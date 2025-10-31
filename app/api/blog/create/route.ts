export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: 'Title and content are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // TODO: 실제 저장 로직 구현
    // 옵션 1: Cloudflare KV
    // 옵션 2: Cloudflare D1
    // 옵션 3: GitHub API (파일로 커밋)

    // 현재는 임시로 성공 응답만 반환
    console.log('Blog post received:', { title, contentLength: content.length });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Blog post received (저장 기능은 추후 구현 예정)',
        title
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
