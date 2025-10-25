import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const protagonist = formData.get('protagonist') as File
    const partner = formData.get('partner') as File | null
    const story = formData.get('story') as string
    const persona = formData.get('persona') as string
    const sceneCount = parseInt(formData.get('sceneCount') as string)

    // Step 1: Analyze face features with Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const protagonistBytes = await protagonist.arrayBuffer()
    const protagonistBase64 = Buffer.from(protagonistBytes).toString('base64')

    const visionPrompt = 'Describe this person\'s face in detail for image generation: facial structure, hair, eyes, distinctive features.'
    const visionResult = await model.generateContent([
      visionPrompt,
      {
        inlineData: {
          data: protagonistBase64,
          mimeType: protagonist.type,
        },
      },
    ])

    const faceFeatures = visionResult.response.text()

    // Step 2: Generate scene breakdown with GPT-4
    const scenePrompt = `Create ${sceneCount} scenes for this story: "${story}"\n\nAI Persona: ${persona || 'neutral storyteller'}\n\nReturn JSON array of scenes with description field.`

    const sceneResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: scenePrompt }],
      response_format: { type: 'json_object' },
    })

    const sceneData = JSON.parse(sceneResponse.choices[0].message.content!)
    const sceneDescriptions = sceneData.scenes || []

    // Step 3: Generate images with DALL-E 3
    const sceneUrls: string[] = []

    for (const scene of sceneDescriptions) {
      const imagePrompt = `${scene.description}\n\nCharacter: ${faceFeatures}`

      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: imagePrompt,
        size: '1024x1024',
        quality: 'standard',
        n: 1,
      })

      sceneUrls.push(imageResponse.data[0].url!)
    }

    return NextResponse.json({ scenes: sceneUrls })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
