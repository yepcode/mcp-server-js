import { z } from "zod";

// Schema for getting processes with pagination and filtering
export const GetProcessesSchema = z.object({
  keywords: z
    .string()
    .optional()
    .describe(
      "Search keywords that apply to process name or description (case-insensitive)"
    ),
  tags: z
    .array(z.string())
    .optional()
    .describe("Filter processes by tags (array of tag names)"),
  page: z
    .number()
    .int()
    .min(0)
    .default(0)
    .optional()
    .describe("Page number for pagination (0-based index)"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .optional()
    .describe("Maximum number of processes to retrieve per page"),
});

// Schema for creating a process
export const CreateProcessSchema = z.object({
  name: z
    .string()
    .describe(
      "The name of the process. This will be displayed in the UI and used for identification."
    ),
  slug: z
    .string()
    .optional()
    .describe(
      "A unique identifier for the process. Used in URLs and API calls. Must be URL-safe (lowercase, hyphens, no spaces)."
    ),
  description: z
    .string()
    .optional()
    .describe(
      "A detailed description of what the process does. This helps users understand the process purpose and functionality."
    ),
  readme: z
    .string()
    .optional()
    .describe(
      "Markdown documentation for the process. This can include usage instructions, examples, and additional context."
    ),
  programmingLanguage: z
    .enum(["JAVASCRIPT", "PYTHON"])
    .describe(
      "The programming language used for the process source code. Supported languages are JAVASCRIPT and PYTHON."
    ),
  sourceCode: z
    .string()
    .describe(
      "The source code of the process. This is the executable code that will run when the process is executed."
    ),
  parametersSchema: z
    .string()
    .optional()
    .describe(
      "JSON Schema defining the input parameters for the process. This schema is used to generate forms in the UI and validate input data."
    ),
  webhook: z
    .record(z.any())
    .optional()
    .describe(
      "Webhook configuration for the process. Defines how the process can be triggered via HTTP webhooks."
    ),
  manifest: z
    .record(z.any())
    .optional()
    .describe(
      "Process manifest configuration. Contains metadata and configuration for the process deployment and execution."
    ),
  settings: z
    .record(z.any())
    .optional()
    .describe(
      "Process settings and configuration options. Includes publication settings, form configurations, and dependencies."
    ),
  tags: z
    .array(z.string())
    .optional()
    .describe(
      "Tags for categorizing and organizing processes. Used for filtering and grouping in the UI."
    ),
});

// Schema for getting a specific process
export const GetProcessSchema = z.object({
  identifier: z
    .string()
    .describe("Unique identifier of the process to retrieve (UUID or slug)"),
});

// Schema for deleting a process
export const DeleteProcessSchema = z.object({
  identifier: z
    .string()
    .describe("Unique identifier of the process to delete (UUID or slug)"),
});

// Schema for getting process versions
export const GetProcessVersionsSchema = z.object({
  processId: z.string().describe("Process ID"),
  page: z.number().int().min(0).default(0).optional().describe("Page number"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .optional()
    .describe("Amount of items to retrieve"),
});

// Schema for executing a process asynchronously
export const ExecuteProcessAsyncSchema = z.object({
  identifier: z
    .string()
    .describe(
      "Unique identifier of the process to execute asynchronously (UUID or slug)"
    ),
  parameters: z.record(z.any()).optional().describe("Process parameters"),
  initiatedBy: z
    .string()
    .optional()
    .describe("An identifier for the individual initiating the request"),
  settings: z.record(z.any()).optional().describe("Execution settings"),
});

// Schema for executing a process synchronously
export const ExecuteProcessSyncSchema = z.object({
  identifier: z
    .string()
    .describe(
      "Unique identifier of the process to execute synchronously (UUID or slug)"
    ),
  parameters: z.record(z.any()).optional().describe("Process parameters"),
  initiatedBy: z
    .string()
    .optional()
    .describe("An identifier for the individual initiating the request"),
  settings: z.record(z.any()).optional().describe("Execution settings"),
});

// Schema for scheduling a process
export const ScheduleProcessSchema = z.object({
  identifier: z
    .string()
    .describe("Unique identifier of the process to schedule (UUID or slug)"),
  parameters: z.record(z.any()).optional().describe("Process parameters"),
  type: z.enum(["PERIODIC", "ONCE"]).describe("Schedule type"),
  cron: z
    .string()
    .optional()
    .describe("Cron expression for PERIODIC schedules"),
  dateTime: z
    .string()
    .optional()
    .describe("Date and time for ONCE schedules (ISO format)"),
  settings: z.record(z.any()).optional().describe("Schedule settings"),
});

// Tool names
export const processesToolNames = {
  getProcesses: "get_processes",
  createProcess: "create_process",
  getProcess: "get_process",
  deleteProcess: "delete_process",
  getProcessVersions: "get_process_versions",
  executeProcessAsync: "execute_process_async",
  executeProcessSync: "execute_process_sync",
  scheduleProcess: "schedule_process",
} as const;

// Tool definitions
export const processesToolDefinitions = [
  {
    name: processesToolNames.getProcesses,
    title: "Get Processes",
    description:
      "Retrieves a paginated list of processes with optional filtering by keywords and tags. Processes are executable code units that can be scheduled or triggered manually.",
    inputSchema: {
      type: "object",
      properties: {
        keywords: {
          type: "string",
          description:
            "Search keywords that apply to process name or description (case-insensitive)",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Filter processes by tags (array of tag names)",
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
          description: "Maximum number of processes to retrieve per page",
        },
      },
    },
  },
  {
    name: processesToolNames.createProcess,
    title: "Create Process",
    description:
      "Creates a new process with source code, configuration, and metadata. The process can be written in JavaScript or Python and includes parameter schemas for form generation.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description:
            "The name of the process. This will be displayed in the UI and used for identification.",
        },
        slug: {
          type: "string",
          description:
            "A unique identifier for the process. Used in URLs and API calls. Must be URL-safe (lowercase, hyphens, no spaces).",
        },
        description: {
          type: "string",
          description:
            "A detailed description of what the process does. This helps users understand the process purpose and functionality.",
        },
        readme: {
          type: "string",
          description:
            "Markdown documentation for the process. This can include usage instructions, examples, and additional context.",
        },
        programmingLanguage: {
          type: "string",
          enum: ["JAVASCRIPT", "PYTHON"],
          description:
            "The programming language used for the process source code. Supported languages are JAVASCRIPT and PYTHON.",
        },
        sourceCode: {
          type: "string",
          description:
            "The source code of the process. This is the executable code that will run when the process is executed.",
        },
        parametersSchema: {
          type: "string",
          description:
            "JSON Schema defining the input parameters for the process. This schema is used to generate forms in the UI and validate input data.",
        },
        webhook: {
          type: "object",
          description:
            "Webhook configuration for the process. Defines how the process can be triggered via HTTP webhooks.",
        },
        manifest: {
          type: "object",
          description:
            "Process manifest configuration. Contains metadata and configuration for the process deployment and execution.",
        },
        settings: {
          type: "object",
          description:
            "Process settings and configuration options. Includes publication settings, form configurations, and dependencies.",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description:
            "Tags for categorizing and organizing processes. Used for filtering and grouping in the UI.",
        },
      },
      required: ["name", "programmingLanguage", "sourceCode"],
    },
  },
  {
    name: processesToolNames.getProcess,
    title: "Get Process",
    description:
      "Retrieves detailed information about a specific process including its configuration, source code, and metadata.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          description:
            "Unique identifier of the process to retrieve (UUID or slug)",
        },
      },
      required: ["identifier"],
    },
  },
  {
    name: processesToolNames.deleteProcess,
    title: "Delete Process",
    description:
      "Deletes a process and all its versions. This action cannot be undone.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          description:
            "Unique identifier of the process to delete (UUID or slug)",
        },
      },
      required: ["identifier"],
    },
  },
  {
    name: processesToolNames.getProcessVersions,
    title: "Get Process Versions",
    description:
      "Retrieves a paginated list of versions for a specific process.",
    inputSchema: {
      type: "object",
      properties: {
        processId: {
          type: "string",
          description: "Process ID",
        },
        page: {
          type: "integer",
          format: "int32",
          default: 0,
          description: "Page number",
        },
        limit: {
          type: "integer",
          format: "int32",
          default: 10,
          description: "Amount of items to retrieve",
        },
      },
      required: ["processId"],
    },
  },
  {
    name: processesToolNames.executeProcessAsync,
    title: "Execute Process Async",
    description:
      "Executes a process asynchronously and returns an execution ID for tracking.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          description:
            "Unique identifier of the process to execute asynchronously (UUID or slug)",
        },
        parameters: {
          type: "object",
          description: "Process parameters",
        },
        initiatedBy: {
          type: "string",
          description:
            "An identifier for the individual initiating the request",
        },
        settings: {
          type: "object",
          description: "Execution settings",
        },
      },
      required: ["identifier"],
    },
  },
  {
    name: processesToolNames.executeProcessSync,
    title: "Execute Process Sync",
    description: "Executes a process synchronously and waits for completion.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          description:
            "Unique identifier of the process to execute synchronously (UUID or slug)",
        },
        parameters: {
          type: "object",
          description: "Process parameters",
        },
        initiatedBy: {
          type: "string",
          description:
            "An identifier for the individual initiating the request",
        },
        settings: {
          type: "object",
          description: "Execution settings",
        },
      },
      required: ["identifier"],
    },
  },
  {
    name: processesToolNames.scheduleProcess,
    title: "Schedule Process",
    description:
      "Creates a schedule for a process to run automatically at specified times.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          description:
            "Unique identifier of the process to schedule (UUID or slug)",
        },
        parameters: {
          type: "object",
          description: "Process parameters",
        },
        type: {
          type: "string",
          enum: ["PERIODIC", "ONCE"],
          description: "Schedule type",
        },
        cron: {
          type: "string",
          description: "Cron expression for PERIODIC schedules",
        },
        dateTime: {
          type: "string",
          description: "Date and time for ONCE schedules (ISO format)",
        },
        settings: {
          type: "object",
          description: "Schedule settings",
        },
      },
      required: ["identifier", "type"],
    },
  },
];
