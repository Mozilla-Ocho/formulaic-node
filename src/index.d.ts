export declare class HttpClient {
    constructor(apiKey: string);
    request<T = any>(
        url: string,
        method?: 'GET' | 'POST' | 'PATCH' | 'DELETE',
        data?: any,
        customHeaders?: Record<string, string>
    ): Promise<T>;
    get<T = any>(url: string, headers?: Record<string, string>): Promise<T>;
    post<T = any>(url: string, data: any, headers?: Record<string, string>): Promise<T>;
    patch<T = any>(url: string, data: any, headers?: Record<string, string>): Promise<T>;
    delete<T = any>(url: string, headers?: Record<string, string>): Promise<T>;
}

export declare class FormulaicCache {
    constructor(ttl?: number);
    get<T = any>(key: string): T | null;
    set(key: string, value: any): void;
    clear(): void;
}

export interface FormulaicOptions {
    baseURL?: string;
    httpClient?: HttpClient;
    debug?: boolean;
}

export interface FormulaData {
    prompts?: object[];
    models?: object[];
    variables?: object[];
    [key: string]: any;
}

export declare class Formulaic {
    constructor(apiKey: string, options?: FormulaicOptions);
    getModels(): Promise<any>;
    getFormula(formulaId: string): Promise<any>;
    getScripts(formulaId: string): Promise<any>;
    createFormula(data: FormulaData): Promise<any>;
    createCompletion(formulaId: string, data?: Record<string, any>): Promise<any>;
    uploadFile(formulaId: string, file: Buffer | string, fileName: string): Promise<any>;
    getFiles(formulaId: string): Promise<any>;
    getFile(formulaId: string, fileId: string): Promise<any>;
    updateFile(formulaId: string, fileId: string, data: any): Promise<any>;
    deleteFile(formulaId: string, fileId: string): Promise<any>;
    createChatCompletion(formulaId: string, messages: object[]): Promise<any>;
}
