import { z } from "zod";

// Schema for getting modules with pagination
export const GetModulesSchema = z.object({
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
    .describe("Maximum number of modules to retrieve per page"),
});

// Schema for creating a module
export const CreateModuleSchema = z.object({
  name: z.string().describe("Module name"),
  description: z.string().optional().describe("Module description"),
  code: z.string().describe("Module source code"),
  language: z.enum(["javascript", "python"]).describe("Programming language"),
  tags: z.array(z.string()).optional().describe("Module tags"),
  settings: z.record(z.any()).optional().describe("Module settings"),
});

// Schema for getting a specific module
export const GetModuleSchema = z.object({
  id: z
    .string()
    .describe(
      "Unique identifier (UUID) of the script library module to retrieve"
    ),
});

// Schema for updating a module
export const UpdateModuleSchema = z.object({
  id: z
    .string()
    .describe(
      "Unique identifier (UUID) of the script library module to update"
    ),
  name: z
    .string()
    .optional()
    .describe(
      "The name of the script library. Must not have spaces, dashes and dots are allowed"
    ),
  sourceCode: z
    .string()
    .optional()
    .describe(
      "The updated source code of the script library module. This is the reusable code that can be imported by processes."
    ),
});

// Schema for deleting a module
export const DeleteModuleSchema = z.object({
  id: z
    .string()
    .describe(
      "Unique identifier (UUID) of the script library module to delete"
    ),
});

// Schema for getting module versions
export const GetModuleVersionsSchema = z.object({
  moduleId: z.string().describe("Module ID"),
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

// Schema for getting a specific module version
export const GetModuleVersionSchema = z.object({
  moduleId: z.string().describe("Module ID"),
  versionId: z.string().describe("Version ID"),
});

// Schema for deleting a module version
export const DeleteModuleVersionSchema = z.object({
  moduleId: z.string().describe("Module ID"),
  versionId: z.string().describe("Version ID"),
});

// Schema for publishing a module version
export const PublishModuleVersionSchema = z.object({
  moduleId: z.string().describe("Module ID"),
  tag: z.string().optional().describe("Version tag"),
  comment: z.string().optional().describe("Version comment"),
  sourceCode: z.string().optional().describe("Module source code"),
});

// Schema for getting module aliases
export const GetModuleAliasesSchema = z.object({
  moduleId: z.string().describe("Module ID"),
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

// Schema for creating a module version alias
export const CreateModuleVersionAliasSchema = z.object({
  moduleId: z.string().describe("Module ID"),
  name: z.string().describe("Alias name"),
  versionId: z
    .string()
    .describe("The version id of the script library being aliased"),
});

// Schema for getting a specific module version alias
export const GetModuleVersionAliasSchema = z.object({
  moduleId: z.string().describe("Module ID"),
  aliasId: z.string().describe("Alias ID"),
});

// Schema for deleting a module version alias
export const DeleteModuleVersionAliasSchema = z.object({
  moduleId: z.string().describe("Module ID"),
  aliasId: z.string().describe("Alias ID"),
});

// Schema for updating a module version alias
export const UpdateModuleVersionAliasSchema = z.object({
  moduleId: z.string().describe("Module ID"),
  aliasId: z.string().describe("Alias ID"),
  name: z.string().optional().describe("Alias name"),
  versionId: z
    .string()
    .optional()
    .describe("The version id of the script library being aliased"),
});

// Tool names
export const modulesToolNames = {
  getModules: "get_modules",
  createModule: "create_module",
  getModule: "get_module",
  updateModule: "update_module",
  deleteModule: "delete_module",
  getModuleVersions: "get_module_versions",
  publishModuleVersion: "publish_module_version",
  getModuleVersion: "get_module_version",
  deleteModuleVersion: "delete_module_version",
  getModuleAliases: "get_module_aliases",
  createModuleVersionAlias: "create_module_version_alias",
  getModuleVersionAlias: "get_module_version_alias",
  deleteModuleVersionAlias: "delete_module_version_alias",
  updateModuleVersionAlias: "update_module_version_alias",
} as const;

// Tool definitions
export const modulesToolDefinitions = [
  {
    name: modulesToolNames.getModules,
    title: "Get Modules",
    description:
      "Retrieves a paginated list of script library modules. Modules are reusable code libraries that can be imported and used across different processes.",
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
          description: "Maximum number of modules to retrieve per page",
        },
      },
    },
  },
  {
    name: modulesToolNames.createModule,
    title: "Create Module",
    description:
      "Creates a new script library module with source code and metadata. Modules can be written in JavaScript or Python and can be imported by processes.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Module name",
        },
        description: {
          type: "string",
          description: "Module description",
        },
        code: {
          type: "string",
          description: "Module source code",
        },
        language: {
          type: "string",
          enum: ["javascript", "python"],
          description: "Programming language",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Module tags",
        },
        settings: {
          type: "object",
          description: "Module settings",
        },
      },
      required: ["name", "code", "language"],
    },
  },
  {
    name: modulesToolNames.getModule,
    title: "Get Module",
    description:
      "Retrieves detailed information about a specific script library module including its source code, metadata, and version information.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description:
            "Unique identifier (UUID) of the script library module to retrieve",
        },
      },
      required: ["id"],
    },
  },
  {
    name: modulesToolNames.updateModule,
    title: "Update Module",
    description:
      "Updates an existing script library module with new source code or metadata. All provided fields will replace the existing values.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description:
            "Unique identifier (UUID) of the script library module to update",
        },
        name: {
          type: "string",
          description:
            "The name of the script library. Must not have spaces, dashes and dots are allowed",
        },
        sourceCode: {
          type: "string",
          description:
            "The updated source code of the script library module. This is the reusable code that can be imported by processes.",
        },
      },
      required: ["id"],
    },
  },
  {
    name: modulesToolNames.deleteModule,
    title: "Delete Module",
    description:
      "Permanently deletes a script library module. This action cannot be undone and may affect processes that import this module.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description:
            "Unique identifier (UUID) of the script library module to delete",
        },
      },
      required: ["id"],
    },
  },
];

