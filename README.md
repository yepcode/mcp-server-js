![YepCode MCP Server Preview](https://yepcode.io/images/cover/yepcode-ultimate-dev-tool-ai-solutions.png)

<div align="center">

[![NPM version](https://img.shields.io/npm/v/@yepcode/mcp-server.svg)](https://npmjs.org/package/@yepcode/mcp-server)
[![NPM Downloads](https://img.shields.io/npm/dm/@yepcode/mcp-server)](https://www.npmjs.com/package/@yepcode/mcp-server)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/yepcode/mcp-server-js/ci.yml)](https://github.com/yepcode/mcp-server-js/actions)

[![Trust Score](https://archestra.ai/mcp-catalog/api/badge/quality/yepcode/mcp-server-js)](https://archestra.ai/mcp-catalog/yepcode__mcp-server-js)
[![smithery badge](https://smithery.ai/badge/@yepcode/mcp-server)](https://smithery.ai/server/@yepcode/mcp-server)

</div>

## What is YepCode MCP Server?

An MCP ([Model Context Protocol](https://modelcontextprotocol.io/introduction)) server that enables AI platforms to interact with [YepCode](https://yepcode.io)'s infrastructure. Run LLM generated scripts and turn your YepCode processes into powerful tools that AI assistants can use directly.

### Why YepCode MCP Server?

- **Seamless AI Integration**: Convert YepCode processes into AI-ready tools with zero configuration
- **Real-time Process Control**: Enable direct interaction between AI systems and your workflows
- **Enterprise-Grade Security**: Execute code in YepCode's isolated, production-ready environments
- **Universal Compatibility**: Integrate with any AI platform supporting the Model Context Protocol

## Integration Guide

YepCode MCP server can be integrated with AI platforms like [Cursor](https://cursor.sh) or [Claude Desktop](https://www.anthropic.com/news/claude-desktop) using either a remote approach (we offer a hosted version of the MCP server) or a local approach (NPX or Docker installation is required).

For both approaches, you need to get your YepCode API credentials:

1. Sign up to [YepCode Cloud](https://cloud.yepcode.io)
2. Visit `Settings` > `API credentials` to create a new API token.

### Remote Approach using SSE Server

- If your MCP Client doesn't support authentication headers, just use the SSE server URL that includes the API Token. Use a configuration similar to the following:

```typescript
{
  "mcpServers": {
    "yepcode-mcp-server": {
      "url": "https://cloud.yepcode.io/mcp/sk-c2E....RD/sse"
    }
  }
}
```

- If your MCP Client supports authentication headers, you can use the HTTP server URL that includes the API Token. Use a configuration similar to the following:

```typescript
{
  "mcpServers": {
    "yepcode-mcp-server": {
      "url": "https://cloud.yepcode.io/mcp/sse",
      "headers": {
        "Authorization": "Bearer <sk-c2E....RD>"
      }
    }
  }
}
```

### Local Approach

#### Using NPX

Make sure you have Node.js installed (version 18 or higher), and use a configuration similar to the following:

```typescript
{
  "mcpServers": {
    "yepcode-mcp-server": {
      "command": "npx",
      "args": ["-y", "@yepcode/mcp-server"],
      "env": {
        "YEPCODE_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

#### Using Docker

1. Build the container image:

```bash
docker build -t yepcode/mcp-server .
```

2. Use a configuration similar to the following:

```typescript
{
  "mcpServers": {
    "yepcode-mcp-server": {
      "command": "docker",
      "args": [
        "run",
        "-d",
        "-e",
        "YEPCODE_API_TOKEN=your_api_token_here",
        "yepcode/mcp-server"
      ]
    }
  }
}
```

## Debugging

Debugging MCP servers can be tricky since they communicate over stdio. To make this easier, we recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which you can run with the following command:

```bash
npm run inspector
```

This will start a server where you can access debugging tools directly in your browser.

## YepCode MCP Tools Reference

The MCP server provides several tools to interact with YepCode's infrastructure:

### Code Execution

#### run_code

Executes code in YepCode's secure environment.

```typescript
// Input
{
  code: string;                          // The code to execute
  options?: {
    language?: string;                   // Programming language (default: 'javascript')
    comment?: string;                    // Execution context
    settings?: Record<string, unknown>;  // Runtime settings
  }
}

// Response
{
  returnValue?: unknown;                 // Execution result
  logs?: string[];                       // Console output
  error?: string;                        // Error message if execution failed
}
```

##### MCP Options

YepCode MCP server supports the following options:

- Disable the run_code tool: In some cases, you may want to disable the `run_code` tool. For example, if you want to use the MCP server as a provider only for the existing tools in your YepCode account.
- Skip the run_code cleanup: By default, run_code processes source code is removed after execution. If you want to keep it for audit purposes, you can use this option.

Options can be passed as a comma-separated list in the `YEPCODE_MCP_OPTIONS` environment variable or as a query parameter in the MCP server URL.

```typescript
// SSE server configuration
{
  "mcpServers": {
    "yepcode-mcp-server": {
      "url": "https://cloud.yepcode.io/mcp/sk-c2E....RD/sse?mcpOptions=disableRunCodeTool,runCodeCleanup"
    }
  }
}

// NPX configuration
{
  "mcpServers": {
    "yepcode-mcp-server": {
      "command": "npx",
      "args": ["-y", "@yepcode/mcp-server"],
      "env": {
        "YEPCODE_API_TOKEN": "your_api_token_here",
        "YEPCODE_MCP_OPTIONS": "disableRunCodeTool,runCodeCleanup"
      }
    }
  }
}
```

### Environment Management

#### set_env_var

Sets an environment variable in the YepCode workspace.

```typescript
// Input
{
  key: string;                           // Variable name
  value: string;                         // Variable value
  isSensitive?: boolean;                 // Whether to mask the value in logs (default: true)
}
```

#### remove_env_var

Removes an environment variable from the YepCode workspace.

```typescript
// Input
{
  key: string;                           // Name of the variable to remove
}
```

### Storage Management

YepCode provides a built-in storage system that allows you to upload, list, download, and delete files. These files can be accessed from your code executions using the `yepcode.storage` helper methods.

#### list_files

Lists all files in your YepCode storage.

```typescript
// Input
{
  prefix?: string;                       // Optional prefix to filter files
}

// Response
{
  files: Array<{
    filename: string;                    // File name or path
    size: number;                        // File size in bytes
    lastModified: string;                // Last modification date
  }>;
}
```

#### upload_file

Uploads a file to YepCode storage.

```typescript
// Input
{
  filename: string;                      // File path (e.g., 'file.txt' or 'folder/file.txt')
  content: string | {                   // File content
    data: string;                        // Base64 encoded content for binary files
    encoding: "base64";
  };
}

// Response
{
  success: boolean;                      // Upload success status
  filename: string;                      // Uploaded file path
}
```

#### download_file

Downloads a file from YepCode storage.

```typescript
// Input
{
  filename: string;                      // File path to download
}

// Response
{
  filename: string;                      // File path
  content: string;                       // File content (base64 for binary files)
  encoding?: string;                     // Encoding type if binary
}
```

#### delete_file

Deletes a file from YepCode storage.

```typescript
// Input
{
  filename: string;                      // File path to delete
}

// Response
{
  success: boolean;                      // Deletion success status
  filename: string;                      // Deleted file path
}
```

### Process Execution

The MCP server can expose your YepCode Processes as individual MCP tools, making them directly accessible to AI assistants. This feature is enabled by just adding the `mcp-tool` tag to your process (see our docs to learn more about [process tags](https://yepcode.io/docs/processes/tags)).

There will be a tool for each exposed process: `run_ycp_<process_slug>` (or `run_ycp_<process_id>` if tool name is longer than 60 characters).

#### run_ycp_<process_slug>

```typescript
// Input
{
  parameters?: any;                      // This should match the input parameters specified in the process
  options?: {
    tag?: string;                        // Process version to execute
    comment?: string;                    // Execution context
  };
  synchronousExecution?: boolean;        // Whether to wait for completion (default: true)
}

// Response (synchronous execution)
{
  executionId: string;                   // Unique execution identifier
  logs: string[];                        // Process execution logs
  returnValue?: unknown;                 // Process output
  error?: string;                        // Error message if execution failed
}

// Response (asynchronous execution)
{
  executionId: string;                   // Unique execution identifier
}
```

#### get_execution

Retrieves the result of a process execution.

```typescript
// Input
{
  executionId: string;                   // ID of the execution to retrieve
}

// Response
{
  executionId: string;                   // Unique execution identifier
  logs: string[];                        // Process execution logs
  returnValue?: unknown;                 // Process output
  error?: string;                        // Error message if execution failed
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
