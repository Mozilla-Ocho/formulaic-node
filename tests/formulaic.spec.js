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
      headers: {
        // Add this line to mock headers
        Authorization: `Bearer ${TEST_API_KEY}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
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
      expect(formulaic.httpClient.headers.Authorization).toBe(
        `Bearer ${TEST_API_KEY}`
      );
      expect(formulaic.httpClient.headers.Accept).toBe("application/json");
      expect(formulaic.httpClient.headers["Content-Type"]).toBe(
        "application/json"
      );
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

      // Mock the resolved value for the GET request
      mockHttpClient.get.mockResolvedValue(expectedModels);

      // Call the actual method
      const models = await formulaic.getModels();

      // Ensure that the mock was called with the correct URL and headers
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${formulaic.baseURL}/api/models`
      );

      // Check that the returned models match the mock result
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

      // Update the test to expect the correct URL without "/scripts"
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${formulaic.baseURL}/api/recipes/${TEST_FORMULA_ID}`
      );

      expect(retrievedData).toEqual(formulaData);
      expect(formulaic.formulaCache.get(TEST_FORMULA_ID)).toEqual(formulaData);
    });

    it("should return cached data if available and within TTL", async () => {
      const cachedData = { id: TEST_FORMULA_ID };

      // Use the cache's set method to cache the data
      formulaic.formulaCache.set(TEST_FORMULA_ID, cachedData);

      // Retrieve the formula, which should come from the cache
      const retrievedData = await formulaic.getFormula(TEST_FORMULA_ID);

      // Ensure that the HTTP GET request was not called because we used the cached data
      expect(mockHttpClient.get).not.toHaveBeenCalled();

      // Verify that the retrieved data matches the cached data
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
      const completionResponse = { result: "Completed!" };
      const formulaData = { id: "test-script-id", name: "Test Formula" };

      // Mock the get request to return a valid formula
      mockHttpClient.get.mockResolvedValue(formulaData);

      // Mock the post request to return a completion response
      mockHttpClient.post.mockResolvedValue(completionResponse);

      const result = await formulaic.createCompletion(TEST_FORMULA_ID, {
        models: [TEST_MODEL_ID],
        variables: TEST_VARIABLES,
      });

      // Ensure the post request was called with the correct URL, body, and headers
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `${formulaic.baseURL}/api/recipes/${TEST_FORMULA_ID}/scripts/${formulaData.id}/artifacts`,
        { models: [TEST_MODEL_ID], variables: TEST_VARIABLES }
      );

      // Check that the result matches the mocked completion response
      expect(result).toEqual(completionResponse);
    });

    it("should proceed with empty models and variables arrays if they are not provided", async () => {
      const completionResponse = { result: "Completed!" };

      // Mock the post request to return a successful response
      mockHttpClient.post.mockResolvedValue(completionResponse);

      // Call the method without providing models or variables
      const result = await formulaic.createCompletion(TEST_FORMULA_ID, {});

      // Ensure that the post request was called with empty models and variables
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `${formulaic.baseURL}/api/recipes/${TEST_FORMULA_ID}/scripts/${formulaData.id}/artifacts`,
        { models: [], variables: [] }
      );

      // Ensure the result matches the mocked response
      expect(result).toEqual(completionResponse);
    });

    it("should throw an error if the request fails", async () => {
      // Mock the failure of the post request
      mockHttpClient.post.mockRejectedValue(new Error("Request failed"));

      // Provide both models and variables to avoid the validation error
      await expect(
        formulaic.createCompletion(TEST_FORMULA_ID, {
          models: [TEST_MODEL_ID],
          variables: TEST_VARIABLES,
        })
      ).rejects.toThrowError("Failed to create completion: Request failed");
    });
  });
});
