'use client'
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function Navigation() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: session, status } = useSession();

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

  useEffect(() => {
    setIsExpanded(false);
  }, [pathname]);

  const youtubeMenu = menuItems.find(item => item.id === 'youtube');

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Main Menu */}
          <div className="flex items-center">
            {menuItems.map(item => {
              if (item.subItems) {
                return (
                  <button
                    key={item.id}
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`px-3 py-2 rounded-md text-sm font-semibold flex items-center transition-colors ${item.isActive ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}>
                    {item.label}
                    <svg className={`w-4 h-4 ml-1.5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                )
              }
              return (
                <Link key={item.id} href={item.href!} className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${pathname === item.href ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}>
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Auth Section */}
          <div className="flex items-center">
            {status === 'loading' && (
              <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
            )}
            {status === 'unauthenticated' && (
              <button onClick={() => signIn('github')} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                로그인
              </button>
            )}
            {status === 'authenticated' && session.user && (
              <div className="flex items-center space-x-3">
                {session.user.image && (
                  <Image src={session.user.image} alt={session.user.name || 'User'} width={32} height={32} className="rounded-full" />
                )}
                <span className="text-sm font-medium text-gray-300 hidden sm:block">{session.user.name}</span>
                <button onClick={() => signOut()} className="px-3 py-2 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accordion Sub-menu Panel */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
        <div className="bg-black/20 p-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {youtubeMenu?.subItems?.map(subItem => (
              <Link key={subItem.id} href={subItem.href} className={`block text-center px-4 py-3 text-sm rounded-lg transition-colors ${pathname === subItem.href ? 'bg-blue-600 text-white' : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-200'}`}>
                {subItem.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
