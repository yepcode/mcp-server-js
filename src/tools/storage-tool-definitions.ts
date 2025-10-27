import { z } from "zod";

// Schema for getting storage objects
export const GetStorageObjectsSchema = z.object({
  prefix: z.string().optional().describe("Filter results to include only objects whose names begin with this prefix (useful for folder-like organization)"),
});

// Schema for uploading a storage object
export const UploadStorageObjectSchema = z.object({
  filename: z.string().describe("Object filename (can include slashes for folder-like organization, e.g., 'folder/subfolder/file.txt')"),
  content: z.union([
    z.string().describe("File content as plain text (for text files)"),
    z.object({
      data: z.string().describe("File content encoded in base64"),
      encoding: z.literal("base64").describe("Encoding type"),
    }).describe("Base64 encoded file content (for binary files)"),
  ]).describe("File content. Use plain text for text files, or base64 object for binary files"),
});

// Schema for downloading a storage object
export const DownloadStorageObjectSchema = z.object({
  filename: z.string().describe("Object filename (can include slashes)"),
});

// Schema for deleting a storage object
export const DeleteStorageObjectSchema = z.object({
  filename: z.string().describe("Object filename (can include slashes)"),
});

// Tool names
export const storageToolNames = {
  getStorageObjects: "get_storage_objects",
  uploadStorageObject: "upload_storage_object",
  downloadStorageObject: "download_storage_object",
  deleteStorageObject: "delete_storage_object",
} as const;

// Tool definitions
export const storageToolDefinitions = [
  {
    name: storageToolNames.getStorageObjects,
    title: "Get Storage Objects",
    description: "Retrieves a list of storage objects in the team's storage bucket. Objects can be filtered by prefix to organize files in folders.",
    inputSchema: {
      type: "object",
      properties: {
        prefix: {
          type: "string",
          description: "Filter results to include only objects whose names begin with this prefix (useful for folder-like organization)",
        },
      },
    },
  },
  {
    name: storageToolNames.uploadStorageObject,
    title: "Upload Storage Object",
    description: "Uploads a file to the team's storage bucket. Files can be organized using folder-like paths in the filename parameter.",
    inputSchema: {
      type: "object",
      properties: {
        filename: {
          type: "string",
          description: "Object filename (can include slashes for folder-like organization, e.g., 'folder/subfolder/file.txt')",
        },
        content: {
          oneOf: [
            {
              type: "string",
              description: "File content as plain text (for text files)",
            },
            {
              type: "object",
              properties: {
                data: {
                  type: "string",
                  description: "File content encoded in base64",
                },
                encoding: {
                  type: "string",
                  enum: ["base64"],
                  description: "Encoding type",
                },
              },
              required: ["data", "encoding"],
              description: "Base64 encoded file content (for binary files)",
            },
          ],
          description: "File content. Use plain text for text files, or base64 object for binary files",
        },
      },
      required: ["filename", "content"],
    },
  },
  {
    name: storageToolNames.downloadStorageObject,
    title: "Download Storage Object",
    description: "Downloads a file from the team's storage bucket. The file content is returned as binary data with appropriate headers.",
    inputSchema: {
      type: "object",
      properties: {
        filename: {
          type: "string",
          description: "Object filename (can include slashes)",
        },
      },
      required: ["filename"],
    },
  },
  {
    name: storageToolNames.deleteStorageObject,
    title: "Delete Storage Object",
    description: "Permanently deletes a file from the team's storage bucket. This action cannot be undone.",
    inputSchema: {
      type: "object",
      properties: {
        filename: {
          type: "string",
          description: "Object filename (can include slashes)",
        },
      },
      required: ["filename"],
    },
  },
];
