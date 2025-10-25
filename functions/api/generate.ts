// Cloudflare Pages Function
// URL: /api/generate

interface Env {
  OPENAI_API_KEY: string
  GEMINI_API_KEY: string
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context

  // 환경 변수 검증
  if (!env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Missing OPENAI_API_KEY' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (!env.GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Missing GEMINI_API_KEY' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const formData = await request.formData()
    const protagonist = formData.get('protagonist') as File
    const story = formData.get('story') as string
    const persona = formData.get('persona') as string || ''
    const sceneCount = parseInt(formData.get('sceneCount') as string)

    if (!protagonist || !story) {
      return new Response(
        JSON.stringify({ error: 'Missing protagonist or story' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Step 1: Gemini Vision - 얼굴 분석
    const protagonistBytes = await protagonist.arrayBuffer()
    const protagonistBase64 = btoa(
      String.fromCharCode(...new Uint8Array(protagonistBytes))
    )

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Describe this person's face in detail for image generation: facial structure, hair, eyes, distinctive features. Keep it under 100 words."
                },
                {
                  inlineData: {
                    mimeType: protagonist.type,
                    data: protagonistBase64
                  }
                }
              ]
            }
          ]
        })
      }
    )

    if (!geminiResponse.ok) {
      const error = await geminiResponse.text()
      return new Response(
        JSON.stringify({ error: 'Gemini Vision failed', details: error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const geminiData = await geminiResponse.json()
    const faceFeatures = geminiData.candidates[0].content.parts[0].text

    // Step 2: GPT-4 - 장면 분할
    const scenePrompt = `Create exactly ${sceneCount} scenes for this story: "${story}"

AI Persona: ${persona || 'neutral storyteller'}

Return a JSON object with this exact format:
{
  "scenes": [
    {"description": "detailed scene description 1"},
    {"description": "detailed scene description 2"},
    ...
  ]
}

Each description should be vivid and detailed for image generation.`

    const gptResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: scenePrompt }],
          response_format: { type: 'json_object' }
        })
      }
    )

    if (!gptResponse.ok) {
      const error = await gptResponse.text()
      return new Response(
        JSON.stringify({ error: 'GPT-4 failed', details: error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const gptData = await gptResponse.json()
    const sceneData = JSON.parse(gptData.choices[0].message.content)
    const sceneDescriptions = sceneData.scenes || []

    // Step 3: DALL-E 3 - 이미지 생성
    const sceneUrls: string[] = []

    for (const scene of sceneDescriptions) {
      const imagePrompt = `${scene.description}

Character appearance: ${faceFeatures}`

      const dalleResponse = await fetch(
        'https://api.openai.com/v1/images/generations',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: imagePrompt,
            size: '1024x1024',
            quality: 'standard',
            n: 1
          })
        }
      )

      if (!dalleResponse.ok) {
        const error = await dalleResponse.text()
        console.error('DALL-E error:', error)
        continue // Skip failed images
      }

      const dalleData = await dalleResponse.json()
      sceneUrls.push(dalleData.data[0].url)
    }

    return new Response(
      JSON.stringify({ scenes: sceneUrls }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
