# 🚀 AI 통합 관리 플랫폼 (Unified AI Platform)

이 프로젝트는 여러 AI 기반 애플리케이션과 비즈니스 관리 도구를 하나의 플랫폼으로 통합한 결과물입니다. `ai-platform`, `ai-erp-platform`, `ai-story-generator` 등의 프로젝트 기능이 병합되었으며, 단일 서버 배포를 목표로 재구성되었습니다.

## 🌟 주요 기능

### 🏢 비즈니스 관리 (ERP)
- **매출/재고/생산 관리**: Express.js 백엔드와 SQLite 데이터베이스를 통해 핵심 비즈니스 데이터를 관리합니다.
- **Dolibarr ERP 연동**: AI 채팅을 통해 "판매", "구매" 등 자연어 명령으로 Dolibarr에 데이터를 실시간으로 등록합니다.
- **데이터 입력 및 분석**: 직관적인 웹 UI를 통해 데이터를 입력하고, 대시보드에서 현황을 분석합니다.

### 🎬 AI 콘텐츠 생성 스위트
- **고급 AI 챗**: 텍스트, 이미지, 파일, 음성을 지원하는 다중 모드 AI 채팅 인터페이스.
- **유튜브 쇼츠 생성기**: 바이럴 쇼츠 스크립트와 전략을 생성하는 전문가 도구.
- **자동 블로그 (Cron Job)**: Vercel Cron Job을 통해 설정된 스케줄에 따라 자동으로 블로그 주제 선정, 콘텐츠 및 이미지 생성, 포스팅을 수행합니다.
- **다양한 콘텐츠 생성기**: 스토리, 캐릭터, 블로그 등 다양한 목적의 콘텐츠를 생성하는 웹 기반 도구들을 포함합니다.

### 💻 개발자 도구
- **커밋 메시지 생성**: Git 변경 사항을 분석하여 Conventional Commit 표준에 맞는 메시지를 자동 생성합니다.
- **코드 변경 설명**: 두 코드 스니펫의 차이점을 분석하고 자연어로 설명합니다.

## 🛠️ 기술 스택

- **프론트엔드**: HTML, CSS, JavaScript, TailwindCSS
- **백엔드**: Node.js, Express.js, SQLite
- **비동기 작업**: `ts-node`를 이용한 TypeScript 스크립트 실행 (Cron Job)
- **라이브러리**: `axios`, `cors`, `sqlite3` 등
- **배포**: Vercel

## 📂 파일 구조

```
ai-unified-platform-final/
├── backend/                # Node.js Express 서버
│   ├── api/                # 통합된 API 라우트 (chat, cron 등)
│   ├── lib/                # 비즈니스 로직 (dolibarr, auto-blog)
│   ├── database/           # SQLite 데이터베이스 파일
│   └── server.js           # 메인 서버 파일
│
├── web/                    # 정적 프론트엔드
│   ├── components/         # 공통 UI 컴포넌트 (네비게이션)
│   ├── auto-blog/          # 자동 블로그 기능 페이지
│   ├── index.html          # 메인 대시보드
│   └── ...                 # 기타 기능 HTML 파일들
│
├── vercel.json             # Vercel 배포 설정
├── package.json            # 백엔드 의존성
└── start.bat               # 로컬 실행 스크립트
```

## 🚀 실행 및 배포

### 1. 로컬에서 실행하기

```bash
# 1. 백엔드 의존성 설치
cd backend
npm install

# 2. 환경 변수 설정
# .env 파일을 생성하고 Dolibarr 및 Cron Secret 키를 설정합니다.
# 예: DOLIBARR_URL, DOLIBARR_API_KEY, CRON_SECRET

# 3. 서버 시작
node server.js
# 또는 루트 디렉토리에서 start.bat 실행
```
웹 브라우저에서 `http://localhost:3001`로 접속합니다.

### 2. Vercel 배포

1.  이 리포지토리를 GitHub에 푸시합니다.
2.  Vercel 대시보드에서 해당 GitHub 리포지토리를 가져와 새 프로젝트를 생성합니다.
3.  `vercel.json` 파일이 자동으로 인식되어 프론트엔드와 백엔드가 올바르게 배포됩니다.
4.  Vercel 프로젝트 설정에서 `DOLIBARR_URL`, `DOLIBARR_API_KEY`, `CRON_SECRET` 등의 환경 변수를 설정해야 합니다.

---
*이 문서는 여러 프로젝트를 성공적으로 통합한 후 생성되었습니다.*
