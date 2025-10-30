import { z } from "zod";

// Schema for getting a token
export const GetTokenSchema = z.object({
  apiToken: z.string().describe("API token"),
});

// Schema for getting all service accounts
export const GetAllServiceAccountsSchema = z.object({});

// Schema for creating a service account
export const CreateServiceAccountSchema = z.object({
  name: z.string().describe("Service account name"),
});

// Schema for deleting a service account
export const DeleteServiceAccountSchema = z.object({
  id: z
    .string()
    .describe("Unique identifier (UUID) of the service account to delete"),
});

// Tool names
export const authToolNames = {
  getToken: "get_token",
  getAllServiceAccounts: "get_all_service_accounts",
  createServiceAccount: "create_service_account",
  deleteServiceAccount: "delete_service_account",
} as const;

// Tool definitions
export const authToolDefinitions = [
  {
    name: authToolNames.getToken,
    title: "Get Token",
    description: "Gets an authentication token using an API token.",
    inputSchema: {
      type: "object",
      properties: {
        apiToken: {
          type: "string",
          description: "API token",
        },
      },
      required: ["apiToken"],
    },
  },
  {
    name: authToolNames.getAllServiceAccounts,
    title: "Get All Service Accounts",
    description: "Retrieves a list of all service accounts.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: authToolNames.createServiceAccount,
    title: "Create Service Account",
    description: "Creates a new service account.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Service account name",
          example: "my-service-account",
        },
      },
      required: ["name"],
    },
  },
  {
    name: authToolNames.deleteServiceAccount,
    title: "Delete Service Account",
    description:
      "Permanently deletes a service account. This action cannot be undone.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description:
            "Unique identifier (UUID) of the service account to delete",
        },
      },
      required: ["id"],
    },
  },
];
