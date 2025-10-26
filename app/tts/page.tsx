'use client'
import { useState } from 'react'
import Navigation from '../components/Navigation'

interface Speaker {
  text: string
  voice: string
  tone: string
}

export default function TTSPage() {
  const [speaker1, setSpeaker1] = useState<Speaker>({ text: '', voice: 'ko-KR-Neural2-A', tone: '' })
  const [speaker2, setSpeaker2] = useState<Speaker>({ text: '', voice: 'ko-KR-Neural2-C', tone: '' })
  const [useTwoSpeakers, setUseTwoSpeakers] = useState(false)
  const [speed, setSpeed] = useState(1.0)
  const [pitch, setPitch] = useState(0.0)
  const [loading, setLoading] = useState(false)
  const [audioUrls, setAudioUrls] = useState<string[]>([])
  const [error, setError] = useState('')

  const voices = [
    { value: 'ko-KR-Standard-A', label: '여성 A (Standard)' },
    { value: 'ko-KR-Standard-B', label: '여성 B (Standard)' },
    { value: 'ko-KR-Standard-C', label: '남성 C (Standard)' },
    { value: 'ko-KR-Standard-D', label: '남성 D (Standard)' },
    { value: 'ko-KR-Neural2-A', label: '여성 A (Neural - 고품질)' },
    { value: 'ko-KR-Neural2-B', label: '여성 B (Neural - 고품질)' },
    { value: 'ko-KR-Neural2-C', label: '남성 C (Neural - 고품질)' }
  ]

  const generateTTS = async () => {
    if (!speaker1.text.trim()) {
      setError('화자 1의 텍스트를 입력해주세요')
      return
    }

    if (useTwoSpeakers && !speaker2.text.trim()) {
      setError('화자 2의 텍스트를 입력해주세요')
      return
    }

    setLoading(true)
    setError('')
    setAudioUrls([])

    try {
      const speakers = useTwoSpeakers ? [speaker1, speaker2] : [speaker1]

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speakers, speed, pitch })
      })

      if (!res.ok) throw new Error('음성 생성 실패')

      const data = await res.json()
      setAudioUrls(data.audioUrls || [])
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const downloadAudio = (url: string, index: number) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `voice-${index + 1}-${Date.now()}.wav`
    link.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-gray-900 text-white">
      <Navigation />
      <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center">Google TTS 음성 생성기</h1>
        <p className="text-gray-400 text-center mb-8">고품질 한국어 Neural 음성 • WAV 다운로드</p>

        {/* 2명 음성 토글 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useTwoSpeakers}
              onChange={(e) => setUseTwoSpeakers(e.target.checked)}
              className="w-5 h-5 mr-3"
            />
            <span className="text-lg font-semibold">2명의 음성 사용 (대화형)</span>
          </label>
        </div>

        {/* 화자 1 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">🎤 화자 1</h3>

          <label className="block text-sm font-semibold mb-2">텍스트</label>
          <textarea
            value={speaker1.text}
            onChange={(e) => setSpeaker1({ ...speaker1, text: e.target.value })}
            placeholder="화자 1의 대사를 입력하세요..."
            className="w-full h-32 bg-gray-700 text-white rounded-lg p-4 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            maxLength={5000}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">음성</label>
              <select
                value={speaker1.voice}
                onChange={(e) => setSpeaker1({ ...speaker1, voice: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {voices.map(v => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">톤/분위기 (선택)</label>
              <input
                type="text"
                value={speaker1.tone}
                onChange={(e) => setSpeaker1({ ...speaker1, tone: e.target.value })}
                placeholder="예: 밝고 경쾌하게"
                className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* 화자 2 */}
        {useTwoSpeakers && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">🎤 화자 2</h3>

            <label className="block text-sm font-semibold mb-2">텍스트</label>
            <textarea
              value={speaker2.text}
              onChange={(e) => setSpeaker2({ ...speaker2, text: e.target.value })}
              placeholder="화자 2의 대사를 입력하세요..."
              className="w-full h-32 bg-gray-700 text-white rounded-lg p-4 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={5000}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">음성</label>
                <select
                  value={speaker2.voice}
                  onChange={(e) => setSpeaker2({ ...speaker2, voice: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {voices.map(v => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">톤/분위기 (선택)</label>
                <input
                  type="text"
                  value={speaker2.tone}
                  onChange={(e) => setSpeaker2({ ...speaker2, tone: e.target.value })}
                  placeholder="예: 차분하고 진지하게"
                  className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 공통 설정 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <label className="block text-lg font-semibold mb-3">
              속도: {speed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <label className="block text-lg font-semibold mb-3">
              음높이: {pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="-20"
              max="20"
              step="1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* 생성 버튼 */}
        <button
          onClick={generateTTS}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors mb-6"
        >
          {loading ? '음성 생성 중...' : '🎤 음성 생성하기'}
        </button>

        {/* 에러 */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* 결과 */}
        {audioUrls.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">생성된 음성 ({audioUrls.length}개)</h2>
            {audioUrls.map((url, i) => (
              <div key={i} className="mb-4 p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2">화자 {i + 1}</h3>
                <audio controls className="w-full mb-2" src={url} />
                <button
                  onClick={() => downloadAudio(url, i)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  WAV 다운로드
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-400 text-center mt-6">
          💡 Google Cloud Text-to-Speech API 사용 • 고품질 Neural 음성
        </p>
      </div>
      </div>
    </div>
  )
}
