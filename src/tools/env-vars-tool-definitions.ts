import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const envVarsToolNames = {
  set: "set_env_var",
  remove: "remove_env_var",
};

export const EnvVarKeySchema = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/);

export const SetEnvVarSchema = z.object({
  key: EnvVarKeySchema,
  value: z.string(),
  isSensitive: z.boolean().optional().default(true),
});

export const RemoveEnvVarSchema = z.object({
  key: EnvVarKeySchema,
});

export type SetEnvVarRequestSchema = z.infer<typeof SetEnvVarSchema>;
export type RemoveEnvVarRequestSchema = z.infer<typeof RemoveEnvVarSchema>;

export interface EnvVarResultSchema {
  error?: string;
}

export const envVarsToolDefinitions = [
  {
    name: envVarsToolNames.set,
    title: "Set environment variable",
    description:
      "Set a YepCode environment variable to be available for future code executions",
    inputSchema: zodToJsonSchema(SetEnvVarSchema),
  },
  {
    name: envVarsToolNames.remove,
    title: "Remove environment variable",
    description: "Remove a YepCode environment variable",
    inputSchema: zodToJsonSchema(RemoveEnvVarSchema),
  },
];
