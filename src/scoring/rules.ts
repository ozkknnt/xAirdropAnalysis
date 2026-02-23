import { NEGATIVE_KEYWORDS, POSITIVE_KEYWORDS } from './keywords.js';
import type { ScoredPost, SourcePost } from '../types.js';

export function scorePost(post: SourcePost): ScoredPost {
  let score = 0;
  const reasons: string[] = [];
  const text = post.text;

  for (const rule of POSITIVE_KEYWORDS) {
    if (rule.pattern.test(text)) {
      score += rule.score;
      reasons.push(`+${rule.score} ${rule.reason}`);
    }
  }

  for (const rule of NEGATIVE_KEYWORDS) {
    if (rule.pattern.test(text)) {
      score += rule.score;
      reasons.push(`${rule.score} ${rule.reason}`);
    }
  }

  const like = post.metrics?.likeCount ?? 0;
  const repost = post.metrics?.repostCount ?? 0;
  if (like >= 100) {
    score += 2;
    reasons.push('+2 高エンゲージメント');
  }
  if (repost >= 30) {
    score += 2;
    reasons.push('+2 拡散傾向');
  }

  const rank = toRank(score);
  return { ...post, score, reasons, rank };
}

export function toRank(score: number): 'S' | 'A' | 'B' | 'C' {
  if (score >= 16) return 'S';
  if (score >= 12) return 'A';
  if (score >= 8) return 'B';
  return 'C';
}

export function scorePosts(posts: SourcePost[]): ScoredPost[] {
  return posts.map(scorePost).sort((a, b) => b.score - a.score);
}
