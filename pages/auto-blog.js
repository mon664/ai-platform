import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function AutoBlog() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [category, setCategory] = useState('marketing');
  const [mode, setMode] = useState('keywords');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  useEffect(() => {
    // Load navigation
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
                <a href="/" class="text-gray-600 hover:text-gray-900">홈</a>
                <a href="/shorts-generator.html" class="text-gray-600 hover:text-gray-900">쇼츠 생성</a>
                <a href="/auto-blog" class="text-gray-600 hover:text-gray-900">자동 블로그</a>
                <a href="/commit-generator.html" class="text-gray-600 hover:text-gray-900">커밋 생성</a>
              </div>
            </div>
          </div>
        </nav>
      `;
    }
  }, []);

  const handleGenerate = async () => {
    if (!title.trim()) {
      alert('블로그 제목을 입력해주세요.');
      return;
    }

    if (mode === 'keywords' && !keywords.trim()) {
      alert('키워드를 입력해주세요.');
      return;
    }

    setIsGenerating(true);

    try {
      // Mock API call - replace with actual API
      setTimeout(() => {
        const mockContent = `
# ${title}

## 서론
${keywords ? `이 글에서는 ${keywords}에 대해 깊이 있게 다루어 보겠습니다.` : '이 글에서는 중요한 주제에 대해 다루어 보겠습니다.'}

## 본론

### 핵심 내용 1
첫 번째 핵심 내용에 대한 상세 설명입니다. 이 부분에서는 가장 중요한 정보를 전달합니다.

### 핵심 내용 2
두 번째 핵심 내용입니다. 추가적인 정보와 분석을 제공합니다.

### 핵심 내용 3
세 번째 핵심 내용입니다. 실용적인 팁과 조언을 포함합니다.

## 결론
오늘 다룬 내용을 요약하며, 독자들이 얻을 수 있는 가치를 정리합니다.

## 자주 묻는 질문

### Q1: 가장 중요한 포인트는 무엇인가요?
A: 가장 중요한 포인트는 실천 가능한 조언입니다.

### Q2: 어떻게 시작해야 하나요?
A: 작은 단계부터 시작하여 점진적으로 발전시켜 나가는 것이 좋습니다.

---

*이 콘텐츠는 AI에 의해 생성되었습니다.*
        `;

        setGeneratedContent(mockContent);
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error('생성 중 오류:', error);
      alert('콘텐츠 생성 중 오류가 발생했습니다.');
      setIsGenerating(false);
    }
  };

  const formatContent = (text) => {
    // Simple markdown to HTML conversion
    return text
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-3 mt-6">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mb-2 mt-4">$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^\* (.*)$/gim, '<li class="ml-4">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br />');
  };

  return (
    <>
      <Head>
        <title>🤖 자동 블로그 생성기 - AI 통합 관리 플랫폼</title>
        <meta name="description" content="AI가 자동으로 블로그 콘텐츠를 생성하고 관리합니다" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      </Head>

      <div className="bg-gray-50 min-h-screen">
        {/* Navigation */}
        <div id="navigation-container"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-xl p-8 mb-8 text-white">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-3">🤖 자동 블로그 생성기</h1>
              <p className="text-xl opacity-90">AI가 자동으로 블로그 콘텐츠를 생성하고 관리합니다</p>
            </div>
          </div>

          {/* 메인 컨텐츠 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 왼쪽: 설정 패널 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow mb-6">
                <h3 className="text-xl font-bold mb-4">📝 블로그 설정</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">블로그 제목</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="블로그 제목을 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="marketing">마케팅</option>
                      <option value="tech">기술</option>
                      <option value="lifestyle">라이프스타일</option>
                      <option value="business">비즈니스</option>
                      <option value="education">교육</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">생성 모드</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="mode"
                          value="keywords"
                          checked={mode === 'keywords'}
                          onChange={(e) => setMode(e.target.value)}
                          className="mr-2"
                        />
                        <span>키워드 기반</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="mode"
                          value="prompt"
                          checked={mode === 'prompt'}
                          onChange={(e) => setMode(e.target.value)}
                          className="mr-2"
                        />
                        <span>프롬프트 기반</span>
                      </label>
                    </div>
                  </div>

                  {mode === 'keywords' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">키워드</label>
                      <textarea
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows="3"
                        placeholder="키워드를 쉼표로 구분하여 입력하세요"
                      ></textarea>
                    </div>
                  )}

                  {mode === 'prompt' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">프롬프트</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows="4"
                        placeholder="생성할 블로그 콘텐츠에 대한 상세 설명을 입력하세요"
                      ></textarea>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">글 길이</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="short">짧음 (300자)</option>
                      <option value="medium" selected>보통 (600자)</option>
                      <option value="long">김 (1000자)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">톤 앤 매너</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="professional">전문적</option>
                      <option value="casual">캐주얼</option>
                      <option value="friendly">친근한</option>
                      <option value="humorous">유머러스한</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        생성 중...
                      </span>
                    ) : (
                      '🚀 블로그 생성'
                    )}
                  </button>
                </div>
              </div>

              {/* 예상 비용 */}
              <div className="bg-gradient-to-r from-pink-500 to-red-500 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-2">💰 예상 비용</h3>
                <div className="text-2xl font-bold">약 ₩500</div>
                <div className="text-sm opacity-90">600자 기준</div>
              </div>
            </div>

            {/* 오른쪽: 에디터 및 결과 */}
            <div className="lg:col-span-2">
              {/* 에디터 */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">✏️ 콘텐츠 에디터</h3>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                      <i className="fas fa-bold"></i>
                    </button>
                    <button className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                      <i className="fas fa-italic"></i>
                    </button>
                    <button className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                      <i className="fas fa-list-ul"></i>
                    </button>
                    <button className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                      <i className="fas fa-link"></i>
                    </button>
                  </div>
                </div>

                <div
                  contentEditable
                  className="w-full min-h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ minHeight: '400px' }}
                  onInput={(e) => setContent(e.target.innerHTML)}
                  dangerouslySetInnerHTML={{ __html: generatedContent }}
                />

                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    글자 수: {content.replace(/<[^>]*>/g, '').length}자
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <i className="fas fa-save mr-2"></i>임시 저장
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <i className="fas fa-eye mr-2"></i>미리보기
                    </button>
                  </div>
                </div>
              </div>

              {/* 생성 결과 */}
              {generatedContent && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">📄 생성 결과</h3>
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatContent(generatedContent) }}
                  />

                  <div className="mt-6 flex justify-end space-x-3">
                    <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <i className="fas fa-redo mr-2"></i>다시 생성
                    </button>
                    <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <i className="fas fa-upload mr-2"></i>블로그에 게시
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}