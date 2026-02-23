import type { ListKind, SourcePost } from '../types.js';

function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export function getDummyPosts(listKind: ListKind): SourcePost[] {
  const base: Array<Omit<SourcePost, 'listKind'>> = [
    {
      id: `${listKind}-1`,
      text: 'New airdrop points update. Snapshot this week and testnet tasks are live.',
      createdAt: isoHoursAgo(2),
      authorId: '1001',
      authorUsername: 'alpha_team',
      url: 'https://x.com/alpha_team/status/1',
      metrics: { likeCount: 180, repostCount: 55, replyCount: 20, quoteCount: 5 }
    },
    {
      id: `${listKind}-2`,
      text: 'Security audit completed for bridge module. Mainnet rollout soon.',
      createdAt: isoHoursAgo(7),
      authorId: '1002',
      authorUsername: 'beta_protocol',
      url: 'https://x.com/beta_protocol/status/2',
      metrics: { likeCount: 90, repostCount: 20, replyCount: 8, quoteCount: 1 }
    },
    {
      id: `${listKind}-3`,
      text: 'gm builders',
      createdAt: isoHoursAgo(3),
      authorId: '1003',
      authorUsername: 'low_signal',
      url: 'https://x.com/low_signal/status/3',
      metrics: { likeCount: 12, repostCount: 1, replyCount: 1, quoteCount: 0 }
    },
    {
      id: `${listKind}-4`,
      text: 'Governance proposal passed, token launch timeline announced with retroactive criteria.',
      createdAt: isoHoursAgo(11),
      authorId: '1004',
      authorUsername: 'core_dao',
      url: 'https://x.com/core_dao/status/4',
      metrics: { likeCount: 220, repostCount: 80, replyCount: 35, quoteCount: 7 }
    },
    {
      id: `${listKind}-5`,
      text: 'Giveaway: follow for follow and win whitelist spots!',
      createdAt: isoHoursAgo(1),
      authorId: '1005',
      authorUsername: 'promo_account',
      url: 'https://x.com/promo_account/status/5',
      metrics: { likeCount: 30, repostCount: 4, replyCount: 2, quoteCount: 0 }
    }
  ];

  return base.map((p) => ({ ...p, listKind }));
}
