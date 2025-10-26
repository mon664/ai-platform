'use client'
import { useState } from 'react'
import Navigation from '../components/Navigation'

interface ShortsResult {
  script: string
  audioUrl: string
  images: string[]
}

export default function ShortsPage() {
  const [mode, setMode] = useState<'keyword' | 'prompt'>('keyword')
  const [keyword, setKeyword] = useState('')
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState(30)
  const [sceneCount, setSceneCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [result, setResult] = useState<ShortsResult | null>(null)
  const [error, setError] = useState('')
  const [improving, setImproving] = useState(false)

  const improveInput = async () => {
    const input = mode === 'keyword' ? keyword : prompt

    if (!input.trim()) {
      setError('입력을 먼저 작성해주세요')
      return
    }

    setImproving(true)
    setError('')

    try {
      const res = await fetch('/api/shorts/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, mode })
      })

      if (!res.ok) throw new Error('개선 실패')

      const data = await res.json()

      if (mode === 'keyword') {
        setKeyword(data.improved)
      } else {
        setPrompt(data.improved)
      }
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다')
    } finally {
      setImproving(false)
    }
  }

  const generateShorts = async () => {
    const input = mode === 'keyword' ? keyword : prompt;

    if (!input.trim()) {
      setError(mode === 'keyword' ? '키워드를 입력해주세요' : '프롬프트를 입력해주세요');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setProgress('쇼츠 생성 중... 잠시만 기다려주세요.'); // A single progress message

    try {
      const res = await fetch('/api/shorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          input,
          duration,
          sceneCount,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || '쇼츠 생성에 실패했습니다.');
      }

      const data = await res.json();
      
      // The new API returns a script and an array of images
      setResult({
        script: data.script,
        images: data.images,
        audioUrl: '', // audioUrl is not part of this API response
      });

    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const downloadAll = () => {
    // 대본 다운로드
    const scriptBlob = new Blob([result?.script || ''], { type: 'text/plain' })
    const scriptUrl = URL.createObjectURL(scriptBlob)
    const scriptLink = document.createElement('a')
    scriptLink.href = scriptUrl
    scriptLink.download = `script-${Date.now()}.txt`
    scriptLink.click()

    // 이미지 다운로드
    result?.images.forEach((img, i) => {
      const link = document.createElement('a')
      link.href = img
      link.download = `scene-${i + 1}.png`
      link.click()
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 to-gray-900 text-white">
      <Navigation />
      <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center">YouTube 쇼츠 자동 생성기</h1>
        <p className="text-gray-400 text-center mb-8">AI가 대본과 장면 이미지를 자동으로 생성</p>

        {/* 생성 모드 선택 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <label className="block text-lg font-semibold mb-3">생성 모드</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode('keyword')}
              className={`p-4 rounded-lg font-semibold transition-colors ${
                mode === 'keyword'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              🔑 키워드 모드
              <p className="text-sm font-normal mt-1">간단한 주제로 자동 생성</p>
            </button>
            <button
              onClick={() => setMode('prompt')}
              className={`p-4 rounded-lg font-semibold transition-colors ${
                mode === 'prompt'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              ✍️ 프롬프트 모드
              <p className="text-sm font-normal mt-1">상세한 대본/시나리오 입력</p>
            </button>
          </div>
        </div>

        {/* 입력 영역 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          {mode === 'keyword' ? (
            <>
              <label className="block text-lg font-semibold mb-3">키워드</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="예: 고구마의 효능, 우주의 신비, AI의 미래"
                className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <p className="text-sm text-gray-400 mt-2">간단한 주제를 입력하면 AI가 자동으로 대본을 생성합니다</p>
              <button
                onClick={improveInput}
                disabled={improving}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {improving ? 'AI 개선 중...' : '🤖 AI로 키워드 개선하기'}
              </button>
            </>
          ) : (
            <>
              <label className="block text-lg font-semibold mb-3">상세 프롬프트</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: 고구마의 5가지 건강 효능에 대해 설명하는 영상을 만들어줘. 각 효능마다 구체적인 예시를 들어서 설명하고, 마지막에는 섭취 방법을 추천해줘."
                className="w-full h-32 bg-gray-700 text-white rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <p className="text-sm text-gray-400 mt-2">상세한 대본이나 시나리오를 입력하면 더 정확한 결과를 얻을 수 있습니다</p>
              <button
                onClick={improveInput}
                disabled={improving}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {improving ? 'AI 개선 중...' : '🤖 AI로 프롬프트 개선하기'}
              </button>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 영상 길이 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <label className="block text-lg font-semibold mb-3">영상 길이</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value={30}>30초</option>
              <option value={45}>45초</option>
              <option value={60}>60초 (1분)</option>
            </select>
          </div>

          {/* 장면 수 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <label className="block text-lg font-semibold mb-3">장면 수</label>
            <select
              value={sceneCount}
              onChange={(e) => setSceneCount(Number(e.target.value))}
              className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {[3, 4, 5, 6, 7, 8].map(n => (
                <option key={n} value={n}>{n}개</option>
              ))}
            </select>
          </div>
        </div>

        {/* 생성 버튼 */}
        <button
          onClick={generateShorts}
          disabled={loading}
          className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors mb-6"
        >
          {loading ? progress || '생성 중...' : '쇼츠 자동 생성하기'}
        </button>

        {/* 에러 */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* 결과 */}
        {result && (
          <div className="space-y-6">
            {/* 대본 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">생성된 대본</h2>
              <p className="whitespace-pre-wrap bg-gray-700 p-4 rounded">{result.script}</p>
            </div>

            {/* 음성 */}
            {result.audioUrl && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">음성</h2>
                <audio controls className="w-full" src={result.audioUrl} />
              </div>
            )}

            {/* 이미지 */}
            {result.images.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">장면 이미지 ({result.images.length}개)</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {result.images.map((img, i) => (
                    <img key={i} src={img} alt={`Scene ${i + 1}`} className="w-full rounded-lg" />
                  ))}
                </div>
              </div>
            )}

            {/* 다운로드 */}
            <button
              onClick={downloadAll}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              모든 파일 다운로드
            </button>

            <p className="text-sm text-gray-400 text-center">
              💡 생성된 이미지와 음성을 영상 편집 프로그램에서 합성하여 쇼츠를 완성하세요
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
