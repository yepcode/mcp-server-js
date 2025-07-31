import { z } from "zod";

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
