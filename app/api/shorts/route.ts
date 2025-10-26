import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { mode, input, duration, sceneCount } = await req.json()

  if (!input) {
    return new Response('입력이 필요합니다', { status: 400 })
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY
  if (!GEMINI_API_KEY) {
    return new Response('API 키가 설정되지 않았습니다', { status: 500 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        try {
          const msg = 'data: ' + JSON.stringify(data) + '\n\n'
          controller.enqueue(encoder.encode(msg))
        } catch (e) {
          controller.enqueue(encoder.encode('data: {"error":"encoding error"}\n\n'))
        }
      }

      try {
        // 1. 대본 생성
        send({ progress: '대본 생성 중...' })

        // duration에 따른 대본 길이 계산 (대략 1초당 5자)
        const targetLength = duration * 5

        const scriptPrompt = mode === 'keyword'
          ? `Create a ${sceneCount}-scene YouTube Shorts script about "${input}" in Korean.

Requirements:
- Target length: approximately ${targetLength} Korean characters (for ${duration} seconds video)
- Write a natural, engaging narration script
- The script should be informative and interesting
- Use casual, friendly tone
- Make it suitable for short-form video content
- Structure: ${sceneCount} scenes

Format:
Just return the script text in Korean, nothing else.`
          : `Create a YouTube Shorts script based on this detailed prompt in Korean:

"${input}"

Requirements:
- Target length: approximately ${targetLength} Korean characters (for ${duration} seconds video)
- Create ${sceneCount} distinct scenes
- Follow the user's instructions in the prompt
- Write naturally and engagingly
- Make it suitable for short-form video content

Format:
Just return the script text in Korean, nothing else.`

        const scriptRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: scriptPrompt }] }],
              generationConfig: {
                maxOutputTokens: Math.min(8192, Math.floor(targetLength * 2))
              }
            })
          }
        )

        const scriptData = await scriptRes.json()
        let script = scriptData.candidates?.[0]?.content?.parts?.[0]?.text || ''

        // 대본 길이 제한 (너무 길면 잘라내기)
        if (script.length > targetLength * 1.5) {
          script = script.substring(0, Math.floor(targetLength * 1.5))
        }

        send({ script })

        // 2. 장면 이미지 생성
        for (let i = 0; i < sceneCount; i++) {
          send({ progress: `이미지 ${i + 1}/${sceneCount} 생성 중...` })

          // 대본을 sceneCount로 나눠서 각 장면에 맞는 프롬프트 생성
          const scenePart = Math.floor(script.length / sceneCount)
          const sceneText = script.substring(i * scenePart, (i + 1) * scenePart)

          const imagePrompt = `Scene ${i + 1} for the script: "${sceneText.substring(0, 100)}..."

Create a high-quality, cinematic image that represents this part of the script.
Make it visually appealing, professional, and suitable for YouTube Shorts vertical format (9:16).
Style: modern, colorful, engaging`

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
            const b64 = imagePart.inlineData.data
            const mime = imagePart.inlineData.mimeType
            const chunkSize = 15000

            for (let j = 0; j < b64.length; j += chunkSize) {
              const chunk = b64.substring(j, j + chunkSize)
              const isLast = j + chunkSize >= b64.length
              send({
                imageChunk: chunk,
                imageIndex: i,
                mimeType: mime,
                isLastChunk: isLast
              })
            }
          }
        }

        send({ complete: true })
        controller.close()

      } catch (error: any) {
        console.error('Shorts generation error:', error)
        send({ error: error.message || '오류가 발생했습니다' })
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
