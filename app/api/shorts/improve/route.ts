import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { input, mode } = await req.json()

    if (!input) {
      return NextResponse.json({ error: '입력이 필요합니다' }, { status: 400 })
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API 키가 설정되지 않았습니다' }, { status: 500 })
    }

    const prompt = mode === 'keyword'
      ? `Improve and expand this YouTube Shorts keyword into a more detailed, engaging topic in Korean:

"${input}"

Make it more specific, interesting, and suitable for creating engaging short-form video content. Return only the improved keyword/topic, nothing else.`
      : `Improve this YouTube Shorts script prompt to make it more detailed and effective in Korean:

"${input}"

Add more specific details, structure, and creative elements while keeping the original intent. Make it clearer and more actionable for script generation. Return only the improved prompt, nothing else.`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    if (!res.ok) {
      return NextResponse.json({ error: '개선 실패' }, { status: 500 })
    }

    const data = await res.json()
    const improved = data.candidates?.[0]?.content?.parts?.[0]?.text || input

    return NextResponse.json({ improved })

  } catch (error: any) {
    console.error('Improve error:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
