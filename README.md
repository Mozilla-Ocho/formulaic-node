# Formulaic API Client

This is a Node/JavaScript library for interacting with the Formulaic API. It provides a simple way to send requests like inference (i.e., prompting a large language model), retrieving prompts from a formula, and more to make using generative AI easy in your project.

## Getting Started

1. **Create a Formulaic Account:** Sign up for a free Formulaic account at [https://formulaic.app](https://formulaic.app).
2. **Generate an API Key:** Go to your profile page at [https://formulaic.app/profile#api-key](https://formulaic.app/profile#api-key) and create a new API key. You'll need this key to authenticate with the Formulaic API.

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
const formulaic = new Formulaic("YOUR_API_KEY", {
  baseURL: "https://formulaic.app", // Optional: Override the base URL if needed
  debug: true, // Enable debug mode for logging requests and responses
});

// Get a list of available models
formulaic.getModels().then((models) => {
  console.log("Available models:", models);
});

// Get information about a specific formula
const formulaId = "YOUR_FORMULA_ID"; // Replace with your formula ID
formulaic.getFormula(formulaId).then((formula) => {
  console.log("Formula details:", formula);
});

// Send a completion request
// Optionally pass in a specific model id and variables object
const completionData = {
  models: ["YOUR_MODEL_ID"], // Replace with your model ID(s)
  variables: [
    {
      name: "variable1",
      value: "Example value 1",
      type: "text",
    },
    {
      name: "variable2",
      value: "Example value 2",
      type: "text",
    },
  ],
};

formulaic.createCompletion(formulaId, completionData).then((completion) => {
  console.log("Completion result:", completion);
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

- **`getFormula(formulaId)`**

  - Retrieves information about a specific formula, using a local cache for repeated requests.
  - **Parameters:**
    - `formulaId` (`string`): The ID of the formula to retrieve.
  - **Returns:** `Promise<object>` - The formula data as returned by the API.

- **`createCompletion(formulaId, data)`**
  - Sends a completion request to the Formulaic API.
  - **Parameters:**
    - `formulaId` (`string`): The ID of the formula to use for the completion.
    - `data` (`object`): The data to send to the API, including models and variables (optional).
      - `models` (`string[]`): An array of model IDs to use for the completion (optional).
      - `variables` (`object[]`): An array of variable objects to pass to the formula (optional).
  - **Returns:** `Promise<object>` - The completion response as returned by the API.
