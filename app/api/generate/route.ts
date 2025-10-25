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

    // Gemini 2.0 - Image generation
    const images: string[] = []

    for (const scene of scenes) {
      const imagenRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${scene}\n\nCharacter: ${face}`
              }]
            }],
            generationConfig: {
              responseModalities: ["IMAGE"]
            }
          })
        }
      )

      if (imagenRes.ok) {
        const data = await imagenRes.json()
        const imageData = data.candidates[0].content.parts[0].inlineData.data
        images.push(`data:image/jpeg;base64,${imageData}`)
      }
    }

    return new Response(JSON.stringify({ scenes: images }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
