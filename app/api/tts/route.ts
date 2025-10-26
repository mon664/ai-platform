import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { text, voice, speed } = await req.json()

    if (!text) {
      return NextResponse.json({ error: '텍스트가 필요합니다' }, { status: 400 })
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API 키가 설정되지 않았습니다' }, { status: 500 })
    }

    // Google Cloud Text-to-Speech API 호출
    const ttsRes = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: voice.startsWith('ko-KR') ? 'ko-KR' : 'en-US',
            name: voice || 'ko-KR-Standard-A'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: speed || 1.0,
            pitch: 0
          }
        })
      }
    )

    if (!ttsRes.ok) {
      const errorText = await ttsRes.text()
      console.error('Google TTS API error:', errorText)
      return NextResponse.json({ error: '음성 생성 실패' }, { status: 500 })
    }

    const data = await ttsRes.json()

    if (!data.audioContent) {
      console.error('No audio content in response:', JSON.stringify(data))
      return NextResponse.json({ error: '음성을 생성하지 못했습니다' }, { status: 500 })
    }

    // Base64 오디오를 data URL로 반환
    const audioUrl = `data:audio/mp3;base64,${data.audioContent}`

    return NextResponse.json({ audioUrl })

  } catch (error: any) {
    console.error('TTS generation error:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
