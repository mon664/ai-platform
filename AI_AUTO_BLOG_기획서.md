# AI 자동 블로그 생성기 - 외식업 전문

## 📋 프로젝트 개요

**목표:** 외식업 관련 고품질 블로그 글을 AI가 자동으로 작성하고 배포하는 시스템 구축

**타겟:** 외식 소상공인, 프랜차이즈, 외식업 관련 정보

**자동화 주기:** 하루 2건 (오전 9시, 오후 6시)

**핵심 가치:** 사람이 작성한 것처럼 자연스럽고, 실용적인 정보 제공

---

## 🎯 핵심 기능

### 1. 자동 주제 생성
- AI가 외식업 트렌드, 시즌, 이슈를 분석하여 주제 선정
- 다양한 카테고리 순환 (창업, 운영, 마케팅, 메뉴, 트렌드 등)
- 중복 방지 (최근 30일 주제 체크)

### 2. 고품질 콘텐츠 생성
- **자연스러운 글쓰기**
  - 사람처럼 서론-본론-결론 구조
  - 실제 경험담 스타일
  - 구체적인 수치와 예시 포함
  - 전문 용어와 일상 언어 혼합

- **SEO 최적화**
  - 키워드 자연스럽게 배치
  - 메타 설명 자동 생성
  - 제목 최적화

- **가독성**
  - 단락 나누기
  - 소제목 활용
  - 불릿 포인트, 번호 리스트
  - 강조 표시

### 3. 자동 이미지 생성 및 삽입
- **이미지 타입**
  - 대표 이미지 (썸네일)
  - 본문 삽입 이미지 (3-5개)
  - 인포그래픽 스타일 이미지

- **생성 방식**
  - Gemini 2.5 Flash Image API
  - 글 내용에 맞는 사실적인 이미지
  - 한국 외식업 스타일

- **최적화**
  - 웹 최적화 크기
  - alt 태그 자동 생성
  - 자연스러운 배치

### 4. 자동 배포
- 작성 완료 후 즉시 블로그에 게시
- Redis에 자동 저장
- 실패 시 재시도 로직

### 5. 관리 대시보드
- 생성 이력 조회
- 수동 생성 버튼
- 주제 큐 관리
- 통계 (조회수, 인기 글 등)

---

## 🛠️ 기술 스택

### Backend
- **Next.js API Routes** (서버리스 함수)
- **Vercel Cron Jobs** (스케줄링)
- **Redis** (데이터 저장)

### AI/API
- **Gemini 2.0 Flash Exp** - 텍스트 생성
- **Gemini 2.5 Flash Image** - 이미지 생성
- **Web Search API** (선택) - 최신 트렌드 수집

### Frontend
- **React** - 관리 대시보드
- **Tailwind CSS** - 스타일링

---

## 📂 파일 구조

```
ai-platform/
├── app/
│   ├── auto-blog/
│   │   └── page.tsx                    # 관리 대시보드
│   ├── api/
│   │   ├── auto-blog/
│   │   │   ├── generate/route.ts       # 블로그 생성 API
│   │   │   ├── topics/route.ts         # 주제 생성 API
│   │   │   ├── history/route.ts        # 생성 이력 API
│   │   │   └── manual/route.ts         # 수동 생성 API
│   │   └── cron/
│   │       └── auto-blog/route.ts      # Vercel Cron 엔드포인트
├── lib/
│   ├── auto-blog/
│   │   ├── topic-generator.ts          # 주제 생성 로직
│   │   ├── content-generator.ts        # 콘텐츠 생성 로직
│   │   ├── image-generator.ts          # 이미지 생성 로직
│   │   ├── blog-publisher.ts           # 블로그 게시 로직
│   │   └── prompt-templates.ts         # AI 프롬프트 템플릿
│   └── auto-blog-storage.ts            # 자동 블로그 데이터 관리
└── vercel.json                          # Cron 설정
```

---

## 🔧 구현 단계별 코드 계획

### Step 1: 주제 생성 시스템

**파일:** `lib/auto-blog/topic-generator.ts`

