import { Server } from "@modelcontextprotocol/sdk/server/index.js";
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
  YepCodeRun,
  Execution,
  YepCodeApiConfig,
} from "@yepcode/run";
import dotenv from "dotenv";
import { ToolCallRequest, ToolHandler } from "./types.js";
import { z } from "zod";
import { getVersion, isEmpty } from "./utils.js";
import Logger from "./logger.js";
import {
  DeleteObjectSchema,
  DownloadObjectSchema,
  ListObjectsSchema,
  storageToolDefinitions,
  storageToolNames,
  UploadObjectSchema,
} from "./tools/storage-tool-definitions.js";
import {
  SetEnvVarSchema,
  RemoveEnvVarSchema,
  envVarsToolDefinitions,
  envVarsToolNames,
} from "./tools/env-vars-tool-definitions.js";
import {
  GetExecutionSchema,
  getExecutionToolNames,
  getExecutionToolDefinitions,
} from "./tools/get-execution-tool-definition.js";
import {
  runCodeToolDefinitions,
  RunCodeSchema,
  ExecutionResultSchema,
  RunProcessSchema,
  runCodeToolNames,
} from "./tools/run-code-tool-definitinos.js";

const RUN_PROCESS_TOOL_NAME_PREFIX = "run_ycp_";
const RUN_PROCESS_TOOL_TAG = "mcp-tool";

dotenv.config();

class YepCodeMcpServer extends Server {
  private yepCodeRun: YepCodeRun;
  private yepCodeEnv: YepCodeEnv;
  private yepCodeApi: YepCodeApi;
  private logger: Logger;
  private disableRunCodeTool: boolean;
  private runCodeCleanup: boolean;
  constructor(
    config: YepCodeApiConfig,
    {
      logsToStderr = false,
      disableRunCodeTool = false,
      runCodeCleanup = false,
    }: {
      logsToStderr?: boolean;
      disableRunCodeTool?: boolean;
      runCodeCleanup?: boolean;
    } = {}
  ) {
    super(
      {
        name: "yepcode-mcp-server",
        version: getVersion(),
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          resourceTemplates: {},
        },
      }
    );

    this.disableRunCodeTool = disableRunCodeTool;
    this.runCodeCleanup = runCodeCleanup;
    this.setupHandlers();
    this.setupErrorHandling();

