English | [繁體中文](./README.zh-TW.md)

# AI Feedback SDK

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

A lightweight and secure JavaScript SDK for collecting user feedback for AI services.

This SDK provides a simple, promise-based interface to handle a two-phase submission process, abstracting away the complexity of token acquisition and secure data submission. It is dependency-free and designed to be integrated into any web front-end with ease.

## Features

- **Simple API**: Just two functions, `init()` and `submit()`, to get started.
- **Secure**: Implements a two-phase commit process (token request -> data submission) to enhance security.
- **Lightweight**: No external dependencies, keeping your page load fast.
- **Modern Tooling**:
  - Built with **Webpack** for maximum compatibility and performance.
  - Code quality enforced by **ESLint**.
  - Consistent formatting ensured by **Prettier**.
- **UMD Build**: Can be used via a module bundler (`import`) or directly in the browser (`<script>` tag).

## Installation

This project is not yet published on npm. To use it, you need to build it locally first.

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Build the production-ready file: `npm run build`

The bundled file will be located at `dist/feedback-sdk.min.js`.

### In the Browser

You can include the locally built UMD bundle directly in your HTML file. See [`demo.html`](./demo.html) for a working example.

```html
<script src="./dist/feedback-sdk.min.js"></script>
```

## Usage

First, initialize the SDK. If you are using it via the `<script>` tag, it will be available on the `window.FeedbackSDK` object.

```javascript
// If using a <script> tag, FeedbackSDK is available globally.
// If you were to use this in another project with a bundler,
// you would import from the local file path.

try {
  FeedbackSDK.init({
    serviceId: 'your-unique-service-id',
    dsn: 'https://your-api-domain.com/api',
  });
} catch (error) {
  console.error('SDK Initialization Failed:', error.message);
}
```

Then, call `submit()` with the user's feedback data. It returns a `Promise` that resolves on success or rejects with a structured error.

```javascript
async function submitFeedback(feedbackData) {
  try {
    const response = await FeedbackSDK.submit(feedbackData);
    console.log('Submission successful!', response);
    // e.g., show a success message to the user
  } catch (error) {
    console.error('Submission Failed:', error);
    // e.g., show an error message based on error.code and error.message
    // error.code can be 'INVALID_DATA', 'UNAUTHORIZED', etc.
  }
}

// Example call
submitFeedback({
  feedbackRating: 'good',
  feedbackComment: 'This AI is very helpful!',
  durationSec: 15.5,
});
```

For a complete, runnable example, see the [`demo.html`](./demo.html) file.

## API Reference

### `FeedbackSDK.init(config)`

Initializes the SDK. This must be called before `submit()`.

- `config` `<Object>` (Required)
  - `serviceId` `<string>` (Required): The unique identifier for your service.
  - `dsn` `<string>` (Required): The base URL for the feedback API. The SDK will append `/token` and `/feedback` to this URL.

### `FeedbackSDK.submit(feedbackData)`

Submits the user feedback.

- `feedbackData` `<Object>` (Required): An object containing the feedback.
  - `feedbackRating` `<string>` (Required): Must be one of `"good"`, `"normal"`, or `"bad"`.
  - `feedbackComment` `<string>` (Optional): A string up to 500 characters.
  - `durationSec` `<number>` (Optional): A non-negative number representing the interaction duration in seconds.
- **Returns**: `<Promise<Object>>` A promise that resolves with the server's response body on success.

### Error Handling

When the `submit()` promise is rejected, it returns an `Error` object with the following properties:

- `message` `<string>`: A human-readable description of the error.
- `code` `<string>`: A machine-readable error code. Possible values include:
  - `INVALID_DATA`: The provided `feedbackData` failed validation.
  - `UNAUTHORIZED`: The request lacked a valid session token.
  - `SUBMISSION_CONFLICT`: The submission token has already been used.
  - `SERVER_ERROR`: A generic server-side or network error occurred.

## Development & Contribution

We welcome contributions! Please follow these steps to set up the development environment.

1.  **Fork & Clone**: Fork the repository and clone it to your local machine.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Run Development Server**:
    This command will watch for changes in the `src` directory and automatically rebuild the non-minified bundle.
    ```bash
    npm run dev
    ```
4.  **Create Production Build**:
    This command will generate the minified and obfuscated bundle in the `dist` directory.
    ```bash
    npm run build
    ```

This project uses [Prettier](https://prettier.io/) for code formatting. Please ensure your contributions adhere to the defined style.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](./LICENSE) file for details.
