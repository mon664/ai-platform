Dolibarr + AI Chat 자동 구축 가이드
1️⃣ 환경 변수 설정 (.env.local)
bash# Dolibarr 설정
DOLIBARR_URL=http://localhost:80
DOLIBARR_API_KEY=your_api_key_here
DOLIBARR_USER=admin
DOLIBARR_PASSWORD=admin

# OpenAI (Fallback 1)
OPENAI_API_KEY=sk-xxx

# Google Gemini (Fallback 2)
GEMINI_API_KEY=AIzaSyxxx

# GLM 4.6 (주 엔진)
GLM_API_KEY=your_glm_key_here

# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/ai_erp

# 세션
JWT_SECRET=your_jwt_secret_here

2️⃣ Docker Compose (Dolibarr + PostgreSQL)
yamlversion: '3.8'
services:
  # PostgreSQL 데이터베이스
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: erp_user
      POSTGRES_PASSWORD: erp_pass
      POSTGRES_DB: dolibarr_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Dolibarr ERP
  dolibarr:
    image: dolibarr/dolibarr:latest
    environment:
      DOLI_DB_HOST: postgres
      DOLI_DB_USER: erp_user
      DOLI_DB_PASSWORD: erp_pass
      DOLI_DB_NAME: dolibarr_db
      DOLI_ADMIN_LOGIN: admin
      DOLI_ADMIN_PASSWORD: admin123
      DOLI_URL_ROOT: http://localhost
    ports:
      - "80:80"
    depends_on:
      - postgres
    volumes:
      - dolibarr_data:/var/www/html

volumes:
  postgres_data:
  dolibarr_data:
실행:
bashdocker-compose up -d

3️⃣ Dolibarr API 키 생성
bash# 1. Dolibarr 접속
# http://localhost:80
# 로그인: admin / admin123

# 2. 관리자 → API 토큰 생성
# 또는 curl로 자동 생성:

curl -X POST http://localhost/api/index.php/setup/tokens \
  -H "Content-Type: application/json" \
  -d '{
    "login": "admin",
    "password": "admin123"
  }'

# 응답에서 token 복사 → .env.local의 DOLIBARR_API_KEY에 붙여넣기

4️⃣ 핵심 API 통합 코드
A) Dolibarr 판매 등록 (app/api/dolibarr/sales.ts)
typescriptexport async function saveDolSale(data: {
  product: string;
  quantity: number;
  price: number;
  customer: string;
  date: string;
}) {
  const apiKey = process.env.DOLIBARR_API_KEY;
  const baseUrl = process.env.DOLIBARR_URL;

  // Dolibarr 형식으로 변환
  const payload = {
    ref: `SALE-${Date.now()}`,
    date: Math.floor(new Date(data.date).getTime() / 1000),
    array_lines: [{
      description: data.product,
      qty: data.quantity,
      subprice: data.price,
      total_ht: data.quantity * data.price,
      total_ttc: data.quantity * data.price * 1.1 // 부가세 포함
    }]
  };

  const response = await fetch(`${baseUrl}/api/index.php/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'DOLAPIKEY': apiKey
    },
    body: JSON.stringify(payload)
  });

  return response.json();
}
B) Dolibarr 구매 등록 (app/api/dolibarr/purchases.ts)
typescriptexport async function saveDolPurchase(data: {
  product: string;
  quantity: number;
  price: number;
  vendor: string;
  date: string;
}) {
  const apiKey = process.env.DOLIBARR_API_KEY;
  const baseUrl = process.env.DOLIBARR_URL;

  const payload = {
    ref: `PUR-${Date.now()}`,
    date: Math.floor(new Date(data.date).getTime() / 1000),
    array_lines: [{
      description: data.product,
      qty: data.quantity,
      subprice: data.price,
      total_ht: data.quantity * data.price,
      total_ttc: data.quantity * data.price * 1.1
    }]
  };

  const response = await fetch(`${baseUrl}/api/index.php/supplierorders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'DOLAPIKEY': apiKey
    },
    body: JSON.stringify(payload)
  });

  return response.json();
}
C) AI 분석 → Dolibarr 자동 등록 (app/api/chat/route.ts)
typescriptimport { saveDolSale, saveDolPurchase } from '@/lib/dolibarr';

export async function POST(request: Request) {
  const { message, confirmed } = await request.json();

  // AI 분석
  const aiResult = await analyzeWithGLM(message);
  
  // Dolibarr에 직접 저장
  let result;
  if (aiResult.action === 'sale') {
    result = await saveDolSale(aiResult.data);
  } else if (aiResult.action === 'purchase') {
    result = await saveDolPurchase(aiResult.data);
  }

  return Response.json({
    success: true,
    message: `✅ ${aiResult.action} 등록 완료!`, 
    data: result
  });
}

5️⃣ GitHub 배포 체크리스트
bash# .gitignore에 추가 (API 키 보호)
.env.local
.env.production.local
node_modules/
.next/
dist/

# 커밋 메시지
git add .
git commit -m "Feat: Dolibarr ERP 통합 + AI 자동화"
git push origin main
```

---

### **6️⃣ 다른 AI 사용자 가이드**

> **중요: 아래 내용을 그대로 다른 AI에게 전달**
```
[다른 AI 사용 시 복붙 설명서]

=== 필수 설정 ===
1. .env.local 파일 생성 (위의 1️⃣번 참고)
2. docker-compose.yml 생성 (위의 2️⃣번 참고)
3. 필수 코드 3개 파일 생성:
   - app/api/dolibarr/sales.ts (A)
   - app/api/dolibarr/purchases.ts (B)
   - app/api/chat/route.ts (C)

=== 실행 ===
1. docker-compose up -d
2. Dolibarr API 키 생성 (위의 4️⃣번)
3. .env.local에 API 키 붙여넣기
4. npm run dev

=== 검증 ===
1. 채팅: "강원삼푸터 김치찌개 500개 판매"
2. Dolibarr (http://localhost)에서 확인
3. 데이터 자동 저장되는지 확인
```

---

## 📋 **복붙용 최종 요약**

### **Step 1: 환경변수**
```
DOLIBARR_URL=http://localhost:80
DOLIBARR_API_KEY=[API 키 생성 후 붙여넣기]
DATABASE_URL=postgresql://erp_user:erp_pass@localhost:5432/dolibarr_db
Step 2: 시작
bashdocker-compose up -d
npm run dev
```

### **Step 3: 테스트**
```
채팅: "판매: 김치찌개 500개 강원삼푸터에"
→ Dolibarr에 자동 저장 ✅

🔑 API 키 가이드
키생성 방법필수 여부DOLIBARR_API_KEYDolibarr 관리자 패널✅ 필수GLM_API_KEYhttps://bigmodel.cn⭐ 주 엔진OPENAI_API_KEYhttps://openai.comFallback 1GEMINI_API_KEYhttps://makersuite.google.comFallback 2

✅ 완료 후 깃허브 푸시
bashgit add .
git commit -m "Feat: Dolibarr ERP 완전 통합 + 자동화"
git push

```