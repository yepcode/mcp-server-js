import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Process, YepCodeApi, YepCodeEnv } from "@yepcode/run";
import { isEmpty } from "../utils.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";

const RUN_PROCESS_TOOL_NAME_PREFIX = "run_ycp_";
const RUN_PROCESS_TOOL_TAG = "mcp-tool";

export const RunProcessSchema = {
  parameters: z.any().optional() as any,
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
};

async function registerProcessTool(
  server: McpServer,
  yepCodeApi: YepCodeApi,
  process: Process
) {
  let toolName = `${RUN_PROCESS_TOOL_NAME_PREFIX}${process.slug}`;
  if (toolName.length > 60) {
    toolName = `${RUN_PROCESS_TOOL_NAME_PREFIX}${process.id}`;
  }

  const inputSchema = RunProcessSchema;
  if (!isEmpty(process.parametersSchema)) {
    inputSchema.parameters = process.parametersSchema as any;
  } else {
    delete inputSchema.parameters;
  }

  server.registerTool(
    toolName,
    {
      description: process.description || process.name,
      inputSchema,
    },
    // @ts-ignore
    async (data: any) => {
      const { synchronousExecution = true, parameters, ...options } = data;
      const { executionId } = await yepCodeApi.executeProcessAsync(
        process.id,
        parameters,
        {
          ...options,
          initiatedBy: "@yepcode/mcp-server",
        }
      );

      return {
        isError: false,
        content: [{ type: "text", text: "Executed" }],
      };
    }
  );
  //   server.tool(
  //     toolName,
  //     `${process.name}${process.description ? ` - ${process.description}` : ""}`,
  //     {},
  //     async (data) => {
  //       const { synchronousExecution = true, parameters, ...options } = data;
  //       const { executionId } = await yepCodeApi.executeProcessAsync(
  //         processId,
  //         parameters,
  //         {
  //           ...options,
  //           initiatedBy: "@yepcode/mcp-server",
  //         }
  //       );

  //       return {
  //         content: [{ type: "text", text: `Execution ID: ${executionId}` }],
  //       };
  //     }
  //   );
}

export async function registerProcessesTools(
  server: McpServer,
  yepCodeApi: YepCodeApi
) {
  let page = 0;
  let limit = 100;
  while (true) {
    const processes = await yepCodeApi.getProcesses({ page, limit });
    if (!processes.data) {
      break;
    }
    processes.data
      .filter((process) => process.tags?.includes(RUN_PROCESS_TOOL_TAG))
      .forEach((process) => registerProcessTool(server, yepCodeApi, process));
    if (!processes.hasNextPage) {
      break;
    }
    page++;
  }
}
