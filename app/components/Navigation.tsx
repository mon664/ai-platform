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
      // Check if the current path is under the youtube category
      isActive: pathname.startsWith('/character') || pathname.startsWith('/tts') || pathname.startsWith('/shorts') || pathname.startsWith('/story'),
      subItems: [
        { id: 'shorts', label: '🎬 쇼츠', href: '/shorts' },
        { id: 'story', label: '📖 스토리', href: '/story' },
        { id: 'character', label: '👤 캐릭터', href: '/character' },
        { id: 'tts', label: '🎤 음성', href: '/tts' },
      ],
    },
    { id: 'blog', label: '📝 블로그', href: '/blog' },
  ];

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex overflow-x-auto scrollbar-hide">
          {menuItems.map(item => {
            if (item.subItems) {
              return (
                <div key={item.id} className="relative group">
                  <button
                    className={`
                      px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all flex items-center
                      ${item.isActive
                        ? 'bg-blue-600 text-white border-b-4 border-blue-400'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                    `}
                  >
                    {item.label}
                    <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  <div className="absolute top-full left-0 bg-gray-800 border border-gray-700 rounded-md shadow-lg hidden group-hover:block z-10">
                    {item.subItems.map(subItem => (
                      <Link
                        key={subItem.id}
                        href={subItem.href}
                        className={`
                          block px-6 py-3 text-sm whitespace-nowrap
                          ${pathname === subItem.href
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'}
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
                  px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all
                  ${pathname === item.href
                    ? 'bg-blue-600 text-white border-b-4 border-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'}
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
