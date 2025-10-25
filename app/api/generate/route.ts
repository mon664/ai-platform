export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const protagonist = formData.get('protagonist') as File
    const story = formData.get('story') as string
    const persona = formData.get('persona') as string || ''
    const sceneCount = parseInt(formData.get('sceneCount') as string)
    const aspectRatio = formData.get('aspectRatio') as string || '16:9'
    const imageEngine = formData.get('imageEngine') as string || 'imagen'

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
              { text: `Analyze this person's face with EXTREME precision for AI character consistency. Provide measurements and specific details:

FACE STRUCTURE:
- Face shape (oval/round/square/heart/diamond)
- Facial proportions (forehead:midface:jaw ratio)
- Jawline definition and angle
- Cheekbone prominence and placement

EYES (CRITICAL):
- Exact eye shape (almond/round/hooded/upturned/downturned)
- Eye color (specific shade, patterns, depth)
- Eye size relative to face
- Distance between eyes (wide-set/close-set/average)
- Eyelid type (monolid/double-lid)
- Eyebrow shape, thickness, arch position

NOSE:
- Nose bridge (high/low/straight/curved)
- Nose width and nostril shape
- Nose tip shape (pointed/rounded/bulbous)
- Nose length relative to face

MOUTH & LIPS:
- Lip fullness (upper and lower separately)
- Lip shape and cupid's bow definition
- Mouth width relative to nose
- Smile characteristics

SKIN & COMPLEXION:
- Exact skin tone (warm/cool/neutral undertones)
- Skin texture and any distinctive marks
- Facial hair details (if present)

HAIR:
- Hair color (exact shade and highlights)
- Hair texture and density
- Hairstyle and length
- Hairline shape

DISTINCTIVE FEATURES:
- Moles, freckles, scars (exact position)
- Any unique characteristics

Output: 250-300 words with numerical precision where possible.` },
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

    // Image generation - Choose engine
    const images: string[] = []

    if (imageEngine === 'vertex') {
      // Vertex AI Subject Customization - Use reference image
      console.log('[DEBUG] Using Vertex AI Subject Customization')

      for (const scene of scenes) {
        const vertexRes = await fetch(
          `https://${process.env.VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${process.env.VERTEX_PROJECT_ID}/locations/${process.env.VERTEX_LOCATION}/publishers/google/models/imagen-3.0-capability-001:predict`,
          {
            method: 'POST',
            headers: {
              'x-goog-api-key': process.env.VERTEX_AI_KEY as string,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              instances: [{
                prompt: `${scene}. Main character is [1]. Style: Cinematic ${aspectRatio}, photorealistic, professional lighting, high detail, film quality.`,
                referenceImages: [{
                  referenceType: 'REFERENCE_TYPE_SUBJECT',
                  referenceId: 1,
                  referenceImage: {
                    bytesBase64Encoded: base64
                  },
                  subjectImageConfig: {
                    subjectDescription: face,
                    subjectType: 'SUBJECT_TYPE_PERSON'
                  }
                }]
              }],
              parameters: {
                sampleCount: 1,
                aspectRatio: aspectRatio
              }
            })
          }
        )

        if (vertexRes.ok) {
          const data = await vertexRes.json()
          console.log('[DEBUG] Vertex AI response:', JSON.stringify(data).substring(0, 500))

          if (!data.predictions || !data.predictions[0]?.bytesBase64Encoded) {
            return new Response(JSON.stringify({
              error: 'Invalid Vertex AI response',
              response: JSON.stringify(data).substring(0, 500)
            }), { status: 500 })
          }

          const imageData = data.predictions[0].bytesBase64Encoded
          images.push(`data:image/png;base64,${imageData}`)
        } else {
          const errText = await vertexRes.text()
          console.error('[ERROR] Vertex AI failed:', errText)
          return new Response(JSON.stringify({
            error: 'Vertex AI failed',
            status: vertexRes.status,
            details: errText.substring(0, 500)
          }), { status: 500 })
        }
      }
    } else {
      // Imagen 3.0 - Standard generation
      console.log('[DEBUG] Using standard Imagen 3.0')

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
                prompt: `${scene}

CRITICAL CHARACTER REQUIREMENTS - DO NOT DEVIATE:
The main character MUST have these EXACT facial features with 100% accuracy:
${face}

STRICT GUIDELINES:
- Match EVERY facial measurement and proportion exactly
- Maintain identical eye shape, color, and spacing
- Preserve exact nose structure and lip shape
- Keep consistent skin tone and complexion
- Replicate hairstyle and color precisely
- Include all distinctive features (moles, scars, etc.)
- NO variations in facial structure between scenes

Style: Cinematic ${aspectRatio}, photorealistic, professional lighting, high detail, film quality, consistent character identity across all frames

Negative prompt: different face, altered features, inconsistent appearance, wrong eye color, different hairstyle, changed facial structure`
              }],
              parameters: {
                sampleCount: 1,
                aspectRatio: aspectRatio
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
