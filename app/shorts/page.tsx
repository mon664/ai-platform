'use client'
import { useState } from 'react'
import Navigation from '../components/Navigation'

interface ShortsResult {
  script: string
  audioUrl: string
  images: string[]
}

export default function ShortsPage() {
  const [keyword, setKeyword] = useState('')
  const [sceneCount, setSceneCount] = useState(5)
  const [voice, setVoice] = useState('ko-KR-Neural2-A')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [result, setResult] = useState<ShortsResult | null>(null)
  const [error, setError] = useState('')

  const voices = [
    { value: 'ko-KR-Standard-A', label: '여성 A' },
    { value: 'ko-KR-Standard-B', label: '여성 B' },
    { value: 'ko-KR-Standard-C', label: '남성 C' },
    { value: 'ko-KR-Neural2-A', label: 'Neural 여성 A' },
    { value: 'ko-KR-Neural2-B', label: 'Neural 여성 B' },
    { value: 'ko-KR-Neural2-C', label: 'Neural 남성 C' }
  ]

  const generateShorts = async () => {
    if (!keyword.trim()) {
      setError('키워드를 입력해주세요')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setProgress('대본 생성 중...')

    try {
      const res = await fetch('/api/shorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, sceneCount, voice })
      })

      if (!res.ok) throw new Error('쇼츠 생성 실패')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('스트림을 읽을 수 없습니다')

      let resultData: ShortsResult = { script: '', audioUrl: '', images: [] }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))

            if (data.progress) {
              setProgress(data.progress)
            }
            if (data.script) {
              resultData.script = data.script
            }
            if (data.audioUrl) {
              resultData.audioUrl = data.audioUrl
            }
            if (data.image) {
              resultData.images.push(data.image)
            }
            if (data.complete) {
              setResult(resultData)
            }
          }
        }
      }

    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다')
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

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
        <p className="text-gray-400 text-center mb-8">키워드 입력만으로 쇼츠 제작 소재 생성</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* 키워드 입력 */}
          <div className="bg-gray-800 rounded-lg p-6 md:col-span-2">
            <label className="block text-lg font-semibold mb-3">키워드</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="예: 고구마, 우주, 인공지능"
              className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
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

        {/* 음성 선택 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <label className="block text-lg font-semibold mb-3">음성</label>
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            {voices.map(v => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
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
