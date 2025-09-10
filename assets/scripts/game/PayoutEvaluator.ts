// assets/scripts/game/PayoutEvaluator.ts
import { PaytableConfig } from '../data/PaytableConfig';

export interface MiddleRowCountWin {
  count: number;        // 該符號在中排出現幾次（3/4/5）
  symbol: number;       // 中獎符號 id
  payout: number;       // 實際得分（已乘 betPerLine）
  positions: number[];  // 中排中：該符號出現的欄索引（用於高亮）
}

/** 只看中排、不需連續；多個同時達標時取「最高獎」（單一筆） */
export function evaluateMiddleRowCount(
  grid: number[][],
  betPerLine: number,
  paytable: PaytableConfig
): { totalWin: number; wins: MiddleRowCountWin[] } {
  const ROW = 1;
  const COLS = grid.length;
  if (COLS === 0) return { totalWin: 0, wins: [] };

  const countMap = new Map<number, number>();
  const posMap = new Map<number, number[]>();

  for (let c = 0; c < COLS; c++) {
    const s = grid[c][ROW];
    countMap.set(s, (countMap.get(s) ?? 0) + 1);
    if (!posMap.has(s)) posMap.set(s, []);
    posMap.get(s)!.push(c);
  }

  let best: MiddleRowCountWin | null = null;

  countMap.forEach((cnt, sym) => {
    if (cnt < 3) return;
    const mult = paytable.getMultiplier(sym, cnt);
    if (mult <= 0) return;
    const payout = mult * betPerLine;
    const win: MiddleRowCountWin = {
      count: cnt,
      symbol: sym,
      payout,
      positions: posMap.get(sym) ?? [],
    };
    if (!best || win.payout > best.payout) best = win;
  });

  if (best) return { totalWin: best.payout, wins: [best] };
  return { totalWin: 0, wins: [] };
}
