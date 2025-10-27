import { z } from "zod";

// Schema for getting variables with pagination
export const GetVariablesSchema = z.object({
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
    .describe("Maximum number of variables to retrieve per page"),
});

// Schema for creating a variable
export const CreateVariableSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/)
    .describe(
      "Variable key (must start with letter, contain only letters, numbers, and underscores)"
    ),
  value: z.string().describe("Variable value"),
  isSensitive: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether the variable is sensitive (hidden in logs and UI)"),
});

// Schema for updating a variable
export const UpdateVariableSchema = z.object({
  id: z
    .string()
    .describe("Unique identifier (UUID) of the team variable to update"),
  value: z.string().optional().describe("New variable value"),
  isSensitive: z
    .boolean()
    .optional()
    .describe("Whether the variable is sensitive (hidden in logs and UI)"),
});

// Schema for deleting a variable
export const DeleteVariableSchema = z.object({
  id: z
    .string()
    .describe("Unique identifier (UUID) of the team variable to delete"),
});

// Tool names
export const variablesToolNames = {
  getVariables: "get_variables",
  createVariable: "create_variable",
  updateVariable: "update_variable",
  deleteVariable: "delete_variable",
} as const;

// Tool definitions
export const variablesToolDefinitions = [
  {
    name: variablesToolNames.getVariables,
    title: "Get Variables",
    description:
      "Retrieves a paginated list of team variables. Variables are key-value pairs that can be used across processes and executions.",
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
          description: "Maximum number of variables to retrieve per page",
        },
      },
    },
  },
  {
    name: variablesToolNames.createVariable,
    title: "Create Variable",
    description:
      "Creates a new team variable that can be used across processes and executions. Variables can be marked as sensitive to hide their values in logs and UI.",
    inputSchema: {
      type: "object",
      properties: {
        key: {
          type: "string",
          minLength: 1,
          maxLength: 255,
          pattern: "^[a-zA-Z][a-zA-Z0-9_]*$",
          description:
            "Variable key (must start with letter, contain only letters, numbers, and underscores)",
        },
        value: {
          type: "string",
          description: "Variable value",
        },
        isSensitive: {
          type: "boolean",
          default: true,
          description:
            "Whether the variable is sensitive (hidden in logs and UI)",
        },
      },
      required: ["key", "value"],
    },
  },
  {
    name: variablesToolNames.updateVariable,
    title: "Update Variable",
    description:
      "Updates an existing team variable with new value or configuration. Sensitive variables will have their values hidden in logs and UI.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description:
            "Unique identifier (UUID) of the team variable to update",
        },
        value: {
          type: "string",
          description: "New variable value",
        },
        isSensitive: {
          type: "boolean",
          description:
            "Whether the variable is sensitive (hidden in logs and UI)",
        },
      },
      required: ["id"],
    },
  },
  {
    name: variablesToolNames.deleteVariable,
    title: "Delete Variable",
    description:
      "Permanently deletes a team variable. This action cannot be undone and may affect processes that depend on this variable.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description:
            "Unique identifier (UUID) of the team variable to delete",
        },
      },
      required: ["id"],
    },
  },
];
