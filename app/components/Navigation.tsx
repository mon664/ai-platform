'use client'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const tabs = [
    { id: 'home', label: '🏠 홈', href: '/' },
    { id: 'character', label: '👤 캐릭터', href: '/character' },
    { id: 'tts', label: '🎤 음성', href: '/tts' },
    { id: 'shorts', label: '🎬 쇼츠', href: '/shorts' },
    { id: 'story', label: '📖 스토리', href: '/story' }
  ]

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <a
              key={tab.id}
              href={tab.href}
              className={`
                px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all
                ${pathname === tab.href
                  ? 'bg-blue-600 text-white border-b-4 border-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'}
              `}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
