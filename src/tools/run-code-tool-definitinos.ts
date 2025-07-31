import { EnvVar } from "@yepcode/run";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const runCodeToolNames = {
  runCode: "run_code",
};

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

export const getCodingRules = async (): Promise<string> => {
  try {
    let rulesMdFile = await fetch(
      "https://yepcode.io/docs/yepcode-coding-rules.md"
    ).then((res) => res.text());
    rulesMdFile = rulesMdFile.substring(
      rulesMdFile.indexOf("## General Rules")
    );
    rulesMdFile = rulesMdFile.replace(
      /(\[Section titled “.*”\]\(#.*\)\n)/g,
      ""
    );

    return `Here you can find the general rules for YepCode coding:

      ${rulesMdFile}`;
  } catch (error) {
    return "";
  }
};

export const buildRunCodeSchema = (envVars: string[], codingRules: string) => {
  return z.object({
    code: z.string().describe(`${codingRules}

    ${
      envVars &&
      envVars.length > 0 &&
      `## YepCode Environment Variables

  You may use the following environment variables already set in the execution context: ${envVars.join(
    ", "
  )}.`
    }`),
    options: RunCodeOptionsSchema,
  });
};

export const RunCodeSchema = buildRunCodeSchema([], "");

export type RunCodeRequestSchema = z.infer<typeof RunCodeSchema>;

export interface RunCodeResultSchema {
  returnValue?: unknown;
  logs: Array<typeof LogSchema>;
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

export const runCodeToolDefinitions = async (envVars: EnvVar[]) => {
  const codingRules = await getCodingRules();
  return [
    {
      name: runCodeToolNames.runCode,
      title:
        "Execute LLM-generated code in YepCode’s remote and secure sandboxes",
      description: `This tool is ideal when your AI agent needs to handle tasks that don’t have a predefined tool available — but could be solved by writing and running a custom script.

It supports JavaScript and Python, both with external dependencies (NPM or PyPI), so it’s perfect for:
* Complex data transformations
* API calls to services not yet integrated
* Custom logic implementations
* One-off utility scripts
* To use files as input, first upload them to YepCode Storage using the upload storage MCP tools. Then, access them in your code using the \`yepcode.storage\` helper methods to download the files.
*	To generate and output files, create them in the local execution storage, then upload them to YepCode Storage using the \`yepcode.storage\` helpers. Once uploaded, you can download them using the download storage MCP tool.

Tip: First try to find a tool that matches your task, but if not available, try generating the code and running it here.`,
      inputSchema: zodToJsonSchema(
        buildRunCodeSchema(
          envVars.map((envVar) => envVar.key),
          codingRules
        )
      ),
    },
  ];
};
