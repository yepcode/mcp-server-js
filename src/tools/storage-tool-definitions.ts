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
    title: "List all files in YepCode Storage",
    description:
      "List all files that user has previously uploaded to YepCode Storage",
    inputSchema: zodToJsonSchema(ListObjectsSchema),
  },
  {
    name: storageToolNames.upload,
    title: "Upload a file to YepCode Storage",
    description:
      "Upload a file to YepCode Storage. Files can be then accessed in your code using the `yepcode.storage` helper methods.",
    inputSchema: zodToJsonSchema(UploadObjectSchema),
  },
  {
    name: storageToolNames.download,
    title: "Download a file from YepCode Storage",
    description: "Download a file from YepCode Storage.",
    inputSchema: zodToJsonSchema(DownloadObjectSchema),
  },
  {
    name: storageToolNames.delete,
    title: "Delete a file from YepCode Storage",
    description: "Delete a file from YepCode Storage.",
    inputSchema: zodToJsonSchema(DeleteObjectSchema),
  },
];
