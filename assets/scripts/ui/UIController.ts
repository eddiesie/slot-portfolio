// assets/scripts/ui/UIController.ts
import { _decorator, Component, Label, Button, tween, UIOpacity } from 'cc';
import { GameController } from '../game/GameController';
import { WinMessageConfig } from '../data/WinMessageConfig';
const { ccclass, property } = _decorator;

@ccclass('UIController')
export class UIController extends Component {
  // ====== 文字顯示 ======
  @property({ type: Label, tooltip: '餘額顯示 Label' })
  balanceLabel: Label | null = null;

  @property({ type: Label, tooltip: '押注顯示 Label' })
  betLabel: Label | null = null;

  @property({ type: Label, tooltip: '贏分顯示 Label（單一 Label）' })
  winLabel: Label | null = null;

  // ====== 按鈕 ======
  @property({ type: Button }) spinButton: Button | null = null;
  @property({ type: Button }) stopButton: Button | null = null;
  @property({ type: Button }) betMinus: Button | null = null;
  @property({ type: Button }) betPlus: Button | null = null;
  @property({ type: Button }) maxBet: Button | null = null;
  @property({ type: Button }) autoBtn: Button | null = null;

  // ====== 遊戲控制 ======
  @property({ type: GameController, tooltip: '拖入 GameController 節點' })
  game: GameController | null = null;

  // ====== 中獎訊息（可選） ======
  @property({ type: WinMessageConfig, tooltip: '拖入 WinMessageConfig 節點（可選）' })
  messageConfig: WinMessageConfig | null = null;

  // ====== 吐司 ======
  @property({ type: Label, tooltip: '吐司訊息 Label（UI/WinToast/Label）' })
  winToastLabel: Label | null = null;

  @property({ tooltip: '吐司顯示秒數' })
  toastSeconds = 1.6;

  // ====== 顯示前綴 ======
  @property({ tooltip: 'WinLabel 的前綴文字' })
  winPrefix = '贏分：';

  // ====== 狀態 ======
  private _balance = 1000;
  private _bet = 10;
  private _spinning = false;
  private _autoMode = false;

  onLoad() {
    this._refreshStaticTexts();
    this._setWinLabel(0); // 初始化顯示「贏分：0」
    this._setupToastOpacity();
    this._toggleButtons(false); // 初始可點 SPIN、不可點 STOP
  }

  // ----------------- UI 事件 -----------------
  public onSpin() {
    if (this._spinning || !this.game) return;
    if (this._balance < this._bet) { this._showToast('餘額不足'); return; }

    this._spinning = true;
    this._balance -= this._bet;
    this._refreshStaticTexts();
    this._setWinLabel(0);               // 開始轉就先清零，保留前綴
    this._toggleButtons(true);          // 鎖住大部分按鈕，只留 STOP

    this.game.spin(
      this._bet,
      () => { /* 可加啟動音效等 */ },
      (win, detail) => {
        // 結算
        if (win > 0) {
          this._balance += win;
          this._showWinMessage(detail?.symbol ?? -1, detail?.count ?? 0, win);
        } else {
          this._showToast('未中獎');
        }
        this._setWinLabel(win);

        this._spinning = false;
        this._toggleButtons(false);
        this._refreshStaticTexts();

        // 簡單 Auto（若之後要做進階版，可在這裡循環呼叫）
        if (this._autoMode) {
          // 小延遲避免過快
          setTimeout(() => this.onSpin(), 150);
        }
      }
    );
  }

  public onStop() {
    // 轉動中才有作用
    if (this._spinning) this.game?.quickStop();
  }

  public onBetMinus() {
    if (this._spinning) return;
    this._bet = Math.max(1, this._bet - 1);
    this._refreshStaticTexts();
  }

  public onBetPlus() {
    if (this._spinning) return;
    this._bet += 1;
    this._refreshStaticTexts();
  }

  public onMaxBet() {
    if (this._spinning) return;
    this._bet = 50;
    this._refreshStaticTexts();
  }

  public onAuto() {
    // 先做簡單切換（可擴充為 UI 高亮/停用其它按鈕）
    this._autoMode = !this._autoMode;
    this._showToast(this._autoMode ? '自動開始' : '自動停止');
    if (this._autoMode && !this._spinning) this.onSpin();
  }

  // ----------------- 顯示/輔助 -----------------
  private _refreshStaticTexts() {
    if (this.balanceLabel) this.balanceLabel.string = `餘額：${this._balance}`;
    if (this.betLabel) this.betLabel.string = `押注：${this._bet}`;
    // 不覆蓋 winLabel，避免把前綴蓋掉
  }

  private _setWinLabel(value: number) {
    if (this.winLabel) this.winLabel.string = `${this.winPrefix}${value}`;
  }

  private _toggleButtons(spinning: boolean) {
    // SPIN 轉動中不可按；STOP 轉動中可按
    if (this.spinButton) this.spinButton.interactable = !spinning;
    if (this.stopButton) this.stopButton.interactable = spinning;

    // 調注相關在轉動中不可按
    if (this.betMinus) this.betMinus.interactable = !spinning;
    if (this.betPlus) this.betPlus.interactable = !spinning;
    if (this.maxBet) this.maxBet.interactable = !spinning;

    // Auto 在轉動中也可按（允許中途關閉）
    if (this.autoBtn) this.autoBtn.interactable = true;
  }

  private _setupToastOpacity() {
    if (!this.winToastLabel) return;
    const node = this.winToastLabel.node;
    let uiop = node.getComponent(UIOpacity);
    if (!uiop) uiop = node.addComponent(UIOpacity);
    uiop.opacity = 0;
  }

  private _showWinMessage(symbolId: number, count: number, payout: number) {
    if (this.messageConfig && symbolId >= 0 && count >= 3) {
      const msg = this.messageConfig.getMessage(symbolId, count, payout);
      this._showToast(msg);
    } else {
      // 後備訊息：若未連到 WinMessageConfig 或 count < 3
      this._showToast(`${this.winPrefix}${payout}`);
    }
  }

  private _showToast(text: string) {
    if (!this.winToastLabel) return;
    this.winToastLabel.string = text;

    const node = this.winToastLabel.node;
    let uiop = node.getComponent(UIOpacity);
    if (!uiop) uiop = node.addComponent(UIOpacity);
    uiop.opacity = 0;

    tween(uiop)
      .to(0.12, { opacity: 255 })
      .delay(this.toastSeconds)
      .to(0.18, { opacity: 0 })
      .start();
  }
}
