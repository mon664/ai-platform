import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  return NextResponse.json({
    error: 'WAV 다운로드는 Google Cloud TTS API가 필요합니다. 브라우저 TTS는 시스템 음성만 재생 가능하며 파일 추출이 불가능합니다.'
  }, { status: 501 })
}
