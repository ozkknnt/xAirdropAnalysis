import { env, resolveXToken } from '../config.js';
import type { ListKind, SourcePost } from '../types.js';

const X_API_BASE = 'https://api.x.com/2';
const X_TIMEOUT_MS = 20_000;

interface XListTweetsResponse {
  data?: Array<{
    id: string;
    text: string;
    created_at?: string;
    author_id?: string;
    public_metrics?: {
      like_count?: number;
      retweet_count?: number;
      reply_count?: number;
      quote_count?: number;
    };
  }>;
  includes?: {
    users?: Array<{
      id: string;
      username?: string;
    }>;
  };
  meta?: {
    next_token?: string;
    result_count?: number;
  };
  errors?: Array<{ message?: string }>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, token: string, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), X_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (response.status === 429 && attempt < maxRetries) {
        const resetAt = Number(response.headers.get('x-rate-limit-reset') ?? '0') * 1000;
        const wait = resetAt > Date.now() ? resetAt - Date.now() : (attempt + 1) * 1500;
        await sleep(Math.min(wait, 60_000));
        continue;
      }

      if (response.status >= 500 && attempt < maxRetries) {
        await sleep((attempt + 1) * 1500);
        continue;
      }

      return response;
    } catch (error) {
      clearTimeout(timeout);
      if (attempt >= maxRetries) {
        throw error;
      }
      await sleep((attempt + 1) * 1200);
    }
  }

  throw new Error('Failed to fetch from X API');
}

export async function fetchListTweets(listId: string, listKind: ListKind, sinceIso: string): Promise<SourcePost[]> {
  const tokenInfo = resolveXToken();
  if (!tokenInfo) {
    throw new Error('X token is not configured. Set X_OAUTH2_ACCESS_TOKEN or X_BEARER_TOKEN.');
  }

  const usersById = new Map<string, string>();
  const posts: SourcePost[] = [];
  let nextToken: string | undefined;

  for (let page = 0; page < env.X_FETCH_MAX_PAGES; page += 1) {
    const params = new URLSearchParams({
      max_results: String(env.X_FETCH_PAGE_SIZE),
      expansions: 'author_id',
      'tweet.fields': 'created_at,author_id,public_metrics,lang',
      'user.fields': 'username'
    });
    if (nextToken) {
      params.set('pagination_token', nextToken);
    }

    const url = `${X_API_BASE}/lists/${listId}/tweets?${params.toString()}`;
    const response = await fetchWithRetry(url, tokenInfo.token);

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`X API error ${response.status}: ${detail}`);
    }

    const json = (await response.json()) as XListTweetsResponse;

    for (const user of json.includes?.users ?? []) {
      if (user.username) {
        usersById.set(user.id, user.username);
      }
    }

    for (const t of json.data ?? []) {
      if (!t.created_at) continue;
      if (new Date(t.created_at).getTime() < new Date(sinceIso).getTime()) continue;

      const username = t.author_id ? usersById.get(t.author_id) : undefined;
      posts.push({
        id: t.id,
        text: t.text,
        createdAt: t.created_at,
        authorId: t.author_id,
        authorUsername: username,
        url: username ? `https://x.com/${username}/status/${t.id}` : undefined,
        listKind,
        metrics: {
          likeCount: t.public_metrics?.like_count,
          repostCount: t.public_metrics?.retweet_count,
          replyCount: t.public_metrics?.reply_count,
          quoteCount: t.public_metrics?.quote_count
        }
      });
    }

    nextToken = json.meta?.next_token;
    if (!nextToken) {
      break;
    }
  }

  return posts;
}
