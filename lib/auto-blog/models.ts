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

// 더미 데이터 및 함수 추가 (빌드 오류 해결용)
export const TEXT_MODELS = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', cost_per_token: 0.000002 },
  { id: 'gpt-4', name: 'GPT-4', cost_per_token: 0.00003 }
];

export const IMAGE_MODELS = [
  { id: 'dall-e-2', name: 'DALL-E 2', cost_per_image: 0.02 },
  { id: 'dall-e-3', name: 'DALL-E 3', cost_per_image: 0.04 }
];

export function estimateCostText(modelId: string, tokens: number): number {
  const model = TEXT_MODELS.find(m => m.id === modelId);
  return model ? model.cost_per_token * tokens : 0;
}

export function estimateCostImage(modelId: string, count: number): number {
  const model = IMAGE_MODELS.find(m => m.id === modelId);
  return model ? model.cost_per_image * count : 0;
}
