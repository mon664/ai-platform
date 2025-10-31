import type { Env } from '@/app/types/cloudflare';

// 제목을 URL-safe slug로 변환
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Date.now();
}

export async function POST(request: Request, { env }: { env: Env }) {
  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: 'Title and content are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // D1 데이터베이스가 바인딩되지 않은 경우
    if (!env?.DB) {
      console.error('D1 database not bound');
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const slug = createSlug(title);

    // D1 데이터베이스에 저장
    const result = await env.DB.prepare(
      'INSERT INTO posts (slug, title, content) VALUES (?, ?, ?)'
    )
      .bind(slug, title, content)
      .run();

    if (!result.success) {
      throw new Error('Failed to insert post');
    }

    return new Response(
      JSON.stringify({
        success: true,
        slug,
        title,
        message: '블로그 게시글이 저장되었습니다!'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating blog post:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}