import { _decorator, Component, Node, Vec3, tween, SpriteFrame } from 'cc';
import { SymbolView } from './SymbolView';
const { ccclass, property } = _decorator;

/**
 * 無跳圖：在每一步「開始之前」就先把最低的格子搬到最上方，並設定成 feed 的下一張，
 * 然後三格一起往下滾動一格。這樣每一步結束時，畫面就是最終要看到的圖，不會在停輪時突變。
 */
@ccclass('Reel')
export class Reel extends Component {
  @property({ tooltip: '每格高度（需與三格之間的 Y 間距一致）' })
  symbolHeight: number = 160;

  @property({ tooltip: '每一步往下滾的時間（秒）' })
  stepDuration: number = 0.06;

  private _cells: Node[] = [];
  private _stepsLeft = 0;
  private _isSpinning = false;
  private _onStop?: () => void;

  private _feed: SpriteFrame[] = [];
  private _resultTop?: SpriteFrame;
  private _resultMid?: SpriteFrame;
  private _resultBot?: SpriteFrame;

  onLoad() {
    const top = this.node.getChildByName('CellTop');
    const mid = this.node.getChildByName('CellMid');
    const bot = this.node.getChildByName('CellBot');
    this._cells = top && mid && bot ? [top, mid, bot] : [...this.node.children];
  }

  /** 依目前 y 位置，回傳當前可見的 上(0)/中(1)/下(2) 節點 */
  public getVisibleNodeAtRow(rowIndex: 0 | 1 | 2): Node {
    const sorted = [...this._cells].sort((a, b) => b.position.y - a.position.y);
    return sorted[rowIndex]; // 0=最高(上),1=中,2=最低(下)
  }

  /** 啟動轉動（feed 最後三張必須是 [top, mid, bot] 最終結果） */
  spin(
    totalSteps: number,
    feed: SpriteFrame[],
    resultTopMidBot: [SpriteFrame, SpriteFrame, SpriteFrame],
    onStop?: () => void
  ) {
    if (this._isSpinning) return;
    this._isSpinning = true;
    this._stepsLeft = Math.max(3, totalSteps);
    this._feed = feed.slice();
    [this._resultTop, this._resultMid, this._resultBot] = resultTopMidBot;
    this._onStop = onStop;

    this._step(); // 進入第一步
  }

  /** 快速停：把剩餘步數縮到 ≤3，並將 feed 裁切成能在最後 1~3 步內正好落到 [top, mid, bot] */
  quickStop() {
    if (!this._isSpinning) return;
    const r = Math.min(this._stepsLeft, 3);
    this._stepsLeft = r;
    if (r <= 0 || !this._resultTop || !this._resultMid || !this._resultBot) return;
    const seq: SpriteFrame[] = [this._resultTop, this._resultMid, this._resultBot];
    this._feed = seq.slice(3 - r); // r=3->[top,mid,bot]；r=2->[mid,bot]；r=1->[bot]
  }

  get isSpinning() { return this._isSpinning; }

  private _step() {
    if (this._stepsLeft <= 0) {
      this._isSpinning = false;
      // 小彈跳（僅 Y 軸，不動 X/Z）
      const bounce = 10;
      const p0 = this.node.position.clone();
      tween(this.node)
        .to(0.05, { position: new Vec3(p0.x, p0.y - bounce, p0.z) })
        .to(0.05, { position: new Vec3(p0.x, p0.y, p0.z) })
        .call(() => this._onStop && this._onStop())
        .start();
      return;
    }

    this._stepsLeft--;

    // ★★★ 無跳圖關鍵：先把「最底的格子」搬到最上面，並設定成下一張圖，再進行本步的下滾動畫
    let bottomIdx = 0;
    for (let i = 1; i < this._cells.length; i++) {
      if (this._cells[i].position.y < this._cells[bottomIdx].position.y) bottomIdx = i;
    }
    const bottom = this._cells[bottomIdx];
    const maxY = Math.max(...this._cells.map(c => c.position.y));
    // 放到最高點之上（下一步滾動後會正好落到最上排可見）
    bottom.setPosition(new Vec3(0, maxY + this.symbolHeight, 0));

    // 先塞入下一張要出現的圖（若 feed 空則沿用最後一張）
    const nextFrame = this._feed.length > 0 ? this._feed.shift()! : (this._feed[this._feed.length - 1] ?? null);
    if (nextFrame) bottom.getComponent(SymbolView)?.setSymbol(nextFrame);

    // 現在三格同時往下滑一格——這一步結束後，畫面就是「剛塞好的圖」要顯示的樣子
    let finished = 0;
    for (const cell of this._cells) {
      const from = cell.position.clone();
      const to = new Vec3(from.x, from.y - this.symbolHeight, from.z);
      tween(cell)
        .to(this.stepDuration, { position: to })
        .call(() => {
          finished++;
          if (finished === this._cells.length) {
            this._step(); // 進下一步
          }
        })
        .start();
    }
  }
}
