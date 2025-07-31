import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const getExecutionToolNames = {
  getExecution: "get_execution",
};

export const GetExecutionSchema = z.object({
  executionId: z.string(),
});

export const getExecutionToolDefinitions = [
  {
    name: getExecutionToolNames.getExecution,
    title: "Get process execution",
    description:
      "Get the status, result, logs, timeline, etc. of a YepCode execution",
    inputSchema: zodToJsonSchema(GetExecutionSchema),
  },
];
