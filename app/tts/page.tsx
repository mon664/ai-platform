'use client'
import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'

export default function TTSPage() {
  const [text, setText] = useState('')
  const [tone, setTone] = useState('')
  const [voice, setVoice] = useState('')
  const [speed, setSpeed] = useState(1.0)
  const [pitch, setPitch] = useState(1.0)
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState('')
  const [error, setError] = useState('')
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([])
  const [improvedText, setImprovedText] = useState('')

  useEffect(() => {
    // 브라우저 음성 로드
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      const koVoices = voices.filter(v => v.lang.startsWith('ko'))
      setBrowserVoices(koVoices.length > 0 ? koVoices : voices.slice(0, 5))
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  const improveTTS = async () => {
    if (!text.trim()) {
      setError('텍스트를 입력해주세요')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, tone })
      })

      if (!res.ok) throw new Error('대본 개선 실패')

      const data = await res.json()
      setImprovedText(data.improvedText || text)
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다')
      setImprovedText(text)
    } finally {
      setLoading(false)
    }
  }

  const generateTTS = () => {
    if (!improvedText && !text.trim()) {
      setError('텍스트를 먼저 입력하고 개선하기를 클릭하세요')
      return
    }

    setError('')
    const utterance = new SpeechSynthesisUtterance(improvedText || text)

    if (voice) {
      const selectedVoice = browserVoices.find(v => v.name === voice)
      if (selectedVoice) utterance.voice = selectedVoice
    }

    utterance.rate = speed
    utterance.pitch = pitch

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-gray-900 text-white">
      <Navigation />
      <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center">AI 음성 생성기</h1>
        <p className="text-gray-400 text-center mb-8">Gemini로 대본 개선 + 브라우저 TTS 음성</p>

        {/* 시나리오 입력 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <label className="block text-lg font-semibold mb-3">시나리오 / 대본</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="음성으로 변환할 텍스트를 입력하세요..."
            className="w-full h-32 bg-gray-700 text-white rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            maxLength={5000}
          />
          <p className="text-sm text-gray-400 mt-2">{text.length} / 5000자</p>
        </div>

        {/* 음성 톤/분위기 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <label className="block text-lg font-semibold mb-3">음성 톤 / 분위기 (선택사항)</label>
          <input
            type="text"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            placeholder="예: 밝고 경쾌하게, 차분하고 진지하게, 감성적으로, 유머러스하게"
            className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* AI 대본 개선 버튼 */}
        <button
          onClick={improveTTS}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors mb-6"
        >
          {loading ? 'AI 개선 중...' : '🤖 AI로 대본 개선하기'}
        </button>

        {/* 개선된 대본 */}
        {improvedText && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <label className="block text-lg font-semibold mb-3">개선된 대본</label>
            <textarea
              value={improvedText}
              onChange={(e) => setImprovedText(e.target.value)}
              className="w-full h-32 bg-gray-700 text-white rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* 음성 선택 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <label className="block text-lg font-semibold mb-3">음성</label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">기본 음성</option>
              {browserVoices.map(v => (
                <option key={v.name} value={v.name}>{v.name}</option>
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
          </div>

          {/* 음높이 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <label className="block text-lg font-semibold mb-3">
              음높이: {pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* 음성 재생 버튼 */}
        <button
          onClick={generateTTS}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors mb-6"
        >
          🎤 음성 듣기
        </button>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <p className="text-sm text-gray-400 text-center">
          💡 브라우저 내장 TTS를 사용합니다. Chrome에서 가장 잘 작동합니다.
        </p>
      </div>
      </div>
    </div>
  )
}
