interface ToolCallContext {
    tool: string;
    args?: any;
    startTime?: number;
}
interface ApiCallContext {
    method: string;
    url: string;
    data?: any;
    startTime?: number;
}
export declare function logToolStart(tool: string, args: any): ToolCallContext;
export declare function logToolEnd(context: ToolCallContext, result: any, error?: Error): void;
export declare function logApiStart(method: string, url: string, data?: any): ApiCallContext;
export declare function logApiEnd(context: ApiCallContext, response: any, error?: Error, mode?: string): void;
export declare function logDataProcessing(step: string, input: any, output?: any): void;
export declare function logPerformanceMetrics(operation: string, metrics: any): void;
export declare function logConfiguration(config: any): void;
export {};
//# sourceMappingURL=logging-helpers.d.ts.map