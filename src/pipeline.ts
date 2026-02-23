import { env, listIds } from './config.js';
import { postToDiscord, buildDiscordMessage } from './notify/discord.js';
import { scorePosts } from './scoring/rules.js';
import { getDummyPosts } from './sources/dummySource.js';
import { fetchListTweets } from './sources/xClient.js';
import type { ListKind, SourcePost } from './types.js';

const LIST_KINDS: ListKind[] = ['EVM', 'SOL', 'SECURITY'];

function since24hIso(): string {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
}

function dedupePosts(posts: SourcePost[]): SourcePost[] {
  const seen = new Set<string>();
  const out: SourcePost[] = [];
  for (const p of posts) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out;
}

export async function runPipeline(): Promise<void> {
  const sinceIso = since24hIso();
  const collected: SourcePost[] = [];

  for (const kind of LIST_KINDS) {
    if (env.USE_DUMMY_DATA) {
      collected.push(...getDummyPosts(kind));
      continue;
    }

    const listId = listIds[kind];
    if (!listId) {
      console.warn(`[warn] skip ${kind}: list id is not configured`);
      continue;
    }

    const rows = await fetchListTweets(listId, kind, sinceIso);
    collected.push(...rows);
  }

  const deduped = dedupePosts(collected);
  const scored = scorePosts(deduped);
  const selected = scored.filter((p) => p.score >= env.SCORE_MIN);

  const message = buildDiscordMessage(selected, env.SCORE_MIN);
  await postToDiscord(message);

  console.log(`[done] posted summary. total=${deduped.length}, selected=${selected.length}`);
}
