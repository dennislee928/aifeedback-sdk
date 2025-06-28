[English](./README.en-US.md)

# AI Feedback SDK

[![授權](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

一個輕量、安全，專為 AI 服務收集使用者回饋的 JavaScript SDK。

此 SDK 提供一個簡潔、基於 Promise 的介面，用以處理複雜的兩階段提交流程，將取得權杖 (token) 與安全提交資料的複雜性完全抽象化。它不依賴任何外部函式庫，並能輕易地整合到任何網頁前端。

## 主要特色

- **簡潔的 API**: 只需 `init()` 和 `submit()` 兩個函式即可開始。
- **安全性**: 實作了兩階段提交流程（權杖請求 -> 資料提交），以增強安全性。
- **輕量化**: 無任何外部依賴，讓您的頁面載入速度更快。
- **現代化工具鏈**:
  - 使用 **Webpack** 建構，以達到最佳的相容性與效能。
  - 透過 **ESLint** 確保程式碼品質。
  - 藉由 **Prettier** 維持風格一致性。
- **UMD 建置**: 可透過模組打包工具 (`import`) 使用，也能直接在瀏覽器中以 `<script>` 標籤載入。

## 安裝方式

本專案尚未發佈至 npm。若要使用，您需要先在本地端進行建構。

1.  複製 (Clone) 此儲存庫。
2.  安裝依賴：`npm install`
3.  建構生產環境版本：`npm run build`

打包後的檔案將會儲存在 `dist/feedback-sdk.min.js`。

### 在瀏覽器中使用

您可以直接在您的 HTML 檔案中引入本地建構好的 UMD 包。一個可執行的完整範例請參考 [`demo.html`](./demo.html) 檔案。

```html
<script src="./dist/feedback-sdk.min.js"></script>
```

## 使用方法

首先，使用您的 `serviceId` 和 `dsn` (API 的基礎 URL) 來初始化 SDK。

```javascript
// 若您是使用 <script> 標籤，SDK 會被掛載在 window.FeedbackSDK 上。
// 若您是在其他專案中使用打包工具，則會從本地檔案路徑匯入。

try {
  FeedbackSDK.init({
    serviceId: 'your-unique-service-id', // 您的服務 ID
    dsn: 'https://your-api-domain.com/api', // 您的 API 基礎路徑
  });
} catch (error) {
  console.error('SDK 初始化失敗:', error.message);
}
```

接著，使用者的回饋資料呼叫 `submit()`。它會回傳一個 `Promise`，成功時會 resolve，失敗時則會 reject 一個結構化的錯誤物件。

```javascript
async function submitFeedback(feedbackData) {
  try {
    const response = await FeedbackSDK.submit(feedbackData);
    console.log('提交成功!', response);
    // 例如：向使用者顯示成功訊息
  } catch (error) {
    console.error('提交失敗:', error);
    // 例如：根據 error.code 和 error.message 顯示錯誤訊息
    // error.code 的可能值包含 'INVALID_DATA', 'UNAUTHORIZED' 等
  }
}

// 範例呼叫
submitFeedback({
  feedbackRating: 'good',
  feedbackComment: '這個 AI 非常有幫助！',
  durationSec: 15.5,
});
```

一個可執行的完整範例，請參考 [`demo.html`](./demo.html) 檔案。

## API 參考文件

### `FeedbackSDK.init(config)`

初始化 SDK。此函式必須在 `submit()` 之前被呼叫。

- `config` `<Object>` (必填)
  - `serviceId` `<string>` (必填): 您的服務的唯一識別碼。
  - `dsn` `<string>` (必填): 回饋 API 的基礎 URL。SDK 會自動在此 URL 後面附加 `/token` 和 `/feedback`。

### `FeedbackSDK.submit(feedbackData)`

提交使用者回饋。

- `feedbackData` `<Object>` (必填): 包含回饋內容的物件。
  - `feedbackRating` `<string>` (必填): 其值必須是 `"good"`, `"normal"`, 或 `"bad"` 其中之一。
  - `feedbackComment` `<string>` (選填): 長度上限為 500 字元的字串。
  - `durationSec` `<number>` (選填): 一個非負數，代表互動的秒數。
- **回傳值**: `<Promise<Object>>` 一個 promise，成功時會 resolve 伺服器回傳的物件。

## 錯誤處理

當 `submit()` 的 promise 被 reject 時，它會回傳一個包含以下屬性的 `Error` 物件：

- `message` `<string>`: 人類可讀的錯誤描述。
- `code` `<string>`: 機器可讀的錯誤代碼。可能的值包含：
  - `INVALID_DATA`: 提供的 `feedbackData` 未通過驗證。
  - `UNAUTHORIZED`: 請求中缺乏有效的 session token。
  - `SUBMISSION_CONFLICT`: 該次提交使用的 token 已被用過。
  - `SERVER_ERROR`: 發生了通用的伺服器端或網路錯誤。

## 開發與貢獻

我們歡迎任何形式的貢獻！請遵循以下步驟來設定開發環境。

1.  **Fork & Clone**: 先 Fork 此儲存庫，然後再 Clone 到您的本地機器。
2.  **安裝依賴**:
    ```bash
    npm install
    ```
3.  **執行開發模式**:
    此指令會監聽 `src` 目錄中的檔案變動，並自動重新建構未壓縮的版本。
    ```bash
    npm run dev
    ```
4.  **建立生產環境版本**:
    此指令會在 `dist` 目錄中生成壓縮且混淆過的版本。
    ```bash
    npm run build
    ```

本專案使用 [Prettier](https://prettier.io/) 來統一程式碼風格，請確保您的貢獻遵循此規範。

## 貢獻

歡迎所有的貢獻！更多資訊請參閱 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 授權條款

本專案採用 Apache 2.0 授權。詳細資訊請參閱 [LICENSE](./LICENSE) 檔案。
