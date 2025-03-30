import { z } from "zod";

export const LogSchema = z.object({
  timestamp: z.string(),
  level: z.string(),
  message: z.string(),
});

export const RunCodeOptionsSchema = z.object({
  language: z
    .string()
    .optional()
    .describe(
      "The language to be used to run the code. We support javascript or python."
    ),
  comment: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
});

export const buildRunCodeSchema = (envVars: string[]) => {
  return z.object({
    code: z.string().describe(`
  * We support JavaScript or Python.
  ${
    envVars &&
    envVars.length > 0 &&
    `* You may use the following environment variables already set in the execution context: ${envVars.join(
      ", "
    )}.`
  }
  * Use external dependencies freely from npm or pip. You should import them as usually, also add an anotation for us to detect them (\`// @add-package package_name\` (javascript) or \`# @add-package package_name\` (python)). When possible, use binary packages to avoid compilation issues.
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
  });
};

export const RunCodeSchema = buildRunCodeSchema([]);

export type RunCodeRequestSchema = z.infer<typeof RunCodeSchema>;

export interface RunCodeResultSchema {
  success: boolean;
  returnValue?: unknown;
  logs: Array<typeof LogSchema>;
  error?: string;
}

export const EnvVarKeySchema = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/);

export const SetEnvVarSchema = z.object({
  key: EnvVarKeySchema,
  value: z.string(),
  isSensitive: z.boolean().optional().default(true),
});

export const RemoveEnvVarSchema = z.object({
  key: EnvVarKeySchema,
});

export type SetEnvVarRequestSchema = z.infer<typeof SetEnvVarSchema>;
export type RemoveEnvVarRequestSchema = z.infer<typeof RemoveEnvVarSchema>;

export interface EnvVarResultSchema {
  success: boolean;
  error?: string;
}

export const RunProcessSchema = z.object({
  parameters: z.any().optional(),
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
});

export const GetExecutionSchema = z.object({
  executionId: z.string(),
});

export const ExecutionResultSchema = z.object({
  executionId: z.string(),
  logs: z.array(LogSchema),
  processId: z.string(),
  status: z.string(),
  timeline: z.array(z.any()),
  returnValue: z.any().optional(),
  error: z.string().optional(),
});

export type ExecutionResultSchema = z.infer<typeof ExecutionResultSchema>;

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
