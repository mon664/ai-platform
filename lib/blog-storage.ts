import fs from 'fs';
import path from 'path';

const BLOG_DIR = path.join(process.cwd(), 'data', 'blog');

// 디렉토리가 없으면 생성
if (!fs.existsSync(BLOG_DIR)) {
  fs.mkdirSync(BLOG_DIR, { recursive: true });
}

export interface BlogPost {
  slug: string;
  title: string;
  content: string;
  createdAt: string;
}

// 제목을 URL-safe slug로 변환
export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Date.now();
}

// 글 생성
export async function createPost(title: string, content: string): Promise<BlogPost> {
  const slug = createSlug(title);
  const post: BlogPost = {
    slug,
    title,
    content,
    createdAt: new Date().toISOString(),
  };

  const filePath = path.join(BLOG_DIR, `${slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(post, null, 2), 'utf-8');

  return post;
}

// 글 목록 조회
export async function listPosts(): Promise<BlogPost[]> {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.json'));
  const posts = files.map(file => {
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
    return JSON.parse(content) as BlogPost;
  });

  // 최신순 정렬
  return posts.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// 특정 글 조회
export async function getPost(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(BLOG_DIR, `${slug}.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as BlogPost;
}

// 글 수정
export async function updatePost(slug: string, title: string, content: string): Promise<BlogPost | null> {
  const existingPost = await getPost(slug);

  if (!existingPost) {
    return null;
  }

  const updatedPost: BlogPost = {
    ...existingPost,
    title,
    content,
  };

  const filePath = path.join(BLOG_DIR, `${slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(updatedPost, null, 2), 'utf-8');

  return updatedPost;
}

// 글 삭제
export async function deletePost(slug: string): Promise<boolean> {
  const filePath = path.join(BLOG_DIR, `${slug}.json`);

  if (!fs.existsSync(filePath)) {
    return false;
  }

  fs.unlinkSync(filePath);
  return true;
}
