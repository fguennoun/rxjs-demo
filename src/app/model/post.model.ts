// ============================================
// 📁 post.model.ts - Le modèle de données
// ============================================


export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface PostViewModel {
  id: number;
  userId: number;
  title: string;
  body: string;
  wordCount: number;
  excerpt: string;
}
