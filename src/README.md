# Formulaic API Client

This is a Node/JavaScript library for interacting with the Formulaic API. It provides a simple way to send requests like inference (i.e. promping a large language model), getting prompts from a formula and more to make using generative AI a breeze in your project.

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
const { Formulaic } = require("@your-username/formulaic-api-client");

// Create a new Formulaic instance
const formulaic = new Formulaic("YOUR_API_KEY", "https://formulaic.app", {
  debug: true, // Enable debug logging
  cache_ttl: 600000, // Cache time-to-live (TTL) in milliseconds (default: 10 minutes)
});

// Get a list of available models
formulaic.getModels().then((models) => {
  console.log(models);
});

// Get information about a specific formula
formulaic.getFormula("f7df2832-c1bd-4e72-b2fe-22bc68abcc26").then((formula) => {
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
  .createCompletion("f7df2832-c1bd-4e72-b2fe-22bc68abcc26", completionData)
  .then((completion) => {
    console.log(completion);
  });
```

## API Reference

### Class: Formulaic

#### Constructor

```javascript
new Formulaic(apiKey, apiUrl, [options]);
```

| Parameter           | Type      | Description                                                                               |
| ------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `apiKey`            | `string`  | The API key for your Formulaic account.                                                   |
| `apiUrl`            | `string`  | The base URL for the Formulaic API. Defaults to `https://formulaic.app`.                  |
| `options`           | `object`  | Optional configuration options.                                                           |
| `options.debug`     | `boolean` | Enable debug logging. Defaults to `false`.                                                |
| `options.cache_ttl` | `number`  | Cache time-to-live (TTL) in milliseconds for formulas. Defaults to `600000` (10 minutes). |

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
