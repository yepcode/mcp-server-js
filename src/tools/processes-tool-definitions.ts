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

// Schema for updating a process
export const UpdateProcessSchema = z.object({
  identifier: z
    .string()
    .describe("Unique identifier of the process to update (UUID or slug)"),
  name: z
    .string()
    .optional()
    .describe(
      "The updated name of the process. This will be displayed in the UI and used for identification."
    ),
  slug: z
    .string()
    .optional()
    .describe(
      "The updated unique identifier for the process. Used in URLs and API calls. Must be URL-safe (lowercase, hyphens, no spaces)."
    ),
  description: z
    .string()
    .optional()
    .describe(
      "The updated detailed description of what the process does. This helps users understand the process purpose and functionality."
    ),
  readme: z
    .string()
    .optional()
    .describe(
      "The updated markdown documentation for the process. This can include usage instructions, examples, and additional context."
    ),
  sourceCode: z
    .string()
    .optional()
    .describe(
      "The updated source code of the process. This is the executable code that will run when the process is executed."
    ),
  parametersSchema: z
    .string()
    .optional()
    .describe(
      "The updated JSON Schema defining the input parameters for the process. This schema is used to generate forms in the UI and validate input data."
    ),
  webhook: z
    .record(z.any())
    .optional()
    .describe(
      "Updated webhook configuration for the process. Defines how the process can be triggered via HTTP webhooks."
    ),
  settings: z
    .record(z.any())
    .optional()
    .describe(
      "Updated process settings and configuration options. Includes publication settings, form configurations, and dependencies."
    ),
  manifest: z
    .record(z.any())
    .optional()
    .describe(
      "Updated process manifest configuration. Contains metadata and configuration for the process deployment and execution."
    ),
  tags: z
    .array(z.string())
    .optional()
    .describe(
      "Updated tags for categorizing and organizing processes. Used for filtering and grouping in the UI."
    ),
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

// Schema for publishing a process version
export const PublishProcessVersionSchema = z.object({
  processId: z.string().describe("Process ID"),
  tag: z.string().optional().describe("Version tag"),
  readme: z.string().optional().describe("Version readme"),
  comment: z.string().optional().describe("Version comment"),
  sourceCode: z.string().optional().describe("Process source code"),
  parametersSchema: z
    .string()
    .optional()
    .describe(
      "JSON Schema defining the input parameters for the process version"
    ),
});

// Schema for getting a specific process version
export const GetProcessVersionSchema = z.object({
  processId: z.string().describe("Process ID"),
  versionId: z.string().describe("Version ID"),
});

// Schema for deleting a process version
export const DeleteProcessVersionSchema = z.object({
  processId: z.string().describe("Process ID"),
  versionId: z.string().describe("Version ID"),
});

// Schema for getting process version aliases
export const GetProcessVersionAliasesSchema = z.object({
  processId: z.string().describe("Process ID"),
  versionId: z.string().optional().describe("Version ID"),
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

// Schema for creating a process version alias
export const CreateProcessVersionAliasSchema = z.object({
  processId: z.string().describe("Process ID"),
  name: z.string().describe("Alias name"),
  versionId: z.string().describe("The version id of the process being aliased"),
});

// Schema for getting a specific process version alias
export const GetProcessVersionAliasSchema = z.object({
  processId: z.string().describe("Process ID"),
  aliasId: z.string().describe("Alias ID"),
});

// Schema for deleting a process version alias
export const DeleteProcessVersionAliasSchema = z.object({
  processId: z.string().describe("Process ID"),
  aliasId: z.string().describe("Alias ID"),
});

// Schema for updating a process version alias
export const UpdateProcessVersionAliasSchema = z.object({
  processId: z.string().describe("Process ID"),
  aliasId: z.string().describe("Alias ID"),
  name: z.string().optional().describe("Alias name"),
  versionId: z
    .string()
    .optional()
    .describe("The version id of the process being aliased"),
});

// Schema for execution settings
export const ExecuteProcessSettingsSchema = z.object({
  agentPoolSlug: z.string().optional().describe("Agent pool where to execute"),
  callbackUrl: z
    .string()
    .optional()
    .describe(
      "URL to receive execution results upon completion (success or failure)"
    ),
});

// Schema for executing a process asynchronously
export const ExecuteProcessAsyncSchema = z.object({
  identifier: z
    .string()
    .describe(
      "Unique identifier of the process to execute asynchronously (UUID or slug)"
    ),
  parameters: z
    .any()
    .optional()
    .describe(
      "Process parameters (JSON string or object). Must match the process parameter schema."
    ),
  tag: z
    .string()
    .optional()
    .describe("A version tag or an alias of the version"),
  comment: z
    .string()
    .optional()
    .describe("Optional comment or description for this execution"),
  initiatedBy: z
    .string()
    .optional()
    .describe("An identifier for the individual initiating the request"),
  settings: ExecuteProcessSettingsSchema.optional().describe(
    "Execution-specific settings and configuration options"
  ),
});

// Schema for executing a process synchronously
export const ExecuteProcessSyncSchema = z.object({
  identifier: z
    .string()
    .describe(
      "Unique identifier of the process to execute synchronously (UUID or slug)"
    ),
  parameters: z
    .any()
    .optional()
    .describe(
      "Process parameters (JSON string or object). Must match the process parameter schema."
    ),
  tag: z
    .string()
    .optional()
    .describe("A version tag or an alias of the version"),
  comment: z
    .string()
    .optional()
    .describe("Optional comment or description for this execution"),
  initiatedBy: z
    .string()
    .optional()
    .describe("An identifier for the individual initiating the request"),
  settings: ExecuteProcessSettingsSchema.optional().describe(
    "Execution-specific settings and configuration options"
  ),
});

// Schema for scheduling a process
export const ScheduleProcessSchema = z.object({
  identifier: z
    .string()
    .describe("Unique identifier of the process to schedule (UUID or slug)"),
  cron: z
    .string()
    .optional()
    .describe(
      "Cron expression defining when the process should be executed. Uses standard cron syntax (minute hour day month dayOfWeek)."
    ),
  dateTime: z
    .string()
    .datetime()
    .optional()
    .describe(
      "Specific date and time when the process should be executed. Used for one-time scheduled executions (ISO 8601 format)."
    ),
  allowConcurrentExecutions: z
    .boolean()
    .optional()
    .describe(
      "Whether multiple executions of the same process can run concurrently. If false, new executions will be queued if one is already running."
    ),
  input: z
    .object({
      parameters: z
        .string()
        .optional()
        .describe(
          "JSON string containing the input parameters for the process execution. Must match the process parameter schema."
        ),
      tag: z
        .string()
        .optional()
        .describe("A version tag or an alias of the version"),
      comment: z
        .string()
        .optional()
        .describe(
          "Optional comment or description for this execution. Useful for tracking and debugging purposes."
        ),
      settings: z
        .object({
          agentPoolSlug: z
            .string()
            .optional()
            .describe("Agent pool where to execute"),
          callbackUrl: z
            .string()
            .url()
            .optional()
            .describe(
              "URL to receive execution results upon completion (success or failure)"
            ),
        })
        .optional()
        .describe(
          "Execution-specific settings and configuration options. Overrides default process settings for this execution."
        ),
    })
    .optional()
    .describe(
      "Input parameters and settings for the scheduled process execution. Defines what parameters will be passed to the process when it runs."
    ),
});

// Tool names
export const processesToolNames = {
  getProcesses: "get_processes",
  createProcess: "create_process",
  getProcess: "get_process",
  updateProcess: "update_process",
  deleteProcess: "delete_process",
  getProcessVersions: "get_process_versions",
  publishProcessVersion: "publish_process_version",
  getProcessVersion: "get_process_version",
  deleteProcessVersion: "delete_process_version",
  getProcessVersionAliases: "get_process_version_aliases",
  createProcessVersionAlias: "create_process_version_alias",
  getProcessVersionAlias: "get_process_version_alias",
  deleteProcessVersionAlias: "delete_process_version_alias",
  updateProcessVersionAlias: "update_process_version_alias",
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
    name: processesToolNames.updateProcess,
    title: "Update Process",
    description:
      "Updates an existing process with new configuration, source code, or metadata. All fields provided will replace the existing values.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          description:
            "Unique identifier of the process to update (UUID or slug)",
        },
        name: {
          type: "string",
          description:
            "The updated name of the process. This will be displayed in the UI and used for identification.",
        },
        slug: {
          type: "string",
          description:
            "The updated unique identifier for the process. Used in URLs and API calls. Must be URL-safe (lowercase, hyphens, no spaces).",
        },
        description: {
          type: "string",
          description:
            "The updated detailed description of what the process does. This helps users understand the process purpose and functionality.",
        },
        readme: {
          type: "string",
          description:
            "The updated markdown documentation for the process. This can include usage instructions, examples, and additional context.",
        },
        sourceCode: {
          type: "string",
          description:
            "The updated source code of the process. This is the executable code that will run when the process is executed.",
        },
        parametersSchema: {
          type: "string",
          description:
            "The updated JSON Schema defining the input parameters for the process. This schema is used to generate forms in the UI and validate input data.",
        },
        webhook: {
          type: "object",
          description:
            "Updated webhook configuration for the process. Defines how the process can be triggered via HTTP webhooks.",
        },
        settings: {
          type: "object",
          description:
            "Updated process settings and configuration options. Includes publication settings, form configurations, and dependencies.",
        },
        manifest: {
          type: "object",
          description:
            "Updated process manifest configuration. Contains metadata and configuration for the process deployment and execution.",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description:
            "Updated tags for categorizing and organizing processes. Used for filtering and grouping in the UI.",
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
          type: ["string", "object"],
          description:
            "Process parameters (JSON string or object). Must match the process parameter schema.",
        },
        tag: {
          type: "string",
          description: "A version tag or an alias of the version",
        },
        comment: {
          type: "string",
          description:
            "Optional comment or description for this execution. Useful for tracking and debugging purposes.",
        },
        initiatedBy: {
          type: "string",
          description:
            "An identifier for the individual initiating the request. This could be an employee ID, a username, or any other unique identifier.",
        },
        settings: {
          type: "object",
          properties: {
            agentPoolSlug: {
              type: "string",
              description: "Agent pool where to execute",
            },
            callbackUrl: {
              type: "string",
              description:
                "URL to receive execution results upon completion (success or failure)",
            },
          },
          description:
            "Execution-specific settings and configuration options. Overrides default process settings for this execution.",
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
          type: ["string", "object"],
          description:
            "Process parameters (JSON string or object). Must match the process parameter schema.",
        },
        tag: {
          type: "string",
          description: "A version tag or an alias of the version",
        },
        comment: {
          type: "string",
          description:
            "Optional comment or description for this execution. Useful for tracking and debugging purposes.",
        },
        initiatedBy: {
          type: "string",
          description:
            "An identifier for the individual initiating the request. This could be an employee ID, a username, or any other unique identifier.",
        },
        settings: {
          type: "object",
          properties: {
            agentPoolSlug: {
              type: "string",
              description: "Agent pool where to execute",
            },
            callbackUrl: {
              type: "string",
              description:
                "URL to receive execution results upon completion (success or failure)",
            },
          },
          description:
            "Execution-specific settings and configuration options. Overrides default process settings for this execution.",
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
        cron: {
          type: "string",
          description: "Cron expression for PERIODIC schedules",
        },
        dateTime: {
          type: "string",
          format: "date-time",
          description: "Date and time for ONCE schedules (ISO format)",
        },
        allowConcurrentExecutions: {
          type: "boolean",
          description:
            "Whether multiple executions of the same process can run concurrently. If false, new executions will be queued if one is already running.",
        },
        input: {
          type: "object",
          description:
            "Input parameters and settings for the scheduled process execution. Defines what parameters will be passed to the process when it runs.",
          properties: {
            parameters: {
              type: "string",
              description:
                "JSON string containing the input parameters for the process execution. Must match the process parameter schema.",
            },
            tag: {
              type: "string",
              description: "A version tag or an alias of the version",
            },
            comment: {
              type: "string",
              description:
                "Optional comment or description for this execution. Useful for tracking and debugging purposes.",
            },
            settings: {
              type: "object",
              description:
                "Execution-specific settings and configuration options. Overrides default process settings for this execution.",
              properties: {
                agentPoolSlug: {
                  type: "string",
                  description: "Agent pool where to execute",
                },
                callbackUrl: {
                  type: "string",
                  format: "uri",
                  description:
                    "URL to receive execution results upon completion (success or failure)",
                },
              },
            },
          },
        },
      },
      required: ["identifier", "type"],
    },
  },
];

export const processesWithVersionsToolDefinitions = [
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
    name: processesToolNames.publishProcessVersion,
    title: "Publish Process Version",
    description: "Publishes a new version of a process.",
    inputSchema: {
      type: "object",
      properties: {
        processId: {
          type: "string",
          description: "Process ID",
        },
        tag: {
          type: "string",
          description: "Version tag",
        },
        readme: {
          type: "string",
          description: "Version readme",
        },
        comment: {
          type: "string",
          description: "Version comment",
        },
        sourceCode: {
          type: "string",
          description: "Process source code",
        },
        parametersSchema: {
          type: "string",
          description:
            "JSON Schema defining the input parameters for the process version",
        },
      },
      required: ["processId"],
    },
  },
  {
    name: processesToolNames.getProcessVersion,
    title: "Get Process Version",
    description:
      "Retrieves detailed information about a specific process version.",
    inputSchema: {
      type: "object",
      properties: {
        processId: {
          type: "string",
          description: "Process ID",
        },
        versionId: {
          type: "string",
          description: "Version ID",
        },
      },
      required: ["processId", "versionId"],
    },
  },
  {
    name: processesToolNames.deleteProcessVersion,
    title: "Delete Process Version",
    description:
      "Deletes a specific process version. This action cannot be undone.",
    inputSchema: {
      type: "object",
      properties: {
        processId: {
          type: "string",
          description: "Process ID",
        },
        versionId: {
          type: "string",
          description: "Version ID",
        },
      },
      required: ["processId", "versionId"],
    },
  },
  {
    name: processesToolNames.getProcessVersionAliases,
    title: "Get Process Version Aliases",
    description:
      "Retrieves a paginated list of version aliases for a specific process.",
    inputSchema: {
      type: "object",
      properties: {
        processId: {
          type: "string",
          description: "Process ID",
        },
        versionId: {
          type: "string",
          description: "Version ID",
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
    name: processesToolNames.createProcessVersionAlias,
    title: "Create Process Version Alias",
    description: "Creates a new alias for a process version.",
    inputSchema: {
      type: "object",
      properties: {
        processId: {
          type: "string",
          description: "Process ID",
        },
        name: {
          type: "string",
          description: "Alias name",
        },
        versionId: {
          type: "string",
          description: "The version id of the process being aliased",
        },
      },
      required: ["processId", "name", "versionId"],
    },
  },
  {
    name: processesToolNames.getProcessVersionAlias,
    title: "Get Process Version Alias",
    description:
      "Retrieves detailed information about a specific process version alias.",
    inputSchema: {
      type: "object",
      properties: {
        processId: {
          type: "string",
          description: "Process ID",
        },
        aliasId: {
          type: "string",
          description: "Alias ID",
        },
      },
      required: ["processId", "aliasId"],
    },
  },
  {
    name: processesToolNames.deleteProcessVersionAlias,
    title: "Delete Process Version Alias",
    description:
      "Permanently deletes a process version alias. This action cannot be undone.",
    inputSchema: {
      type: "object",
      properties: {
        processId: {
          type: "string",
          description: "Process ID",
        },
        aliasId: {
          type: "string",
          description: "Alias ID",
        },
      },
      required: ["processId", "aliasId"],
    },
  },
  {
    name: processesToolNames.updateProcessVersionAlias,
    title: "Update Process Version Alias",
    description:
      "Updates an existing process version alias with new configuration. All provided fields will replace the existing values.",
    inputSchema: {
      type: "object",
      properties: {
        processId: {
          type: "string",
          description: "Process ID",
        },
        aliasId: {
          type: "string",
          description: "Alias ID",
        },
        name: {
          type: "string",
          description: "Alias name",
        },
        versionId: {
          type: "string",
          description: "The version id of the process being aliased",
        },
      },
      required: ["processId", "aliasId"],
    },
  },
];