```typescript
// 주제 생성 로직
export async function generateTopics(count: number): Promise<Topic[]> {
  // 1. Redis에서 최근 30일 주제 가져오기 (중복 방지)
  // 2. 카테고리 순환 로직 (창업, 운영, 마케팅 등)
  // 3. Gemini API로 트렌드 분석 및 주제 생성
  // 4. SEO 키워드 추출
  // 5. 제목 후보 3개 생성
  // 6. 메타 설명 생성
}

interface Topic {
  id: string
  category: 'startup' | 'operation' | 'marketing' | 'menu' | 'trend' | 'franchise'
  title: string
  titleCandidates: string[]
  keywords: string[]
  metaDescription: string
  targetAudience: string
  createdAt: string
}
```

**Gemini 프롬프트 예시:**
```typescript
const TOPIC_GENERATION_PROMPT = `
당신은 외식업 전문 콘텐츠 기획자입니다.

최근 트렌드: ${recentTrends}
이전 주제: ${recentTopics}
카테고리: ${category}

다음 조건을 만족하는 블로그 주제를 생성하세요:
1. 실용적이고 구체적인 정보 제공
2. 외식 소상공인/프랜차이즈 관계자에게 유용
3. 검색 가능성 높은 주제
4. 최근 트렌드 반영
5. 이전 주제와 중복 없음

JSON 형식으로 응답:
{
  "title": "클릭을 유도하는 제목",
  "titleCandidates": ["제목1", "제목2", "제목3"],
  "keywords": ["키워드1", "키워드2", ...],
  "metaDescription": "검색 결과에 표시될 설명 (150자 이내)",
  "outline": ["섹션1", "섹션2", "섹션3"]
}
`
```

---

### Step 2: 콘텐츠 생성 시스템

**파일:** `lib/auto-blog/content-generator.ts`

```typescript
// 콘텐츠 생성 로직
export async function generateContent(topic: Topic): Promise<BlogContent> {
  // 1. 아웃라인 확정
  // 2. 섹션별 상세 내용 생성
  // 3. 이미지 삽입 위치 결정 (3-5개)
  // 4. 자연스러운 문체로 변환
  // 5. 내부 링크 제안
  // 6. CTA(Call-to-Action) 추가
}

interface BlogContent {
  title: string
  content: string // Markdown 형식
  sections: Section[]
  imagePlaceholders: ImagePlaceholder[]
  internalLinks: string[]
  cta: string
  estimatedReadTime: number // 분 단위
}

interface Section {
  heading: string
  content: string
  imageAfter?: boolean
}

interface ImagePlaceholder {
  position: number // 문단 번호
  description: string // 생성할 이미지 설명
  alt: string
}
```

**Gemini 프롬프트 예시:**
```typescript
const CONTENT_GENERATION_PROMPT = `
당신은 15년 경력의 외식업 컨설턴트이자 블로그 작가입니다.

주제: ${topic.title}
키워드: ${topic.keywords.join(', ')}
대상: ${topic.targetAudience}

다음 스타일로 2000-3000자 분량의 블로그 글을 작성하세요:

✅ 글쓰기 규칙:
1. 친근하면서도 전문적인 톤
2. 실제 경험담처럼 작성 ("저도 처음엔...", "경험상..." 등)
3. 구체적인 수치와 예시 포함
4. 단락은 3-4문장으로 짧게
5. 소제목으로 가독성 향상
6. 불릿 포인트, 번호 리스트 적극 활용

📝 구조:
- 도입부: 공감대 형성 + 문제 제기 (2-3문단)
- 본론: 해결책 3-5가지 (각 소제목 포함)
- 결론: 요약 + 실천 방법 + 격려

🖼️ 이미지 위치:
- [IMAGE:1] 형태로 표시
- 본문 흐름에 맞게 3-5개 배치
- 각 이미지마다 설명 주석 포함

Markdown 형식으로 응답하세요.
`
```

---

### Step 3: 이미지 생성 시스템

**파일:** `lib/auto-blog/image-generator.ts`

