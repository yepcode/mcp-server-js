import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Log, YepCodeEnv, YepCodeRun } from "@yepcode/run";
import { z } from "zod";

const RunCodeOptionsSchema = z.object({
  language: z
    .string()
    .optional()
    .describe(
      "The language to be used to run the code. We support javascript or python."
    ),
  comment: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
});

const buildRunCodeSchema = (envVars: string[]) => {
  return {
    code: z.string().describe(`
  * We support JavaScript (NodeJS v20) or Python (v3.12).
  ${
    envVars &&
    envVars.length > 0 &&
    `* You may use the following environment variables already set in the execution context: ${envVars.join(
      ", "
    )}.`
  }
  * Use external dependencies freely from NPM or PyPI. You should import them as usually.
    * If package name is different from the import sentence, add an anotation for us to detect them (\`// @add-package package_name\` (javascript) or \`# @add-package package_name\` (python)).
    * When possible, use binary packages to avoid compilation issues.
  * Include debugging logs (\`console.log()\` in javascript or \`print()\` in python) if necessary for execution tracking and error debugging.
  * Do not catch errors, let them fail the execution.
  * Follow the required script structure based on the chosen language:

  \`\`\`js
  // @add-package package_name_1
  const package_name_1 = require("package_name_1");
  // @add-package package_name_2
  const package_name_2 = require("package_name_2");

  async function main() {
      // The generated code should go here
      return {"success": true, "data": result}
  }

  module.exports = { main }
  \`\`\`

  \`\`\`py
  # @add-package package_name_1
  import package_name_1
  # @add-package package_name_2
  from package_name_2.module import Module

  def main():
      # The generated code should go here
      return {"success": True, "data": result}
  \`\`\`
  `),
    options: RunCodeOptionsSchema,
  };
};

export const registerRunCodeTools = async (
  server: McpServer,
  yepCodeRun: YepCodeRun,
  yepCodeEnv: YepCodeEnv
) => {
  const envVars = await yepCodeEnv.getEnvVars();
  server.tool(
    "run_code",
    `Execute LLM-generated code safely in YepCode's secure, production-grade sandboxes.
    This tool is ideal when your AI agent needs to handle tasks that don't have a predefined tool available — but could be solved by writing and running a custom script.

    It supports external dependencies (NPM or PyPI), so it's perfect for:
    	•	Complex data transformations
    	•	API calls to services not yet integrated
    	•	Custom logic implementations
    	•	One-off utility scripts

    Tip: First try to find a tool that matches your task, but if not available, try generating the code and running it here!`,
    buildRunCodeSchema(envVars.map((envVar) => envVar.key)),
    async ({ code, options }) => {
      try {
        const logs: Log[] = [];
        let executionError: string | undefined;
        let returnValue: unknown;
        const execution = await yepCodeRun.run(code, {
          // removeOnDone: !this.skipRunCodeCleanup,
          initiatedBy: "@yepcode/mcp-server",
          onLog: (log) => {
            logs.push(log);
          },
          onError: (error) => {
            executionError = error.message;
          },
          onFinish: (value) => {
            returnValue = value;
          },
          ...options,
        });
        execution.waitForDone();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  logs,
                  returnValue,
                  ...(executionError && { error: executionError }),
                },
                null,
                2
              ),
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
};
