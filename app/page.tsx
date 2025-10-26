'use client'
import { useState } from 'react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('home')

  const tabs = [
    { id: 'home', label: '🏠 홈', icon: '🏠' },
    { id: 'character', label: '👤 캐릭터', icon: '👤', href: '/character' },
    { id: 'tts', label: '🎤 음성', icon: '🎤', href: '/tts' },
    { id: 'shorts', label: '🎬 쇼츠', icon: '🎬', href: '/shorts' },
    { id: 'story', label: '📖 스토리', icon: '📖', href: '/story' }
  ]

  const handleTabClick = (tab: any) => {
    if (tab.href) {
      window.location.href = tab.href
    } else {
      setActiveTab(tab.id)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 text-white">
      {/* 상단 네비게이션 탭 */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`
                  px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all
                  ${activeTab === tab.id || (tab.id === 'home' && !tab.href)
                    ? 'bg-blue-600 text-white border-b-4 border-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 text-center">AI Content Platform</h1>
          <p className="text-gray-400 text-center mb-12">AI 기반 콘텐츠 제작 도구 모음</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Story Generator */}
            <button
              onClick={() => window.location.href = '/story'}
              className="bg-gray-800 hover:bg-gray-750 rounded-lg p-8 transition-all hover:scale-105 text-left"
            >
              <h2 className="text-3xl font-bold mb-3">📖 AI 스토리 생성기</h2>
              <p className="text-gray-400 mb-4">스토리와 주인공 사진으로 일관성 있는 장면 이미지 생성</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✓ Gemini Vision 얼굴 분석</li>
                <li>✓ Nano Banana 일관된 캐릭터</li>
                <li>✓ 여러 비율 지원 (16:9, 9:16, 1:1)</li>
              </ul>
            </button>

            {/* Character Generator */}
            <button
              onClick={() => window.location.href = '/character'}
              className="bg-gray-800 hover:bg-gray-750 rounded-lg p-8 transition-all hover:scale-105 text-left"
            >
              <h2 className="text-3xl font-bold mb-3">👤 캐릭터 생성기</h2>
              <p className="text-gray-400 mb-4">프롬프트로 주인공 이미지 1장 생성</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✓ YouTube 썸네일용</li>
                <li>✓ AI 스토리 주인공용</li>
                <li>✓ 다양한 비율 선택</li>
              </ul>
            </button>

            {/* Google TTS */}
            <button
              onClick={() => window.location.href = '/tts'}
              className="bg-gray-800 hover:bg-gray-750 rounded-lg p-8 transition-all hover:scale-105 text-left"
            >
              <h2 className="text-3xl font-bold mb-3">🎤 Google TTS</h2>
              <p className="text-gray-400 mb-4">고품질 한국어 Neural 음성 생성</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✓ 2명 음성 대화 지원</li>
                <li>✓ 톤/분위기 AI 개선</li>
                <li>✓ WAV 파일 다운로드</li>
              </ul>
            </button>

            {/* Shorts Generator */}
            <button
              onClick={() => window.location.href = '/shorts'}
              className="bg-gray-800 hover:bg-gray-750 rounded-lg p-8 transition-all hover:scale-105 text-left"
            >
              <h2 className="text-3xl font-bold mb-3">🎬 쇼츠 자동 생성</h2>
              <p className="text-gray-400 mb-4">키워드로 대본, 이미지 자동 생성</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✓ Gemini 대본 생성</li>
                <li>✓ Nano Banana 장면 이미지</li>
                <li>✓ 실시간 진행 상황 표시</li>
              </ul>
            </button>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-2xl font-bold mb-4">🚀 빠른 시작 가이드</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <h4 className="font-semibold text-lg mb-2">📖 스토리 영상 만들기</h4>
                  <ol className="text-sm text-gray-400 space-y-1">
                    <li>1. <strong>캐릭터</strong> → 주인공 이미지 생성</li>
                    <li>2. <strong>스토리</strong> → 장면 이미지 생성</li>
                    <li>3. <strong>음성</strong> → 대본 개선 & TTS</li>
                    <li>4. 영상 편집 프로그램에서 합성</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">🎬 쇼츠 만들기</h4>
                  <ol className="text-sm text-gray-400 space-y-1">
                    <li>1. <strong>쇼츠</strong> → 키워드 입력</li>
                    <li>2. 자동 생성: 대본+음성+이미지</li>
                    <li>3. 모든 파일 다운로드</li>
                    <li>4. 영상 편집 프로그램에서 합성</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>Powered by Gemini AI, Google Cloud TTS, Nano Banana</p>
              <p className="mt-2">Cloudflare Pages • Next.js 15 • Edge Runtime</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}