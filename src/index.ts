#!/usr/bin/env node

import Logger from "./logger.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import YepCodeMcpServer from "./server.js";

const logger = new Logger("StdioServer");

const main = async (): Promise<void> => {
  const server = new YepCodeMcpServer({});
  logger.log("Starting YepCode MCP server");
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.log("MCP server connected to transport");

    // Handle process termination
    process.on("SIGINT", async () => {
      logger.log("Received SIGINT, shutting down");
      await server.close();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.log("Received SIGTERM, shutting down");
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
