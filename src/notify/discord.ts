import { env } from '../config.js';
import type { ScoredPost } from '../types.js';

function clip(text: string, max = 180): string {
  return text.length <= max ? text : `${text.slice(0, max - 3)}...`;
}

function formatPostLine(post: ScoredPost): string {
  const user = post.authorUsername ? `@${post.authorUsername}` : post.authorId ?? 'unknown';
  const when = new Date(post.createdAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const link = post.url ? ` [link](${post.url})` : '';
  const reasons = post.reasons.slice(0, 3).join(' / ');
  return `- **${post.score}点** [${post.listKind}] ${clip(post.text)}\n  - ${user} | ${when}${link}\n  - ${reasons}`;
}

export function buildDiscordMessage(posts: ScoredPost[], minScore: number): string {
  const s = posts.filter((p) => p.rank === 'S').slice(0, 3);
  const a = posts.filter((p) => p.rank === 'A').slice(0, 7);
  const b = posts.filter((p) => p.rank === 'B').slice(0, 10);

  const nowJst = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  const lines: string[] = [
    `# X Airdrop Daily Summary`,
    `対象: 過去24時間 / 作成: ${nowJst} JST`,
    `抽出条件: ${minScore}点以上`,
    ''
  ];

  const pushSection = (title: string, items: ScoredPost[]) => {
    lines.push(`## ${title} (${items.length}件)`);
    if (items.length === 0) {
      lines.push('- なし');
    } else {
      lines.push(...items.map(formatPostLine));
    }
    lines.push('');
  };

  pushSection('Sランク', s);
  pushSection('Aランク', a);
  pushSection('Bランク', b);

  return lines.join('\n').slice(0, 1900);
}

export async function postToDiscord(content: string): Promise<void> {
  if (!env.DISCORD_WEBHOOK_URL) {
    throw new Error('DISCORD_WEBHOOK_URL is not set.');
  }

  if (env.DRY_RUN) {
    console.log('[DRY_RUN] Discord payload preview:\n');
    console.log(content);
    return;
  }

  const res = await fetch(env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Discord webhook failed (${res.status}): ${body}`);
  }
}
