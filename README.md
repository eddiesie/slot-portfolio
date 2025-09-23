# 🎰 Slot Portfolio (Cocos Creator 3.8.6)

本專案為一個 **Cocos Creator 3x5 拉霸機 Demo**，展示基礎的遊戲流程、無跳圖轉輪、可視化 Paytable 與簡單中獎結算。  
---

## 功能特色
- **無跳圖轉輪**：每一步先換圖再位移，停輪即顯示最終結果。
- **可視化 Paytable**：在 Inspector 調整符號權重與 3/4/5 倍率。
- **簡易結算器**：判斷中排 3/4/5 連線，計算最高獎金。
- **UI 金流控制**：Spin / Stop / Auto 模式、下注、餘額更新。
- **中獎訊息模板**：動態帶入 `{symbol}/{count}/{payout}`。

---

## 📂 檔案結構 (assets/scripts)
- `GameController.ts`：遊戲主流程，產生盤面、驅動轉輪、結算結果。
- `Reel.ts`：單輪轉動邏輯，支援 quickStop，保證無跳圖。
- `UIController.ts`：處理玩家互動、扣款派彩、UI 更新、Auto 模式。
- `PayoutEvaluator.ts`：計算中排 3/4/5 連，回傳最高獎金與中獎位置。
- `PaytableConfig.ts`：Inspector 可視化設定符號權重與倍率。
- `WinMessageConfig.ts`：產生中獎訊息字串。
- `SymbolView.ts`：符號顯示元件。
- `Paytable.ts`：舊版靜態表（現由 `PaytableConfig` 取代）。

---

## ▶️ 執行方式
1. 使用 **Cocos Creator 3.8.6** 開啟專案。  
2. 在 `GameController` 綁定 `symbolFrames` 與 `PaytableConfig`。  
3. 按下 **Preview** 測試 Spin → Stop → 派彩流程。  

---

## 🙌 備註
此專案重點在 **程式架構清楚**：  
流程（GameController）／動畫（Reel）／結算（PayoutEvaluator）／數值設定（PaytableConfig）／UI（UIController） 模組分離，方便日後擴充與測試。
