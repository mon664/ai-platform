# Cloudflare D1 설정 가이드

이 문서는 AI Platform 블로그 기능에 필요한 Cloudflare D1 데이터베이스 설정 방법을 안내합니다.

## 1. D1 데이터베이스 생성

터미널에서 다음 명령어를 실행하세요:

```bash
npx wrangler d1 create ai-platform-blog
```

명령어 실행 후 출력되는 `database_id`를 복사하세요.

**예시 출력:**
```
✅ Successfully created DB 'ai-platform-blog'!

[[d1_databases]]
binding = "DB"
database_name = "ai-platform-blog"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

## 2. wrangler.jsonc 업데이트

`wrangler.jsonc` 파일의 `database_id`를 실제 ID로 교체하세요:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "ai-platform-blog",
      "database_id": "여기에_실제_ID_입력"  // ← 1단계에서 복사한 ID
    }
  ]
}
```

## 3. 데이터베이스 스키마 적용

```bash
npx wrangler d1 execute ai-platform-blog --file=schema.sql
```

## 4. Cloudflare Pages 바인딩 설정

Cloudflare Pages 대시보드에서:

1. **Pages** → **ai-platform** → **Settings** → **Functions**
2. **D1 database bindings** 섹션으로 이동
3. **Add binding** 클릭:
   - **Variable name:** `DB`
   - **D1 database:** `ai-platform-blog` 선택
4. **Save** 클릭

## 5. 로컬 개발 환경 테스트

로컬에서 D1과 함께 개발하려면:

```bash
# 로컬 D1 데이터베이스 초기화
npx wrangler d1 execute ai-platform-blog --local --file=schema.sql

# 로컬 개발 서버 실행
npm run dev
```

## 6. 데이터베이스 확인

데이터베이스가 올바르게 설정되었는지 확인:

```bash
# 프로덕션 데이터베이스 확인
npx wrangler d1 execute ai-platform-blog --command "SELECT * FROM posts"

# 로컬 데이터베이스 확인
npx wrangler d1 execute ai-platform-blog --local --command "SELECT * FROM posts"
```

## 트러블슈팅

### 문제: "Database not configured" 오류

**원인:** D1 바인딩이 설정되지 않음

**해결:**
1. Cloudflare Pages에서 D1 바인딩 확인
2. `wrangler.jsonc`의 `database_id` 확인
3. 재배포 후 테스트

### 문제: "Table does not exist" 오류

**원인:** 스키마가 적용되지 않음

**해결:**
```bash
npx wrangler d1 execute ai-platform-blog --file=schema.sql
```

## 추가 정보

- [Cloudflare D1 공식 문서](https://developers.cloudflare.com/d1/)
- [Wrangler CLI 문서](https://developers.cloudflare.com/workers/wrangler/)
