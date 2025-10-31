'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link';

export default function Navigation() {
  const pathname = usePathname()

  const menuItems = [
    { id: 'home', label: '🏠 홈', href: '/' },
    {
      id: 'youtube',
      label: '🎬 유튜브',
      isActive: pathname.startsWith('/character') || pathname.startsWith('/tts') || pathname.startsWith('/shorts') || pathname.startsWith('/story'),
      subItems: [
        { id: 'shorts', label: '🎬 쇼츠 생성기', href: '/shorts' },
        { id: 'story', label: '📖 스토리 생성기', href: '/story' },
        { id: 'character', label: '👤 캐릭터 생성기', href: '/character' },
        { id: 'tts', label: '🎤 음성 생성기', href: '/tts' },
      ],
    },
    { id: 'blog', label: '📝 블로그', href: '/blog' },
  ];

  return (
    <div className="bg-gray-900/60 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex overflow-x-auto scrollbar-hide">
          {menuItems.map(item => {
            if (item.subItems) {
              return (
                <div key={item.id} className="relative group">
                  <button
                    className={`
                      px-5 py-4 font-semibold text-sm whitespace-nowrap transition-all flex items-center
                      ${item.isActive
                        ? 'text-white' // Active parent doesn't need a background, just text color
                        : 'text-gray-400 hover:text-white'}
                    `}
                  >
                    {item.label}
                    <svg className="w-4 h-4 ml-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  {/* Dropdown Panel */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 min-w-max bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-lg shadow-lg hidden group-hover:block opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-in-out z-10 py-2">
                    {item.subItems.map(subItem => (
                      <Link
                        key={subItem.id}
                        href={subItem.href}
                        className={`
                          block px-5 py-2.5 text-sm whitespace-nowrap
                          ${pathname === subItem.href
                            ? 'bg-blue-600 text-white' // Highlight for active sub-item
                            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'}
                        `}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={item.id}
                href={item.href!}
                className={`
                  px-5 py-4 font-semibold text-sm whitespace-nowrap transition-all
                  ${pathname === item.href
                    ? 'text-white' // Simplified active state for main links
                    : 'text-gray-400 hover:text-white'}
                `}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
