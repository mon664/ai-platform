'use client'
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            AI Content Platform
          </h1>
          <p className="text-gray-400 text-xl">AI 기반 콘텐츠 제작의 모든 것. 유튜브부터 블로그까지.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* YouTube Card */}
          <Link href="/shorts">
            <div className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 transition-all hover:border-blue-500 hover:scale-105 hover:bg-gray-800/80 cursor-pointer h-full flex flex-col">
              <div className="mb-4">
                <span className="text-5xl">🎬</span>
              </div>
              <h2 className="text-3xl font-bold mb-3">유튜브 콘텐츠 제작</h2>
              <p className="text-gray-400 mb-4 flex-grow">쇼츠, 스토리, 캐릭터, 음성 생성 등 유튜브 콘텐츠 제작을 위한 모든 도구를 만나보세요.</p>
              <span className="font-semibold text-blue-400 group-hover:underline mt-auto">시작하기 →</span>
            </div>
          </Link>

          {/* Blog Card */}
          <Link href="/blog">
            <div className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 transition-all hover:border-green-500 hover:scale-105 hover:bg-gray-800/80 cursor-pointer h-full flex flex-col">
              <div className="mb-4">
                <span className="text-5xl">📝</span>
              </div>
              <h2 className="text-3xl font-bold mb-3">개발 블로그</h2>
              <p className="text-gray-400 mb-4 flex-grow">AI 플랫폼 개발 과정에서 얻은 인사이트와 기술 팁을 공유합니다.</p>
              <span className="font-semibold text-green-400 group-hover:underline mt-auto">보러가기 →</span>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center text-sm text-gray-600">
            <p>Powered by Gemini AI, Google Cloud, and Next.js</p>
        </div>
      </div>
    </main>
  );
}