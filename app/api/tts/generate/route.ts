import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { text, voice, speed, pitch, tone } = await req.json();

    if (!text) {
      return new NextResponse(JSON.stringify({ error: '텍스트가 필요합니다' }), { status: 400 });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return new NextResponse(JSON.stringify({ error: 'TTS API 키가 설정되지 않았습니다' }), { status: 500 });
    }

    let ssmlToSynthesize = '';

    // If a tone/mood is provided, use an AI to generate SSML
    if (tone && tone.trim()) {
      const ssmlGenPrompt = `You are an expert in Speech Synthesis Markup Language (SSML). Your task is to take a plain text script and a desired mood, and convert the script into a well-formed SSML string to reflect that mood. Use <prosody>, <emphasis>, <break>, and other appropriate tags to control the speech pace, pitch, and emotion. Ensure the entire output is wrapped in a single <speak> tag.

**Desired Mood:** "${tone}"

**Plain Text Script:**
"${text}"

**Your SSML Output:**`;

      const ssmlGenRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: ssmlGenPrompt }] }] })
        }
      );

      if (!ssmlGenRes.ok) {
        throw new Error('AI를 이용한 SSML 생성에 실패했습니다.');
      }

      const ssmlGenData = await ssmlGenRes.json();
      ssmlToSynthesize = ssmlGenData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Basic validation to ensure it looks like SSML
      if (!ssmlToSynthesize.trim().startsWith('<speak>')) {
         // Fallback or error
         throw new Error('AI가 유효한 SSML을 생성하지 못했습니다.');
      }

    } else {
      // If no tone, just wrap the plain text in a simple speak tag for consistency
      ssmlToSynthesize = `<speak>${text}</speak>`;
    }

    // Now, synthesize the (potentially AI-generated) SSML
    const requestBody: any = {
      voice: { languageCode: 'ko-KR', name: voice },
      audioConfig: { audioEncoding: 'LINEAR16' },
      input: { ssml: ssmlToSynthesize },
    };
    
    // SSML controls prosody, so don't send these if SSML is used.
    // However, we can still apply a global speed/pitch modification if needed,
    // but for now, we let the generated SSML handle it.
    // requestBody.audioConfig.speakingRate = speed || 1.0;
    // requestBody.audioConfig.pitch = (pitch - 1.0) * 20 || 0.0;

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
      throw new Error(`최종 음성 생성 실패: ${errorText}`);
    }

    const data = await res.json();
    
    // Since we removed chunking, we expect a single audioContent
    return new NextResponse(JSON.stringify({ audioContent: data.audioContent }), {
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
