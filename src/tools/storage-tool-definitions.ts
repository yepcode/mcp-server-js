import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const ListObjectsSchema = z.object({
  prefix: z
    .string()
    .optional()
    .describe(
      "Prefix to filter objects by. Filter results to include only objects whose names begin with this prefix"
    ),
});

export const UploadObjectSchema = z.object({
  filename: z
    .string()
    .describe(
      "Filename or path where to upload the object (e.g., 'file.txt' or 'folder/file.txt')"
    ),
  content: z.union([
    z.string().describe("File content as plain text (for text files)"),
    z.object({
      data: z.string().describe("File content encoded in base64"),
      encoding: z.literal("base64").describe("Encoding type")
    }).describe("Base64 encoded file content (for binary files)")
  ]).describe("File content. Use plain text for text files, or base64 object for binary files"),
});

export const DownloadObjectSchema = z.object({
  filename: z
    .string()
    .describe(
      "Filename or path where to download the object (e.g., 'file.txt' or 'folder/file.txt')"
    ),
});

export const DeleteObjectSchema = z.object({
  filename: z
    .string()
    .describe(
      "Filename or path where to delete the object (e.g., 'file.txt' or 'folder/file.txt')"
    ),
});

export const storageToolDefinitions = [
  {
    name: "list_objects",
    description: "List all objects in storage",
    inputSchema: zodToJsonSchema(ListObjectsSchema),
  },
  {
    name: "upload_object",
    description: "Upload an object to storage",
    inputSchema: zodToJsonSchema(UploadObjectSchema),
  },
  {
    name: "download_object",
    description: "Download an object from storage",
    inputSchema: zodToJsonSchema(DownloadObjectSchema),
  },
  {
    name: "delete_object",
    description: "Delete an object from storage",
    inputSchema: zodToJsonSchema(DeleteObjectSchema),
  },
];
