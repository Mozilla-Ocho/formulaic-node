# Formulaic API Client

This is a Node/JavaScript library for interacting with the Formulaic API. It provides a simple way to send requests like inference (i.e. prompting a large language model), getting prompts from a formula and more to make using generative AI a breeze in your project.

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
const { Formulaic } = require("formulaic-node"); // Corrected require statement
const FORMULAIC_API_URL = "https://formulaic.app"; // API URL as a variable

// Create a new Formulaic instance
const formulaic = new Formulaic("YOUR_API_KEY", {
  baseURL: FORMULAIC_API_URL, // Use a different API URL
  debug: true,
});

// Get a list of available models
formulaic.getModels().then((models) => {
  console.log(models);
});

// Get information about a specific formula
const formulaId = "f7df2832-c1bd-4e72-b2fe-22bc68abcc26"; // Replace with your formula ID
formulaic.getFormula(formulaId).then((formula) => {
  console.log(formula);
});

// Send a completion request
const completionData = {
  models: ["gemini-1.5-flash-001"],
  variables: [
    {
      name: "domains",
      value: ["agriculture_food", "automotive_transport", "finance"],
      type: "text",
    },
    {
      name: "sentence",
      value: "This is a test sentence.",
      type: "text",
    },
  ],
};
formulaic
  .createCompletion(formulaId, completionData) // Replace with your formula ID
  .then((completion) => {
    console.log(completion);
  });
```

## API Reference

### Class: Formulaic

#### Constructor

```javascript
new Formulaic(apiKey, [options]);
```

| Parameter           | Type      | Description                                            | Default                 |
| ------------------- | --------- | ------------------------------------------------------ | ----------------------- |
| `apiKey`            | `string`  | The API key for your Formulaic account.                |                         |
| `options`           | `object`  | Optional configuration options.                        |                         |
| `options.baseURL`   | `string`  | The base URL for the Formulaic API.                    | `https://formulaic.app` |
| `options.debug`     | `boolean` | Enable debug logging.                                  | `false`                 |
| `options.cache_ttl` | `number`  | Cache time-to-live (TTL) in milliseconds for formulas. | `600000` (10 minutes)   |

#### Methods

- **`getModels()`**
  - Retrieves a list of available models.
  - Returns: `Promise<object[]>` - An array of model objects as returned by the API.
- **`getFormula(formulaId)`**
  - Retrieves information about a specific formula, using a local cache.
  - Returns: `Promise<object>` - The formula data as returned by the API.
- **`createCompletion(formulaId, data)`**
  - Sends a completion request to the Formulaic API.
  - Returns: `Promise<object>` - The completion response as returned by the API.