```typescript
// 이미지 생성 로직
export async function generateImages(
  content: BlogContent,
  topic: Topic
): Promise<GeneratedImage[]> {
  // 1. 썸네일 이미지 생성 (대표 이미지)
  // 2. 본문 이미지 3-5개 생성
  // 3. 각 이미지 Base64 → Redis/스토리지 저장
  // 4. alt 태그 생성
  // 5. 이미지를 Markdown에 삽입
}

interface GeneratedImage {
  id: string
  type: 'thumbnail' | 'content'
  base64: string // 또는 URL
  alt: string
  prompt: string
  position?: number
}
```

**Gemini Image 프롬프트 예시:**
```typescript
const IMAGE_GENERATION_PROMPTS = {
  thumbnail: (topic: Topic) => `
    Professional, high-quality photograph for a Korean restaurant business blog.
    Topic: ${topic.title}
    Style: Realistic, modern, clean, bright lighting
    Setting: Korean restaurant or cafe interior/exterior
    No text overlay, no people faces clearly visible
    16:9 aspect ratio, suitable for blog thumbnail
  `,

  content: (description: string) => `
    Realistic photograph for Korean restaurant business blog article.
    Scene: ${description}
    Style: Professional, natural lighting, authentic Korean restaurant setting
    No text, no watermarks
    High quality, editorial style
    4:3 aspect ratio
  `
}

// 예시 이미지 생성 프롬프트
// "카페 인테리어, 따뜻한 조명, 손님들이 대화하는 모습, 자연스러운 분위기"
// "주방에서 음식을 준비하는 모습, 깔끔한 조리 환경, 전문적인 느낌"
```

---

### Step 4: 블로그 게시 시스템

**파일:** `lib/auto-blog/blog-publisher.ts`

```typescript
// 블로그 게시 로직
export async function publishBlog(
  content: BlogContent,
  images: GeneratedImage[]
): Promise<PublishResult> {
  // 1. 이미지를 Markdown에 삽입
  // 2. slug 생성 (URL 친화적)
  // 3. 메타데이터 추가
  // 4. Redis에 저장 (createPost 함수 사용)
  // 5. 게시 이력 기록
  // 6. 성공/실패 로그
}

interface PublishResult {
  success: boolean
  slug: string
  url: string
  publishedAt: string
  error?: string
}
```

---

### Step 5: 자동화 Cron Job

**파일:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/auto-blog",
      "schedule": "0 9,18 * * *"
    }
  ]
}
```

**설명:**
- `0 9,18 * * *` = 매일 오전 9시, 오후 6시 (한국 시간 기준 UTC+9 조정 필요)
- 실제 한국 시간으로 하려면: `0 0,9 * * *` (UTC 기준 0시, 9시 = 한국 9시, 18시)

**파일:** `app/api/cron/auto-blog/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { generateTopics } from '@/lib/auto-blog/topic-generator'
import { generateContent } from '@/lib/auto-blog/content-generator'
import { generateImages } from '@/lib/auto-blog/image-generator'
import { publishBlog } from '@/lib/auto-blog/blog-publisher'

