'use client'
import { useState, useEffect, useRef } from 'react'
import Navigation from '../components/Navigation'

interface ShortsResult {
  script: string
  audioUrl: string
  images: string[]
}

const availableFonts = [
  'Arial',
  'Verdana',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Malgun Gothic',
  'Apple SD Gothic Neo',
  'Nanum Gothic',
];

export default function ShortsPage() {
  const [mode, setMode] = useState<'keyword' | 'prompt'>('keyword')
  const [keyword, setKeyword] = useState('')
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState(30)
  const [sceneCount, setSceneCount] = useState(5)
  const [imageStyle, setImageStyle] = useState('photorealistic')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [result, setResult] = useState<ShortsResult | null>(null)
  const [error, setError] = useState('')
  const [improving, setImproving] = useState(false)

  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null)
  const [subtitleText, setSubtitleText] = useState('')
  const [fontSize, setFontSize] = useState(48)
  const [fontColor, setFontColor] = useState('#FFFFFF')
  const [fontFamily, setFontFamily] = useState('Arial')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const improveInput = async () => {
    const input = mode === 'keyword' ? keyword : prompt
    if (!input.trim()) {
      setError('입력을 먼저 작성해주세요')
      return
    }
    setImproving(true)
    setError('')
    try {
      const res = await fetch('/api/shorts/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, mode })
      })
      if (!res.ok) throw new Error('개선 실패')
      const data = await res.json()
      if (mode === 'keyword') {
        setKeyword(data.improved)
      } else {
        setPrompt(data.improved)
      }
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다')
    } finally {
      setImproving(false)
    }
  }

  const generateShorts = async () => {
    const input = mode === 'keyword' ? keyword : prompt;
    if (!input.trim()) {
      setError(mode === 'keyword' ? '키워드를 입력해주세요' : '프롬프트를 입력해주세요');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    setProgress('쇼츠 생성 중... 잠시만 기다려주세요.');
    try {
      const res = await fetch('/api/shorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          input,
          duration,
          sceneCount,
          imageStyle,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || '쇼츠 생성에 실패했습니다.');
      }
      const data = await res.json();
      setResult({
        script: data.script,
        images: data.images,
        audioUrl: '', 
      });
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  // Effect to draw on canvas when editor values change
  useEffect(() => {
    if (isEditorOpen && editingImageIndex !== null && result) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const imgSrc = result.images[editingImageIndex];
      if (!canvas || !ctx || !imgSrc) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Text settings
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = fontColor;
        ctx.strokeStyle = 'black';
        ctx.lineWidth = fontSize / 8;
        ctx.textAlign = 'center';

        // Simple text wrapping
        const lines = [];
        const words = subtitleText.split(' ');
        let currentLine = words[0] || '';

        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const width = ctx.measureText(currentLine + " " + word).width;
          if (width < canvas.width * 0.9) {
            currentLine += " " + word;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        lines.push(currentLine);
        
        const lineHeight = fontSize * 1.2;
        const startY = canvas.height - (lines.length * lineHeight) - (canvas.height * 0.05);

        lines.forEach((line, i) => {
          const y = startY + (i * lineHeight);
          ctx.strokeText(line, canvas.width / 2, y);
          ctx.fillText(line, canvas.width / 2, y);
        });
      };
      img.src = imgSrc;
    }
  }, [isEditorOpen, editingImageIndex, result, subtitleText, fontSize, fontColor, fontFamily]);

  const openEditor = (index: number) => {
    if (!result) return;
    const sceneLength = Math.floor(result.script.length / result.images.length);
    const text = result.script.substring(index * sceneLength, (index + 1) * sceneLength).trim();
    setSubtitleText(text);
    setEditingImageIndex(index);
    setIsEditorOpen(true);
  }

  const saveAndClose = () => {
    if (!canvasRef.current || editingImageIndex === null || !result) return;
    const newDataUrl = canvasRef.current.toDataURL('image/png');
    const newImages = [...result.images];
    newImages[editingImageIndex] = newDataUrl;
    setResult({ ...result, images: newImages });
    setIsEditorOpen(false);
  }

  const navigateEditor = (direction: 'next' | 'prev') => {
    if (editingImageIndex === null || !result) return;
    // Before navigating, save current state to the main result array
    if (canvasRef.current) {
      const newDataUrl = canvasRef.current.toDataURL('image/png');
      const newImages = [...result.images];
      newImages[editingImageIndex] = newDataUrl;
      setResult({ ...result, images: newImages });
    }

    const newIndex = direction === 'next' ? editingImageIndex + 1 : editingImageIndex - 1;
    if (newIndex >= 0 && newIndex < result.images.length) {
      openEditor(newIndex);
    }
  }

  const downloadAll = () => {
    if (!result) return;
    const scriptBlob = new Blob([result.script || ''], { type: 'text/plain' })
    const scriptUrl = URL.createObjectURL(scriptBlob)
    const scriptLink = document.createElement('a')
    scriptLink.href = scriptUrl
    scriptLink.download = `script-${Date.now()}.txt`
    scriptLink.click()

    result.images.forEach((img, i) => {
      if (!img) return;
      const link = document.createElement('a')
      link.href = img
      link.download = `scene-${i + 1}.png`
      link.click()
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 to-gray-900 text-white">
      <Navigation />
      <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* ... Form UI ... */}

        {result && (
          <div className="space-y-6">
            {/* ... Script and Image display ... */}
          </div>
        )}
      </div>
      </div>

      {/* Editor Modal */}
      {isEditorOpen && editingImageIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-5xl w-full max-h-[95vh] flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-center">자막 편집기 (장면 {editingImageIndex + 1} / {result?.images.length})</h2>
            <div className="flex-grow flex gap-6 overflow-hidden">
              <div className="w-1/2 flex items-center justify-center bg-black rounded-lg">
                <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
              </div>

              <div className="w-1/2 flex flex-col gap-4 overflow-y-auto pr-2">
                <div>
                  <label className="block text-sm font-semibold mb-2">자막 텍스트</label>
                  <textarea 
                    value={subtitleText}
                    onChange={(e) => setSubtitleText(e.target.value)}
                    className="w-full h-40 bg-gray-700 text-white rounded-lg p-3 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">글자 크기: {fontSize}px</label>
                  <input 
                    type="range" 
                    min="12" 
                    max="128" 
                    value={fontSize} 
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">글자 색상</label>
                  <input 
                    type="color" 
                    value={fontColor} 
                    onChange={(e) => setFontColor(e.target.value)}
                    className="w-full h-10 p-1 bg-gray-700 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">폰트</label>
                  <select 
                    value={fontFamily} 
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg p-3"
                  >
                    {availableFonts.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center flex-shrink-0">
              <div>
                <button
                  onClick={() => navigateEditor('prev')}
                  disabled={editingImageIndex === 0}
                  className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
                >
                  이전
                </button>
                <button
                  onClick={() => navigateEditor('next')}
                  disabled={editingImageIndex === (result?.images.length || 0) - 1}
                  className="ml-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
                >
                  다음
                </button>
              </div>
              <div>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                  모두 취소
                </button>
                <button
                  onClick={saveAndClose}
                  className="ml-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  변경 저장 및 닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
