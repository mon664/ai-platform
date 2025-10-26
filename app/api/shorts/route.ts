import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

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

    // Style mapping
    const styleMap: { [key: string]: string } = {
      photorealistic: 'hyper-realistic, photorealistic, 8k',
      anime: 'in a vibrant, high-quality anime art style',
      '3d-render': 'as a high-detail 3D render, trending on ArtStation',
      'fantasy-art': 'in a digital fantasy art style, epic, detailed',
      cinematic: 'cinematic, film quality, dramatic lighting',
    };
    const styleDescription = styleMap[imageStyle] || 'cinematic';

    // 2. 장면 이미지 생성
    const images: string[] = [];
    console.log('Starting image generation loop...');
    for (let i = 0; i < sceneCount; i++) {
      console.log(`[Scene ${i+1}] Preparing to generate...`);
      const scenePart = Math.floor(script.length / sceneCount);
      const sceneText = script.substring(i * scenePart, (i + 1) * scenePart);
      
      const parts = [];
      let textPrompt = '';

      if (protagonistB64) {
        textPrompt = `**Subject:** A cinematic shot of a KOREAN person who looks EXACTLY like the person in the reference image. The scene is based on the script snippet: "${sceneText.substring(0, 150)}". Maintain perfect facial consistency.\n\n**Style:** ${styleDescription}. The setting should be appropriate for South Korea.\n\n**Negative Prompt:** text, words, letters, characters, subtitles, watermarks, logos, writing, script, font, signature.`;
        parts.push({ text: textPrompt });
        parts.push({ inline_data: { mime_type: protagonistMimeType, data: protagonistB64 } });
      } else {
      const imagePrompt = `Negative Prompt: text, words, letters, characters, subtitles, watermarks, logos, writing, script, font, signature. Do not render any text on the image.\n---\n**Prompt:** A high-quality, cinematic shot of a KOREAN person. The scene is based on the script: "${sceneText.substring(0, 150)}". The image must be visually focused on the scene and characters.\n\n**Style:** ${styleDescription}. The setting is South Korea.`;
        parts.push({ text: textPrompt });
      }
      console.log(`[Scene ${i+1}] Prompt ready.`);

      let imageGenerated = false;
      for (let attempt = 1; attempt <= 2; attempt++) {
        console.log(`[Scene ${i+1}] Attempt ${attempt}...`);
        const imageRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: {
                response_modalities: ['Image'],
                image_config: { aspect_ratio: '9:16' }
              }
            })
          }
        );

        if (imageRes.ok) {
          const imageData = await imageRes.json();
          const imagePart = imageData.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData);
          if (imagePart?.inlineData?.data) {
            images.push(`data:image/png;base64,${imagePart.inlineData.data}`);
            imageGenerated = true;
            console.log(`[Scene ${i+1}] Attempt ${attempt} SUCCESS.`);
            break;
          }
        }
        const errorText = await imageRes.text();
        console.error(`[Scene ${i+1}] Attempt ${attempt} FAILED. Status: ${imageRes.status}, Error: ${errorText}`);
        if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!imageGenerated) {
        console.error(`[Scene ${i+1}] All attempts failed. Pushing placeholder.`);
        images.push('');
      }
    }

    // 3. 최종 결과 전송
    return new NextResponse(JSON.stringify({ script, images }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Shorts generation error:', error);
    return new NextResponse(JSON.stringify({ error: error.message || '오류가 발생했습니다' }), { status: 500 });
  }
}
