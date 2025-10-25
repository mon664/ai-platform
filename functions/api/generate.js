// Cloudflare Pages Function for AI Story Generation

export async function onRequestPost(context) {
  const { request, env } = context

  // Validate environment variables
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
    const protagonist = formData.get('protagonist')
    const story = formData.get('story')
    const persona = formData.get('persona') || ''
    const sceneCount = parseInt(formData.get('sceneCount'))

    if (!protagonist || !story) {
      return new Response(
        JSON.stringify({ error: 'Missing protagonist or story' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Step 1: Gemini Vision - Analyze face
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
                  text: "Describe this person's face for image generation: facial features, hair, eyes. Keep it under 100 words."
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
      const errorText = await geminiResponse.text()
      console.error('GEMINI_ERROR', geminiResponse.status, errorText)
      return new Response(
        errorText,
        { status: geminiResponse.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const geminiData = await geminiResponse.json()
    const faceFeatures = geminiData.candidates[0].content.parts[0].text

    // Step 2: GPT-4 - Create scenes
    const scenePrompt = `Create ${sceneCount} scenes for: "${story}"\nAI Persona: ${persona}\n\nReturn JSON: {"scenes": [{"description": "..."}]}`

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
      const errorText = await gptResponse.text()
      console.error('OPENAI_GPT4_ERROR', gptResponse.status, errorText)
      return new Response(
        errorText,
        { status: gptResponse.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const gptData = await gptResponse.json()
    const sceneData = JSON.parse(gptData.choices[0].message.content)
    const sceneDescriptions = sceneData.scenes || []

    // Step 3: DALL-E 3 - Generate images
    const sceneUrls = []

    for (const scene of sceneDescriptions) {
      const imagePrompt = `${scene.description}\n\nCharacter: ${faceFeatures}`

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

      if (dalleResponse.ok) {
        const dalleData = await dalleResponse.json()
        sceneUrls.push(dalleData.data[0].url)
      } else {
        const errorText = await dalleResponse.text()
        console.error('OPENAI_DALLE_ERROR', dalleResponse.status, errorText)
        // Continue with other images even if one fails
      }
    }

    return new Response(
      JSON.stringify({ scenes: sceneUrls }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('SERVER_ERROR', error)
    return new Response(
      JSON.stringify({
        error: error.message || String(error),
        stack: error.stack
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
