import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// Helper function to split text into chunks without breaking words
function splitText(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let currentChunk = "";

  // Split by sentences to be more natural
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxLength) {
      chunks.push(currentChunk);
      currentChunk = "";
    }
    currentChunk += sentence;
  }
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  return chunks;
}

export async function POST(req: NextRequest) {
  try {
    const { text, voice, speed, pitch, tone } = await req.json();

    if (!text) {
      return new NextResponse(JSON.stringify({ error: '텍스트가 필요합니다' }), { status: 400 });
    }

    const API_KEY = process.env.GOOGLE_CLOUD_TTS_API_KEY;
    if (!API_KEY) {
      return new NextResponse(JSON.stringify({ error: 'TTS API 키가 설정되지 않았습니다' }), { status: 500 });
    }

    const textChunks = splitText(text, 4500); // Split text into chunks of ~4500 chars
    const audioContents: string[] = [];

    for (const chunk of textChunks) {
      const isSsml = tone && tone.trim().startsWith('<speak>');
      
      const input = (isSsml && textChunks.length === 1) ? { ssml: tone } : { text: chunk };
      
      const requestBody: any = {
        voice: { languageCode: 'ko-KR', name: voice },
        audioConfig: { audioEncoding: 'LINEAR16' },
        input: input,
      };

      if (!isSsml || textChunks.length > 1) {
        requestBody.audioConfig.speakingRate = speed || 1.0;
        requestBody.audioConfig.pitch = (pitch - 1.0) * 20 || 0.0;
      }

      const res = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Google TTS API error:', errorText);
        throw new Error(`음성 조각 생성 실패: ${errorText}`);
      }

      const data = await res.json();
      if (data.audioContent) {
        audioContents.push(data.audioContent);
      }
    }

    return new NextResponse(JSON.stringify({ audioContents }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('TTS generation error:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message || '서버 오류가 발생했습니다' }),
      { status: 500 }
    );
  }
}