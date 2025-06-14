#!/usr/bin/env node

import Logger from "./logger.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import YepCodeMcpServer from "./server.js";
import { getVersion } from "./utils.js";

const logger = new Logger("StdioServer", { logsToStderr: true });

const main = async (): Promise<void> => {
  let disableRunCodeTool = false;
  let runCodeCleanup = false;
  if (process.env.YEPCODE_MCP_OPTIONS) {
    const mcpOptions = process.env.YEPCODE_MCP_OPTIONS.split(",");
    disableRunCodeTool = mcpOptions.includes("disableRunCodeTool");
    runCodeCleanup = mcpOptions.includes("runCodeCleanup");
  }
  const server = new YepCodeMcpServer(
    {},
    { logsToStderr: true, disableRunCodeTool, runCodeCleanup }
  );
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info(`@yepcode/mcp-server v${getVersion()} successfully started`);

    // Handle process termination
    process.on("SIGINT", async () => {
      logger.info("Received SIGINT, shutting down");
      await server.close();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.info("Received SIGTERM, shutting down");
      await server.close();
      process.exit(0);
    });
  } catch (error) {
    logger.error("Failed to start server:", error as Error);
    process.exit(1);
  }
};

main().catch((error) => {
  logger.error("Error running server", error);
});

export default main;
