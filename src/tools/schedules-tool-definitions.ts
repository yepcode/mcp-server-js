import { z } from "zod";

// Schema for getting schedules with pagination and filtering
export const GetSchedulesSchema = z.object({
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
    .describe("Maximum number of scheduled processes to retrieve per page"),
  processId: z
    .string()
    .optional()
    .describe("Filter scheduled processes by process ID (UUID)"),
  keywords: z
    .string()
    .optional()
    .describe("Keywords filter: applies to process name or schedule comment"),
});

// Schema for getting a specific schedule
export const GetScheduleSchema = z.object({
  id: z
    .string()
    .describe("Unique identifier (UUID) of the scheduled process to retrieve"),
});

// Schema for pausing a schedule
export const PauseScheduleSchema = z.object({
  id: z
    .string()
    .describe("Unique identifier (UUID) of the scheduled process to pause"),
});

// Schema for resuming a schedule
export const ResumeScheduleSchema = z.object({
  id: z
    .string()
    .describe("Unique identifier (UUID) of the scheduled process to resume"),
});

// Schema for deleting a schedule
export const DeleteScheduleSchema = z.object({
  id: z
    .string()
    .describe("Unique identifier (UUID) of the scheduled process to delete"),
});

// Schema for updating a schedule
export const UpdateScheduleSchema = z.object({
  id: z
    .string()
    .describe("Unique identifier (UUID) of the scheduled process to update"),
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
export const schedulesToolNames = {
  getSchedules: "get_schedules",
  getSchedule: "get_schedule",
  pauseSchedule: "pause_schedule",
  resumeSchedule: "resume_schedule",
  deleteSchedule: "delete_schedule",
  updateSchedule: "update_schedule",
} as const;

// Tool definitions
export const schedulesToolDefinitions = [
  {
    name: schedulesToolNames.getSchedules,
    title: "Get Scheduled Processes",
    description:
      "Retrieves a paginated list of scheduled processes with optional filtering by process and keywords. Scheduled processes define when and how often processes should be executed automatically.",
    inputSchema: {
      type: "object",
      properties: {
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
          description:
            "Maximum number of scheduled processes to retrieve per page",
        },
        processId: {
          type: "string",
          description: "Filter scheduled processes by process ID (UUID)",
        },
        keywords: {
          type: "string",
          description:
            "Keywords filter: applies to process name or schedule comment",
        },
      },
    },
  },
  {
    name: schedulesToolNames.getSchedule,
    title: "Get Scheduled Process",
    description:
      "Retrieves detailed information about a specific scheduled process including its configuration, schedule settings, and current status.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description:
            "Unique identifier (UUID) of the scheduled process to retrieve",
        },
      },
      required: ["id"],
    },
  },
  {
    name: schedulesToolNames.pauseSchedule,
    title: "Pause Scheduled Process",
    description:
      "Pauses a currently active scheduled process. The process will stop executing until it is resumed.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description:
            "Unique identifier (UUID) of the scheduled process to pause",
        },
      },
      required: ["id"],
    },
  },
  {
    name: schedulesToolNames.resumeSchedule,
    title: "Resume Scheduled Process",
    description:
      "Resumes a previously paused scheduled process. The process will continue executing according to its original schedule configuration.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description:
            "Unique identifier (UUID) of the scheduled process to resume",
        },
      },
      required: ["id"],
    },
  },
  {
    name: schedulesToolNames.deleteSchedule,
    title: "Delete Scheduled Process",
    description:
      "Permanently deletes a scheduled process and cancels all future executions. This action cannot be undone.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description:
            "Unique identifier (UUID) of the scheduled process to delete",
        },
      },
      required: ["id"],
    },
  },
  {
    name: schedulesToolNames.updateSchedule,
    title: "Update Scheduled Process",
    description:
      "Updates an existing scheduled process with new configuration, schedule settings, or parameters. All provided fields will replace the existing values.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description:
            "Unique identifier (UUID) of the scheduled process to update",
        },
        cron: {
          type: "string",
          description:
            "Cron expression defining when the process should be executed. Uses standard cron syntax (minute hour day month dayOfWeek).",
        },
        dateTime: {
          type: "string",
          format: "date-time",
          description:
            "Specific date and time when the process should be executed. Used for one-time scheduled executions (ISO 8601 format).",
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
      required: ["id"],
    },
  },
];
