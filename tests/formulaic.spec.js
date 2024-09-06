const { Formulaic } = require("../src/index"); // Adjust path as necessary

describe("Formulaic", () => {
  const TEST_API_KEY = "test-api-key";
  const TEST_FORMULA_ID = "test-formula-id";
  const TEST_MODEL_ID = "test-model-id";
  const TEST_VARIABLES = [{ key: "var1", value: "value1" }];
  let mockHttpClient;
  let formulaic;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
    };
    formulaic = new Formulaic(TEST_API_KEY, { httpClient: mockHttpClient });
  });

  describe("constructor", () => {
    it("should initialize with API key and default API URL", () => {
      expect(formulaic.apiKey).toBe(TEST_API_KEY);
      expect(formulaic.baseURL).toBe("https://formulaic.app");
    });

    it("should allow overriding the API URL", () => {
      const customURL = "https://custom.formulaic.app";
      const customFormulaic = new Formulaic(TEST_API_KEY, {
        baseURL: customURL,
      });
      expect(customFormulaic.baseURL).toBe(customURL);
    });

    it("should set up default headers", () => {
      expect(formulaic.headers.Authorization).toBe(`Bearer ${TEST_API_KEY}`);
      expect(formulaic.headers.Accept).toBe("application/json");
      expect(formulaic.headers["Content-Type"]).toBe("application/json");
    });

    it("should set up debug mode if specified", () => {
      const debugFormulaic = new Formulaic(TEST_API_KEY, { debug: true });
      expect(debugFormulaic.debug).toBe(true);
    });

    it("should use provided HttpClient", () => {
      expect(formulaic.httpClient).toBe(mockHttpClient);
    });
  });

  describe("getModels", () => {
    it("should make a GET request to the models endpoint", async () => {
      const expectedModels = [{ id: "model1", name: "Model 1" }];
      mockHttpClient.get.mockResolvedValue(expectedModels);

      const models = await formulaic.getModels();
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${formulaic.baseURL}/api/models`,
        formulaic.headers
      );
      expect(models).toEqual(expectedModels);
    });

    it("should throw an error if the request fails", async () => {
      mockHttpClient.get.mockRejectedValue(new Error("Request failed"));

      await expect(formulaic.getModels()).rejects.toThrowError(
        "Failed to get models: Request failed"
      );
    });
  });

  describe("getFormula", () => {
    it("should make a GET request to the formula endpoint and cache the result", async () => {
      const formulaData = { id: "test-script-id", name: "Test Formula" };
      mockHttpClient.get.mockResolvedValue(formulaData);

      const retrievedData = await formulaic.getFormula(TEST_FORMULA_ID);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${formulaic.baseURL}/api/recipes/${TEST_FORMULA_ID}/scripts`,
        formulaic.headers
      );
      expect(retrievedData).toEqual(formulaData);
      expect(formulaic.formulaCache[TEST_FORMULA_ID].data).toEqual(formulaData);
    });

    it("should return cached data if available and within TTL", async () => {
      const cachedData = { id: "test-script-id", name: "Cached Formula" };
      formulaic.formulaCache[TEST_FORMULA_ID] = {
        timestamp: Date.now(),
        data: cachedData,
      };

      const retrievedData = await formulaic.getFormula(TEST_FORMULA_ID);
      expect(mockHttpClient.get).not.toHaveBeenCalled();
      expect(retrievedData).toEqual(cachedData);
    });

    it("should throw an error if the formula ID is not provided", async () => {
      await expect(formulaic.getFormula()).rejects.toThrowError(
        "Formula ID is required"
      );
    });

    it("should throw an error if the request fails", async () => {
      mockHttpClient.get.mockRejectedValue(new Error("Request failed"));

      await expect(formulaic.getFormula(TEST_FORMULA_ID)).rejects.toThrowError(
        "Failed to get formula: Request failed"
      );
    });
  });

  describe("createCompletion", () => {
    const completionResponse = { result: "Completed!" };
    const formulaData = { id: "test-script-id", name: "Test Formula" };

    beforeEach(() => {
      // Ensure that getFormula returns a valid formula object
      mockHttpClient.get.mockResolvedValue(formulaData);
    });

    it("should make a POST request to the completion endpoint", async () => {
      mockHttpClient.post.mockResolvedValue(completionResponse);

      const result = await formulaic.createCompletion(TEST_FORMULA_ID, {
        models: [TEST_MODEL_ID],
        variables: TEST_VARIABLES,
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `${formulaic.baseURL}/api/recipes/${TEST_FORMULA_ID}/scripts/${formulaData.id}/artifacts`,
        { models: [TEST_MODEL_ID], variables: TEST_VARIABLES },
        formulaic.headers
      );
      expect(result).toEqual(completionResponse);
    });

    it("should proceed with empty models and variables arrays if they are not provided", async () => {
      mockHttpClient.post.mockResolvedValue(completionResponse);

      const result = await formulaic.createCompletion(TEST_FORMULA_ID, {});

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `${formulaic.baseURL}/api/recipes/${TEST_FORMULA_ID}/scripts/${formulaData.id}/artifacts`,
        { models: [], variables: [] },
        formulaic.headers
      );
      expect(result).toEqual(completionResponse);
    });

    it("should throw an error if the request fails", async () => {
      mockHttpClient.post.mockRejectedValue(new Error("Request failed"));

      await expect(
        formulaic.createCompletion(TEST_FORMULA_ID, { models: [TEST_MODEL_ID] })
      ).rejects.toThrowError("Failed to create completion: Request failed");
    });
  });
});