export async function GET(req: NextRequest) {
  // Vercel Cron 인증 확인
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. 주제 1개 생성
    const topics = await generateTopics(1)
    const topic = topics[0]

    // 2. 콘텐츠 생성
    const content = await generateContent(topic)

    // 3. 이미지 생성
    const images = await generateImages(content, topic)

    // 4. 블로그 게시
    const result = await publishBlog(content, images)

    // 5. 로그 기록
    await logGeneration({
      topic,
      result,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ success: true, result })

  } catch (error: any) {
    console.error('Auto-blog generation failed:', error)

    // 실패 로그 기록
    await logError(error)

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// 로그 기록 함수
async function logGeneration(data: any) {
  // Redis에 생성 이력 저장
  // Key: auto-blog:history:{timestamp}
}

async function logError(error: any) {
  // Redis에 에러 로그 저장
  // Key: auto-blog:errors:{timestamp}
}
```

---

### Step 6: 관리 대시보드

**파일:** `app/auto-blog/page.tsx`

```typescript
'use client'
import { useState, useEffect } from 'react'
import { fetchWithAuth } from '@/lib/client-auth'

export default function AutoBlogDashboard() {
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)

  // 기능:
  // 1. 생성 이력 표시 (최근 30일)
  // 2. 수동 생성 버튼
  // 3. 통계 (총 생성 수, 성공률, 평균 생성 시간)
  // 4. 주제 큐 관리
  // 5. 설정 (카테고리 비율, 생성 시간 등)

  const handleManualGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetchWithAuth('/api/auto-blog/manual', {
        method: 'POST'
      })
      const data = await res.json()
      alert('블로그 생성 시작!')
    } catch (error) {
      alert('생성 실패: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🤖 AI 자동 블로그 관리</h1>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="총 생성 수" value="42개" />
          <StatCard title="이번 달" value="18개" />
          <StatCard title="성공률" value="95%" />
          <StatCard title="다음 생성" value="3시간 후" />
        </div>

        {/* 수동 생성 버튼 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">수동 생성</h2>
          <button
            onClick={handleManualGenerate}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg"
          >
            {loading ? '생성 중...' : '지금 바로 생성하기'}
          </button>
        </div>

        {/* 생성 이력 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">생성 이력</h2>
          <div className="space-y-4">
            {history.map(item => (
              <HistoryItem key={item.id} data={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 📊 데이터베이스 스키마 (Redis)

### 1. 블로그 포스트 (기존과 동일)
```
Key: blog:{slug}
Value: JSON { title, content, createdAt, ... }
```

### 2. 자동 생성 이력
```
Key: auto-blog:history:{timestamp}
Value: JSON {
  id: string
  topic: Topic
  result: PublishResult
  duration: number (ms)
  imagesGenerated: number
  success: boolean
  timestamp: string
}
```

### 3. 주제 큐
```
Key: auto-blog:topics:queue
Value: JSON Array [Topic, Topic, ...]
```

### 4. 생성된 주제 히스토리 (중복 방지)
```
Key: auto-blog:topics:history
Value: JSON Array (최근 30일 주제)
```

### 5. 에러 로그
```
Key: auto-blog:errors:{timestamp}
Value: JSON { error, stack, context, timestamp }
```

### 6. 설정
```
Key: auto-blog:config
Value: JSON {
  enabled: boolean
  categoriesRatio: { startup: 20, operation: 30, ... }
  dailyCount: 2
  cronTimes: ["09:00", "18:00"]
}
```

---

## 🔐 환경 변수

**Vercel에 추가 필요:**

```bash
# 기존 환경 변수
GEMINI_API_KEY=...
Cloud_all_API=...
REDIS_URL=...
JWT_SECRET=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...

# 새로 추가
CRON_SECRET=random-secret-key-for-cron-authentication
```

---

## 🎨 프롬프트 템플릿 상세

**파일:** `lib/auto-blog/prompt-templates.ts`

```typescript
export const PROMPT_TEMPLATES = {
  // 카테고리별 주제 생성 프롬프트
  topicGeneration: {
    startup: `외식업 창업 관련 실용적인 주제...`,
    operation: `외식업 운영 노하우 관련 주제...`,
    marketing: `외식업 마케팅 전략 관련 주제...`,
    menu: `메뉴 개발 및 관리 관련 주제...`,
    trend: `외식업 최신 트렌드 관련 주제...`,
    franchise: `프랜차이즈 창업 및 운영 관련 주제...`,
  },

  // 콘텐츠 생성 프롬프트
  contentGeneration: `
    [상세한 글쓰기 가이드]
    - 15년 경력 컨설턴트 톤
    - 실제 사례 중심
    - 단계별 가이드
    - 체크리스트 포함
    - 실천 가능한 팁
  `,

  // 이미지 생성 프롬프트
  imageGeneration: {
    thumbnail: `블로그 대표 이미지...`,
    interior: `레스토랑 인테리어...`,
    food: `음식 사진...`,
    operation: `운영 관련 이미지...`,
    marketing: `마케팅 관련 이미지...`,
  },

  // 자연스러운 문체 변환 프롬프트
  styleRefinement: `
    다음 텍스트를 더 자연스럽고 사람답게 다듬어주세요:
    - 딱딱한 표현 → 친근한 표현
    - 전문 용어 → 쉬운 설명 추가
    - 긴 문장 → 짧고 명확하게
    - 불필요한 접속사 제거
  `,
}
```

---

## 🔄 워크플로우

### 자동 생성 프로세스:

```
1. Vercel Cron 트리거 (09:00, 18:00 KST)
   ↓
2. 인증 확인 (CRON_SECRET)
   ↓
3. 주제 생성
   - Redis에서 최근 주제 조회
   - 카테고리 순환 로직
   - Gemini API 호출 (주제 생성)
   - 주제 큐에 저장
   ↓
4. 콘텐츠 생성
   - Gemini API 호출 (글 작성)
   - 2000-3000자 분량
   - 이미지 삽입 위치 표시
   ↓
5. 이미지 생성
   - 썸네일 1개
   - 본문 이미지 3-5개
   - Gemini Image API 호출
   - Base64 → Redis 저장
   ↓
6. 콘텐츠 조합
   - 이미지를 Markdown에 삽입
   - 메타데이터 추가
   - slug 생성
   ↓
7. 블로그 게시
   - createPost() 호출
   - Redis에 저장
   - URL 생성
   ↓
8. 이력 기록
   - 성공/실패 로그
   - 통계 업데이트
   ↓
9. 완료 (다음 스케줄 대기)
```

### 수동 생성 프로세스:

```
1. 관리자 대시보드에서 "생성하기" 클릭
   ↓
2. 인증 확인 (JWT)
   ↓
3. API 호출: POST /api/auto-blog/manual
   ↓
4. [3-8 단계 동일]
   ↓
5. 실시간 진행 상황 표시
   ↓
6. 완료 알림
```

---

## 🚀 구현 순서 (권장)

### Phase 1: 기본 구조 (1-2일)
1. ✅ 파일 구조 생성
2. ✅ 주제 생성 로직 구현
3. ✅ 콘텐츠 생성 로직 구현
4. ✅ 테스트 API 엔드포인트

### Phase 2: 이미지 생성 (1일)
5. ✅ 이미지 생성 로직
6. ✅ 이미지 저장 및 삽입
7. ✅ 최적화

### Phase 3: 블로그 통합 (0.5일)
8. ✅ 블로그 게시 로직
9. ✅ 메타데이터 관리
10. ✅ URL 생성

### Phase 4: 자동화 (0.5일)
11. ✅ Vercel Cron 설정
12. ✅ 자동 실행 테스트
13. ✅ 에러 핸들링

### Phase 5: 관리 대시보드 (1일)
14. ✅ UI 구현
15. ✅ 통계 표시
16. ✅ 수동 생성 기능

### Phase 6: 최적화 및 모니터링 (1일)
17. ✅ 성능 최적화
18. ✅ 로그 시스템
19. ✅ 에러 알림

---

## 📈 예상 성능

- **생성 시간:** 약 2-3분/글
- **이미지 생성:** 약 5-10초/이미지
- **비용:**
  - Gemini API: ~$0.05/글
  - Gemini Image: ~$0.10/이미지
  - 총: 약 $0.50/글
  - 월 60건 → 약 $30

---

## ⚠️ 주의사항

### 1. API 레이트 리밋
- Gemini API: 분당 요청 제한 확인
- 이미지 생성: 동시 생성 제한
- 재시도 로직 필수

### 2. 콘텐츠 품질 관리
- 정기적으로 생성된 글 확인
- 부적절한 내용 필터링
- 사실 확인 (AI 할루시네이션 방지)

### 3. 저작권
- 생성된 이미지는 AI 생성임을 명시
- 실제 사진 필요 시 Unsplash API 통합 고려

### 4. SEO
- 중복 콘텐츠 방지
- 캐노니컬 URL 설정
- 사이트맵 자동 업데이트

---

## 🎯 성공 기준

✅ **기술적 성공:**
- 자동 생성 성공률 95% 이상
- 평균 생성 시간 3분 이내
- 에러 발생 시 자동 복구

✅ **콘텐츠 품질:**
- 자연스러운 문체 (AI 티 안남)
- 실용적인 정보 제공
- 이미지 적절하게 배치
- 2000자 이상 고품질 콘텐츠

✅ **운영 효율:**
- 수동 개입 없이 안정적 운영
- 문제 발생 시 알림
- 대시보드로 쉽게 모니터링

---

## 🔮 향후 확장 가능성

### 단기 (1-2개월)
- 주제 투표 시스템 (독자 의견 반영)
- 다양한 카테고리 추가
- 시리즈 글 자동 생성

### 중기 (3-6개월)
- 다국어 지원 (영어, 중국어)
- 동영상 스크립트 자동 생성
- SNS 자동 배포 (인스타그램, 페이스북)

### 장기 (6개월+)
- 독자 반응 분석 (AI 학습)
- 개인화 추천 시스템
- 광고 수익 최적화

---

## 📞 구현 시 고려사항

### 1. 테스트 전략
```typescript
// 단위 테스트
- 주제 생성 로직
- 콘텐츠 생성 로직
- 이미지 생성 로직

// 통합 테스트
- 전체 워크플로우
- Cron Job 실행

// 수동 테스트
- 생성된 글 품질 확인
- 이미지 적절성 확인
```

### 2. 모니터링
```typescript
// 로그 항목
- 생성 시작/완료 시간
- 각 단계별 소요 시간
- 에러 발생 시 상세 정보
- API 호출 횟수 및 비용

// 알림 설정
- 생성 실패 시 이메일/슬랙
- API 에러율 20% 이상 시
- 비용 예산 초과 시
```

### 3. 백업 및 복구
```typescript
// 백업 전략
- 생성된 콘텐츠 자동 백업
- 실패한 생성 재시도 큐
- 주제 큐 백업

// 복구 전략
- 실패 시 이전 버전으로 롤백
- 수동 개입 옵션
```

---

**작성자:** Claude Code AI Assistant
**최종 수정:** 2025-11-01
**버전:** 1.0
**상태:** 구현 준비 완료

---

## 🎬 다음 단계

이 MD 파일을 기반으로 다른 AI 또는 개발자가 다음 순서로 구현하면 됩니다:

1. ✅ 이 MD 파일 검토 및 수정
2. ✅ Phase 1부터 순차적으로 코드 작성
3. ✅ 각 단계별 테스트
4. ✅ 환경 변수 설정
5. ✅ Cron Job 설정 및 테스트
6. ✅ 프로덕션 배포
7. ✅ 모니터링 및 최적화

**질문이나 수정 사항이 있으면 이 파일을 업데이트하세요!**

---

## 🔗 현재 프로젝트 통합 가이드

### 📍 프로젝트 정보

**현재 프로젝트:** AI Content Platform
**배포 URL:** https://ai-platform-one.vercel.app
**GitHub:** https://github.com/mon664/ai-platform
**배포 플랫폼:** Vercel

---

### 🔑 사용할 API 키 (이미 설정됨)

```bash
# Vercel 환경 변수 (Settings → Environment Variables)

# AI 텍스트 생성
GEMINI_API_KEY=AIzaSy... (메인 키)

# 이미지 생성 (같은 키 사용 가능)
Cloud_all_API=AIzaSyCDznEqbR15saENX8cK1MOLBT-f9wgUxfQ

# 데이터베이스 (블로그 저장)
REDIS_URL=redis://default:***@redis-11417.c340.ap-northeast-2-1.ec2.redns.redis-cloud.com:11417

# 인증 (관리자만 접근)
JWT_SECRET=your-jwt-secret
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-password

# ⭐ 새로 추가 필요
CRON_SECRET=random-secret-for-cron-job-authentication
```

**CRON_SECRET 생성 방법:**
```bash
# 랜덤 문자열 생성 (32자 이상 권장)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 📱 Navigation 메뉴 추가

**파일:** `app/components/Navigation.tsx`

**추가할 메뉴:**
```typescript
// 기존 menuItems 배열에 추가
const menuItems = [
  { id: 'home', label: '🏠 홈', href: '/' },
  {
    id: 'youtube',
    label: '🎬 유튜브',
    // ... 기존 서브메뉴
  },
  { id: 'blog', label: '📝 블로그', href: '/blog' },
  // ⭐ 여기 추가
  { id: 'auto-blog', label: '🤖 자동블로그', href: '/auto-blog' },
];
```

---

### 🛡️ 인증 적용

자동 블로그 관리 대시보드는 **관리자만 접근 가능**해야 합니다.

**적용 방법:**

1. **대시보드 페이지 보호**
```typescript
// app/auto-blog/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/client-auth'

export default function AutoBlogDashboard() {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/admin/login')
    }
  }, [])

  // ... 나머지 코드
}
```

2. **모든 API 라우트 보호**
```typescript
// app/api/auto-blog/*/route.ts
import { requireAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  // ... 나머지 코드
}
```

3. **Cron Job만 예외** (인증 방식 다름)
```typescript
// app/api/cron/auto-blog/route.ts
// JWT 대신 CRON_SECRET 사용
const authHeader = req.headers.get('authorization')
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

---

### 📦 설치할 패키지 (추가 없음!)

**현재 프로젝트에 이미 설치됨:**
- ✅ `jsonwebtoken` - JWT 인증
- ✅ `ioredis` - Redis 연결
- ✅ Next.js, React, TypeScript

**추가 설치 필요 없음!** 👍

---

### 🚀 배포 방법

#### 1. 코드 작성 후 Git 푸시

```bash
# 파일 추가
git add app/auto-blog/ app/api/auto-blog/ app/api/cron/ lib/auto-blog/ vercel.json

# 커밋
git commit -m "feat: add AI auto-blog generator system"

# 푸시 (자동 배포됨)
git push
```

#### 2. Vercel 환경 변수 추가

**Vercel 대시보드 접속:**
1. https://vercel.com
2. `ai-platform` 프로젝트 선택
3. **Settings** → **Environment Variables**

**추가할 변수:**
```bash
Name: CRON_SECRET
Value: [생성한 랜덤 문자열]
Environments: ✅ Production ✅ Preview ✅ Development
```

**Save** 클릭!

#### 3. Vercel Cron 설정 확인

**파일:** `vercel.json` (프로젝트 루트)

```json
{
  "crons": [
    {
      "path": "/api/cron/auto-blog",
      "schedule": "0 0,9 * * *"
    }
  ]
}
```

**스케줄 설명:**
- `0 0,9 * * *` = UTC 기준 0시, 9시
- **한국 시간:** 오전 9시, 오후 6시 ✅

**배포 후 자동 적용됨!**

#### 4. 배포 확인

```bash
# 터미널에서 (또는 자동 배포 대기)
vercel --prod

# 완료 후 확인
# 1. https://ai-platform-one.vercel.app/auto-blog (대시보드)
# 2. Vercel 대시보드 → Cron Jobs 탭 확인
```

---

### 🔍 배포 후 체크리스트

**1. 환경 변수 확인**
```
✅ GEMINI_API_KEY
✅ REDIS_URL
✅ JWT_SECRET
✅ ADMIN_EMAIL
✅ ADMIN_PASSWORD
✅ CRON_SECRET (새로 추가)
```

**2. 페이지 접근 테스트**
```
✅ https://ai-platform-one.vercel.app/auto-blog
   → 로그인 안 하면 → /admin/login 리다이렉트
   → 로그인 후 → 대시보드 표시
```

**3. API 테스트**
```bash
# 로그인
curl -X POST https://ai-platform-one.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 응답에서 token 복사

# 수동 생성 테스트
curl -X POST https://ai-platform-one.vercel.app/api/auto-blog/manual \
  -H "Authorization: Bearer [token]"
```

**4. Cron Job 확인**
```
Vercel 대시보드 → Settings → Cron Jobs
→ /api/cron/auto-blog 표시되는지 확인
→ Next Run 시간 확인
```

**5. 첫 실행 로그 확인**
```
Vercel 대시보드 → Deployments → 최신 배포 클릭
→ Functions 탭 → /api/cron/auto-blog 클릭
→ 로그 확인
```

---

### 🧪 테스트 시나리오

#### 시나리오 1: 수동 생성 테스트

1. https://ai-platform-one.vercel.app/admin/login 접속
2. 로그인
3. https://ai-platform-one.vercel.app/auto-blog 접속
4. "지금 바로 생성하기" 버튼 클릭
5. 생성 진행 상황 표시
6. 완료 후 https://ai-platform-one.vercel.app/blog 에서 확인

#### 시나리오 2: 자동 생성 테스트

1. Cron Job 시간 대기 (오전 9시 또는 오후 6시)
2. 또는 Vercel 대시보드에서 수동 트리거
3. 생성 완료 확인
4. /blog 페이지에서 새 글 확인

#### 시나리오 3: 에러 핸들링 테스트

1. API 키 일부러 잘못 설정
2. 수동 생성 실행
3. 에러 메시지 표시 확인
4. Redis에 에러 로그 저장 확인

---

### 📊 모니터링 방법

#### 1. Vercel 대시보드
```
Deployments → Functions → /api/cron/auto-blog
→ Invocations (실행 횟수)
→ Duration (실행 시간)
→ Errors (에러 발생)
```

#### 2. Redis 데이터 확인
```bash
# Redis CLI 접속
redis-cli -u $REDIS_URL

# 자동 생성 이력 확인
KEYS auto-blog:history:*

# 최근 이력 조회
GET auto-blog:history:2025-11-01T09:00:00
```

#### 3. 생성된 블로그 확인
```
https://ai-platform-one.vercel.app/blog
→ 최신 글 2개 확인 (하루 2건)
```

---

### 🐛 트러블슈팅

#### 문제 1: Cron Job이 실행 안됨
**원인:** CRON_SECRET 미설정 또는 스케줄 오류
**해결:**
1. Vercel 환경 변수에서 `CRON_SECRET` 확인
2. `vercel.json` 스케줄 확인
3. Vercel Cron Jobs 탭에서 상태 확인

#### 문제 2: 이미지 생성 실패
**원인:** Gemini Image API 레이트 리밋
**해결:**
1. 이미지 개수 줄이기 (5개 → 3개)
2. 재시도 로직 추가
3. API 키 쿼터 확인

#### 문제 3: 블로그 게시 실패
**원인:** Redis 연결 오류
**해결:**
1. `REDIS_URL` 환경 변수 확인
2. Redis 서버 상태 확인
3. 네트워크 방화벽 확인

#### 문제 4: 인증 오류
**원인:** JWT_SECRET 미설정
**해결:**
1. Vercel 환경 변수 확인
2. 재배포 필요 시 `vercel --prod`

---

### 💡 개발 팁

#### 로컬 테스트 방법

```bash
# 로컬 환경 변수 설정
# .env.local 파일 생성
GEMINI_API_KEY=...
REDIS_URL=...
JWT_SECRET=test-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
CRON_SECRET=test-cron-secret

# 로컬 서버 실행
npm run dev

# 브라우저에서 테스트
http://localhost:3000/auto-blog
```

#### API 직접 호출 테스트

```bash
# Cron Job 시뮬레이션 (로컬)
curl -X GET http://localhost:3000/api/cron/auto-blog \
  -H "Authorization: Bearer test-cron-secret"

# 수동 생성 (로컬)
# 1. 로그인해서 token 받기
# 2. 수동 생성 API 호출
curl -X POST http://localhost:3000/api/auto-blog/manual \
  -H "Authorization: Bearer [token]"
```

---

### 🎯 배포 완료 후 확인사항

**완료 체크리스트:**

- [ ] Vercel 환경 변수 6개 설정 완료
- [ ] `vercel.json` Cron 설정 확인
- [ ] Git 푸시 및 자동 배포 완료
- [ ] /auto-blog 페이지 접속 가능
- [ ] 로그인 후 대시보드 표시
- [ ] 수동 생성 테스트 성공
- [ ] 블로그 게시 확인
- [ ] Navigation 메뉴 추가됨
- [ ] Cron Job 등록 확인 (Vercel 대시보드)
- [ ] 첫 자동 생성 실행 대기 (오전 9시 또는 오후 6시)

**모든 항목 체크 완료 시 → 운영 시작! 🎉**

---

### 📞 추가 도움말

**구현 중 막히면:**
1. 이 MD 파일의 해당 섹션 다시 확인
2. `프로젝트_진행상황.md` 파일 참고
3. 기존 코드 (`app/shorts/`, `app/blog/`) 참고
4. Vercel 로그 확인

**다른 AI에게 인계 시:**
"AI_AUTO_BLOG_기획서.md 파일을 읽고 Phase 1부터 구현해줘"

---

**이제 모든 정보가 준비되었습니다! 🚀**
