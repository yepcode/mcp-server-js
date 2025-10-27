import { z } from "zod";

// Schema for getting executions with pagination and filtering
export const GetExecutionsSchema = z.object({
  keywords: z.string().optional().describe("Search keywords that apply to process name or execution comment (case-insensitive)"),
  processId: z.string().optional().describe("Filter executions by process ID (UUID)"),
  status: z.enum(["CREATED", "RUNNING", "FINISHED", "KILLED", "REJECTED", "ERROR"]).optional().describe("Filter executions by status"),
  from: z.string().optional().describe("Filter executions created from this date and time (ISO 8601 format)"),
  to: z.string().optional().describe("Filter executions created until this date and time (ISO 8601 format)"),
  page: z.number().int().min(0).default(0).optional().describe("Page number for pagination (0-based index)"),
  limit: z.number().int().min(1).max(100).default(10).optional().describe("Maximum number of executions to retrieve per page"),
});

// Schema for getting a specific execution
export const GetExecutionSchema = z.object({
  id: z.string().describe("Unique identifier (UUID) of the execution to retrieve"),
});

// Schema for killing an execution
export const KillExecutionSchema = z.object({
  id: z.string().describe("Unique identifier (UUID) of the execution to terminate"),
});

// Schema for rerunning an execution
export const RerunExecutionSchema = z.object({
  id: z.string().describe("Unique identifier (UUID) of the execution to rerun"),
});

// Schema for getting execution logs
export const GetExecutionLogsSchema = z.object({
  id: z.string().describe("Unique identifier (UUID) of the execution to get logs for"),
});

// Tool names
export const executionsToolNames = {
  getExecutions: "get_executions",
  getExecution: "get_execution",
  killExecution: "kill_execution",
  rerunExecution: "rerun_execution",
  getExecutionLogs: "get_execution_logs",
} as const;

// Tool definitions
export const executionsToolDefinitions = [
  {
    name: executionsToolNames.getExecutions,
    title: "Get Executions",
    description: "Retrieves a paginated list of process executions with optional filtering by keywords, process, status, and date range. Executions represent individual runs of processes.",
    inputSchema: {
      type: "object",
      properties: {
        keywords: {
          type: "string",
          description: "Search keywords that apply to process name or execution comment (case-insensitive)",
        },
        processId: {
          type: "string",
          description: "Filter executions by process ID (UUID)",
        },
        status: {
          type: "string",
          enum: ["CREATED", "QUEUED", "DEQUEUED", "RUNNING", "FINISHED", "KILLED", "REJECTED", "ERROR"],
          description: "Filter executions by status",
        },
        from: {
          type: "string",
          description: "Filter executions created from this date and time (ISO 8601 format)",
        },
        to: {
          type: "string",
          description: "Filter executions created until this date and time (ISO 8601 format)",
        },
        page: {
          type: "integer",
          format: "int32",
          default: 0,
          description: "Page number for pagination (0-based index)",
        },
        limit: {
          type: "integer",
          format: "int32",
          default: 10,
          description: "Maximum number of executions to retrieve per page",
        },
      },
    },
  },
  {
    name: executionsToolNames.getExecution,
    title: "Get Execution",
    description: "Retrieves detailed information about a specific execution including its status, parameters, results, and metadata.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Unique identifier (UUID) of the execution to retrieve",
        },
      },
      required: ["id"],
    },
  },
  {
    name: executionsToolNames.killExecution,
    title: "Kill Execution",
    description: "Terminates a running execution immediately. This operation sends a kill signal to stop the execution process and marks it as killed.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Unique identifier (UUID) of the execution to terminate",
        },
      },
      required: ["id"],
    },
  },
  {
    name: executionsToolNames.rerunExecution,
    title: "Rerun Execution",
    description: "Reruns a previously executed process with the same parameters and settings.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Unique identifier (UUID) of the execution to rerun",
        },
      },
      required: ["id"],
    },
  },
  {
    name: executionsToolNames.getExecutionLogs,
    title: "Get Execution Logs",
    description: "Retrieves the logs for a specific execution, including console output and error messages.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Unique identifier (UUID) of the execution to get logs for",
        },
      },
      required: ["id"],
    },
  },
];
