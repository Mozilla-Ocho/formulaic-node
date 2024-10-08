# Formulaic API Client

This is a Node/JavaScript library for interacting with the [Formulaic API](https://formulaic.app). It simplifies interacting with large language models (LLM), retrieving formula data, and uploading files to enhance LLM results, supporting features like instant RAG (retrieval-augmented generation).

## Getting Started

1. **Create a Formulaic Account:** Sign up for a free Formulaic account at [https://formulaic.app](https://formulaic.app).
2. **Generate an API Key:** Visit your profile page at [https://formulaic.app/profile#api-key](https://formulaic.app/profile#api-key) to create a new API key. You will use this key to authenticate with the Formulaic API.
3. Create a "Formula" either on the platform, or using this library!

## Installation

Using NPM:

```bash
npm i formulaic-node
```

Using Yarn:

```bash
yarn add formulaic-node
```

## Usage

```javascript
const { Formulaic } = require("formulaic-node"); // Import the library

// Create a new Formulaic instance
const formulaic = new Formulaic("YOUR_API_KEY");

// Example 1: Get a list of available models
formulaic.getModels().then((models) => {
  console.log("Available models:", models);
  // use up to 3 models in the same request to get multiple model responses at once.
  // use the model id to specifically use that model
});

// Example 2: Get information about a specific formula
const formulaId = "YOUR_FORMULA_ID"; // Replace with your formula ID
formulaic.getFormula(formulaId).then((formula) => {
  console.log("Formula details:", formula);
});

// Example 3: Send a completion request with optional model and variable data
const completionData = {
  models: ["YOUR_MODEL_ID"], // Replace with your model ID(s)
  variables: [
    { name: "variable1", value: "Example value 1" },
    { name: "variable2", value: "Example value 2" },
  ],
};

formulaic.createCompletion(formulaId, completionData).then((completion) => {
  console.log("Completion result:", completion);
});

//Continue a formula response by "chatting"

// Example 4: Create a chat completion by sending chat messages
const messages = [
  { role: "system", cotent: "You are a friendly, helpful assistant" },
  { role: "assistant", content: "Welcome to Formulaic! Ask me anything." },
  { role: "user", content: "hello" },
];

formulaic.createChatCompletion(formulaId, messages).then((chatResponse) => {
  console.log("Chat response:", chatResponse);
});
```

## API Reference

### Class: `Formulaic`

#### Constructor

```javascript
new Formulaic(apiKey, [options]);
```

| Parameter            | Type      | Description                                       | Default                 |
| -------------------- | --------- | ------------------------------------------------- | ----------------------- |
| `apiKey`             | `string`  | The API key for your Formulaic account.           |                         |
| `options`            | `object`  | Optional configuration options.                   |                         |
| `options.baseURL`    | `string`  | The base URL for the Formulaic API.               | `https://formulaic.app` |
| `options.debug`      | `boolean` | Enable debug logging.                             | `false`                 |
| `options.httpClient` | `object`  | Custom HTTP client (useful for mocking in tests). | `new HttpClient()`      |

#### Methods

- **`getModels()`**

  - Retrieves a list of available models.
  - **Returns:** `Promise<object[]>` - An array of model objects as returned by the API.
  - **Example:**

    ```javascript
    formulaic.getModels().then((models) => {
      console.log(models);
    });
    ```

- **`getFormula(formulaId)`**

  - Retrieves information about a specific formula, with caching for repeated requests.
  - **Parameters:**
    - `formulaId` (`string`): The ID of the formula to retrieve.
  - **Returns:** `Promise<object>` - The formula data as returned by the API.
  - **Example:**

    ```javascript
    formulaic.getFormula("formula-id").then((formula) => {
      console.log(formula);
    });
    ```

- **`createCompletion(formulaId, data)`**

  - Sends a completion request to the Formulaic API.
  - **Parameters:**
    - `formulaId` (`string`): The ID of the formula to use for the completion.
    - `data` (`object`): The data to send to the API, including models and variables (optional).
      - `models` (`string[]`): An array of model IDs to use for the completion (optional).
      - `variables` (`object[]`): An array of variable objects to pass to the formula (optional).
  - **Returns:** `Promise<object>` - The completion response as returned by the API.
  - **Example:**

    ```javascript
    const data = {
      models: ["model-id"],
      variables: [{ name: "var1", value: "value1", type: "text" }],
    };

    formulaic.createCompletion("formula-id", data).then((response) => {
      console.log(response);
    });
    ```

- **`createChatCompletion(formulaId, messages)`**

  - Sends a chat message and retrieves a chat response.
  - **Parameters:**
    - `formulaId` (`string`): The ID of the formula associated with the chat.
    - `messages` (`object[]`): An array of message objects, each with `role` and `content`.
  - **Returns:** `Promise<object>` - The chat completion response as returned by the API.
  - **Example:**

    ```javascript
    const messages = [
      { role: "assistant", content: "Welcome to Formulaic!" },
      { role: "user", content: "Hello" },
    ];

    formulaic
      .createChatCompletion("formula-id", messages)
      .then((chatResponse) => {
        console.log(chatResponse);
      });
    ```

- **`uploadFile(formulaId, file, fileName)`**

  - Uploads a file to the Formulaic API for use in the formula.
  - **Parameters:**
    - `formulaId` (`string`): The ID of the formula.
    - `file` (`Buffer|string`): The file to upload, either as a Buffer or file path.
    - `fileName` (`string`): The name of the file being uploaded.
  - **Returns:** `Promise<object>` - The response from the API confirming the file upload.
  - **Example:**

    ```javascript
    const fs = require("fs");
    const fileBuffer = fs.readFileSync("path/to/your/file");

    formulaic
      .uploadFile("formula-id", fileBuffer, "example.txt")
      .then((response) => {
        console.log(response);
      });
    ```

#### Error Handling

All methods throw errors when requests fail. It is recommended to use `try...catch` for better error handling:

```javascript
try {
  const models = await formulaic.getModels();
  console.log(models);
} catch (error) {
  console.error("Error fetching models:", error.message);
}
```
