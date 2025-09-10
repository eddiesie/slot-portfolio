// assets/scripts/ui/UIController.ts
import { _decorator, Component, Label, Button, Node, UIOpacity, tween } from 'cc';
import { GameController } from '../game/GameController';
const { ccclass, property } = _decorator;

type WinDetail = { symbol: number; count: number; payout: number } | null;

@ccclass('UIController')
export class UIController extends Component {
  @property(Label) balanceLabel: Label | null = null;
  @property(Label) betLabel: Label | null = null;
  @property(Label) winLabel: Label | null = null;

  @property(Button) spinButton: Button | null = null;
  @property(Button) stopButton: Button | null = null;
  @property(Button) betMinus: Button | null = null;
  @property(Button) betPlus: Button | null = null;
  @property(Button) maxBet: Button | null = null;
  @property(Button) autoBtn: Button | null = null;

  @property(GameController) game: GameController | null = null;

  // === Win Toast ===
  @property(Node) winToastNode: Node | null = null;
  @property(Label) winToastLabel: Label | null = null;

  // === 狀態 ===
  private balance = 1000;
  private betPerLine = 1;
  private linesCount = 10; // 目前固定 10（只算中排；這裡代表總押注=betPerLine*10）
  private lastWin = 0;
  private spinning = false;

  // === Auto 模式 ===
  private autoEnabled = false;
  @property({ tooltip: 'Auto 模式每局間隔秒數' })
  private autoDelaySec = 0.35;

  start() {
    this.refreshUI();
    this.updateButtons();
  }

  public onBetPlus() {
    if (this.spinning || this.autoEnabled) return;
    this.betPerLine = Math.min(this.betPerLine + 1, 10);
    this.refreshUI();
  }

  public onBetMinus() {
    if (this.spinning || this.autoEnabled) return;
    this.betPerLine = Math.max(this.betPerLine - 1, 1);
    this.refreshUI();
  }

  public onMaxBet() {
    if (this.spinning || this.autoEnabled) return;
    this.betPerLine = 10;
    this.refreshUI();
  }

  public onSpin() {
    if (this.spinning) return;

    const totalBet = this.betPerLine * this.linesCount;
    if (this.balance < totalBet) {
      console.warn('餘額不足，無法旋轉');
      // 自動模式下，若餘額不足，直接關閉 auto
      if (this.autoEnabled) {
        this.autoEnabled = false;
        this.updateButtons();
      }
      return;
    }

    this.balance -= totalBet;
    this.lastWin = 0;
    this.spinning = true;
    this.refreshUI();
    this.updateButtons();

    this.game?.spin(
      this.betPerLine,
      () => {}, // started
      (win, detail) => this.roundFinished(win, detail)
    );
  }

  public onStop() {
    if (!this.spinning && !this.autoEnabled) return;
    // Stop 同時關閉 Auto，並嘗試快速停當前局
    this.autoEnabled = false;
    this.game?.quickStop();
    this.updateButtons();
  }

  public onAuto() {
    this.autoEnabled = !this.autoEnabled;
    this.updateButtons();

    // 如果剛打開 Auto 且目前沒有在轉，立刻開始第一局
    if (this.autoEnabled && !this.spinning) {
      this.onSpin();
    }
  }

  public roundFinished(win: number, detail: WinDetail) {
    this.lastWin = win;
    this.balance += win;
    this.spinning = false;
    this.refreshUI();
    this.updateButtons();

    if (win > 0) {
      const text = detail
        ? `中獎！符號 #${detail.symbol} ×${detail.count} → +${detail.payout}`
        : `中獎！+${win}`;
      this.showWinToast(text);
    }

    // Auto 續轉：若 auto 開著且餘額足夠，延遲後自動再轉
    if (this.autoEnabled) {
      const totalBet = this.betPerLine * this.linesCount;
      if (this.balance >= totalBet) {
        this.scheduleOnce(() => {
          if (this.autoEnabled && !this.spinning) this.onSpin();
        }, this.autoDelaySec);
      } else {
        console.warn('Auto 已停止：餘額不足');
        this.autoEnabled = false;
        this.updateButtons();
      }
    }
  }

  private showWinToast(text: string) {
    if (!this.winToastNode || !this.winToastLabel) return;
    this.winToastLabel.string = text;

    const op = this.winToastNode.getComponent(UIOpacity) || this.winToastNode.addComponent(UIOpacity);
    tween(op)
      .to(0.15, { opacity: 255 })
      .delay(1.2)
      .to(0.25, { opacity: 0 })
      .start();
  }

  private refreshUI() {
    if (this.balanceLabel) this.balanceLabel.string = `餘額：${this.balance}`;
    if (this.betLabel) this.betLabel.string = `押注：${this.betPerLine * this.linesCount}`;
    if (this.winLabel) this.winLabel.string = `贏分：${this.lastWin}`;
  }

  private updateButtons() {
    // Auto 開啟時，鎖住 Spin 與 Bet 調整；Stop 在旋轉時可用
    const canSpin = !this.spinning && !this.autoEnabled;
    const canStop = this.spinning || this.autoEnabled;

    if (this.spinButton) this.spinButton.interactable = canSpin;
    if (this.stopButton) this.stopButton.interactable = canStop;

    const betLocked = this.spinning || this.autoEnabled;
    if (this.betMinus) this.betMinus.interactable = !betLocked;
    if (this.betPlus) this.betPlus.interactable = !betLocked;
    if (this.maxBet) this.maxBet.interactable = !betLocked;

    if (this.autoBtn) {
      // Auto 按鈕總是可點擊，用來切換
      this.autoBtn.interactable = true;
      // 嘗試改變按鈕文字提示
      const label = this.autoBtn.getComponentInChildren(Label);
      if (label) label.string = this.autoEnabled ? 'Auto: ON' : 'Auto';
    }
  }
}
