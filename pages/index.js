import Head from 'next/head';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Load navigation component
    const loadNavigation = () => {
      const container = document.getElementById('navigation-container');
      if (container) {
        container.innerHTML = `
          <nav class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex justify-between h-16">
                <div class="flex items-center">
                  <h1 class="text-xl font-bold text-gray-800">AI 통합 관리 플랫폼</h1>
                </div>
                <div class="flex items-center space-x-4">
                  <a href="/shorts-generator.html" class="text-gray-600 hover:text-gray-900">쇼츠 생성</a>
                  <a href="/auto-blog/index.html" class="text-gray-600 hover:text-gray-900">자동 블로그</a>
                  <a href="/commit-generator.html" class="text-gray-600 hover:text-gray-900">커밋 생성</a>
                </div>
              </div>
            </div>
          </nav>
        `;
      }
    };

    loadNavigation();
  }, []);

  return (
    <>
      <Head>
        <title>AI 통합 관리 플랫폼</title>
        <meta name="description" content="AI 통합 관리 플랫폼 - Ultimate AI Suite" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      </Head>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        {/* Navigation will be loaded here */}
        <div id="navigation-container"></div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Commit Message Generator */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <i className="fas fa-code-commit text-green-600 text-xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">커밋 메시지 생성</h2>
                  <p className="text-sm text-gray-500">Conventional Commit 표준에 맞는 메시지 자동 생성</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    코드 변경 내용
                  </label>
                  <textarea
                    id="commitInput"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows="6"
                    placeholder="변경된 코드 내용을 입력하세요...&#10;예: 사용자 인증 기능 추가, 로그인 API 구현 등"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    추가 컨텍스트 (선택)
                  </label>
                  <input
                    type="text"
                    id="commitContext"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="예: PR #123, 이슈 수정, 기능 개선 등"
                  />
                </div>

                <button
                  onClick={() => {
                    const input = document.getElementById('commitInput').value;
                    const context = document.getElementById('commitContext').value;

                    if (!input.trim()) {
                      alert('코드 변경 내용을 입력해주세요.');
                      return;
                    }

                    // Generate mock commit message
                    const commitMessage = `feat: ${input.substring(0, 50)}${input.length > 50 ? '...' : ''}`;
                    document.getElementById('commitOutput').value = commitMessage;
                  }}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  커밋 메시지 생성
                </button>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    생성된 커밋 메시지
                  </label>
                  <textarea
                    id="commitOutput"
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    rows="3"
                    readOnly
                    placeholder="생성된 커밋 메시지가 여기에 표시됩니다..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Text-to-Speech */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <i className="fas fa-volume-up text-blue-600 text-xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">텍스트 음성 변환</h2>
                  <p className="text-sm text-gray-500">텍스트를 자연스러운 음성으로 변환</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    변환할 텍스트
                  </label>
                  <textarea
                    id="ttsInput"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="6"
                    placeholder="음성으로 변환할 텍스트를 입력하세요..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    언어 선택
                  </label>
                  <select
                    id="ttsLanguage"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    const text = document.getElementById('ttsInput').value;
                    const lang = document.getElementById('ttsLanguage').value;

                    if (!text.trim()) {
                      alert('변환할 텍스트를 입력해주세요.');
                      return;
                    }

                    alert(`TTS 기능: ${text.substring(0, 30)}... (${lang} 언어)`);
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  음성 생성
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">빠른 링크</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <a href="/shorts-generator.html" className="text-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <i className="fas fa-video text-red-600 text-2xl mb-2"></i>
                <p className="text-sm font-medium text-gray-700">유튜브 쇼츠 생성</p>
              </a>

              <a href="/auto-blog/index.html" className="text-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <i className="fas fa-blog text-green-600 text-2xl mb-2"></i>
                <p className="text-sm font-medium text-gray-700">자동 블로그</p>
              </a>

              <a href="/commit-generator.html" className="text-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <i className="fas fa-code text-blue-600 text-2xl mb-2"></i>
                <p className="text-sm font-medium text-gray-700">커밋 생성</p>
              </a>

              <a href="/text-to-speech.html" className="text-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <i className="fas fa-microphone text-purple-600 text-2xl mb-2"></i>
                <p className="text-sm font-medium text-gray-700">음성 변환</p>
              </a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}