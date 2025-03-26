# YepCode MCP Server 🤖

An MCP (Model Context Protocol) server that enables AI platforms to interact with YepCode's infrastructure. Turn your YepCode processes into powerful tools that AI assistants can use directly.

## Why YepCode MCP Server? ✨

- **AI-Ready Automation** 🧠: Transform your YepCode processes into tools that any AI assistant can use
- **Bidirectional Communication** 🔄: Create two-way interactions between AI systems and your automation workflows
- **Secure Infrastructure** 🔒: Execute code and processes in YepCode's secure, isolated environments
- **Flexible Integration** 🔌: Works with any AI assistant that supports the Model Context Protocol (Claude, Cursor, etc.)

## What is this for? 🎯

This MCP server allows you to:

### 1. Create Custom AI Tools 🛠️

Build specialized tools for your AI assistants by creating YepCode processes for:

- 📊 Database queries and operations
- 🔗 API integrations
- 🔄 Data transformations
- 💡 Custom business logic
- 🔑 Authentication flows
- 📁 File processing

### 2. Execute Code ⚡

- 💻 Run code snippets in various programming languages
- 🧪 Test AI-generated code in isolated environments
- ⏱️ Execute long-running processes
- 🔐 Access secure computing resources

### 3. Manage Infrastructure 🏗️

- ⚙️ Set and manage environment variables
- 🎮 Control access to resources
- 📊 Monitor executions
- ⚠️ Handle errors gracefully

## Quick Start 🚀

### 1. Installation 📦

```bash
npm install @yepcode/mcp-server
```

### 2. Configuration ⚙️

Create a `.env` file:

```bash
YEPCODE_API_KEY=your_api_key_here
YEPCODE_PROCESSES_AS_MCP_TOOLS=true  # Optional: Expose YepCode processes as individual MCP tools
```

### 3. Integration with AI Platforms

This is the tipical JSON confiuration to be added to tools like Cursor or Claude Desktop.

```json
{
  "mcpServers": {
    "yepcode-mcp-server": {
      "command": "npx",
      "args": ["-y", "@yepcode/mcp-server"],
      "env": {
        "YEPCODE_API_KEY":"your_api_key_here",
        "YEPCODE_PROCESSES_AS_MCP_TOOLS": "true"
      }
    }
  }
}
```

## Available Tools 🧰

### run_code 💻

Executes code in YepCode's secure environment.

```typescript
// Input
{
  code: string;
  options?: {
    language?: string;                    // Programming language (default: 'javascript')
    parameters?: Record<string, unknown>; // Runtime parameters
    tag?: string;                        // Version tag
    comment?: string;                    // Execution context
    settings?: Record<string, unknown>;  // Runtime settings
  }
}

// Response
{
  success: boolean;
  returnValue?: unknown;  // Execution result
  logs?: string[];       // Console output
  error?: string;
}
```

### Environment Variables 🔐

#### set_env_var

Sets an environment variable.

```typescript
// Input
{
  key: string;
  value: string;
  isSensitive?: boolean; // Mask value in logs (default: true)
}
```

#### remove_env_var

Removes an environment variable.

```typescript
// Input
{
  key: string;
}
```

### Run YepCode Processes as MCP Tools ⚡

#### run_yepcode_process_*

When `YEPCODE_PROCESSES_AS_MCP_TOOLS=true`, each YepCode process becomes available as an individual MCP tool. This provides better discoverability and direct access to your processes from AI assistants.

There will be a tool for each YepCode process: `run_yepcode_process_<process_slug>`.

```typescript
// Input
{
  parameters?: any;
  options?: {
    tag?: string;      // Process version
    comment?: string;  // Execution context
  };
  synchronousExecution?: boolean;  // Wait for completion (default: true)
}

// Response (synchronous execution)
{
  executionId: string;
  logs: string[];
  returnValue?: unknown;
  error?: string;
}

// Response (asynchronous execution)
{
  executionId: string;
}
```

#### get_execution

Retrieves the result of an execution.

```typescript
// Input
{
  executionId: string;
}

// Response
{
  executionId: string;
  logs: string[];
  returnValue?: unknown;
  error?: string;
}
```

## License ⚖️

All rights reserved by YepCode. Usage is subject to [YepCode Terms of Service](https://yepcode.io/terms-of-use).
