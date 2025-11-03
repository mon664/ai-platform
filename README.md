# 🏭 AI 스마트 팩토리 ERP 시스템

AI 기반 통합 생산 관리 ERP 시스템으로, 이카운트와 실시간 연동하여 스마트 팩토리 운영을 지원합니다.

## ✨ 주요 기능

### 🤖 AI 자동화
- **자연어 처리**: "삼성전자에 갤럭시 10대 팔아줘"와 같은 자연어 명령 처리
- **AI Fallback 시스템**: Gemini → ChatGPT → GLM → 모의 응답 (비용 효율적)
- **실시간 ERP 연동**: 명령어 즉시 이카운트 ERP에 반영

### 📊 실시간 데이터 관리
- **296개 거래처**: 실시간 거래처 정보 연동
- **252개 품목**: 품목별 재고 및 가격 관리
- **6개 창고**: 창고별 입출고 현황 추적

### 🏭 생산 관리
- **생산일지**: 교대별 생산 현황 기록
- **가동률 계산**: 자동 효율성 분석
- **품질 관리**: 불량률 추적 및 HACCP 관리

## 🚀 빠른 시작

### 1. 환경 설정
```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에 API 키 설정
```

### 2. API 키 설정 (.env.local)
```bash
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GLM_API_KEY=your_glm_api_key_here
ECOUNT_SESSION_ID=your_ecount_session_id_here
ECOUNT_ZONE=BB
```

### 3. 서버 실행
```bash
# 개발 서버 (로컬)
npm run dev

# Vercel 배포 (프로덕션)
npm i -g vercel
vercel login
vercel --prod
```

### 4. 접속
- **로컬 개발**: http://localhost:3001
- **네트워크 개발**: http://192.168.35.81:3001
- **Vercel 프로덕션**: [Vercel 배포 후 자동 생성된 URL]

## 📱 모듈 안내

### 1. 🏠 대시보드 (`/`)
- 전체 시스템 현황
- 빠른 모듈 접근
- 실시간 통계

### 2. 🤖 AI 채팅 (`/chat`)
- 자연어 비즈니스 명령 처리
- 실시간 ERP 연동
- 명령어 히스토리

### 3. 📋 구매입력 (`/modules/purchase-input`)
- 실시간 거래처/품목 선택
- 수량 및 단가 입력
- 즉시 이카운트 연동

### 4. 📸 이카운트 연동 (`/ecount/purchase`)
- 3단계 AI 전표 처리
- 자동 데이터 검증
- OCR 지원 (개발 중)

### 5. 📊 생산일지 (`/modules/production-log`)
- 교대별 생산 기록
- 품목별 실적 관리
- 가동률 자동 계산

### 6. 💰 BOM 관리 (`/modules/bom`)
- 원가명세서 관리
- 자재별 원가 계산
- BOM 트리 구조

### 7. 🔬 HACCP 관리 (`/modules/haccp`)
- 식품안전 검사 기록
- 위생 관리 시스템
- 규제 준수 확인

## 🔧 시스템 구조

```
ai-platform/
├── app/
│   ├── page.tsx                    # 메인 대시보드
│   ├── components/
│   │   └── Navigation.tsx          # 네비게이션
│   ├── api/
│   │   ├── chat/route.ts           # AI 채팅 API
│   │   ├── data/                   # 데이터 API
│   │   └── modules/                # 모듈별 API
│   ├── modules/                    # ERP 모듈 페이지
│   ├── chat/page.tsx              # AI 채팅 페이지
│   └── ecount/purchase/page.tsx    # 이카운트 연동
├── lib/
│   └── client-auth.ts              # 인증 라이브러리
├── data/                           # CSV 데이터 파일
├── .env.local                      # 환경 변수
└── README.md                       # 이 파일
```

## 📊 데이터 연동

### CSV 데이터 파일
- **거래처.csv**: 296개 거래처 정보
- **품목.csv**: 252개 품목 정보
- **창고.csv**: 6개 창고 정보

### API 엔드포인트
- `/api/data/vendors` - 거래처 데이터
- `/api/data/products` - 품목 데이터
- `/api/data/warehouses` - 창고 데이터
- `/api/chat` - AI 채팅 처리
- `/api/production-log` - 생산일지 처리
- `/api/purchase-input` - 구매입력 처리

## ⚠️ 알려진 이슈

### 해결 필요
1. **GLM API 모델명**: `glm-4` 모델명 확인 필요
2. **Gemini API 모델**: `gemini-pro` 대체 모델 필요
3. **창고 코드 매핑**: 품목코드 ↔ 이카운트 코드 연동

### 해결됨
- ✅ 네비게이션 캐시 문제
- ✅ API Fallback 시스템
- ✅ 실시간 데이터 연동

## 🔑 API 우선순위

1. **Gemini API** (가장 저렴, 주 엔진)
2. **ChatGPT API** (2차 대체)
3. **GLM 4.6 API** (3차 대체)
4. **모의 응답** (개발용 Fallback)

## 📞 지원

- **프로젝트 문서**: [PROJECT_HANDOVER_DOCUMENT.md](./PROJECT_HANDOVER_DOCUMENT.md)
- **환경 변수 예제**: [.env.example](./.env.example)
- **이슈 신고**: [GitHub Issues] (프로젝트 저장소)

## 📝 라이선스

[프로젝트 라이선스 정보]

---

**개발일**: 2025년 11월 3일
**버전**: v1.0
**상태**: 개발 완료, 운영 준비

🚀 **AI 기반 스마트 팩토리의 미래를 지금 시작하세요!**