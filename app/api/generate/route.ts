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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
    console.log('[DEBUG] Face description:', face)

    // Gemini 2.5 - Scene generation
    const sceneRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Create ${sceneCount} detailed scene descriptions for this story: "${story}"\nPersona: ${persona}\n\nReturn only a JSON array: ["scene 1 description", "scene 2 description", ...]`
            }]
          }]
        })
      }
    )

    if (!sceneRes.ok) {
      const err = await sceneRes.text()
      return new Response(err, { status: sceneRes.status })
    }

    const sceneData = await sceneRes.json()
    const sceneText = sceneData.candidates[0].content.parts[0].text
    const scenes = JSON.parse(sceneText.replace(/```json\n?|\n?```/g, ''))
    console.log('[DEBUG] Scenes array:', scenes)

    // Imagen 3.0 - Image generation
    const images: string[] = []

    for (const scene of scenes) {
      const imagenRes = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict',
        {
          method: 'POST',
          headers: {
            'x-goog-api-key': process.env.GEMINI_API_KEY as string,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            instances: [{
              prompt: `${scene}\n\nCharacter: ${face}`
            }],
            parameters: {
              sampleCount: 1,
              aspectRatio: '16:9'
            }
          })
        }
      )

      if (imagenRes.ok) {
        const data = await imagenRes.json()
        console.log('[DEBUG] Image generation response:', JSON.stringify(data).substring(0, 500))

        if (!data.predictions || !data.predictions[0]?.bytesBase64Encoded) {
          return new Response(JSON.stringify({
            error: 'Invalid image response',
            response: JSON.stringify(data).substring(0, 500)
          }), { status: 500 })
        }

        const imageData = data.predictions[0].bytesBase64Encoded
        images.push(`data:image/png;base64,${imageData}`)
      } else {
        const errText = await imagenRes.text()
        console.error('[ERROR] Image generation failed:', errText)
        return new Response(JSON.stringify({
          error: 'Image API failed',
          status: imagenRes.status,
          details: errText.substring(0, 500)
        }), { status: 500 })
      }
    }

    console.log('[DEBUG] Total images generated:', images.length)

    if (images.length === 0) {
      return new Response(JSON.stringify({ error: 'No images generated (loop completed but empty)' }), { status: 500 })
    }

    return new Response(JSON.stringify({ scenes: images }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
