import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    gl_api_key: process.env.GLM_API_KEY ? "설정됨" : "설정안됨",
    gl_api_key_length: process.env.GLM_API_KEY?.length || 0,
    gl_api_key_preview: process.env.GLM_API_KEY?.substring(0, 10) + "..." || "",
    ecount_session: process.env.ECOUNT_SESSION_ID ? "설정됨" : "설정안됨",
    all_env_keys: Object.keys(process.env).filter(key =>
      key.includes('GLM') || key.includes('ECOUNT') || key.includes('API')
    )
  });
}