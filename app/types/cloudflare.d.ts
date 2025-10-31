// Cloudflare D1 타입 정의
export interface Env {
  DB: D1Database;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}
