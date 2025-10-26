'use client'
import { useState } from 'react'

export default function TTSPage() {
  const [text, setText] = useState('')
  const [voice, setVoice] = useState('ko-KR-Standard-A')
  const [speed, setSpeed] = useState(1.0)
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState('')
  const [error, setError] = useState('')

  const voices = [
    { value: 'ko-KR-Standard-A', label: '한국어 여성 A' },
    { value: 'ko-KR-Standard-B', label: '한국어 여성 B' },
    { value: 'ko-KR-Standard-C', label: '한국어 남성 C' },
    { value: 'ko-KR-Standard-D', label: '한국어 남성 D' },
    { value: 'ko-KR-Neural2-A', label: '한국어 Neural 여성 A (고품질)' },
    { value: 'ko-KR-Neural2-B', label: '한국어 Neural 여성 B (고품질)' },
    { value: 'ko-KR-Neural2-C', label: '한국어 Neural 남성 C (고품질)' }
  ]

  const generateTTS = async () => {
    if (!text.trim()) {
      setError('텍스트를 입력해주세요')
      return
    }

    setLoading(true)
    setError('')
    setAudioUrl('')

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice, speed })
      })

      if (!res.ok) throw new Error('음성 생성 실패')

      const data = await res.json()
      setAudioUrl(data.audioUrl)
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const downloadAudio = () => {
    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `tts-${Date.now()}.mp3`
    link.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center">Google TTS 음성 생성</h1>
        <p className="text-gray-400 text-center mb-8">시나리오를 음성 파일로 변환</p>

        {/* 시나리오 입력 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <label className="block text-lg font-semibold mb-3">시나리오</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="음성으로 변환할 텍스트를 입력하세요..."
            className="w-full h-48 bg-gray-700 text-white rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            maxLength={5000}
          />
          <p className="text-sm text-gray-400 mt-2">{text.length} / 5000자</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 음성 선택 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <label className="block text-lg font-semibold mb-3">음성 선택</label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {voices.map(v => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* 속도 조절 */}
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
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>느림 (0.5x)</span>
              <span>빠름 (2.0x)</span>
            </div>
          </div>
        </div>

        {/* 생성 버튼 */}
        <button
          onClick={generateTTS}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors mb-6"
        >
          {loading ? '음성 생성 중...' : '음성 생성하기'}
        </button>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* 결과 오디오 */}
        {audioUrl && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">생성된 음성</h2>
            <audio controls className="w-full mb-4" src={audioUrl} />
            <button
              onClick={downloadAudio}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              MP3 다운로드
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
