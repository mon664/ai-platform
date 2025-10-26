import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { mode, input, duration, sceneCount } = await req.json()

  if (!input) {
    return new NextResponse(JSON.stringify({ error: '입력이 필요합니다' }), { status: 400 })
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY
  if (!GEMINI_API_KEY) {
    return new NextResponse(JSON.stringify({ error: 'API 키가 설정되지 않았습니다' }), { status: 500 })
  }

  try {
    // 1. 대본 생성
    const targetLength = duration * 5
    const scriptPrompt = mode === 'keyword'
      ? `Create a ${sceneCount}-scene YouTube Shorts script about "${input}" in Korean. Target length: ~${targetLength} characters. Return only the script text.`
      : `Create a YouTube Shorts script based on this prompt: "${input}". Target length: ~${targetLength} characters, ${sceneCount} scenes. Return only the script text.`

    const scriptRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: scriptPrompt }] }],
          generationConfig: { maxOutputTokens: 8192 }
        })
      }
    )

    if (!scriptRes.ok) {
      const errorText = await scriptRes.text();
      console.error("Script generation failed:", errorText);
      throw new Error('대본 생성에 실패했습니다.');
    }

    const scriptData = await scriptRes.json()
    const script = scriptData.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // 2. 장면 이미지 생성
    const images: string[] = []
    for (let i = 0; i < sceneCount; i++) {
      const scenePart = Math.floor(script.length / sceneCount)
      const sceneText = script.substring(i * scenePart, (i + 1) * scenePart)
      
      const imagePrompt = `**Subject:** A cinematic shot of a KOREAN person. The scene is based on the following script snippet: "${sceneText.substring(0, 150)}".\n\n**Style:** Photorealistic, cinematic lighting, high detail, film quality, modern, colorful, engaging. The setting should be appropriate for South Korea.\n\n**Negative Prompt (what to avoid):** Do NOT include any text, words, letters, subtitles, or characters in the image.`

      let imageGenerated = false;
      for (let attempt = 1; attempt <= 2; attempt++) { // Retry up to 2 times
        const imageRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: imagePrompt }] }],
              generationConfig: {
                response_modalities: ['Image'],
                image_config: { aspect_ratio: '9:16' }
              }
            })
          }
        )

        if (imageRes.ok) {
          const imageData = await imageRes.json()
          const imagePart = imageData.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData)
          if (imagePart?.inlineData?.data) {
            images.push(`data:image/png;base64,${imagePart.inlineData.data}`)
            imageGenerated = true;
            break; // Success, exit retry loop
          }
        }
        console.error(`Image generation attempt ${attempt} failed for scene ${i + 1}`);
        if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 sec before retrying
      }

      if (!imageGenerated) {
        images.push(''); // Push placeholder if all retries fail
      }
    }

    // 3. 최종 결과 전송
    return new NextResponse(JSON.stringify({ script, images }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('Shorts generation error:', error)
    return new NextResponse(JSON.stringify({ error: error.message || '오류가 발생했습니다' }), { status: 500 })
  }
}