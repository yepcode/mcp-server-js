import { z } from "zod";

export const LogSchema = z.object({
  timestamp: z.string(),
  level: z.string(),
  message: z.string(),
});

export const RunCodeOptionsSchema = z.object({
  language: z.string().optional(),
  parameters: z.record(z.unknown()).optional(),
  tag: z.string().optional(),
  comment: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
});

export const RunCodeSchema = z.object({
  code: z.string(),
  options: RunCodeOptionsSchema,
});

export type RunCodeRequestSchema = z.infer<typeof RunCodeSchema>;

export interface RunCodeResultSchema {
  success: boolean;
  returnValue?: unknown;
  logs: Array<typeof LogSchema>;
  error?: string;
}

export const EnvVarKeySchema = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/);

export const SetEnvVarSchema = z.object({
  key: EnvVarKeySchema,
  value: z.string(),
  isSensitive: z.boolean().optional().default(true),
});

export const RemoveEnvVarSchema = z.object({
  key: EnvVarKeySchema,
});

export type SetEnvVarRequestSchema = z.infer<typeof SetEnvVarSchema>;
export type RemoveEnvVarRequestSchema = z.infer<typeof RemoveEnvVarSchema>;

export interface EnvVarResultSchema {
  success: boolean;
  error?: {
    message: string;
  };
}

export const RunProcessSchema = z.object({
  parameters: z.any().optional(),
  options: z
    .object({
      tag: z
        .string()
        .optional()
        .describe(
          "The process version to be executed. You may provide a specific version if user asks explicity for a process version."
        ),
      comment: z
        .string()
        .optional()
        .describe(
          "A comment to be added to the execution. You may provide some context about the execution."
        ),
    })
    .optional(),
  synchronousExecution: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "Whether the execution should be synchronous or not. If true, the execution will be synchronous and the execution result will be returned immediately. If false, the execution will be asynchronous and you should use the execution id to get the result later."
    ),
});

export const GetExecutionSchema = z.object({
  executionId: z.string(),
});

export const ExecutionResultSchema = z.object({
  executionId: z.string(),
  logs: z.array(LogSchema),
  processId: z.string(),
  status: z.string(),
  timeline: z.array(z.any()),
  returnValue: z.any().optional(),
  error: z.string().optional(),
});

export type ExecutionResultSchema = z.infer<typeof ExecutionResultSchema>;

export interface MCPRequest<T = unknown> {
  params: {
    name: string;
    arguments: T;
  };
}

export interface MCPResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

export interface ToolCallRequest {
  params: {
    name: string;
    arguments?: Record<string, unknown>;
    _meta?: Record<string, unknown>;
  };
  method: "tools/call";
}

export type ToolHandler<T> = (data: T) => Promise<unknown>;
