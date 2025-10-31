# Gemini CLI - 404 문제 해결 가이드

## 🎯 목표
`/api/generate` 404 에러 해결 (Functions가 배포에 포함 안 됨)

---

## ✅ Task 1: Cloudflare 빌드 설정 변경

**Cloudflare Dashboard에서 수동으로 변경:**

```
1. https://dash.cloudflare.com 접속

2. Workers & Pages → ai-platform 클릭

3. Settings → Builds & deployments 클릭

4. Build configuration 섹션 찾기

5. 다음과 같이 변경:

   Framework preset: None
   Build command: npm run build
   Build output directory: out
   Root directory: (비워두기)

6. "Save" 클릭

7. Deployments 탭으로 이동

8. "Retry deployment" 클릭
```

**완료 후 보고**: "Task 1 done - Cloudflare 설정 변경 완료"

---

## ✅ Task 2: wrangler.toml 커밋

로컬에서 실행:

```bash
cd C:\projects\ai-platform
git add wrangler.toml
git commit -m "fix: add wrangler.toml for Functions support"
git push
```

**완료 후 보고**: "Task 2 done - wrangler.toml 푸시 완료"

---

## ✅ Task 3: 테스트

5분 후 테스트:

```bash
# 1. Functions 작동 확인
curl https://ai-platform-q3f.pages.dev/api/test

# 예상: {"message": "Functions are working!", ...}

# 2. 환경 변수 확인
curl https://ai-platform-q3f.pages.dev/api/diag

# 예상: {"OPENAI": true, "GEMINI": true}
```

**완료 후 보고**: "Task 3 done - 테스트 결과: [성공/실패]"

---

## 🚨 Task 3 실패 시

### Plan B: next.config.js 수정

`output: 'export'` 제거:

```javascript
// next.config.js
module.exports = {
  // output: 'export',  // ← 이 줄 주석 처리 또는 삭제
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
}
```

커밋 & 푸시:
```bash
git add next.config.js
git commit -m "fix: remove static export for Functions"
git push
```

**완료 후 보고**: "Plan B done"

---

## 📝 중요 사항

- **천천히 진행**: 각 Task 사이 5분 대기
- **Rate Limit 방지**: curl 명령은 1번만 실행
- **에러 발생 시**: 에러 메시지 전체 복사해서 보고

---

## 🔄 작업 순서

1. Task 1 (수동) → 5분 대기
2. Task 2 (git) → 5분 대기
3. Task 3 (테스트) → 성공하면 완료
4. 실패 시 Plan B → 5분 대기 → 재테스트

---

**시작 명령**: "Task 1부터 시작"
