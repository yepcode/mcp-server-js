import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { YepCodeEnv } from "@yepcode/run";
import { z } from "zod";

export const registerEnvVarsTools = (
  server: McpServer,
  yepCodeEnv: YepCodeEnv
) => {
  server.tool(
    "set_env_var",
    "Set a YepCode environment variable to be available for future code executions",
    {
      key: z.string().describe("The key of the environment variable to set"),
      value: z
        .string()
        .describe("The value of the environment variable to set"),
      isSensitive: z
        .boolean()
        .optional()
        .default(true)
        .describe("Whether the environment variable is sensitive"),
    },
    async ({ key, value, isSensitive }) => {
      try {
        console.log("setting env var", key, value, isSensitive);
        await yepCodeEnv.setEnvVar(key, value, isSensitive);
        return {
          content: [
            {
              type: "text",
              text: `Environment variable '${key}' set successfully`,
            },
          ],
        };
      } catch (e: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Error: ${e.message}` }],
        };
      }
    }
  );

  server.tool(
    "remove_env_var",
    "Remove a YepCode environment variable",
    {
      key: z.string().describe("The key of the environment variable to remove"),
    },
    async ({ key }) => {
      try {
        await yepCodeEnv.delEnvVar(key);
        return {
          content: [{ type: "text", text: "Environment variable removed" }],
        };
      } catch (e: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Error: ${e.message}` }],
        };
      }
    }
  );
};
