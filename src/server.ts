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
  GetStorageObjectsSchema,
  UploadStorageObjectSchema,
  DownloadStorageObjectSchema,
  DeleteStorageObjectSchema,
  storageToolDefinitions,
  storageToolNames,
} from "./tools/storage-tool-definitions.js";
import {
  GetVariablesSchema,
  CreateVariableSchema,
  UpdateVariableSchema,
  DeleteVariableSchema,
  variablesToolDefinitions,
  variablesToolNames,
} from "./tools/variables-tool-definitions.js";
import {
  runCodeToolDefinitions,
  RunCodeSchema,
  ExecutionResultSchema,
  RunProcessSchema,
  runCodeToolNames,
} from "./tools/run-code-tool-definitinos.js";
import {
  GetSchedulesSchema,
  GetScheduleSchema,
  PauseScheduleSchema,
  ResumeScheduleSchema,
  DeleteScheduleSchema,
  schedulesToolDefinitions,
  schedulesToolNames,
} from "./tools/schedules-tool-definitions.js";
import {
  GetProcessesSchema,
  CreateProcessSchema,
  GetProcessSchema,
  UpdateProcessSchema,
  DeleteProcessSchema,
  GetProcessVersionsSchema,
  ExecuteProcessAsyncSchema,
  ExecuteProcessSyncSchema,
  ScheduleProcessSchema,
  processesToolDefinitions,
  processesToolNames,
} from "./tools/processes-tool-definitions.js";
import {
  GetExecutionsSchema,
  GetExecutionSchema,
  KillExecutionSchema,
  RerunExecutionSchema,
  GetExecutionLogsSchema,
  executionsToolDefinitions,
  executionsToolNames,
} from "./tools/executions-tool-definitions.js";
import {
  GetModulesSchema,
  CreateModuleSchema,
  GetModuleSchema,
  DeleteModuleSchema,
  GetModuleVersionsSchema,
  GetModuleVersionSchema,
  DeleteModuleVersionSchema,
  GetModuleAliasesSchema,
  modulesToolDefinitions,
  modulesToolNames,
} from "./tools/modules-tool-definitions.js";

const RUN_PROCESS_TOOL_NAME_PREFIX = "yc_";
const RUN_PROCESS_TOOL_TAG = "mcp-tool";
const RUN_CODE_TOOL_TAG = "run_code";
const API_TOOL_TAG = "yc_api";

const DEFAULT_TOOL_TAGS = [RUN_CODE_TOOL_TAG, RUN_PROCESS_TOOL_TAG];

dotenv.config();

