import { fileURLToPath } from "url";
import { join, dirname } from "path";
import { readFileSync } from "fs";
import { YepCodeApi, YepCodeEnv, YepCodeRun } from "@yepcode/run";
import { YepCodeApiConfig } from "@yepcode/run";

export const YepCodeEnvFactory = {
  create: (config: YepCodeApiConfig) => {
    try {
      return new YepCodeEnv(config);
    } catch (error) {
      return {
        getEnvVars: async () => [],
      } as unknown as YepCodeEnv;
    }
  },
};

export const YepCodeRunFactory = {
  create: (config: YepCodeApiConfig) => {
    try {
      return new YepCodeRun(config);
    } catch (error) {
      return {} as YepCodeRun;
    }
  },
};

export const YepCodeApiFactory = {
  create: (config: YepCodeApiConfig) => {
    try {
      return new YepCodeApi(config);
    } catch (error) {
      return {
        getTeamId: async () => "not-set",
        getProcesses: async () => ({
          data: [],
          hasNextPage: false,
        }),
      } as unknown as YepCodeApi;
    }
  },
};

export const isEmpty = (value: unknown): boolean => {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (isObject(value) && Object.keys(value).length === 0)
  );
};

export const isObject = (value: unknown): value is object => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function getVersion(): string {
  try {
    const packageJsonPath = join(__dirname, "../package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    return packageJson.version || "1.0.0";
  } catch (err) {
    console.error("[yepcode-mcp-server]", "Unable to retrieve version:", err);
    return "unknown";
  }
}
