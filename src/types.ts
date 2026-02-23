export type ListKind = 'EVM' | 'SOL' | 'SECURITY';

export interface SourcePost {
  id: string;
  text: string;
  createdAt: string;
  authorId?: string;
  authorUsername?: string;
  url?: string;
  listKind: ListKind;
  metrics?: {
    likeCount?: number;
    repostCount?: number;
    replyCount?: number;
    quoteCount?: number;
  };
}

export interface ScoredPost extends SourcePost {
  score: number;
  reasons: string[];
  rank: 'S' | 'A' | 'B' | 'C';
}
