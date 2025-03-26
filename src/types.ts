import { z } from "zod";

export const LogSchema = z.object({
  timestamp: z.string(),
  level: z.string(),
  message: z.string(),
});

export const ExecutionErrorSchema = z.object({
  message: z.string().optional(),
});

export const RunCodeOptionsSchema = z.object({
  context: z.record(z.unknown()).optional(),
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
  error?: typeof ExecutionErrorSchema;
}

export const SetEnvVarSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  value: z.string(),
  isSensitive: z.boolean().optional().default(true),
});

export const RemoveEnvVarSchema = z.object({
  key: z.string(),
});

export type SetEnvVarRequestSchema = z.infer<typeof SetEnvVarSchema>;
export type RemoveEnvVarRequestSchema = z.infer<typeof RemoveEnvVarSchema>;

export interface EnvVarResultSchema {
  success: boolean;
  error?: {
    message: string;
  };
}

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
