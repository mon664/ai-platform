import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { text, tone } = await req.json()

    if (!text) {
      return NextResponse.json({ error: '텍스트가 필요합니다' }, { status: 400 })
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API 키가 설정되지 않았습니다' }, { status: 500 })
    }

    // Gemini로 대본 개선
    const prompt = tone
      ? `Improve the following Korean text for voice narration with a "${tone}" tone. Make it more natural and engaging for audio. Keep it in Korean. Return ONLY the improved text, nothing else.

Original:
${text}`
      : `Improve the following Korean text for voice narration. Make it more natural, engaging, and suitable for audio. Keep it in Korean. Return ONLY the improved text, nothing else.

Original:
${text}`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text()
      console.error('Gemini API error:', errorText)
      return NextResponse.json({ error: '대본 개선 실패' }, { status: 500 })
    }

    const data = await geminiRes.json()
    const improvedText = data.candidates?.[0]?.content?.parts?.[0]?.text || text

    return NextResponse.json({ improvedText })

  } catch (error: any) {
    console.error('TTS improvement error:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
