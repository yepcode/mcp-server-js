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
import {
  YepCodeEnv,
  Log,
  YepCodeApi,
  YepCodeApiManager,
  YepCodeRun,
  Execution,
} from "@yepcode/run";
import dotenv from "dotenv";
import {
  RunCodeSchema,
  SetEnvVarSchema,
  RemoveEnvVarSchema,
  ToolCallRequest,
  ToolHandler,
  RunProcessSchema,
  LogSchema,
  ExecutionResultSchema,
  GetExecutionSchema,
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
      ...(data
        ? { data: isObject(data) ? JSON.stringify(data) : data }
        : undefined),
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

  private yepCodeRun: YepCodeRun;
  private yepCodeEnv: YepCodeEnv;
  private yepCodeApi: YepCodeApi;

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
      this.yepCodeRun = new YepCodeRun();
      this.yepCodeEnv = new YepCodeEnv();
      this.yepCodeApi = YepCodeApiManager.getInstance({});
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

  private async executionResult(
    executionId: string
  ): Promise<ExecutionResultSchema> {
    const execution = new Execution({
      yepCodeApi: this.yepCodeApi,
      executionId,
    });
    await execution.waitForDone();
    return {
      executionId,
      logs: execution.logs,
      processId: execution.processId,
      status: execution.status,
      timeline: execution.timeline,
      ...(execution.returnValue && {
        returnValue: execution.returnValue,
      }),
      ...(execution.error && { error: execution.error }),
    };
  }

  private setupToolHandlers(): void {
    const baseTools = [
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
    ];

    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.log(
        `Handling ListTools request${
          process.env.YEPCODE_PROCESSES_AS_MCP_TOOLS
            ? " with processes as MCP tools"
            : ""
        }`
      );
      const tools = [...baseTools];
      if (process.env.YEPCODE_PROCESSES_AS_MCP_TOOLS) {
        tools.push({
          name: "get_execution",
          description:
            "Get the status, result, logs, timeline, etc. of a YepCode execution",
          inputSchema: zodToJsonSchema(GetExecutionSchema),
        });
        let page = 0;
        let limit = 100;
        while (true) {
          const processes = await this.yepCodeApi.getProcesses({ page, limit });
          logger.log(`Found ${processes?.data?.length} processes`);
          if (!processes.data) {
            break;
          }
          tools.push(
            ...processes.data
              .filter((process) => !process.slug.startsWith("yepcode-run-"))
              .map((process) => {
                const inputSchema = zodToJsonSchema(RunProcessSchema) as any;
                inputSchema.properties.parameters =
                  process.parametersSchema || {};
                return {
                  name: `run_yepcode_process_${process.slug}`,
                  description: `${process.name}${
                    process.description ? ` - ${process.description}` : ""
                  }`,
                  inputSchema,
                };
              })
          );
          if (!processes.hasNextPage) {
            break;
          }
          page++;
        }
      }
      return {
        tools,
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      logger.log(`Received CallTool request for: ${request.params.name}`);

      if (request.params.name.startsWith("run_yepcode_process_")) {
        const processSlug = request.params.name.replace(
          "run_yepcode_process_",
          ""
        );

        return this.handleToolRequest(
          RunProcessSchema,
          request,
          async (data) => {
            const {
              synchronousExecution = true,
              parameters,
              ...options
            } = data;
            const { executionId } = await this.yepCodeApi.executeProcessAsync(
              processSlug,
              parameters,
              {
                ...options,
                initiatedBy: "@yepcode/mcp-server",
              }
            );
            if (!synchronousExecution) {
              return {
                executionId,
              };
            }
            return await this.executionResult(executionId);
          }
        );
      }

      switch (request.params.name) {
        case "run_code":
          return this.handleToolRequest(
            RunCodeSchema,
            request,
            async (data) => {
              const { code, options } = data;
              const logs: Log[] = [];
              let executionError: string | undefined;
              let returnValue: unknown;

              logger.log("Running code with YepCode", {
                codeLength: code.length,
                options,
              });

              const execution = await this.yepCodeRun.run(code, {
                ...options,
                initiatedBy: "@yepcode/mcp-server",
                onLog: (log) => {
                  logs.push(log);
                },
                onError: (error) => {
                  executionError = error.message;
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
                ...(executionError && { error: executionError }),
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

        case "get_execution":
          return this.handleToolRequest(
            GetExecutionSchema,
            request,
            async (data) => {
              return await this.executionResult(data.executionId);
            }
          );
        default:
          logger.error(`Unknown tool requested: ${request.params.name}`);
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
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
