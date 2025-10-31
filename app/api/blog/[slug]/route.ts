import type { Env, BlogPost } from '@/app/types/cloudflare';

export async function GET(
  request: Request,
  { params, env }: { params: { slug: string }; env: Env }
) {
  try {
    const { slug } = params;

    // D1 데이터베이스가 바인딩되지 않은 경우
    if (!env?.DB) {
      console.error('D1 database not bound');
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // slug로 게시글 조회
    const post = await env.DB.prepare(
      'SELECT * FROM posts WHERE slug = ?'
    )
      .bind(slug)
      .first<BlogPost>();

    if (!post) {
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ post }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching blog post:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PUT(
  request: Request,
  { params, env }: { params: { slug: string }; env: Env }
) {
  try {
    const { slug } = params;
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

    // D1 데이터베이스 업데이트
    const result = await env.DB.prepare(
      'UPDATE posts SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?'
    )
      .bind(title, content, slug)
      .run();

    if (!result.success) {
      throw new Error('Failed to update post');
    }

    return new Response(
      JSON.stringify({
        success: true,
        slug,
        message: '게시글이 수정되었습니다!'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error updating blog post:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}