class YepCodeMcpServer extends Server {
  private yepCodeRun: YepCodeRun;
  private yepCodeEnv: YepCodeEnv;
  private yepCodeApi: YepCodeApi;
  private logger: Logger;
  private tools: string[];
  private runCodeCleanup: boolean;
  constructor(
    config: YepCodeApiConfig,
    {
      logsToStderr = false,
      tools = DEFAULT_TOOL_TAGS,
      runCodeCleanup = false,
    }: {
      logsToStderr?: boolean;
      tools?: string[];
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

    this.tools = tools;
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
      const tools = [];
      if (this.tools.includes(API_TOOL_TAG)) {
        tools.push(...storageToolDefinitions);
        tools.push(...variablesToolDefinitions);
        tools.push(...schedulesToolDefinitions);
        tools.push(...processesToolDefinitions);
        tools.push(...executionsToolDefinitions);
        tools.push(...modulesToolDefinitions);
      }
      if (this.tools.includes(RUN_CODE_TOOL_TAG)) {
        const envVars = await this.yepCodeEnv.getEnvVars();
        tools.push(...(await runCodeToolDefinitions(envVars)));
      }

      let page = 0;
      let limit = 100;
      while (true) {
        const processes = await this.yepCodeApi.getProcesses({
          page,
          limit,
          tags: this.tools,
        });
        this.logger.info(`Found ${processes?.data?.length} processes`);
        if (!processes.data) {
          break;
        }
        tools.push(
          ...processes.data.map((process) => {
            const inputSchema = zodToJsonSchema(RunProcessSchema) as any;
            if (!isEmpty(process.parametersSchema)) {
              inputSchema.properties.parameters = process.parametersSchema;
            } else {
              delete inputSchema.properties.parameters;
            }
            let toolName = process.slug;
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
          if (!this.tools.includes(RUN_CODE_TOOL_TAG)) {
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

        case variablesToolNames.getVariables:
          return this.handleToolRequest(
            GetVariablesSchema,
            request,
            async (data) => {
              const variables = await this.yepCodeApi.getVariables({
                page: data.page,
                limit: data.limit,
              });
              return variables;
            }
          );

        case variablesToolNames.createVariable:
          return this.handleToolRequest(
            CreateVariableSchema,
            request,
            async (data) => {
              const variable = await this.yepCodeApi.createVariable({
                key: data.key,
                value: data.value,
                isSensitive: data.isSensitive,
              });
              return variable;
            }
          );

        case variablesToolNames.updateVariable:
          return this.handleToolRequest(
            UpdateVariableSchema,
            request,
            async (data) => {
              const updateData: any = {};
              if (data.value !== undefined) {
                updateData.value = data.value;
              }
              if (data.isSensitive !== undefined) {
                updateData.isSensitive = data.isSensitive;
              }
              const variable = await this.yepCodeApi.updateVariable(
                data.id,
                updateData
              );
              return variable;
            }
          );

        case variablesToolNames.deleteVariable:
          return this.handleToolRequest(
            DeleteVariableSchema,
            request,
            async (data) => {
              await this.yepCodeApi.deleteVariable(data.id);
              return { result: `Variable ${data.id} deleted successfully` };
            }
          );

        case storageToolNames.getStorageObjects:
          return this.handleToolRequest(
            GetStorageObjectsSchema,
            request,
            async (data) => {
              const objects = await this.yepCodeApi.getObjects({
                prefix: data.prefix,
              });
              return objects;
            }
          );

        case storageToolNames.uploadStorageObject:
          return this.handleToolRequest(
            UploadStorageObjectSchema,
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
                file: new Blob([fileContent as BlobPart]),
              });
              return { result: `Object ${filename} uploaded successfully` };
            }
          );

        case storageToolNames.downloadStorageObject:
          return this.handleToolRequest(
            DownloadStorageObjectSchema,
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

        case storageToolNames.deleteStorageObject:
          return this.handleToolRequest(
            DeleteStorageObjectSchema,
            request,
            async (data) => {
              const { filename } = data;
              await this.yepCodeApi.deleteObject(filename);
              return { result: `Object ${filename} deleted successfully` };
            }
          );

        case schedulesToolNames.getSchedules:
          return this.handleToolRequest(
            GetSchedulesSchema,
            request,
            async (data) => {
              const schedules = await this.yepCodeApi.getSchedules({
                page: data.page,
                limit: data.limit,
                processId: data.processId,
                keywords: data.keywords,
              });
              return schedules;
            }
          );

        case schedulesToolNames.getSchedule:
          return this.handleToolRequest(
            GetScheduleSchema,
            request,
            async (data) => {
              const schedule = await this.yepCodeApi.getSchedule(data.id);
              return schedule;
            }
          );

        case schedulesToolNames.pauseSchedule:
          return this.handleToolRequest(
            PauseScheduleSchema,
            request,
            async (data) => {
              await this.yepCodeApi.pauseSchedule(data.id);
              return { result: `Schedule ${data.id} paused successfully` };
            }
          );

        case schedulesToolNames.resumeSchedule:
          return this.handleToolRequest(
            ResumeScheduleSchema,
            request,
            async (data) => {
              await this.yepCodeApi.resumeSchedule(data.id);
              return { result: `Schedule ${data.id} resumed successfully` };
            }
          );

        case schedulesToolNames.deleteSchedule:
          return this.handleToolRequest(
            DeleteScheduleSchema,
            request,
            async (data) => {
              await this.yepCodeApi.deleteSchedule(data.id);
              return { result: `Schedule ${data.id} deleted successfully` };
            }
          );

        case processesToolNames.getProcesses:
          return this.handleToolRequest(
            GetProcessesSchema,
            request,
            async (data) => {
              const processes = await this.yepCodeApi.getProcesses({
                keywords: data.keywords,
                tags: data.tags,
                page: data.page,
                limit: data.limit,
              });
              return processes;
            }
          );

        case processesToolNames.createProcess:
          return this.handleToolRequest(
            CreateProcessSchema,
            request,
            async (data) => {
              const process = await this.yepCodeApi.createProcess({
                name: data.name,
                description: data.description,
                slug: data.slug,
                readme: data.readme,
                programmingLanguage: data.programmingLanguage,
                sourceCode: data.sourceCode,
                parametersSchema: data.parametersSchema,
                webhook: data.webhook,
                manifest: data.manifest,
                tags: data.tags,
                settings: data.settings,
              });
              return process;
            }
          );

        case processesToolNames.getProcess:
          return this.handleToolRequest(
            GetProcessSchema,
            request,
            async (data) => {
              const process = await this.yepCodeApi.getProcess(data.identifier);
              return process;
            }
          );

        case processesToolNames.updateProcess:
          return this.handleToolRequest(
            UpdateProcessSchema,
            request,
            async (data) => {
              const { identifier, ...rest } = data;
              const process = await this.yepCodeApi.updateProcess(
                identifier,
                rest
              );
              return process;
            }
          );

        case processesToolNames.deleteProcess:
          return this.handleToolRequest(
            DeleteProcessSchema,
            request,
            async (data) => {
              await this.yepCodeApi.deleteProcess(data.identifier);
              return {
                result: `Process ${data.identifier} deleted successfully`,
              };
            }
          );

        case processesToolNames.getProcessVersions:
          return this.handleToolRequest(
            GetProcessVersionsSchema,
            request,
            async (data) => {
              const versions = await this.yepCodeApi.getProcessVersions(
                data.processId,
                {
                  page: data.page,
                  limit: data.limit,
                }
              );
              return versions;
            }
          );

        case processesToolNames.executeProcessAsync:
          return this.handleToolRequest(
            ExecuteProcessAsyncSchema,
            request,
            async (data) => {
              // Normalize parameters: parse JSON string if needed
              let params: Record<string, any> | undefined;
              if (typeof data.parameters === "string") {
                try {
                  params = JSON.parse(data.parameters);
                } catch (error) {
                  throw new Error(
                    `Invalid JSON string for parameters: ${error}`
                  );
                }
              } else {
                params = data.parameters;
              }

              const { executionId } = await this.yepCodeApi.executeProcessAsync(
                data.identifier,
                params,
                {
                  initiatedBy: data.initiatedBy || "@yepcode/mcp-server",
                  tag: data.tag,
                  comment: data.comment,
                  ...data.settings,
                }
              );
              return { executionId };
            }
          );

        case processesToolNames.executeProcessSync:
          return this.handleToolRequest(
            ExecuteProcessSyncSchema,
            request,
            async (data) => {
              // Normalize parameters: parse JSON string if needed
              let params: Record<string, any> | undefined;
              if (typeof data.parameters === "string") {
                try {
                  params = JSON.parse(data.parameters);
                } catch (error) {
                  throw new Error(
                    `Invalid JSON string for parameters: ${error}`
                  );
                }
              } else {
                params = data.parameters;
              }

              const result = await this.yepCodeApi.executeProcessSync(
                data.identifier,
                params,
                {
                  initiatedBy: data.initiatedBy || "@yepcode/mcp-server",
                  tag: data.tag,
                  comment: data.comment,
                  ...data.settings,
                }
              );
              return result;
            }
          );

        case processesToolNames.scheduleProcess:
          return this.handleToolRequest(
            ScheduleProcessSchema,
            request,
            async (data) => {
              const schedule = await this.yepCodeApi.createSchedule(
                data.identifier,
                {
                  cron: data.cron,
                  dateTime: data.dateTime,
                }
              );
              return schedule;
            }
          );

        case executionsToolNames.getExecutions:
          return this.handleToolRequest(
            GetExecutionsSchema,
            request,
            async (data) => {
              const executions = await this.yepCodeApi.getExecutions({
                keywords: data.keywords,
                processId: data.processId,
                status: data.status,
                from: data.from,
                to: data.to,
                page: data.page,
                limit: data.limit,
              });
              return executions;
            }
          );

        case executionsToolNames.getExecution:
          return this.handleToolRequest(
            GetExecutionSchema,
            request,
            async (data) => {
              const execution = await this.yepCodeApi.getExecution(data.id);
              return execution;
            }
          );

        case executionsToolNames.killExecution:
          return this.handleToolRequest(
            KillExecutionSchema,
            request,
            async (data) => {
              await this.yepCodeApi.killExecution(data.id);
              return { result: `Execution ${data.id} killed successfully` };
            }
          );

        case executionsToolNames.rerunExecution:
          return this.handleToolRequest(
            RerunExecutionSchema,
            request,
            async (data) => {
              const execution = await this.yepCodeApi.rerunExecution(data.id);
              return execution;
            }
          );

        case executionsToolNames.getExecutionLogs:
          return this.handleToolRequest(
            GetExecutionLogsSchema,
            request,
            async (data) => {
              const logs = await this.yepCodeApi.getExecutionLogs(data.id);
              return logs;
            }
          );

        case modulesToolNames.getModules:
          return this.handleToolRequest(
            GetModulesSchema,
            request,
            async (data) => {
              const modules = await this.yepCodeApi.getModules({
                page: data.page,
                limit: data.limit,
              });
              return modules;
            }
          );

        case modulesToolNames.createModule:
          return this.handleToolRequest(
            CreateModuleSchema,
            request,
            async (data) => {
              const module = await this.yepCodeApi.createModule({
                name: data.name,
              });
              return module;
            }
          );

        case modulesToolNames.getModule:
          return this.handleToolRequest(
            GetModuleSchema,
            request,
            async (data) => {
              const module = await this.yepCodeApi.getModule(data.id);
              return module;
            }
          );

        case modulesToolNames.deleteModule:
          return this.handleToolRequest(
            DeleteModuleSchema,
            request,
            async (data) => {
              await this.yepCodeApi.deleteModule(data.id);
              return { result: `Module ${data.id} deleted successfully` };
            }
          );

        case modulesToolNames.getModuleVersions:
          return this.handleToolRequest(
            GetModuleVersionsSchema,
            request,
            async (data) => {
              const versions = await this.yepCodeApi.getModuleVersions(
                data.moduleId,
                {
                  page: data.page,
                  limit: data.limit,
                }
              );
              return versions;
            }
          );

        case modulesToolNames.getModuleVersion:
          return this.handleToolRequest(
            GetModuleVersionSchema,
            request,
            async (data) => {
              // Note: getModuleVersion method doesn't exist in YepCodeApi
              throw new Error(
                "getModuleVersion method not available in YepCodeApi"
              );
            }
          );

        case modulesToolNames.deleteModuleVersion:
          return this.handleToolRequest(
            DeleteModuleVersionSchema,
            request,
            async (data) => {
              // Note: deleteModuleVersion method doesn't exist in YepCodeApi
              throw new Error(
                "deleteModuleVersion method not available in YepCodeApi"
              );
            }
          );

        case modulesToolNames.getModuleAliases:
          return this.handleToolRequest(
            GetModuleAliasesSchema,
            request,
            async (data) => {
              // Note: getModuleAliases method doesn't exist in YepCodeApi
              throw new Error(
                "getModuleAliases method not available in YepCodeApi"
              );
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
