'use client'
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navigation() {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-gray-900/60 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-start">
          {menuItems.map(item => {
            if (item.subItems) {
              return (
                <div key={item.id} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`
                      px-5 py-4 font-semibold text-sm whitespace-nowrap transition-all flex items-center
                      ${item.isActive ? 'text-white' : 'text-gray-400 hover:text-white'}
                    `}
                  >
                    {item.label}
                    <svg className={`w-4 h-4 ml-1.5 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  
                  {/* Dropdown Panel */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64">
                      {/* Speech bubble tail */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-gray-800"></div>
                      <div className="bg-gray-800/90 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl p-4 space-y-2">
                        {item.subItems.map(subItem => (
                          <Link
                            key={subItem.id}
                            href={subItem.href}
                            onClick={() => setIsDropdownOpen(false)} // Close on item click
                            className={`
                              block text-center px-4 py-3 text-base rounded-lg
                              ${pathname === subItem.href
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:text-white hover:bg-gray-700/60'}
                            `}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.id}
                href={item.href!}
                className={`
                  px-5 py-4 font-semibold text-sm whitespace-nowrap transition-all
                  ${pathname === item.href ? 'text-white' : 'text-gray-400 hover:text-white'}
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
