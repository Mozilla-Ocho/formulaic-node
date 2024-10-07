const { Formulaic } = require("../src/index"); // Adjust path as necessary

describe("Formulaic", () => {
  const TEST_API_KEY = "test-api-key";
  const TEST_FORMULA_ID = "test-formula-id";
  const TEST_MODEL_ID = "test-model-id";
  const TEST_VARIABLES = [{ key: "var1", value: "value1" }];
  const TEST_MESSAGES = [
    { role: "assistant", content: "Welcome to Formulaic! Ask me anything." },
    { role: "user", content: "hello" },
  ];
  let mockHttpClient;
  let formulaic;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      headers: {
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

      mockHttpClient.get.mockResolvedValue(expectedModels);

      const models = await formulaic.getModels();

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${formulaic.baseURL}/api/models`
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
        `${formulaic.baseURL}/api/recipes/${TEST_FORMULA_ID}`
      );

      expect(retrievedData).toEqual(formulaData);
      expect(formulaic.formulaCache.get(TEST_FORMULA_ID)).toEqual(formulaData);
    });

    it("should return cached data if available and within TTL", async () => {
      const cachedData = { id: TEST_FORMULA_ID };

      formulaic.formulaCache.set(TEST_FORMULA_ID, cachedData);

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
        { models: [TEST_MODEL_ID], variables: TEST_VARIABLES }
      );

      expect(result).toEqual(completionResponse);
    });

    it("should proceed with empty models and variables arrays if they are not provided", async () => {
      mockHttpClient.post.mockResolvedValue(completionResponse);

      const result = await formulaic.createCompletion(TEST_FORMULA_ID, {});

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `${formulaic.baseURL}/api/recipes/${TEST_FORMULA_ID}/scripts/${formulaData.id}/artifacts`,
        { models: [], variables: [] }
      );

      expect(result).toEqual(completionResponse);
    });

    it("should throw an error if the request fails", async () => {
      mockHttpClient.post.mockRejectedValue(new Error("Request failed"));

      await expect(
        formulaic.createCompletion(TEST_FORMULA_ID, {
          models: [TEST_MODEL_ID],
          variables: TEST_VARIABLES,
        })
      ).rejects.toThrowError("Failed to create completion: Request failed");
    });
  });

  // New test for createChatCompletion
  describe("createChatCompletion", () => {
    const chatCompletionResponse = {
      chat: {
        context: "",
        messages: [
          {
            role: "assistant",
            content: "Welcome to Formulaic! Ask me anything.",
          },
          { role: "user", content: "hello" },
          {
            role: "assistant",
            content:
              "Hello! It seems like you want to provide some context. Please go ahead and share it, and I'll do my best to assist you!",
            context: [],
          },
        ],
      },
      usage: {
        prompt_tokens: 29,
        completion_tokens: 28,
        total_tokens: 57,
      },
    };

    it("should make a POST request to the chat completion endpoint", async () => {
      mockHttpClient.post.mockResolvedValue(chatCompletionResponse);

      const result = await formulaic.createChatCompletion(
        TEST_FORMULA_ID,
        TEST_MESSAGES
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `${formulaic.baseURL}/api/recipes/${TEST_FORMULA_ID}/chats`,
        TEST_MESSAGES,
        { "Content-Type": "application/json" }
      );

      expect(result).toEqual(chatCompletionResponse);
    });

    it("should throw an error if the request fails", async () => {
      mockHttpClient.post.mockRejectedValue(new Error("Request failed"));

      await expect(
        formulaic.createChatCompletion(TEST_FORMULA_ID, TEST_MESSAGES)
      ).rejects.toThrowError(
        "Failed to create chat completion: Request failed"
      );
    });

    it("should throw an error if the formula ID is not provided", async () => {
      await expect(
        formulaic.createChatCompletion(null, TEST_MESSAGES)
      ).rejects.toThrowError("Formula ID is required");
    });

    it("should throw an error if messages are not provided as an array", async () => {
      await expect(
        formulaic.createChatCompletion(TEST_FORMULA_ID, "invalid-messages")
      ).rejects.toThrowError("Messages must be an array");
    });
  });
});
