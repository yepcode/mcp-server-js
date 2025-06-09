#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getVersion } from "./utils.js";
import { registerEnvVarsTools } from "./tools/env-vars.js";
import {
  YepCodeApi,
  YepCodeApiConfig,
  YepCodeEnv,
  YepCodeRun,
} from "@yepcode/run";
import { registerRunCodeTools } from "./tools/run-code.js";
import { registerProcessesTools } from "./tools/processes.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

let disableRunCodeTool = false;
let skipRunCodeCleanup = false;
if (process.env.YEPCODE_MCP_OPTIONS) {
  const mcpOptions = process.env.YEPCODE_MCP_OPTIONS.split(",");
  disableRunCodeTool = mcpOptions.includes("disableRunCodeTool");
  skipRunCodeCleanup = mcpOptions.includes("skipRunCodeCleanup");
}

export const configSchema = z.object({
  yepcodeApiToken: z
    .string()
    .describe(
      "YepCode API token, obtained from https://cloud.yepcode.io/<your-team>/settings/api-credentials"
    ),
});

export default function createStatelessServer({
  config,
}: {
  config: z.infer<typeof configSchema>;
}) {
  try {
    const server = new McpServer({
      name: "YepCode MCP Server",
      version: getVersion(),
    });

    let yepCodeEnv;
    let yepCodeRun;
    let yepCodeApi;
    if (config.yepcodeApiToken) {
      const yepCodeApiConfig: YepCodeApiConfig = {
        apiToken: config.yepcodeApiToken,
      };
      yepCodeEnv = new YepCodeEnv(yepCodeApiConfig);
      yepCodeRun = new YepCodeRun(yepCodeApiConfig);
      yepCodeApi = new YepCodeApi(yepCodeApiConfig);
    } else {
      yepCodeEnv = {
        getEnvVars: async () => [],
      } as unknown as YepCodeEnv;
      yepCodeRun = {} as YepCodeRun;
      yepCodeApi = {
        getProcesses: async () => ({
          data: [],
          hasNextPage: false,
        }),
      } as unknown as YepCodeApi;
    }

    registerRunCodeTools(server, yepCodeRun, yepCodeEnv);
    registerEnvVarsTools(server, yepCodeEnv);
    registerProcessesTools(server, yepCodeApi);

    return server.server;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

if (process.env.STANDALONE !== "false") {
  const transport = new StdioServerTransport();
  const server = createStatelessServer({
    config: {
      yepcodeApiToken: process.env.YEPCODE_API_TOKEN || "",
    },
  });
  server.connect(transport).catch(console.error);
}
