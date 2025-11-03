# AI 스마트 팩토리 ERP 시스템 - 인수인계 문서

**프로젝트명**: AI 기반 통합 생산 관리 ERP 시스템
**개발일자**: 2025년 11월 3일
**최종버전**: v1.0
**개발자**: Claude AI Assistant
**담당자**: [담당자 이름]

---

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [시스템 구조](#시스템-구조)
3. [환경 설정](#환경-설정)
4. [API 키 및 인증 정보](#api-키-및-인증-정보)
5. [주요 기능 모듈](#주요-기능-모듈)
6. [데이터베이스 구조](#데이터베이스-구조)
7. [배포 정보](#배포-정보)
8. [문제 해결](#문제-해결)
9. [향후 개발 과제](#향후-개발-과제)

---

## 🎯 프로젝트 개요

### 시스템 소개
AI 기반 스마트 팩토리 ERP 시스템으로, 이카운트(이랜드 ERP)와 연동하여 실시간 생산 관리, 재고 관리, 구매 관리, 품질 관리 기능을 제공합니다.

### 주요 특징
- 🤖 **AI 자동화**: 자연어 처리로 비즈니스 명령 자동 실행
- 🏭 **실시간 연동**: 이카운트 ERP API 연동 (296거래처, 252품목, 6창고)
- 📊 **실시간 모니터링**: 생산 현황, 재고, 품질 데이터 실시간 추적
- 💰 **비용 효율**: AI Fallback 시스템 (Gemini → ChatGPT → GLM)
- 📱 **반응형 UI**: 모바일 친화적 웹 인터페이스

---

## 🏗️ 시스템 구조

### 기술 스택
- **프론트엔드**: Next.js 15.5.2, TypeScript, React 18
- **백엔드**: Next.js API Routes, Node.js
- **스타일링**: Inline CSS (React 스타일 객체)
- **AI 엔진**: Gemini API, ChatGPT API, GLM API
- **ERP 연동**: 이카운트 OAPI v2

### 프로젝트 구조
```
ai-platform/
├── app/
│   ├── page.tsx                          # 메인 대시보드
│   ├── components/
│   │   └── Navigation.tsx                # 네비게이션 컴포넌트
│   ├── api/
│   │   ├── chat/route.ts                 # AI 채팅 API
│   │   ├── production-log/route.ts       # 생산일지 API
│   │   ├── purchase-input/route.ts       # 구매입력 API
│   │   └── data/
│   │       ├── vendors/route.ts          # 거래처 데이터 API
│   │       ├── products/route.ts         # 품목 데이터 API
│   │       └── warehouses/route.ts       # 창고 데이터 API
│   ├── modules/
│   │   ├── production-log/page.tsx       # 생산일지 모듈
│   │   ├── purchase-input/page.tsx       # 구매입력 모듈
│   │   ├── bom/page.tsx                  # BOM 관리 모듈
│   │   └── haccp/page.tsx                # HACCP 관리 모듈
│   ├── chat/page.tsx                     # AI 채팅 페이지
│   └── ecount/purchase/page.tsx          # 이카운트 연동 페이지
├── lib/
│   └── client-auth.ts                    # 인증 라이브러리
└── package.json
```

---

## ⚙️ 환경 설정

### 개발 환경 요구사항
- **Node.js**: v18.0.0 이상
- **npm**: v9.0.0 이상
- **운영체제**: Windows 10/11, macOS, Linux

### 설치 및 실행
```bash
# 프로젝트 복제
git clone [프로젝트 저장소 주소]
cd ai-platform

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

### 서버 정보
- **개발 서버**: http://localhost:3001
- **네트워크 접속**: http://192.168.35.81:3001
- **포트**: 3001 (3000 점유 시 자동 변경)

---

## 🔑 API 키 및 인증 정보

### 환경 변수 설정 (.env.local)
```bash
# AI API 키
GEMINI_API_KEY=[Gemini API 키]
OPENAI_API_KEY=[OpenAI ChatGPT API 키]
GLM_API_KEY=[GLM 4.6 API 키]

# 이카운트 ERP 연동
ECOUNT_SESSION_ID=[이카운트 세션 ID]
ECOUNT_ZONE=BB

# 기타 설정
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### API 우선순위 (비용 효율성 기준)
1. **Gemini API** (가장 저렴, 주 엔진)
2. **ChatGPT API** (2차 대체)
3. **GLM 4.6 API** (3차 대체)
4. **모의 응답** (개발용 Fallback)

### 이카운트 연동 정보
- **API 버전**: OAPI v2
- **기본 URL**: `https://sboapiBB.ecount.com`
- **세션 인증**: SESSION_ID 기반
- **주요 엔드포인트**:
  - 판매: `/OAPI/V2/Sale/SaveSale`
  - 구매: `/OAPI/V2/Purchases/SavePurchases`
  - 입고: `/OAPI/V2/GoodsReceipt/SaveGoodsReceipt`

---

## 🚀 주요 기능 모듈

### 1. AI 자동화 챗봇 (/chat)
- **기능**: 자연어 비즈니스 명령 처리
- **지원 명령어**:
  - 판매: "삼성전자에 갤럭시 10대 팔아줘"
  - 구매: "LG디스플레이에서 OLED 패널 100개 사줘"
  - 생산입고: "갤럭시 50개 생산 완료 입고 처리"
- **처리 흐름**: 명령어 → AI 파싱 → 이카운트 API 실행 → 결과 응답

### 2. 구매입력 모듈 (/modules/purchase-input)
- **기능**: 실시간 거래처/품목 선택 구매 입력
- **데이터**: 296거래처, 252품목 실시간 연동
- **특징**: 드롭다운 선택, 수량/단가 입력, 즉시 이카운트 연동

### 3. 생산일지 모듈 (/modules/production-log)
- **기능**: 실시간 생산 현황 기록 및 관리
- **데이터**:
  - 교대별 담당자 관리
  - 품목별 계획/실적/불량량 추적
  - 가동률 및 불량률 자동 계산
- **창고 연동**: 6개 창고 데이터 실시간 로드

### 4. 이카운트 연동 (/ecount/purchase)
- **기능**: 3단계 AI 전표 처리
- **처리 단계**:
  1. 자동 데이터 추출
  2. AI 검증 및 수정
  3. 이카운트 자동 전표 입력

### 5. BOM 관리 모듈 (/modules/bom)
- **기능**: 원가명세서 관리
- **특징**: 자재별 원가 계산, BOM 트리 구조

### 6. HACCP 관리 모듈 (/modules/haccp)
- **기능**: 식품안전 검사 기록
- **특징**: 위생 관리, 검사 일지, 규제 준수

---

## 📊 데이터베이스 구조

### CSV 데이터 파일
**위치**: 프로젝트 루트 또는 data 폴더

1. **거래처.csv** (296개)
   - 구조: 거래처코드, 상호명, 대표자, 전화번호, 휴대폰
   - API: `/api/data/vendors`

2. **품목.csv** (252개)
   - 구조: 품목코드, 품목명, 규격, 단위, 단가
   - API: `/api/data/products`

3. **창고.csv** (6개)
   - 구조: 창고코드, 창고명, 창고구분, 사용여부
   - API: `/api/data/warehouses`

### 창고 데이터
- **00003**: 본사창고 (기본)
- **00004**: 본사생산공장
- **00005**: 제1창고
- **00006**: 제2창고
- **00007**: 임시창고
- **00008**: 불량창고

---

## 🚀 배포 정보

### 개발 환경
- **서버**: Next.js 개발 서버
- **포트**: 3001 (3000 점유 시 자동 변경)
- **접속**: http://localhost:3001

### Vercel 배포 (프로덕션)
**중요**: 이 프로젝트는 Vercel 클라우드 서버에 배포되어야 합니다!

#### 1. Vercel 배포 준비
```bash
# Vercel CLI 설치
npm i -g vercel

# Vercel 로그인
vercel login

# 프로젝트 배포
vercel

# 배포 확인
vercel --prod
```

#### 2. Vercel 환경 변수 설정
**Vercel Dashboard → Project Settings → Environment Variables**

```bash
# AI API Keys
GEMINI_API_KEY=[Gemini API 키]
OPENAI_API_KEY=[OpenAI ChatGPT API 키]
GLM_API_KEY=[GLM 4.6 API 키]

# 이카운트 ERP 연동
ECOUNT_SESSION_ID=[이카운트 세션 ID]
ECOUNT_ZONE=BB

# Vercel 자동 설정
NEXT_PUBLIC_APP_URL=[Vercel 배포 URL]
```

#### 3. Vercel 배포 주소
- **로컬 개발**: http://localhost:3001
- **네트워크 개발**: http://192.168.35.81:3001
- **Vercel 프로덕션**: [Vercel 배포 후 자동 생성된 URL]
  - 예시: `https://ai-smart-factory.vercel.app`

#### 4. Vercel 설정 파일
**vercel.json** (프로젝트 루트):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_APP_URL": "@url"
  }
}
```

#### 5. 배포 명령어
```bash
# 개발 배포 (Preview)
vercel

# 프로덕션 배포
vercel --prod

# 배포 상태 확인
vercel ls
```

#### 6. Vercel 특이사항
- **자동 HTTPS**: SSL 인증서 자동 적용
- **글로벌 CDN**: 전세계 빠른 접속 지원
- **무료 티어**: 월 100GB 트래픽 무료
- **자동 빌드**: Git Push 시 자동 배포

---

## ⚠️ 문제 해결

### 현재 알려진 이슈

1. **GLM API 문제**
   - **오류**: `Unknown Model`, `Insufficient balance`
   - **상태**: Fallback 시스템으로 자동 대체
   - **조치**: 충전 필요 또는 다른 AI 사용

2. **Gemini API 문제**
   - **오류**: `models/gemini-pro is not found`
   - **상태**: ChatGPT Fallback으로 자동 대체
   - **조치**: 모델명 변경 필요

3. **네비게이션 캐시 문제**
   - **현상**: ERP 메뉴가 보이지 않음
   - **해결**: 브라우저 하드 새로고침 (Ctrl+F5)
   - **영구 해결**: Navigation 컴포넌트 리팩토링 완료

### 일반적인 문제 해결

1. **서버 시작 실패**
   ```bash
   # 포트 확인 및 종료
   netstat -ano | findstr :3000
   taskkill /PID [PID] /F

   # 캐시 삭제
   rm -rf .next
   npm run dev
   ```

2. **API 연동 실패**
   - 환경 변수 확인 (.env.local)
   - API 키 유효성 확인
   - 이카운트 세션 ID 확인

3. **데이터 로딩 오류**
   - CSV 파일 위치 확인
   - 파일 인코딩 확인 (UTF-8)
   - API 경로 확인

---

## 📋 향후 개발 과제

### 긴급 과제
1. **GLM API 모델명 수정**
   - 현재: `glm-4` → 필요: 올바른 모델명
   - 위치: `/app/api/chat/route.ts`

2. **Gemini API 모델 업데이트**
   - 현재: `gemini-pro` → 필요: 사용 가능한 모델명
   - 위치: `/app/api/chat/route.ts`

3. **창고 데이터 매핑**
   - 품목코드 ↔ 이카운트 품목코드 연동
   - 자동 코드 변환 시스템 구축

### 중기 과제
1. **데이터베이스 연동**
   - CSV 파일 → 정식 DBMS 전환
   - 실시간 데이터 동기화

2. **사용자 관리 시스템**
   - 직원별 권한 관리
   - 접근 제어 시스템

3. **모바일 앱 개발**
   - React Native 기반 모바일 앱
   - 푸시 알림 기능

### 장기 과제
1. **AI 기능 고도화**
   - 예측 분석 기능
   - 자동 최적화 시스템

2. **MES 시스템 연동**
   - 실시간 생산 설비 데이터 연동
   - IoT 센서 데이터 통합

3. **클라우드 전환**
   - AWS/Azure 배포
   - 다중 테넌트 아키텍처

---

## 📞 연락 정보

### 기술 지원
- **개발자**: Claude AI Assistant
- **프로젝트 관리자**: [관리자 이름]
- **이메일**: [관리자 이메일]
- **전화**: [관리자 전화번호]

### 외부 연동
- **이카운트 지원**: [이카운트 기술지원 연락처]
- **AI API 지원**: 각 API 제공업체 지원센터
- **Vercel 지원**:
  - 웹사이트: https://vercel.com/support
  - 문서: https://vercel.com/docs
  - 상태페이지: https://vercel-status.com/

---

## 📄 부록

### 로그 위치
- **서버 로그**: 터미널 출력
- **API 호출 로그**: 브라우저 개발자 도구
- **에러 로그**: 서버 콘솔

### 백업 정책
- **소스 코드**: Git 저장소 자동 백업
- **데이터**: CSV 파일 주기적 백업 권장
- **환경 설정**: .env.local 파일 별도 보관

### 보안 고려사항
- API 키는 환경 변수로 관리
- 세션 ID 정기 갱신 필요
- 민감 데이터 암호화 권장

---

**문서 최종 수정일**: 2025년 11월 3일
**버전**: v1.0
**상태**: 개발 완료, 운영 준비 상태

*이 문서는 시스템의 현재 상태를 기준으로 작성되었으며, 변경 사항 발생 시 업데이트가 필요합니다.*