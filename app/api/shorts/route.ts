import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const mode = formData.get('mode') as string;
    const input = formData.get('input') as string;
    const duration = Number(formData.get('duration'));
    const sceneCount = Number(formData.get('sceneCount'));
    const imageStyle = formData.get('imageStyle') as string;
    const protagonistImage = formData.get('protagonistImage') as File | null;

    if (!input) {
      return new NextResponse(JSON.stringify({ error: '입력이 필요합니다' }), { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return new NextResponse(JSON.stringify({ error: 'API 키가 설정되지 않았습니다' }), { status: 500 });
    }

    // Handle protagonist image if it exists
    let protagonistB64: string | null = null;
    let protagonistMimeType: string | null = null;
    if (protagonistImage) {
      const bytes = await protagonistImage.arrayBuffer();
      const uint8Array = new Uint8Array(bytes);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      protagonistB64 = btoa(binary);
      protagonistMimeType = protagonistImage.type;
    }

    // 1. 대본 생성
    const targetLength = duration * 5;
    const scriptPrompt = mode === 'keyword'
      ? `Create a ${sceneCount}-scene YouTube Shorts script about "${input}" in Korean. Target length: ~${targetLength} characters. Return only the script text.`
      : `Create a YouTube Shorts script based on this prompt: "${input}". Target length: ~${targetLength} characters, ${sceneCount} scenes. Return only the script text.`

    const scriptRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: scriptPrompt }] }] })
      }
    );
    if (!scriptRes.ok) throw new Error('대본 생성 실패');
    const scriptData = await scriptRes.json();
    const script = scriptData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // 2. 장면 프롬프트 생성 (script 기반으로 sceneCount개 JSON 배열 요청)
    const scenesReq = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `From the following Korean YouTube Shorts script, extract ${sceneCount} concise scene descriptions for image generation. One line per scene, vivid and specific. Return ONLY a JSON array of strings.\n\nSCRIPT:\n"""${script}"""`
            }]
          }]
        })
      }
    );
    if (!scenesReq.ok) throw new Error('장면 프롬프트 생성 실패');
    const scenesJson = await scenesReq.json();
    const scenesTextRaw = scenesJson.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    let scenes: string[] = []
    try {
      scenes = JSON.parse(String(scenesTextRaw).replace(/```json\n?|\n?```/g, ''))
        .filter((s: any) => typeof s === 'string' && s.trim().length > 0)
    } catch {}
    // Fallback: derive scenes from script text if parsing failed/empty
    if (!Array.isArray(scenes) || scenes.length === 0) {
      const clean = String(script).replace(/\r/g, '').trim()
      const chunks = clean.split(/\n{2,}|\.|!|\?/).map(s => s.trim()).filter(Boolean)
      const wanted = Math.max(1, sceneCount || 5)
      const approx = Math.ceil(chunks.length / wanted)
      const derived: string[] = []
      for (let i = 0; i < wanted; i++) {
        const start = i * approx
        const slice = chunks.slice(start, start + approx).join(' ')
        derived.push((slice || `Scene ${i+1}`).slice(0, 180))
      }
      scenes = derived
    }

    // Style mapping
    const styleMap: { [key: string]: string } = {
      photorealistic: 'hyper-realistic, photorealistic, 8k',
      anime: 'in a vibrant, high-quality anime art style',
      '3d-render': 'as a high-detail 3D render, trending on ArtStation',
      'fantasy-art': 'in a digital fantasy art style, epic, detailed',
      cinematic: 'cinematic, film quality, dramatic lighting',
    };
    const styleDescription = styleMap[imageStyle] || 'cinematic';

    // 3. 장면 이미지 생성
    const images: string[] = []
    for (const scene of scenes.slice(0, sceneCount || scenes.length)) {
      const body: any = {
        contents: [{
          parts: [
            { text: `Generate a keyframe image for this scene (Korean): ${scene}\n\nStyle: ${styleDescription}` }
          ]
        }],
        generationConfig: {
          response_modalities: ['Image'],
          image_config: { aspect_ratio: '9:16' }
        }
      };
      if (protagonistB64 && protagonistMimeType) {
        body.contents[0].parts.push({
          inline_data: { mime_type: protagonistMimeType, data: protagonistB64 }
        });
      }

      const imgRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );
      if (!imgRes.ok) {
        // Skip this scene but continue others
        continue
      }
      try {
        const data = await imgRes.json();
        const imagePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        const b64 = imagePart?.inlineData?.data;
        if (b64) images.push(`data:image/png;base64,${b64}`)
      } catch {}
    }

    // 4. 최종 결과 전송
    return new NextResponse(JSON.stringify({ script, images }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Shorts generation error:', error);
    return new NextResponse(JSON.stringify({ error: error.message || '오류가 발생했습니다' }), { status: 500 });
  }
}
