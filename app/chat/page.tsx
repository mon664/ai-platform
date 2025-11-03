'use client';

import { useState } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 사용자 메시지 추가
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);

    try {
      // GLM 4.6에 요청
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const result = await response.json();

      // AI 응답 추가
      setMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '오류 발생' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827', color: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* 채팅 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#111827' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '16px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
            <div style={{
              display: 'inline-block',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: msg.role === 'user' ? '#2563eb' : '#374151',
              color: msg.role === 'user' ? 'white' : '#f3f4f6',
              maxWidth: '70%'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* 입력 영역 */}
      <div style={{ padding: '16px', backgroundColor: '#1f2937', borderTop: '1px solid #374151' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="예: A업체에 김치찌개 500개 판매"
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#374151',
              color: 'white',
              border: '1px solid #4b5563',
              borderRadius: '8px'
            }}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#6b7280' : '#9333ea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '처리중...' : '전송'}
          </button>
        </div>
      </div>
    </div>
  );
}