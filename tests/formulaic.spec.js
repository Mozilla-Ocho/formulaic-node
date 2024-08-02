const { Formulaic } = require("../src");

const TEST_FORMULAIC_API_URL = "http://localhost:3000";

const TEST_API_KEY = "YOUR_TEST_API_KEY";
const TEST_FORMULA_ID = "test-formula-id";
const TEST_MODEL_ID = "test-model-id";
const TEST_FORMULA_DATA = { id: "test-script-id", name: "Test Formula" };

class MockHttpClient {
  async get(url, headers) {
    return {
      status: 200,
      json: () =>
        Promise.resolve([
          { id: "model1", name: "Model 1" },
          { id: "model2", name: "Model 2" },
        ]),
    };
  }

  async post(url, data, headers) {
    return {
      status: 200,
      json: () => Promise.resolve({ result: "Completed!" }),
    };
  }
}

describe("Formulaic", () => {
  let formulaic;
  let mockHttpClient;

  beforeEach(() => {
    mockHttpClient = new MockHttpClient();
    formulaic = new Formulaic(TEST_API_KEY, {
      baseURL: TEST_FORMULAIC_API_URL,
      httpClient: mockHttpClient,
    });
  });

  describe("constructor", () => {
    it("should initialize with API key and default API URL", () => {
      expect(formulaic.apiKey).toBe(TEST_API_KEY);
      expect(formulaic.baseURL).toBe(TEST_FORMULAIC_API_URL);
    });

    it("should allow overriding the API URL", () => {
      const customApiUrl = "https://custom-formulaic.com";
      const customFormulaic = new Formulaic(TEST_API_KEY, {
        baseURL: customApiUrl,
      });
      expect(customFormulaic.baseURL).toBe(customApiUrl);
    });

    it("should set up default headers", () => {
      expect(formulaic.headers.Authorization).toBe(`Bearer ${TEST_API_KEY}`);
      expect(formulaic.headers.Accept).toBe("*/*");
      expect(formulaic.headers["Content-Type"]).toBe("application/json");
    });

    it("should set up debug mode if specified", () => {
      const debugFormulaic = new Formulaic(TEST_API_KEY, {
        debug: true,
      });
      expect(debugFormulaic.debug).toBe(true);
    });

    it("should use provided HttpClient", () => {
      expect(formulaic.httpClient).toBe(mockHttpClient);
    });
  });

  describe("getModels", () => {
    it("should make a GET request to the models endpoint", async () => {
      const expectedModels = [
        { id: "model1", name: "Model 1" },
        { id: "model2", name: "Model 2" },
      ];
      const models = await formulaic.getModels();
      expect(models).toEqual(expectedModels);
    });

    it("should throw an error if the request fails", async () => {
      mockHttpClient.get = async () => ({ status: 500 });
      await expect(formulaic.getModels()).rejects.toThrowError(
        "Failed to get models: 500"
      );
    });
  });

  describe("getFormula", () => {
    it("should make a GET request to the formula endpoint and cache the result", async () => {
      const formulaData = { id: "test-script-id", name: "Test Formula" };
      mockHttpClient.get = async () => ({
        status: 200,
        json: () => Promise.resolve(formulaData),
      });

      const retrievedData = await formulaic.getFormula(TEST_FORMULA_ID);
      expect(retrievedData).toEqual(formulaData);
      expect(formulaic.formulaCache[TEST_FORMULA_ID].data).toEqual(formulaData);
    });

    it("should return cached data if available and within TTL", async () => {
      formulaic.formulaCache[TEST_FORMULA_ID] = {
        timestamp: Date.now(),
        data: TEST_FORMULA_DATA,
      };

      const formulaData = await formulaic.getFormula(TEST_FORMULA_ID);
      expect(formulaData).toEqual(TEST_FORMULA_DATA);
    });

    it("should throw an error if the formula ID is not provided", async () => {
      await expect(formulaic.getFormula()).rejects.toThrowError(
        "Formula ID is required"
      );
    });

    it("should throw an error if the request fails", async () => {
      mockHttpClient.get = async () => ({ status: 500 });
      await expect(formulaic.getFormula(TEST_FORMULA_ID)).rejects.toThrowError(
        `Failed to get formula: 500`
      );
    });
  });

  describe("createCompletion", () => {
    it("should make a POST request to the completion endpoint", async () => {
      const completionResponse = { result: "Completed!" };
      mockHttpClient.post = async () => ({
        status: 200,
        json: () => Promise.resolve(completionResponse),
      });

      const completion = await formulaic.createCompletion(TEST_FORMULA_ID, {
        models: [TEST_MODEL_ID],
      });
      expect(completion).toEqual(completionResponse);
    });

    it("should throw an error if data does not contain a models array", async () => {
      await expect(
        formulaic.createCompletion(TEST_FORMULA_ID, {})
      ).rejects.toThrowError("Data must include a 'models' array.");
    });

    it("should throw an error if the models array is empty", async () => {
      await expect(
        formulaic.createCompletion(TEST_FORMULA_ID, { models: [] })
      ).rejects.toThrowError(
        "Data must include at least one model in the 'models' array."
      );
    });

    it("should throw an error if the request fails", async () => {
      mockHttpClient.post = async () => ({ status: 500 });
      await expect(
        formulaic.createCompletion(TEST_FORMULA_ID, { models: [TEST_MODEL_ID] })
      ).rejects.toThrowError(`Failed to get response from LLM: 500`);
    });
  });
});
