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

// Tool names
export const schedulesToolNames = {
  getSchedules: "get_schedules",
  getSchedule: "get_schedule",
  pauseSchedule: "pause_schedule",
  resumeSchedule: "resume_schedule",
  deleteSchedule: "delete_schedule",
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
];
