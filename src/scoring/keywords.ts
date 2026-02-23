export const POSITIVE_KEYWORDS: Array<{ pattern: RegExp; score: number; reason: string }> = [
  { pattern: /airdrop/i, score: 4, reason: 'airdrop関連' },
  { pattern: /snapshot/i, score: 3, reason: 'snapshot言及' },
  { pattern: /testnet|mainnet/i, score: 2, reason: 'network進捗' },
  { pattern: /token launch|tge/i, score: 4, reason: 'TGE/launch情報' },
  { pattern: /retroactive|points?/i, score: 3, reason: 'retroactive/points' },
  { pattern: /security|audit|exploit/i, score: 3, reason: 'security関連' },
  { pattern: /bridge|liquidity|staking/i, score: 2, reason: '運用系トピック' },
  { pattern: /governance|proposal/i, score: 2, reason: 'governance情報' }
];

export const NEGATIVE_KEYWORDS: Array<{ pattern: RegExp; score: number; reason: string }> = [
  { pattern: /giveaway|follow\s+for\s+follow/i, score: -3, reason: '低品質プロモ傾向' },
  { pattern: /meme|gm\b|gn\b/i, score: -2, reason: '情報密度が低い' },
  { pattern: /price prediction|moon|100x/i, score: -3, reason: '煽り系' }
];
