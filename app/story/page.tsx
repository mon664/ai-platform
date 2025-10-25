'use client'

import { useState } from 'react'

export default function StoryGenerator() {
  const [protagonist, setProtagonist] = useState<File | null>(null)
  const [partner, setPartner] = useState<File | null>(null)
  const [story, setStory] = useState('')
  const [persona, setPersona] = useState('')
  const [sceneCount, setSceneCount] = useState(8)
  const [loading, setLoading] = useState(false)
  const [scenes, setScenes] = useState<string[]>([])

  const handleGenerate = async () => {
    if (!protagonist || !story) {
      alert('주인공 이미지와 스토리를 입력해주세요')
      return
    }

    setLoading(true)
    setScenes([])

    const formData = new FormData()
    formData.append('protagonist', protagonist)
    if (partner) formData.append('partner', partner)
    formData.append('story', story)
    formData.append('persona', persona)
    formData.append('sceneCount', sceneCount.toString())

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Generation failed')

      const data = await res.json()
      setScenes(data.scenes)
    } catch (error) {
      alert('생성 실패: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🎬 AI 스토리 장면 생성기</h1>

        {/* Character Upload */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl mb-4">1. 캐릭터 업로드</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">주인공</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProtagonist(e.target.files?.[0] || null)}
                className="w-full p-2 bg-gray-700 rounded"
              />
            </div>
            <div>
              <label className="block mb-2">상대역 (선택)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPartner(e.target.files?.[0] || null)}
                className="w-full p-2 bg-gray-700 rounded"
              />
            </div>
          </div>
        </div>

        {/* Story Input */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl mb-4">2. 스토리 작성</h2>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="스토리를 입력하세요..."
            maxLength={1000}
            className="w-full h-32 p-4 bg-gray-700 rounded resize-none"
          />
          <p className="text-sm text-gray-400 mt-2">{story.length} / 1000</p>
        </div>

        {/* AI Persona */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl mb-4">3. AI 페르소나 (선택)</h2>
          <textarea
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder="AI 스토리텔러의 페르소나를 입력하세요..."
            maxLength={500}
            className="w-full h-24 p-4 bg-gray-700 rounded resize-none"
          />
        </div>

        {/* Settings */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl mb-4">4. 설정</h2>
          <label className="block mb-2">장면 수:</label>
          <select
            value={sceneCount}
            onChange={(e) => setSceneCount(Number(e.target.value))}
            className="w-full p-2 bg-gray-700 rounded"
          >
            <option value={8}>8 장면</option>
            <option value={12}>12 장면</option>
            <option value={16}>16 장면</option>
          </select>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-4 rounded-lg text-xl transition"
        >
          {loading ? '생성 중...' : '장면 생성하기'}
        </button>

        {/* Results */}
        {scenes.length > 0 && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl mb-4">생성된 장면</h2>
            <div className="grid grid-cols-2 gap-4">
              {scenes.map((url, i) => (
                <img key={i} src={url} alt={`Scene ${i + 1}`} className="rounded" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
