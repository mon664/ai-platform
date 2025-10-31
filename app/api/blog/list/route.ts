import type { Env, BlogPost } from '@/app/types/cloudflare';

export const runtime = 'edge';

export async function GET(request: Request, { env }: { env: Env }) {
  try {
    // D1 데이터베이스가 바인딩되지 않은 경우
    if (!env?.DB) {
      console.error('D1 database not bound');
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 최신 게시글부터 조회
    const { results } = await env.DB.prepare(
      'SELECT id, slug, title, created_at, updated_at FROM posts ORDER BY created_at DESC'
    ).all<BlogPost>();

    return new Response(
      JSON.stringify({ posts: results || [] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
