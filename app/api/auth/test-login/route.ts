import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 테스트용 간단 로그인
    if (email === 'admin@example.com' && password === 'admin123!@#') {
      return NextResponse.json({
        success: true,
        message: '로그인 성공',
        token: 'test-token-' + Date.now()
      });
    }

    return NextResponse.json({
      success: false,
      message: '이메일 또는 비밀번호가 틀렸습니다.'
    }, { status: 401 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '서버 오류 발생'
    }, { status: 500 });
  }
}