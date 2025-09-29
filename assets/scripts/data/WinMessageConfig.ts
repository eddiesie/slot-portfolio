// assets/scripts/data/WinMessageConfig.ts
import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 依符號與連線數（3/4/5）回傳客製化中獎訊息。
 * 可用模板變數：
 *   {symbol} = 符號名稱（對齊 PaytableConfig.SymbolNames）
 *   {count}  = 連線數（3/4/5）
 *   {payout} = 得分（已乘押注）
 */
@ccclass('WinMessageConfig')
export class WinMessageConfig extends Component {
  @property({ type: [String], tooltip: '符號名稱，順序需與 GameController.symbolFrames 一致' })
  symbolNames: string[] = ['blue','green','orange','purple','red','lollipop'];

  @property({ type: [String], tooltip: '連 3 個的訊息模板（逐符號）' })
  msg3: string[] = [
    '{symbol} x{count}！贏 {payout}',
    '{symbol} x{count}！贏 {payout}',
    '{symbol} x{count}！贏 {payout}',
    '{symbol} x{count}！贏 {payout}',
    '{symbol} x{count}！贏 {payout}',
    '棒棒糖 x{count}！超讚～贏 {payout}',
  ];

  @property({ type: [String], tooltip: '連 4 個的訊息模板（逐符號）' })
  msg4: string[] = [
    '{symbol} 四連！贏 {payout}',
    '{symbol} 四連！贏 {payout}',
    '{symbol} 四連！贏 {payout}',
    '{symbol} 四連！贏 {payout}',
    '{symbol} 四連！贏 {payout}',
    '棒棒糖 四連！贏 {payout}',
  ];

  @property({ type: [String], tooltip: '連 5 個的訊息模板（逐符號）' })
  msg5: string[] = [
    '{symbol} 五連！大贏 {payout}',
    '{symbol} 五連！大贏 {payout}',
    '{symbol} 五連！大贏 {payout}',
    '{symbol} 五連！大贏 {payout}',
    '{symbol} 五連！大贏 {payout}',
    '棒棒糖 五連！JACKPOT！{payout}',
  ];

  private _safe(arr: string[], i: number, fallback: string): string {
    return i >= 0 && i < arr.length && arr[i] ? arr[i] : fallback;
  }

  /** 以簡單模板替換（相容舊版 TS / 無 replaceAll） */
  private _format(tpl: string, data: Record<string, string | number>): string {
    // 只替換 {key} 型式
    return tpl.replace(/\{(\w+)\}/g, (_m, key: string) => {
      const v = data[key];
      return v !== undefined && v !== null ? String(v) : _m;
    });
  }

  /** 根據符號 id 與連線數（3/4/5），組出訊息文字 */
  getMessage(symbolId: number, count: number, payout: number): string {
    const name = this._safe(this.symbolNames, symbolId, `symbol#${symbolId}`);
    const tpl =
      count === 5
        ? this._safe(this.msg5, symbolId, '{symbol} x{count} 贏 {payout}')
        : count === 4
        ? this._safe(this.msg4, symbolId, '{symbol} x{count} 贏 {payout}')
        : this._safe(this.msg3, symbolId, '{symbol} x{count} 贏 {payout}');

    return this._format(tpl, { symbol: name, count, payout });
  }
}
