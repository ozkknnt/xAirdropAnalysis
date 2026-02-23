# xAirdropAnalysis

Xのリスト投稿を毎日要約してDiscordに通知する、個人用Botの最小構成です。

現時点の実装は以下です。
- end-to-end: `dummy data -> scoring -> Discord webhook` が動作
- X取得モジュール: `src/sources/xClient.ts` に実装済み（トークン設定で切替）
- 認証方針: `OAuth2 User Context` 優先、`App-only Bearer` フォールバック

## セットアップ

```bash
npm install
cp .env.example .env
```

`USE_DUMMY_DATA=true` のまま、まずDiscord投稿の疎通を確認してください。

## 実行

手動実行:

```bash
npm run run
```

開発実行:

```bash
npm run dev
```

ビルド + 実行:

```bash
npm run build
npm run start
```

## 環境変数

主要項目は `.env.example` を参照してください。

必須（dummy以外で運用時）:
- `X_LIST_ID_EVM`
- `X_LIST_ID_SOL`
- `X_LIST_ID_SECURITY`
- `X_OAUTH2_ACCESS_TOKEN` または `X_BEARER_TOKEN`
- `DISCORD_WEBHOOK_URL`

補足:
- `USE_DUMMY_DATA=true` でX APIを使わずダミー投稿を処理
- `DRY_RUN=true` でDiscord送信せず、payloadを標準出力
- `SCORE_MIN` は抽出閾値（デフォルト8）

## スコアリング

- ルールベース（加点/減点）
- キーワード辞書: `src/scoring/keywords.ts`
- ロジック本体: `src/scoring/rules.ts`
- 閾値 `8` 以上を抽出
- ランク: `S/A/B/C`
  - `S: >=16`
  - `A: >=12`
  - `B: >=8`

Discord出力上限:
- `S` 最大3件
- `A` 最大7件
- `B` 最大10件

## X API実装のポイント

`src/sources/xClient.ts`:
- エンドポイント: `GET /2/lists/:id/tweets`
- 24時間フィルタ: `created_at` をクライアント側で判定
- レート制限: `429` + `x-rate-limit-reset` を考慮してリトライ
- 一時エラー (`5xx`) もリトライ

## 毎日20:00 JST実行（cron例）

マシンのタイムゾーンがJSTの場合:

```cron
0 20 * * * cd /path/to/xAirdropAnalysis && /usr/bin/env npm run run >> bot.log 2>&1
```

マシンがUTCの場合（20:00 JST = 11:00 UTC）:

```cron
0 11 * * * cd /path/to/xAirdropAnalysis && TZ=Asia/Tokyo /usr/bin/env npm run run >> bot.log 2>&1
```

## 置き換え手順（次フェーズ）

1. `.env` で `USE_DUMMY_DATA=false` に変更
2. `X_LIST_ID_*` と `X_OAUTH2_ACCESS_TOKEN`（または `X_BEARER_TOKEN`）を設定
3. `npm run run` で実データ取得を確認
4. 必要に応じて `src/scoring/keywords.ts` を拡張
