export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const protagonist = formData.get('protagonist') as File
    const story = formData.get('story') as string
    const persona = formData.get('persona') as string || ''
    const sceneCount = parseInt(formData.get('sceneCount') as string)

    if (!protagonist || !story) {
      return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 })
    }

    // Gemini Vision - encode Base64 in chunks to avoid stack overflow
    const bytes = await protagonist.arrayBuffer()
    const uint8Array = new Uint8Array(bytes)

    // Chunk processing for large images
    let base64 = ''
    const chunkSize = 8192
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize)
      base64 += String.fromCharCode.apply(null, Array.from(chunk))
    }
    base64 = btoa(base64)

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Describe this person's face for image generation (100 words max):" },
              { inlineData: { mimeType: protagonist.type, data: base64 } }
            ]
          }]
        })
      }
    )

    if (!geminiRes.ok) {
      const err = await geminiRes.text()
      return new Response(err, { status: geminiRes.status })
    }

    const geminiData = await geminiRes.json()
    const face = geminiData.candidates[0].content.parts[0].text

    // GPT-4
    const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'user',
          content: `Create ${sceneCount} scenes for: "${story}"\nPersona: ${persona}\n\nReturn JSON: {"scenes": [{"description": "..."}]}`
        }],
        response_format: { type: 'json_object' }
      })
    })

    if (!gptRes.ok) {
      const err = await gptRes.text()
      return new Response(err, { status: gptRes.status })
    }

    const gptData = await gptRes.json()
    const scenes = JSON.parse(gptData.choices[0].message.content).scenes

    // DALL-E 3
    const images: string[] = []

    for (const scene of scenes) {
      const dalleRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `${scene.description}\n\nCharacter: ${face}`,
          size: '1792x1024',
          quality: 'standard'
        })
      })

      if (dalleRes.ok) {
        const data = await dalleRes.json()
        images.push(data.data[0].url)
      }
    }

    return new Response(JSON.stringify({ scenes: images }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
