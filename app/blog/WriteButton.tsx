
'use client';

import { useSession } from 'next-auth/react';

const WriteButton = () => {
  const { data: session, status } = useSession();

  const handleWriteClick = () => {
    alert('현재 글쓰기 기능은 CLI를 통해 지원됩니다. Gemini에게 글의 제목과 내용을 요청해주세요.');
  };

  if (status === 'authenticated') {
    return (
      <button 
        onClick={handleWriteClick}
        className="px-5 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-md"
      >
        📝 새 글 작성하기
      </button>
    );
  }

  return null;
};

export default WriteButton;
