import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const storageToolNames = {
  list: "list_files",
  upload: "upload_file",
  download: "download_file",
  delete: "delete_file",
};

export const ListObjectsSchema = z.object({
  prefix: z
    .string()
    .optional()
    .describe(
      "Prefix to filter files by. Filter results to include only files whose names begin with this prefix"
    ),
});

export const UploadObjectSchema = z.object({
  filename: z
    .string()
    .describe(
      "Filename or path where to upload the file (e.g., 'file.txt' or 'folder/file.txt')"
    ),
  content: z
    .union([
      z.string().describe("File content as plain text (for text files)"),
      z
        .object({
          data: z.string().describe("File content encoded in base64"),
          encoding: z.literal("base64").describe("Encoding type"),
        })
        .describe("Base64 encoded file content (for binary files)"),
    ])
    .describe(
      "File content. Use plain text for text files, or base64 object for binary files"
    ),
});

export const DownloadObjectSchema = z.object({
  filename: z
    .string()
    .describe(
      "Filename or path where to download the file (e.g., 'file.txt' or 'folder/file.txt')"
    ),
});

export const DeleteObjectSchema = z.object({
  filename: z
    .string()
    .describe(
      "Filename or path where to delete the file (e.g., 'file.txt' or 'folder/file.txt')"
    ),
});

export const storageToolDefinitions = [
  {
    name: storageToolNames.list,
    description: "List all files in storage",
    inputSchema: zodToJsonSchema(ListObjectsSchema),
  },
  {
    name: storageToolNames.upload,
    description: "Upload a file to storage",
    inputSchema: zodToJsonSchema(UploadObjectSchema),
  },
  {
    name: storageToolNames.download,
    description: "Download a file from storage",
    inputSchema: zodToJsonSchema(DownloadObjectSchema),
  },
  {
    name: storageToolNames.delete,
    description: "Delete a file from storage",
    inputSchema: zodToJsonSchema(DeleteObjectSchema),
  },
];
