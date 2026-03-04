# 24/7 自動化開發系統 - 設定指南

## ✅ 現有 Cron 工作

| 名稱 | 排程 | 用途 |
|------|------|------|
| daily-update | 每日 5:00 | 系統更新 |
| daily-skill-scan | 每日 6:00 | 技能掃描 |

---

## 🎯 新增自動化工作

### 1. 每小時專案進度檢查
```bash
openclaw cron add "project-check" \
  --cron "0 * * *" \
  --message "檢查所有執行中的專案進度，如果有進展或問題，回報狀態" \
  --announce \
  --timeout-seconds 300
```

### 2. 每日專案摘要 (早上 9 點)
```bash
openclaw cron add "daily-summary" \
  --cron "0 9 * * *" \
  --message "生成昨日專案摘要，包含完成的工作、待解決問題、本日重點" \
  --announce \
  --timeout-seconds 600
```

### 3. 每週專案回顧 (週一 9 點)
```bash
openclaw cron add "weekly-review" \
  --cron "0 9 * * 1" \
  --message "執行每週專案回顧：回顧上週進度、規劃本週目標、優化工作流程" \
  --announce \
  --timeout-seconds 1800
```

---

## 🤖 使用方式

### 啟動自動化專案
```
你 (Telegram)：
「幫我建立一個自動化流程，自動每週生成銷售報告」

Main Agent：
1. 拆解任務
2. 設定 cron job
3. 測試流程
4. 回報完成
```

### 查看專案狀態
```
問：「目前有哪些自動化工作在執行？」
```

---

## 📊 監控儀表板

### 即時狀態
- 每 30 分鐘 Heartbeat 檢查
- 任務進度即時回報
- 錯誤即時通知

### 通知設定
```
| 觸發條件     | 通知方式   |
|--------------|------------|
| 任務完成     | Telegram   |
| 遇到錯誤     | Telegram   |
| 每日摘要     | Telegram   |
| 每週回顧     | Telegram   |
```

---

## 🔧 維護任務

| 任務 | 頻率 | 內容 |
|------|------|------|
| 記憶體備份 | 每日 | 自動儲存進度到 memory/ |
| API 檢查 | 每週 | 檢查配額使用量 |
| 效能優化 | 每月 | 調整 timeout |
| 設定健檢 | 每季 | 審查安全性 |

---

## ⚡ 快速開始

1. **設定每日自動化**
```bash
openclaw cron add "daily-standup" \
  --cron "0 9 * * *" \
  --message "檢查專案狀態並回報" \
  --announce
```

2. **啟動專案開發**
```
告訴我你的需求，我會自動拆解並執行
```

3. **監控進度**
```
問：「專案進度如何？」
```
