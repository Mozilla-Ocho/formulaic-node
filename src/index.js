const FORMULAIC_API_URL = "https://formulaic.app";

class HttpClient {
  async get(url, headers) {
    const response = await fetch(url, {
      method: "GET",
      headers,
    });
    return response;
  }

  async post(url, data, headers) {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return response;
  }
}

/**
 * A class for interacting with the Formulaic API.
 */
class Formulaic {
  /**
   * Creates a new Formulaic instance.
   *
   * @param {string} apiKey - The API key for your Formulaic account.
   * @param {string} apiUrl - The base URL for the Formulaic API.
   * @param {object} [options] - Optional configuration options.
   * @param {boolean} [options.debug=false] - Enable debug logging.
   */
  constructor(apiKey, apiUrl, options = {}) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl || FORMULAIC_API_URL;
    this.headers = {
      Authorization: "Bearer " + this.apiKey,
      Accept: "*/*",
      "Content-Type": "application/json",
    };
    this.httpClient = new HttpClient(); // Use HttpClient by default
    this.debug = options.debug || false; // Default to false if not provided
  }

  /**
   * Retrieves a list of available models.
   *
   * @returns {Promise<object[]>} - A Promise that resolves with an array of model objects as returned by the API.
   */
  async getModels() {
    try {
      const url = `${this.apiUrl}/api/models`;

      if (this.debug) {
        console.log("Formulaic: Sending request to:", url);
        console.log("Formulaic: Headers:", this.headers);
      }

      const response = await this.httpClient.get(url, this.headers);

      if (this.debug) {
        console.log("Formulaic: Response status:", response.status);
        console.log("Formulaic: Response text:", response.statusText);
      }

      if (response.status !== 200) {
        throw new Error(
          `Failed to get models: ${response.status} - ${response.statusText}`
        );
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves information about a specific formula.
   *
   * @param {string} formulaId - The ID of the formula to retrieve.
   * @returns {Promise<object>} - A Promise that resolves with the formula data as returned by the API.
   */
  async getFormula(formulaId) {
    try {
      if (!formulaId) {
        throw new Error("Formula ID is required");
      }
      const url = `${this.apiUrl}/api/recipes/${formulaId}/scripts`;

      if (this.debug) {
        console.log("Formulaic: Sending request to:", url);
        console.log("Formulaic: Headers:", this.headers);
      }

      const response = await this.httpClient.get(url, this.headers);

      if (this.debug) {
        console.log("Formulaic: Response status:", response.status);
        console.log("Formulaic: Response text:", response.statusText);
      }

      if (response.status !== 200) {
        throw new Error(
          `Failed to get formula: ${response.status} - ${response.statusText}`
        );
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sends a completion request to the Formulaic API.
   *
   * @param {string} formulaId - The ID of the formula to use for the completion.
   * @param {object} data - The data to send to the API.
   * @param {string[]} data.models - An array of model IDs to use for the completion.
   * @returns {Promise<object>} - A Promise that resolves with the completion response as returned by the API.
   */
  async createCompletion(formulaId, data) {
    // Validate data
    if (!data.models || typeof data.models !== "object") {
      throw new Error("Data must include a 'models' array.");
    }
    if (data.models.length === 0) {
      throw new Error(
        "Data must include at least one model in the 'models' array."
      );
    }

    try {
      if (this.debug) {
        console.log("Formulaic: Sending request with data:", data);
      }

      const formula = await this.getFormula(formulaId);
      const scriptId = formula.id;

      const formulaUrl = `/api/recipes/${formulaId}/scripts/${scriptId}/artifacts`; // Construct the URL for sending a completion request
      const url = this.apiUrl + formulaUrl;

      if (this.debug) {
        console.log("Formulaic: Sending request to:", url);
        console.log("Formulaic: Headers:", this.headers);
      }

      const response = await this.httpClient.post(url, data, this.headers);

      if (this.debug) {
        console.log("Formulaic: Response status:", response.status);
        console.log("Formulaic: Response text:", response.statusText);
      }

      if (response.status !== 200) {
        throw new Error(
          `Failed to get response from LLM: ${response.status} - ${response.statusText}`
        );
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to create completion: ${error.message}`);
    }
  }
}

module.exports = { Formulaic };
