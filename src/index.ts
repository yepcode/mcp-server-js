#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ExecutionError, YepCodeRun, YepCodeEnv, Log } from "@yepcode/run";
import dotenv from "dotenv";
import {
  RunCodeSchema,
  SetEnvVarSchema,
  RemoveEnvVarSchema,
  ToolCallRequest,
  ToolHandler,
} from "./types.js";
import { z } from "zod";
import { isObject } from "./utils.js";

class Logger {
  constructor() {}

  log(message: string, data: unknown = undefined) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: "INFO",
      message,
      ...(data ? (isObject(data) ? JSON.stringify(data) : data) : undefined),
    };
    console.error(JSON.stringify(logEntry));
  }

  error(message: string, error: Error | undefined = undefined) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: "ERROR",
      message,
      ...(error
        ? error instanceof Error
          ? {
              error: error.stack || error.message || String(error),
            }
          : error
        : undefined),
    };
    console.error(JSON.stringify(logEntry));
  }
}

const logger = new Logger();

dotenv.config();

class YepCodeServer {
  private server: Server;

  private yepcodeRun: YepCodeRun;
  private yepCodeEnv: YepCodeEnv;

  constructor() {
    this.server = new Server(
      {
        name: "yepcode-mcp-server",
        version: "0.0.1",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          resourceTemplates: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();

    try {
      this.yepcodeRun = new YepCodeRun();
      this.yepCodeEnv = new YepCodeEnv();
      logger.log("YepCode initialized successfully");
    } catch (error) {
      logger.error("Exception while initializing YepCode", error as Error);
      throw new McpError(
        ErrorCode.InternalError,
        "Exception while initializing YepCode. Have you set the YEPCODE_API_TOKEN environment variable?"
      );
    }
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      logger.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      logger.log("Received SIGINT, shutting down");
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupTemplateHandlers();
  }

  private setupResourceHandlers(): void {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [], // Empty list as we don't have any resources
    }));
  }

  private setupTemplateHandlers(): void {
    this.server.setRequestHandler(
      ListResourceTemplatesRequestSchema,
      async () => ({
        resourceTemplates: [], // Empty list as we don't have any templates
      })
    );
  }

  private async handleToolRequest<T>(
    schema: z.ZodSchema<T>,
    request: ToolCallRequest,
    handler: ToolHandler<T>
  ): Promise<{ content: Array<{ type: string; text: string }> }> {
    const parsed = schema.safeParse(request.params.arguments);
    if (!parsed.success) {
      logger.error("Invalid request arguments", parsed.error);
      throw new McpError(ErrorCode.InvalidParams, "Invalid request arguments");
    }

    try {
      logger.log(
        `Handling tool request: ${request.params.name}`,
        request.params.arguments
      );
      const result = await handler(parsed.data);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                ...(result as Record<string, unknown>),
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      logger.error(
        `Error in tool handler: ${request.params.name}`,
        error as Error
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: {
                  message: errorMessage,
                },
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.log("Handling ListTools request");
      return {
        tools: [
          {
            name: "run_code",
            description: "Execute code using YepCode's infrastructure",
            inputSchema: zodToJsonSchema(RunCodeSchema),
          },
          {
            name: "set_env_var",
            description: "Set a YepCode environment variable",
            inputSchema: zodToJsonSchema(SetEnvVarSchema),
          },
          {
            name: "remove_env_var",
            description: "Remove a YepCode environment variable",
            inputSchema: zodToJsonSchema(RemoveEnvVarSchema),
          },
        ],
      };
    });

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request, extra) => {
        logger.log(`Received CallTool request for: ${request.params.name}`);

        switch (request.params.name) {
          case "run_code":
            return this.handleToolRequest(
              RunCodeSchema,
              request,
              async (data) => {
                const { code, options } = data;
                const logs: Log[] = [];
                let executionError: ExecutionError | undefined;
                let returnValue: unknown;

                logger.log("Running code with YepCode", {
                  codeLength: code.length,
                  options,
                });

                const execution = await this.yepcodeRun.run(code, {
                  ...options,
                  onLog: (log) => {
                    logs.push(log);
                  },
                  onError: (error) => {
                    executionError = error;
                    logger.error("YepCode execution error", error as Error);
                  },
                  onFinish: (value) => {
                    returnValue = value;
                    logger.log("YepCode execution finished", {
                      hasReturnValue: value !== undefined,
                    });
                  },
                });

                await execution.waitForDone();

                return {
                  success: !executionError,
                  logs,
                  returnValue,
                  error: executionError,
                };
              }
            );

          case "set_env_var":
            return this.handleToolRequest(
              SetEnvVarSchema,
              request,
              async (data) => {
                const { key, value, isSensitive } = data;
                logger.log(`Setting environment variable: ${key}`, {
                  isSensitive,
                });
                await this.yepCodeEnv.setEnvVar(key, value, isSensitive);
                return {};
              }
            );

          case "remove_env_var":
            return this.handleToolRequest(
              RemoveEnvVarSchema,
              request,
              async (data) => {
                logger.log(`Removing environment variable: ${data.key}`);
                await this.yepCodeEnv.delEnvVar(data.key);
                return {};
              }
            );

          default:
            logger.error(`Unknown tool requested: ${request.params.name}`);
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      }
    );
  }

  async run(): Promise<void> {
    logger.log("Starting YepCode MCP server");
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      logger.log("MCP server connected to transport");

      // Handle process termination
      process.on("SIGINT", async () => {
        logger.log("Received SIGINT, shutting down");
        await this.server.close();
        process.exit(0);
      });

      process.on("SIGTERM", async () => {
        logger.log("Received SIGTERM, shutting down");
        await this.server.close();
        process.exit(0);
      });
    } catch (error) {
      logger.error("Failed to start server:", error as Error);
      process.exit(1);
    }
  }
}

const server = new YepCodeServer();
server.run().catch((error) => {
  logger.error("Error running server", error);
});
