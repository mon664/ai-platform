import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { keyword, sceneCount, voice } = await req.json()

  if (!keyword) {
    return new Response('키워드가 필요합니다', { status: 400 })
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY
  if (!GEMINI_API_KEY) {
    return new Response('API 키가 설정되지 않았습니다', { status: 500 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 1. 대본 생성
        controller.enqueue(encoder.encode('data: ' + JSON.stringify({ progress: '대본 생성 중...' }) + '\n\n'))

        const scriptPrompt = `Create a ${sceneCount}-scene YouTube Shorts script about "${keyword}" in Korean.

Requirements:
- Write a natural, engaging narration script (200-300 characters)
- The script should be informative and interesting
- Use casual, friendly tone
- Make it suitable for short-form video content

Format:
Just return the script text, nothing else.`

        const scriptRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: scriptPrompt }] }]
            })
          }
        )

        const scriptData = await scriptRes.json()
        const script = scriptData.candidates?.[0]?.content?.parts?.[0]?.text || ''

        controller.enqueue(encoder.encode('data: ' + JSON.stringify({ script }) + '\n\n'))

        // 2. 음성 생성
        controller.enqueue(encoder.encode('data: ' + JSON.stringify({ progress: '음성 생성 중...' }) + '\n\n'))

        const ttsRes = await fetch(
          `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              input: { text: script },
              voice: {
                languageCode: 'ko-KR',
                name: voice || 'ko-KR-Neural2-A'
              },
              audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 1.0
              }
            })
          }
        )

        const ttsData = await ttsRes.json()
        const audioUrl = `data:audio/mp3;base64,${ttsData.audioContent}`

        controller.enqueue(encoder.encode('data: ' + JSON.stringify({ audioUrl }) + '\n\n'))

        // 3. 장면 이미지 생성
        for (let i = 0; i < sceneCount; i++) {
          controller.enqueue(encoder.encode('data: ' + JSON.stringify({
            progress: `이미지 ${i + 1}/${sceneCount} 생성 중...`
          }) + '\n\n'))

          const imagePrompt = `Scene ${i + 1} for "${keyword}": Create a high-quality, cinematic image related to ${keyword}.
          Make it visually appealing, professional, and suitable for YouTube Shorts vertical format.`

          const imageRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: imagePrompt }]
                }],
                generationConfig: {
                  response_modalities: ['Image'],
                  image_config: {
                    aspect_ratio: '9:16'
                  }
                }
              })
            }
          )

          const imageData = await imageRes.json()
          const imagePart = imageData.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData)

          if (imagePart?.inlineData?.data) {
            const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
            controller.enqueue(encoder.encode('data: ' + JSON.stringify({ image: imageUrl }) + '\n\n'))
          }
        }

        // 완료
        controller.enqueue(encoder.encode('data: ' + JSON.stringify({ complete: true }) + '\n\n'))
        controller.close()

      } catch (error: any) {
        console.error('Shorts generation error:', error)
        controller.enqueue(encoder.encode('data: ' + JSON.stringify({
          error: error.message || '오류가 발생했습니다'
        }) + '\n\n'))
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
