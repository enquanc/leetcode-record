**[中文](#leetcode-刷題紀錄) | [English](#leetcode-practice-tracker)**

# LeetCode 刷題紀錄

一個簡單的本地網頁工具,用來記錄自己在 LeetCode 上的刷題紀錄,包含題目名稱、難度、標籤、日期、狀態與花費時間,並支援搜尋、篩選、排序。

## 功能

- 新增 / 編輯 / 刪除刷題紀錄
- 記錄欄位:題目名稱、難度(Easy/Medium/Hard)、標籤、日期、狀態(AC 通過 / 未通過 / 複習中)、花費時間(分鐘)
- 依題目名稱或標籤搜尋
- 依難度、狀態篩選
- 點欄位標題排序
- 統計總題數、已通過數、各難度題數
- 依難度計分並加總已通過題目的總分(Easy 1 分、Medium 3 分、Hard 5 分)
- 資料儲存在本機的 `data/records.json`,不需要額外資料庫

## 安裝

1. 安裝 [Node.js](https://nodejs.org)(建議 LTS 版本)
2. 在專案資料夾安裝依賴:

   ```bash
   npm install
   ```

## 使用方式

1. 複製專案:

   ```bash
   git clone https://github.com/enquanc/leetcode-record.git
   cd leetcode-record
   ```

2. 啟動伺服器:

   ```bash
   npm start
   ```

   若在 PowerShell 執行 `npm start` 時出現「因為這個系統上已停用指令碼執行」的錯誤,可改用以下方式啟動,不受此限制影響:

   ```bash
   node server.js
   ```

接著在瀏覽器開啟 [http://localhost:3000](http://localhost:3000) 即可開始記錄刷題狀況。

伺服器預設監聽 port 3000,資料會自動儲存在 `data/records.json`,關閉伺服器不會遺失資料。

## 專案結構

```
.
├── server.js          # Express 後端與 API
├── data/
│   └── records.json   # 刷題紀錄資料(執行時自動建立)
└── public/
    ├── index.html      # 前端頁面
    ├── style.css       # 樣式
    └── app.js          # 前端邏輯(表單、篩選、排序、API 呼叫)
```

## API

| 方法   | 路徑                | 說明             |
|--------|---------------------|------------------|
| GET    | `/api/records`      | 取得所有紀錄     |
| POST   | `/api/records`      | 新增一筆紀錄     |
| PUT    | `/api/records/:id`  | 更新指定紀錄     |
| DELETE | `/api/records/:id`  | 刪除指定紀錄     |

---

# LeetCode Practice Tracker

A simple local web tool for tracking your LeetCode practice history, including problem title, difficulty, tags, date, status, and time spent — with search, filtering, and sorting support.

## Features

- Add / edit / delete practice records
- Record fields: problem title, difficulty (Easy/Medium/Hard), tags, date, status (AC / Failed / Reviewing), time spent (minutes)
- Search by problem title or tags
- Filter by difficulty and status
- Sort by clicking column headers
- Stats for total problems solved, AC count, and count per difficulty
- Score AC'd problems by difficulty and show the total (Easy = 1 pt, Medium = 3 pts, Hard = 5 pts)
- Data is stored locally in `data/records.json` — no external database needed

## Installation

1. Install [Node.js](https://nodejs.org) (LTS version recommended)
2. Install dependencies in the project folder:

   ```bash
   npm install
   ```

## Usage

1. Clone the repository:

   ```bash
   git clone https://github.com/enquanc/leetcode-record.git
   cd leetcode-record
   ```

2. Start the server:

   ```bash
   npm start
   ```

   If PowerShell blocks `npm start` with a "running scripts is disabled on this system" error, run this instead — it bypasses the restriction:

   ```bash
   node server.js
   ```

Then open [http://localhost:3000](http://localhost:3000) in your browser to start tracking your practice.

The server listens on port 3000 by default. Data is automatically saved to `data/records.json`, so it persists across restarts.

## Project Structure

```
.
├── server.js          # Express backend and API
├── data/
│   └── records.json   # Practice records data (auto-created at runtime)
└── public/
    ├── index.html      # Frontend page
    ├── style.css       # Styles
    └── app.js          # Frontend logic (form, filtering, sorting, API calls)
```

## API

| Method | Path                | Description         |
|--------|---------------------|----------------------|
| GET    | `/api/records`      | Get all records      |
| POST   | `/api/records`      | Create a new record  |
| PUT    | `/api/records/:id`  | Update a record      |
| DELETE | `/api/records/:id`  | Delete a record      |
