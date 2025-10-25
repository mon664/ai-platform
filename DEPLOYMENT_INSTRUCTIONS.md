# 🚀 배포 지침서

Next.js 프로젝트가 생성되었습니다! 이제 Cloudflare Pages에 배포하세요.

## ⚠️ 중요: Google Drive 문제 해결

Google Drive에서 `npm install`이 작동하지 않으므로, **C:\ 드라이브**에서 작업해야 합니다.

---

## 📋 배포 단계 (10분)

### Step 1: C:\ 드라이브로 프로젝트 복사 (2분)

```cmd
# 1. C:\projects 폴더 생성
mkdir C:\projects
cd C:\projects

# 2. 프로젝트 폴더 생성
mkdir ai-content-platform
cd ai-content-platform

# 3. Google Drive에서 파일 복사
xcopy "G:\내 드라이브\ai소스\claude\ai-content-platform\*" . /E /I /Y
```

### Step 2: Git 초기화 (2분)

```bash
# C:\projects\ai-content-platform 에서 실행

git init
git add .
git commit -m "Initial commit: AI Content Platform with auto-deploy"
```

### Step 3: GitHub 저장소 생성 (2분)

1. https://github.com 접속
2. **New repository** 클릭
3. 저장소 이름: `ai-content-platform`
4. **Create repository** 클릭 (README 추가 안 함)
5. 생성된 URL 복사: `https://github.com/사용자명/ai-content-platform.git`

### Step 4: GitHub에 푸시 (1분)

```bash
# 저장소 URL을 자신의 것으로 변경
git branch -M main
git remote add origin https://github.com/사용자명/ai-content-platform.git
git push -u origin main
```

### Step 5: Cloudflare Pages 연결 (3분)

1. **https://dash.cloudflare.com** 접속
2. **Workers & Pages** 클릭
3. **Create application** 클릭
4. **Pages** 탭 선택
5. **Connect to Git** 클릭
6. **GitHub** 선택 및 인증
7. 저장소 선택: `ai-content-platform`
8. **Begin setup** 클릭

**Build settings**:
```
Project name: ai-content-platform
Production branch: main
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: (비워두기)
```

9. **Save and Deploy** 클릭!

⏱️ **2-3분 대기**

### Step 6: 배포 완료 확인! (1분)

```
✅ Your site is live at:
https://ai-content-platform-xxx.pages.dev
```

---

## 🎉 성공!

이제 코드를 수정하고 푸시만 하면 자동으로 배포됩니다:

```bash
# C:\projects\ai-content-platform 에서

# 파일 수정 후
git add .
git commit -m "Update: 새 기능 추가"
git push

# ✅ 자동으로 Cloudflare Pages에 배포!
```

---

## 💻 로컬 개발

```bash
cd C:\projects\ai-content-platform

# 의존성 설치 (최초 1회)
npm install

# 개발 서버 시작
npm run dev
```

http://localhost:3000 접속

---

## 🌐 커스텀 도메인 연결 (선택사항)

1. Cloudflare Pages → 프로젝트 선택
2. **Custom domains** 탭
3. **Set up a custom domain** 클릭
4. `survivingfnb.com` 입력
5. DNS 자동 설정
6. 5분~24시간 후 적용

---

## 📁 프로젝트 구조

```
ai-content-platform/
├── app/
│   ├── layout.tsx          # 전체 레이아웃
│   ├── page.tsx            # 홈페이지
│   └── globals.css         # 전역 스타일
├── package.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── .gitignore
└── README.md
```

---

## 🔄 개발 워크플로우

```
[C:\projects\ai-content-platform]
  ↓
1. 코드 수정 (VS Code)
  ↓
2. npm run dev로 로컬 테스트
  ↓
3. git add . && git commit -m "..."
  ↓
4. git push
  ↓
[Cloudflare Pages 자동 배포]
  ↓
5. 2-3분 후 라이브!
  ↓
6. https://ai-content-platform.pages.dev 확인
```

---

## ✅ 체크리스트

- [ ] C:\projects에 프로젝트 복사
- [ ] git init 및 초기 커밋
- [ ] GitHub 저장소 생성
- [ ] git push
- [ ] Cloudflare Pages 연결
- [ ] 첫 배포 확인
- [ ] npm install (로컬 개발용)
- [ ] npm run dev 테스트

---

## 🚨 문제 해결

### npm install 오류
- **원인**: Google Drive 동기화 충돌
- **해결**: C:\ 드라이브에서 작업

### 빌드 실패
- **확인**: package.json 파일이 제대로 복사되었는지 확인
- **해결**: Cloudflare Pages Deployments 탭에서 로그 확인

### 사이트 접속 안 됨
- **확인**: 배포가 완료될 때까지 2-3분 대기
- **해결**: Deployments 탭에서 "Success" 확인

---

## 💰 비용

**완전 무료!**
- GitHub: 무료 (Public 저장소)
- Cloudflare Pages: 무료 (500 빌드/월)
- SSL/HTTPS: 자동 무료

---

## 🎯 다음 단계

1. **지금 바로**: Step 1부터 따라하기
2. **개발 시작**: C:\에서 npm install → npm run dev
3. **기능 추가**: API Routes, AI 통합
4. **도메인 연결**: survivingfnb.com

---

**지금 바로 시작하세요!** 🚀

배포는 이제 자동입니다. 코드만 작성하세요!
