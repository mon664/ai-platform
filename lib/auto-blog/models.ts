// 자동 블로그 생성 관련 모델
export interface BlogGeneration {
  id: string;
  keyword: string;
  target_tokens: number;
  blog_post_id: string | null;
  generation_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  generation_time: number | null;
  cost_estimate: number | null;
  created_at: Date;
  completed_at: Date | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  status: 'draft' | 'published';
  tags: string[];
  featured_image: string;
  meta_title: string;
  meta_description: string;
  view_count: number;
  like_count: number;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
  ai_generated: boolean;
}

export interface AutoBlogConfig {
  enabled: boolean;
  schedule: string; // cron expression
  keywords: string[];
  target_tokens: number;
  auto_publish: boolean;
  image_generation: boolean;
}