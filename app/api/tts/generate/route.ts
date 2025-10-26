import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { text, voice, speed, pitch, tone } = await req.json();

    if (!text && !(tone && tone.trim().startsWith('<speak>'))) {
      return NextResponse.json({ error: '텍스트 또는 SSML을 입력해주세요' }, { status: 400 });
    }

    const API_KEY = process.env.GOOGLE_CLOUD_TTS_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ error: 'TTS API 키가 설정되지 않았습니다' }, { status: 500 });
    }

    const voiceName = voice || 'ko-KR-Neural2-A';

    const isSsml = tone && tone.trim().startsWith('<speak>');

    const requestBody: any = {
      voice: {
        languageCode: 'ko-KR',
        name: voiceName,
      },
      audioConfig: {
        audioEncoding: 'LINEAR16',
      },
      input: isSsml ? { ssml: tone } : { text: text },
    };

    if (!isSsml) {
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
      console.error('TTS API error:', errorText);
      return NextResponse.json({ error: '음성 생성 실패' }, { status: 500 });
    }

    const data = await res.json();
    const audioContent = data.audioContent;

    if (!audioContent) {
      return NextResponse.json({ error: '음성 데이터 없음' }, { status: 500 });
    }

    // Base64 디코딩 (Edge Runtime 호환)
    const binaryString = atob(audioContent);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new Response(bytes, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename="tts.wav"',
        'Content-Length': bytes.length.toString(),
      },
    });

  } catch (error: any) {
    console.error('TTS generation error:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