    try {
      this.yepCodeRun = new YepCodeRun(config);
      this.yepCodeEnv = new YepCodeEnv(config);
      this.yepCodeApi = new YepCodeApi(config);
      this.logger = new Logger(this.yepCodeApi.getTeamId(), {
        logsToStderr,
      });
      this.logger.info("YepCode initialized successfully");
    } catch (error) {
      this.logger = new Logger("YepCodeMcpServer", {
        logsToStderr,
      });
      this.logger.error("Exception while initializing YepCode", error as Error);
      throw new McpError(
        ErrorCode.InternalError,
        "Exception while initializing YepCode. Have you set the YEPCODE_API_TOKEN environment variable?"
      );
    }
  }

  private setupErrorHandling(): void {
    this.onerror = (error) => {
      this.logger.error("[MCP Error]", error);
    };
  }

  private setupHandlers(): void {
    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupTemplateHandlers();
  }

  private setupResourceHandlers(): void {
    this.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [], // Empty list as we don't have any resources
    }));
  }

  private setupTemplateHandlers(): void {
    this.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
      resourceTemplates: [], // Empty list as we don't have any templates
    }));
  }

  private async handleToolRequest<T>(
    schema: z.ZodSchema<T>,
    request: ToolCallRequest,
    handler: ToolHandler<T>
  ): Promise<{
    isError: boolean;
    content: Array<{ type: string; text: string }>;
  }> {
    const parsed = schema.safeParse(request.params.arguments);
    if (!parsed.success) {
      this.logger.error("Invalid request arguments", parsed.error);
      throw new McpError(ErrorCode.InvalidParams, "Invalid request arguments");
    }

    try {
      this.logger.info(`Handling tool request: ${request.params.name}`);
      const result = await handler(parsed.data);
      return {
        isError: false,
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
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
      this.logger.error(
        `Error in tool handler: ${request.params.name}`,
        error as Error
      );
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: errorMessage,
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
    this.setRequestHandler(ListToolsRequestSchema, async () => {
      this.logger.info(`Handling ListTools request`);
      const tools = [
        ...envVarsToolDefinitions,
        ...storageToolDefinitions,
        ...getExecutionToolDefinitions,
      ];

      if (!this.disableRunCodeTool) {
        const envVars = await this.yepCodeEnv.getEnvVars();
        tools.push(...(await runCodeToolDefinitions(envVars)));
      }

      let page = 0;
      let limit = 100;
      while (true) {
        const processes = await this.yepCodeApi.getProcesses({ page, limit });
        this.logger.info(`Found ${processes?.data?.length} processes`);
        if (!processes.data) {
          break;
        }
        tools.push(
          ...processes.data
            .filter((process) => process.tags?.includes(RUN_PROCESS_TOOL_TAG))
            .map((process) => {
              const inputSchema = zodToJsonSchema(RunProcessSchema) as any;
              if (!isEmpty(process.parametersSchema)) {
                inputSchema.properties.parameters = process.parametersSchema;
              } else {
                delete inputSchema.properties.parameters;
              }
              let toolName = `${RUN_PROCESS_TOOL_NAME_PREFIX}${process.slug}`;
              if (toolName.length > 60) {
                toolName = `${RUN_PROCESS_TOOL_NAME_PREFIX}${process.id}`;
              }
              return {
                name: toolName,
                title: process.name,
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
      this.logger.info(
        `Found ${tools.length} tools: ${tools
          .map((tool) => tool.name)
          .join(", ")}`
      );
      return {
        tools,
      };
    });

    this.setRequestHandler(CallToolRequestSchema, async (request) => {
      this.logger.info(`Received CallTool request for: ${request.params.name}`);

      if (request.params.name.startsWith(RUN_PROCESS_TOOL_NAME_PREFIX)) {
        const processId = request.params.name.replace(
          RUN_PROCESS_TOOL_NAME_PREFIX,
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
              processId,
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
        case runCodeToolNames.runCode:
          if (this.disableRunCodeTool) {
            this.logger.error("Run code tool is disabled");
            throw new McpError(
              ErrorCode.MethodNotFound,
              "Run code tool is disabled"
            );
          }
          return this.handleToolRequest(
            RunCodeSchema,
            request,
            async (data) => {
              const { code, options } = data;
              const logs: Log[] = [];
              let executionError: string | undefined;
              let returnValue: unknown;

              this.logger.info("Running code with YepCode", {
                codeLength: code.length,
                options,
              });

              const execution = await this.yepCodeRun.run(code, {
                removeOnDone: this.runCodeCleanup,
                ...options,
                initiatedBy: "@yepcode/mcp-server",
                onLog: (log) => {
                  logs.push(log);
                },
                onError: (error) => {
                  executionError = error.message;
                  this.logger.error("YepCode execution error", error as Error);
                },
                onFinish: (value) => {
                  returnValue = value;
                  this.logger.info("YepCode execution finished", {
                    hasReturnValue: value !== undefined,
                  });
                },
              });

              await execution.waitForDone();

              return {
                logs,
                returnValue,
                ...(executionError && { error: executionError }),
              };
            }
          );

        case envVarsToolNames.set:
          return this.handleToolRequest(
            SetEnvVarSchema,
            request,
            async (data) => {
              const { key, value, isSensitive } = data;
              this.logger.info(`Setting environment variable: ${key}`, {
                isSensitive,
              });
              await this.yepCodeEnv.setEnvVar(key, value, isSensitive);
              return {};
            }
          );

        case envVarsToolNames.remove:
          return this.handleToolRequest(
            RemoveEnvVarSchema,
            request,
            async (data) => {
              this.logger.info(`Removing environment variable: ${data.key}`);
              await this.yepCodeEnv.delEnvVar(data.key);
              return {};
            }
          );

        case getExecutionToolNames.getExecution:
          return this.handleToolRequest(
            GetExecutionSchema,
            request,
            async (data) => {
              return await this.executionResult(data.executionId);
            }
          );

        case storageToolNames.list:
          return this.handleToolRequest(
            ListObjectsSchema,
            request,
            async (data) => {
              const objects = await this.yepCodeApi.getObjects({
                prefix: data?.prefix || undefined,
              });
              return objects;
            }
          );
        case storageToolNames.upload:
          return this.handleToolRequest(
            UploadObjectSchema,
            request,
            async (data) => {
              const { filename, content } = data;

              let fileContent: string | Buffer;

              if (typeof content === "string") {
                fileContent = content;
              } else if (content.encoding === "base64") {
                fileContent = Buffer.from(content.data, "base64");
              } else {
                throw new Error("Invalid content format");
              }

              await this.yepCodeApi.createObject({
                name: filename,
                file: new Blob([fileContent]),
              });
              return { result: `Object ${filename} uploaded successfully` };
            }
          );
        case storageToolNames.download:
          return this.handleToolRequest(
            DownloadObjectSchema,
            request,
            async (data) => {
              const { filename } = data;
              const stream = await this.yepCodeApi.getObject(filename);

              const chunks: Buffer[] = [];
              for await (const chunk of stream) {
                chunks.push(Buffer.from(chunk));
              }
              const buffer = Buffer.concat(chunks);

              return {
                content: buffer.toString("base64"),
                encoding: "base64",
                filename,
                size: buffer.length,
              };
            }
          );
        case storageToolNames.delete:
          return this.handleToolRequest(
            DeleteObjectSchema,
            request,
            async (data) => {
              const { filename } = data;
              await this.yepCodeApi.deleteObject(filename);
              return { result: `Object ${filename} deleted successfully` };
            }
          );
        default:
          this.logger.error(`Unknown tool requested: ${request.params.name}`);
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }
}

export default YepCodeMcpServer;
