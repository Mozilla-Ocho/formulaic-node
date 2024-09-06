const FORMULAIC_BASE_URL = "https://formulaic.app";
const FORMULA_CACHE_TTL = 600000; // 10 minutes in milliseconds

class HttpClient {
  async request(url, method = "GET", data = null, headers = {}) {
    const options = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status} - ${response.statusText}`
      );
    }

    return response.json(); // Assuming the response is always JSON
  }

  get(url, headers) {
    return this.request(url, "GET", null, headers);
  }

  post(url, data, headers) {
    return this.request(url, "POST", data, headers);
  }
}

class Formulaic {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseURL = options.baseURL || FORMULAIC_BASE_URL;
    this.headers = {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/json", // Changed to application/json for more specific Accept header
      "Content-Type": "application/json",
    };
    this.httpClient = options.httpClient || new HttpClient();
    this.debug = options.debug || false;
    this.formulaCache = {};
  }

  logDebug(...messages) {
    if (this.debug) {
      console.log("Formulaic:", ...messages);
    }
  }

  async getModels() {
    const url = `${this.baseURL}/api/models`;

    this.logDebug("Sending request to:", url);

    try {
      const models = await this.httpClient.get(url, this.headers);
      this.logDebug("Received models:", models);
      return models;
    } catch (error) {
      throw new Error(`Failed to get models: ${error.message}`);
    }
  }

  async getFormula(formulaId) {
    if (!formulaId) {
      throw new Error("Formula ID is required");
    }

    // Check the cache
    const cachedFormula = this.formulaCache[formulaId];
    if (
      cachedFormula &&
      Date.now() - cachedFormula.timestamp < FORMULA_CACHE_TTL
    ) {
      this.logDebug("Returning formula from cache:", formulaId);
      return cachedFormula.data;
    }

    const url = `${this.baseURL}/api/recipes/${formulaId}/scripts`;

    this.logDebug("Sending request to:", url);

    try {
      const formulaData = await this.httpClient.get(url, this.headers);
      this.formulaCache[formulaId] = {
        timestamp: Date.now(),
        data: formulaData,
      };
      this.logDebug("Updating formula cache:", formulaId);
      return formulaData;
    } catch (error) {
      throw new Error(`Failed to get formula: ${error.message}`);
    }
  }

  async createCompletion(formulaId, data) {
    if (!Array.isArray(data.models) || data.models.length === 0) {
      throw new Error(
        "Data must include a 'models' array with at least one model."
      );
    }

    this.logDebug("Sending request with data:", data);

    try {
      const formula = await this.getFormula(formulaId);
      const scriptId = formula.id;
      const url = `${this.baseURL}/api/recipes/${formulaId}/scripts/${scriptId}/artifacts`;

      this.logDebug("Sending request to:", url);

      const completionResponse = await this.httpClient.post(
        url,
        data,
        this.headers
      );
      this.logDebug("Received completion response:", completionResponse);
      return completionResponse;
    } catch (error) {
      throw new Error(`Failed to create completion: ${error.message}`);
    }
  }
}

module.exports = { Formulaic };
