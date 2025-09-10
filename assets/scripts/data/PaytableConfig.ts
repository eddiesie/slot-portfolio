// assets/scripts/data/PaytableConfig.ts
import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 把本元件掛在場景中的一個節點（例如 PaytableConfig）。
 * Inspector 會顯示可調的權重與倍率。
 * 陣列順序要與 GameController.symbolFrames 的順序一致。
 */
@ccclass('PaytableConfig')
export class PaytableConfig extends Component {
  @property({ type: [String], tooltip: '符號名稱（僅顯示用，可留空）' })
  symbolNames: string[] = ['blue', 'green', 'orange', 'purple', 'red', 'lollipop'];

  @property({ type: [Number], tooltip: '各符號的出現權重（越大越常見）' })
  weights: number[] = [30, 30, 30, 25, 25, 3];

  @property({ type: [Number], tooltip: '中排出現 3 個時的倍率（逐符號）' })
  mult3: number[] = [10, 10, 10, 10, 10, 100];

  @property({ type: [Number], tooltip: '中排出現 4 個時的倍率（逐符號）' })
  mult4: number[] = [20, 20, 20, 20, 20, 250];

  @property({ type: [Number], tooltip: '中排出現 5 個時的倍率（逐符號）' })
  mult5: number[] = [50, 50, 50, 50, 50, 1000];

  /** 取得某符號在出現 count(3/4/5) 個時的倍率 */
  getMultiplier(symbolId: number, count: number): number {
    const safePick = (arr: number[]) =>
      symbolId < arr.length ? Math.max(0, arr[symbolId] || 0) : 0;
    if (count === 3) return safePick(this.mult3);
    if (count === 4) return safePick(this.mult4);
    if (count === 5) return safePick(this.mult5);
    return 0;
  }

  /** 依權重加權抽一個符號 id（limit = 可用符號數，對齊 symbolFrames 長度） */
  pickWeighted(limit: number): number {
    const n = Math.min(limit, this.weights.length);
    let sum = 0;
    for (let i = 0; i < n; i++) sum += Math.max(0, this.weights[i] || 0);
    if (sum <= 0) return 0;
    let r = Math.random() * sum;
    for (let i = 0; i < n; i++) {
      r -= Math.max(0, this.weights[i] || 0);
      if (r <= 0) return i;
    }
    return n - 1;
  }
}
