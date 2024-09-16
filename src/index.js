const FORMULAIC_BASE_URL = "https://formulaic.app";
const FORMULA_CACHE_TTL = 600000; // 10 minutes in milliseconds
const fs = require("fs");
const { Blob } = require("buffer");
class HttpClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.headers = {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/json",
    };
  }

  async request(url, method = "GET", data = null, customHeaders = {}) {
    const options = {
      method,
      headers: { ...this.headers, ...customHeaders },
      body: data && !(data instanceof FormData) ? JSON.stringify(data) : data,
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status} - ${response.statusText}`
      );
    }

    return response.json();
  }

  get(url, headers = {}) {
    return this.request(url, "GET", null, headers);
  }

  post(url, data, headers = {}) {
    return this.request(url, "POST", data, headers);
  }

  patch(url, data, headers = {}) {
    return this.request(url, "PATCH", data, headers);
  }

  delete(url, headers = {}) {
    return this.request(url, "DELETE", null, headers);
  }
}

class FormulaicCache {
  constructor(ttl = FORMULA_CACHE_TTL) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }
    this.cache.delete(key); // Remove expired cache
    return null;
  }

  set(key, value) {
    this.cache.set(key, { data: value, timestamp: Date.now() });
  }

  clear() {
    this.cache.clear();
  }
}

class Formulaic {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseURL = options.baseURL || FORMULAIC_BASE_URL;
    this.httpClient = options.httpClient || new HttpClient(apiKey);
    this.debug = options.debug || false;
    this.formulaCache = new FormulaicCache();
  }

  logDebug(...messages) {
    if (this.debug) {
      console.log("Formulaic Debug:", ...messages);
    }
  }

  async getModels() {
    const url = `${this.baseURL}/api/models`;
    this.logDebug("Fetching models from:", url);

    try {
      return await this.httpClient.get(url);
    } catch (error) {
      throw new Error(`Failed to get models: ${error.message}`);
    }
  }

  async getFormula(formulaId) {
    if (!formulaId) throw new Error("Formula ID is required");

    const cachedFormula = this.formulaCache.get(formulaId);
    if (cachedFormula) {
      this.logDebug("Returning formula from cache:", formulaId);
      return cachedFormula;
    }

    const url = `${this.baseURL}/api/recipes/${formulaId}`;
    this.logDebug("Fetching formula from:", url);

    try {
      const formulaData = await this.httpClient.get(url);
      this.formulaCache.set(formulaId, formulaData);
      return formulaData;
    } catch (error) {
      throw new Error(`Failed to get formula: ${error.message}`);
    }
  }

  async createFormula(data) {
    const url = `${this.baseURL}/api/recipes`;

    this.logDebug("Creating new formula:", url);

    try {
      return await this.httpClient.post(url, data);
    } catch (error) {
      throw new Error(`Failed to create formula: ${error.message}`);
    }
  }

  async createCompletion(formulaId, data = {}) {
    const models = Array.isArray(data.models) ? data.models : [];
    const variables = Array.isArray(data.variables) ? data.variables : [];

    if (!models.length) throw new Error("At least one model is required.");
    if (!variables.length)
      throw new Error("At least one variable is required.");

    try {
      const formula = await this.getFormula(formulaId);
      const url = `${this.baseURL}/api/recipes/${formulaId}/scripts/${formula.id}/artifacts`;
      this.logDebug("Creating completion for formula:", formulaId);

      return await this.httpClient.post(url, { ...data, models, variables });
    } catch (error) {
      throw new Error(`Failed to create completion: ${error.message}`);
    }
  }

  async uploadFile(formulaId, file, fileName) {
    const url = `${this.baseURL}/api/recipes/${formulaId}/files`;
    const formData = new FormData();

    if (Buffer.isBuffer(file)) {
      // Convert Buffer to Blob for native FormData compatibility
      const blob = new Blob([file]);
      formData.append("file", blob, fileName);
    } else if (typeof file === "string") {
      // If it's a file path (Node.js), read it from the filesystem as a stream
      const fileStream = fs.createReadStream(file);
      formData.append("file", fileStream, fileName);
    } else {
      throw new Error("Invalid file type, must be Buffer or file path");
    }

    this.logDebug("Uploading file to:", url, "with file name:", fileName);

    try {
      const headers = formData.getHeaders(); // Get headers for form-data
      const response = await this.httpClient.post(url, formData, headers);
      this.logDebug("File upload response:", response);
      return response;
    } catch (error) {
      console.log(error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async getFiles(formulaId) {
    const url = `${this.baseURL}/api/recipes/${formulaId}/files`;
    this.logDebug("Fetching files for formula:", formulaId);

    try {
      const response = await this.httpClient.get(url);
      this.logDebug("Fetched files:", response);
      return response;
    } catch (error) {
      throw new Error(`Failed to get files: ${error.message}`);
    }
  }

  async getFile(formulaId, fileId) {
    const url = `${this.baseURL}/api/recipes/${formulaId}/files/${fileId}`;
    this.logDebug("Fetching file:", fileId, "for formula:", formulaId);

    try {
      const response = await this.httpClient.get(url);
      this.logDebug("Fetched file:", response);
      return response;
    } catch (error) {
      throw new Error(`Failed to get file: ${error.message}`);
    }
  }

  async updateFile(formulaId, fileId, data) {
    const url = `${this.baseURL}/api/recipes/${formulaId}/files/${fileId}`;
    this.logDebug("Updating file:", fileId, "for formula:", formulaId);

    try {
      const response = await this.httpClient.patch(url, data);
      this.logDebug("File update response:", response);
      return response;
    } catch (error) {
      throw new Error(`Failed to update file: ${error.message}`);
    }
  }

  async deleteFile(formulaId, fileId) {
    const url = `${this.baseURL}/api/recipes/${formulaId}/files/${fileId}`;
    this.logDebug("Deleting file:", fileId, "from formula:", formulaId);

    try {
      const response = await this.httpClient.delete(url);
      this.logDebug("File deletion response:", response);
      return response;
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}

module.exports = { Formulaic };