export const modulesWithVersionsToolDefinitions = [
  {
    name: modulesToolNames.getModuleVersions,
    title: "Get Module Versions",
    description:
      "Retrieves a paginated list of versions for a specific module.",
    inputSchema: {
      type: "object",
      properties: {
        moduleId: {
          type: "string",
          description: "Module ID",
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
      required: ["moduleId"],
    },
  },
  {
    name: modulesToolNames.getModuleVersion,
    title: "Get Module Version",
    description:
      "Retrieves detailed information about a specific module version.",
    inputSchema: {
      type: "object",
      properties: {
        moduleId: {
          type: "string",
          description: "Module ID",
        },
        versionId: {
          type: "string",
          description: "Version ID",
        },
      },
      required: ["moduleId", "versionId"],
    },
  },
  {
    name: modulesToolNames.deleteModuleVersion,
    title: "Delete Module Version",
    description:
      "Deletes a specific module version. This action cannot be undone.",
    inputSchema: {
      type: "object",
      properties: {
        moduleId: {
          type: "string",
          description: "Module ID",
        },
        versionId: {
          type: "string",
          description: "Version ID",
        },
      },
      required: ["moduleId", "versionId"],
    },
  },
  {
    name: modulesToolNames.getModuleAliases,
    title: "Get Module Aliases",
    description:
      "Retrieves a paginated list of version aliases for a specific module.",
    inputSchema: {
      type: "object",
      properties: {
        moduleId: {
          type: "string",
          description: "Module ID",
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
      required: ["moduleId"],
    },
  },
  {
    name: modulesToolNames.publishModuleVersion,
    title: "Publish Module Version",
    description: "Publishes a new version of a module.",
    inputSchema: {
      type: "object",
      properties: {
        moduleId: {
          type: "string",
          description: "Module ID",
        },
        tag: {
          type: "string",
          description: "Version tag",
        },
        comment: {
          type: "string",
          description: "Version comment",
        },
        sourceCode: {
          type: "string",
          description: "Module source code",
        },
      },
      required: ["moduleId"],
    },
  },
  {
    name: modulesToolNames.createModuleVersionAlias,
    title: "Create Module Version Alias",
    description: "Creates a new alias for a module version.",
    inputSchema: {
      type: "object",
      properties: {
        moduleId: {
          type: "string",
          description: "Module ID",
        },
        name: {
          type: "string",
          description: "Alias name",
        },
        versionId: {
          type: "string",
          description: "The version id of the script library being aliased",
        },
      },
      required: ["moduleId", "name", "versionId"],
    },
  },
  {
    name: modulesToolNames.getModuleVersionAlias,
    title: "Get Module Version Alias",
    description:
      "Retrieves detailed information about a specific module version alias.",
    inputSchema: {
      type: "object",
      properties: {
        aliasId: {
          type: "string",
          description: "Alias ID",
        },
      },
      required: ["moduleId", "aliasId"],
    },
  },
  {
    name: modulesToolNames.deleteModuleVersionAlias,
    title: "Delete Module Version Alias",
    description:
      "Permanently deletes a module version alias. This action cannot be undone.",
    inputSchema: {
      type: "object",
      properties: {
        aliasId: {
          type: "string",
          description: "Alias ID",
        },
      },
      required: ["moduleId", "aliasId"],
    },
  },
  {
    name: modulesToolNames.updateModuleVersionAlias,
    title: "Update Module Version Alias",
    description:
      "Updates an existing module version alias with new configuration. All provided fields will replace the existing values.",
    inputSchema: {
      type: "object",
      properties: {
        moduleId: {
          type: "string",
          description: "Module ID",
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
          description: "The version id of the script library being aliased",
        },
      },
      required: ["moduleId", "aliasId"],
    },
  },
];
