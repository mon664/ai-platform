export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 text-center">AI Content Platform</h1>
        <p className="text-gray-400 text-center mb-12">AI 기반 콘텐츠 제작 도구 모음</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Story Generator */}
          <a href="/story" className="bg-gray-800 hover:bg-gray-750 rounded-lg p-8 transition-all hover:scale-105">
            <h2 className="text-3xl font-bold mb-3">📖 AI 스토리 생성기</h2>
            <p className="text-gray-400 mb-4">스토리와 주인공 사진으로 일관성 있는 장면 이미지 생성</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>✓ Gemini Vision 얼굴 분석</li>
              <li>✓ Nano Banana 일관된 캐릭터</li>
              <li>✓ 여러 비율 지원 (16:9, 9:16, 1:1)</li>
            </ul>
          </a>

          {/* Character Generator */}
          <a href="/character" className="bg-gray-800 hover:bg-gray-750 rounded-lg p-8 transition-all hover:scale-105">
            <h2 className="text-3xl font-bold mb-3">👤 캐릭터 생성기</h2>
            <p className="text-gray-400 mb-4">프롬프트로 주인공 이미지 1장 생성</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>✓ YouTube 썸네일용</li>
              <li>✓ AI 스토리 주인공용</li>
              <li>✓ 다양한 비율 선택</li>
            </ul>
          </a>

          {/* Google TTS */}
          <a href="/tts" className="bg-gray-800 hover:bg-gray-750 rounded-lg p-8 transition-all hover:scale-105">
            <h2 className="text-3xl font-bold mb-3">🎤 Google TTS</h2>
            <p className="text-gray-400 mb-4">시나리오를 자연스러운 AI 음성으로 변환</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>✓ 한국어 Neural 음성</li>
              <li>✓ 속도 조절 가능</li>
              <li>✓ MP3 다운로드</li>
            </ul>
          </a>

          {/* Shorts Generator */}
          <a href="/shorts" className="bg-gray-800 hover:bg-gray-750 rounded-lg p-8 transition-all hover:scale-105">
            <h2 className="text-3xl font-bold mb-3">🎬 쇼츠 자동 생성</h2>
            <p className="text-gray-400 mb-4">키워드로 대본, 음성, 이미지 자동 생성</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>✓ Gemini 대본 생성</li>
              <li>✓ Google TTS 음성</li>
              <li>✓ Nano Banana 장면 이미지</li>
            </ul>
          </a>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Powered by Gemini AI, Google TTS, Nano Banana</p>
          <p className="mt-2">Cloudflare Pages • Next.js 15 • Edge Runtime</p>
        </div>
      </div>
    </main>
  );
}