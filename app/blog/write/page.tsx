'use client';

import { useState } from 'react';

export default function WriteBlogPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('저장 중...');

    try {
      const response = await fetch('/api/blog/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        setStatus('✅ 게시글이 저장되었습니다!');
        setTitle('');
        setContent('');
      } else {
        setStatus('❌ 저장 실패');
      }
    } catch (error) {
      setStatus('❌ 오류 발생');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">블로그 글쓰기</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="블로그 제목을 입력하세요"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">내용 (Markdown 지원)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
              placeholder="# 제목&#10;&#10;내용을 Markdown 형식으로 작성하세요..."
              rows={20}
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              게시글 저장
            </button>

            <a
              href="/blog"
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              목록으로
            </a>
          </div>

          {status && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              {status}
            </div>
          )}
        </form>

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-lg font-bold mb-2">📝 Markdown 가이드</h2>
          <pre className="text-sm text-gray-400">
{`# 큰 제목
## 중간 제목
### 작은 제목

**굵은 글씨**
*기울임*

- 목록 항목 1
- 목록 항목 2

[링크](https://example.com)
![이미지](https://example.com/image.png)

\`코드\`

\`\`\`
코드 블록
\`\`\``}
          </pre>
        </div>
      </div>
    </div>
  );
}
