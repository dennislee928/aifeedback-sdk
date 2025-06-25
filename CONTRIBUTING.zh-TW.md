# 貢獻指南 - AI Feedback SDK

首先，非常感謝您考慮為 AI Feedback SDK 做出貢獻！正是因為有像您這樣的人，開源社群才能如此美好。

## 我該從何處著手？

如果您發現了 bug 或有新功能的請求，歡迎[建立一個 issue](https://github.com/your-username/aifeedback-sdk/issues/new)！通常來說，在您開始動手寫程式碼之前，先透過 issue 確認 bug 的存在或新功能的必要性，會是最好的做法。

### Fork & 建立分支

如果您準備好開始貢獻，請先 fork 本儲存庫，然後建立一個具描述性名稱的新分支。

一個好的分支名稱範例如下（假設您正在處理 issue #123）：

```
git checkout -b 123-add-a-new-feature
```

### 讓程式碼順利運行

本專案使用特定版本的 Node.js。我們建議您使用 [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager) 來管理您的 Node 版本。

1.  執行 `nvm use`，它會自動根據 `.nvmrc` 檔案切換到正確的 Node.js 版本。
2.  `npm install`
3.  `npm run dev`

### 進行變更

開始修改程式碼。本專案使用 [Prettier](https://prettier.io/) 和 [ESLint](https://eslint.org/) 來維持程式碼的品質與風格一致性。請確保您的程式碼遵循專案的標準。

- 您可以執行 `npm run lint` 來檢查是否有語法錯誤。
- 如果您的編輯器有對應的擴充功能，程式碼會在您提交 (commit) 時自動格式化。

### 提交您的變更

請確保您的提交訊息清晰且具描述性。

### 發送 Pull Request

當您準備好提交您的貢獻時，請從您 fork 的儲存庫建立一個 Pull Request。請確保：

1.  在 PR 的描述中參照您正在處理的 issue（例如："Closes #123"）。
2.  提供您所做變更的清晰描述。
3.  確保所有檢查（如 CI 建置和語法檢查）都通過。

我們會盡快審核您的貢獻。再次感謝您的付出！
