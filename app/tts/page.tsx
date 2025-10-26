'use client'
import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'

interface Speaker {
  text: string
  improvedText: string
  voice: string
  tone: string
}

export default function TTSPage() {
  const [speaker1, setSpeaker1] = useState<Speaker>({ text: '', improvedText: '', voice: '', tone: '' })
  const [speaker2, setSpeaker2] = useState<Speaker>({ text: '', improvedText: '', voice: '', tone: '' })
  const [useTwoSpeakers, setUseTwoSpeakers] = useState(false)
  const [speed, setSpeed] = useState(1.0)
  const [pitch, setPitch] = useState(1.0)
  const [loading, setLoading] = useState(false)
  const [improving, setImproving] = useState(false)
  const [error, setError] = useState('')
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      const koVoices = voices.filter(v => v.lang.startsWith('ko'))
      setBrowserVoices(koVoices.length > 0 ? koVoices : voices.slice(0, 10))
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  const improveSpeaker = async (speakerNum: 1 | 2) => {
    const speaker = speakerNum === 1 ? speaker1 : speaker2

    if (!speaker.text.trim()) {
      setError(`화자 ${speakerNum}의 텍스트를 입력해주세요`)
      return
    }

    setImproving(true)
    setError('')

    try {
      const res = await fetch('/api/tts/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: speaker.text, tone: speaker.tone })
      })

      if (!res.ok) throw new Error('대본 개선 실패')

      const data = await res.json()

      if (speakerNum === 1) {
        setSpeaker1({ ...speaker1, improvedText: data.improvedText })
      } else {
        setSpeaker2({ ...speaker2, improvedText: data.improvedText })
      }
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다')
    } finally {
      setImproving(false)
    }
  }

  const playTTS = (speakerNum: 1 | 2) => {
    const speaker = speakerNum === 1 ? speaker1 : speaker2
    const textToSpeak = speaker.improvedText || speaker.text

    if (!textToSpeak.trim()) {
      setError(`화자 ${speakerNum}의 텍스트를 입력해주세요`)
      return
    }

    setError('')
    const utterance = new SpeechSynthesisUtterance(textToSpeak)

    if (speaker.voice) {
      const selectedVoice = browserVoices.find(v => v.name === speaker.voice)
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
        <p className="text-gray-400 text-center mb-8">AI 대본 개선 + 브라우저 TTS 음성</p>

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
            className="w-full h-24 bg-gray-700 text-white rounded-lg p-4 mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            maxLength={5000}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-semibold mb-2">음성</label>
              <select
                value={speaker1.voice}
                onChange={(e) => setSpeaker1({ ...speaker1, voice: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">기본 음성</option>
                {browserVoices.map(v => (
                  <option key={v.name} value={v.name}>{v.name}</option>
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

          {/* AI 개선 버튼 */}
          <button
            onClick={() => improveSpeaker(1)}
            disabled={improving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg mb-3 transition-colors"
          >
            {improving ? 'AI 개선 중...' : '🤖 AI로 대본 개선하기'}
          </button>

          {/* 개선된 텍스트 */}
          {speaker1.improvedText && (
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-2">개선된 대본</label>
              <textarea
                value={speaker1.improvedText}
                onChange={(e) => setSpeaker1({ ...speaker1, improvedText: e.target.value })}
                className="w-full h-24 bg-gray-700 text-white rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* 음성 듣기 버튼 */}
          <button
            onClick={() => playTTS(1)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🎤 음성 듣기
          </button>
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
              className="w-full h-24 bg-gray-700 text-white rounded-lg p-4 mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={5000}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-semibold mb-2">음성</label>
                <select
                  value={speaker2.voice}
                  onChange={(e) => setSpeaker2({ ...speaker2, voice: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">기본 음성</option>
                  {browserVoices.map(v => (
                    <option key={v.name} value={v.name}>{v.name}</option>
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

            {/* AI 개선 버튼 */}
            <button
              onClick={() => improveSpeaker(2)}
              disabled={improving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg mb-3 transition-colors"
            >
              {improving ? 'AI 개선 중...' : '🤖 AI로 대본 개선하기'}
            </button>

            {/* 개선된 텍스트 */}
            {speaker2.improvedText && (
              <div className="mb-3">
                <label className="block text-sm font-semibold mb-2">개선된 대본</label>
                <textarea
                  value={speaker2.improvedText}
                  onChange={(e) => setSpeaker2({ ...speaker2, improvedText: e.target.value })}
                  className="w-full h-24 bg-gray-700 text-white rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {/* 음성 듣기 버튼 */}
            <button
              onClick={() => playTTS(2)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🎤 음성 듣기
            </button>
          </div>
        )}

        {/* 공통 설정 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">음성 설정</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-3">
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
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>느림 (0.5x)</span>
                <span>빠름 (2.0x)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">
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
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>낮음 (0.5)</span>
                <span>높음 (2.0)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 에러 */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <p className="text-sm text-gray-400 text-center mt-6">
          💡 AI가 대본을 개선한 후 브라우저 TTS로 음성 재생 • Chrome 권장
        </p>
      </div>
      </div>
    </div>
  )
}
