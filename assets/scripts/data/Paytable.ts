// assets/scripts/data/Paytable.ts

/** 你的 symbolFrames 排序請對齊這個 enum 的索引 */
export enum SymbolId {
    Blue = 0,
    Green = 1,
    Orange = 2,
    Purple = 3,
    Red = 4,
    Lollipop = 5,
  }
  
  /** 權重（越大越常見）；用於加權隨機抽圖 */
  export const SYMBOL_WEIGHTS: number[] = [
    30, // Blue
    30, // Green
    30, // Orange
    25, // Purple
    25, // Red
     3, // Lollipop（稀有）
  ];
  
  /** 中排「出現次數」倍率表：multiplier[symbolId][count] = 倍率 */
  export const MIDDLE_ROW_COUNT_MULTIPLIER_BY_SYMBOL: Record<number, Record<number, number>> = {
    [SymbolId.Blue]:     { 3: 10, 4: 20, 5: 50 },
    [SymbolId.Green]:    { 3: 10, 4: 20, 5: 50 },
    [SymbolId.Orange]:   { 3: 10, 4: 20, 5: 50 },
    [SymbolId.Purple]:   { 3: 10, 4: 20, 5: 50 },
    [SymbolId.Red]:      { 3: 10, 4: 20, 5: 50 },
    [SymbolId.Lollipop]: { 3:100, 4:250, 5:1000 }, // 若想 4 個才算，把 3:100 改成 0
  };
  
  /** 依權重加權抽一個符號 id（0..N-1） */
  export function pickWeightedSymbol(weights: number[], limit?: number): number {
    const n = (typeof limit === 'number') ? Math.min(weights.length, Math.max(1, limit)) : weights.length;
    let sum = 0;
    for (let i = 0; i < n; i++) sum += Math.max(0, weights[i] ?? 0);
    if (sum <= 0) return 0;
    let r = Math.random() * sum;
    for (let i = 0; i < n; i++) {
      r -= Math.max(0, weights[i] ?? 0);
      if (r <= 0) return i;
    }
    return n - 1;
  }
  