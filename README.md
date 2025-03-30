![YepCode MCP Server Preview](/readme-assets/cover.png)

<div align="center">

[![NPM version](https://img.shields.io/npm/v/@yepcode/mcp-server.svg)](https://npmjs.org/package/@yepcode/mcp-server)
[![NPM Downloads](https://img.shields.io/npm/dm/@yepcode/mcp-server)](https://www.npmjs.com/package/@yepcode/mcp-server)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/yepcode/mcp-server-js/ci.yml)](https://github.com/yepcode/mcp-server-js/actions)

</div>

## What is YepCode MCP Server?

An MCP ([Model Context Protocol](https://modelcontextprotocol.io/introduction)) server that enables AI platforms to interact with [YepCode](https://yepcode.io)'s infrastructure. Turn your YepCode processes into powerful tools that AI assistants can use directly.

### Why YepCode MCP Server?

- **Seamless AI Integration**: Convert YepCode processes into AI-ready tools with zero configuration
- **Real-time Process Control**: Enable direct interaction between AI systems and your workflows
- **Enterprise-Grade Security**: Execute code in YepCode's isolated, production-ready environments
- **Universal Compatibility**: Integrate with any AI platform supporting the Model Context Protocol

## Integration Guide

YepCode MCP server can be integrated with AI platforms like [Cursor](https://cursor.sh) or [Claude Desktop](https://www.anthropic.com/news/claude-desktop) using either NPX or Docker.

#### Required Environment Variables

- `YEPCODE_API_TOKEN`: Your YepCode API token. How to obtain:
  1. Sign up to [YepCode Cloud](https://cloud.yepcode.io)
  2. Get your API token from your workspace under: `Settings` > `API credentials`
- `YEPCODE_PROCESSES_AS_MCP_TOOLS`: Set to "true" to expose YepCode processes as individual MCP tools (optional)

### Using NPX

Add the following configuration to your AI platform settings:

```typescript
{
  "mcpServers": {
    "yepcode-mcp-server": {
      "command": "npx",
      "args": ["-y", "@yepcode/mcp-server"],
      "env": {
        "YEPCODE_API_TOKEN": "your_api_token_here",
        "YEPCODE_PROCESSES_AS_MCP_TOOLS": "true"
      }
    }
  }
}
```

### Using Docker

1. Build the container image:
```bash
docker build -t yepcode/mcp-server .
```

2. Add the following configuration to your AI platform settings:
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
        "-e",
        "YEPCODE_PROCESSES_AS_MCP_TOOLS=true",
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
  success: boolean;                      // Whether the execution was successful
  returnValue?: unknown;                 // Execution result
  logs?: string[];                       // Console output
  error?: string;                        // Error message if execution failed
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

### Process Execution

The MCP server can expose your YepCode Processes as individual MCP tools, making them directly accessible to AI assistants. This feature is enabled by setting `YEPCODE_PROCESSES_AS_MCP_TOOLS=true` in your environment.

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

