# MCP Server for YepCode API

This is an MCP (Model Context Protocol) server that integrates with the YepCode API, allowing you to execute code through YepCode's infrastructure. Built with TypeScript for type safety and better developer experience.

## Features

- Implements the Model Context Protocol (MCP) specification
- Uses stdio transport for communication
- Type-safe with TypeScript and Zod schema validation
- Integrates with YepCode's code execution infrastructure
- Proper error handling with MCP error types

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
- Copy `.env.example` to `.env`
- Add your YepCode API key to the `.env` file

## Running the Server

Development mode (with hot reload):
```bash
npm run dev
```

Build and run in production:
```bash
npm run build
npm start
```

Type checking:
```bash
npm run type-check
```

## MCP Tools

### run_code

Executes code using YepCode's infrastructure.

Input schema:
```typescript
{
  code: string;
  context?: Record<string, unknown>;
}
```

Response:
```typescript
{
  success: boolean;
  returnValue?: unknown;  // The final return value of the execution
  logs?: string[];       // Array of logs collected during execution
  error?: {
    message: string;     // Error message if execution failed
    stack?: string;      // Error stack trace if available
  };
}
```

### set_env_var

Sets a YepCode environment variable.

Input schema:
```typescript
{
  key: string;
  value: string;
  isSensitive?: boolean; // defaults to true
}
```

Response:
```typescript
{
  success: boolean;
  error?: {
    message: string;
  };
}
```

### remove_env_var

Removes a YepCode environment variable.

Input schema:
```typescript
{
  key: string;
}
```

Response:
```typescript
{
  success: boolean;
  error?: {
    message: string;
  };
}
```

## Error Handling

The server uses MCP error types for proper error handling:

- `MethodNotFound`: When an unknown tool is requested
- `InvalidParams`: When the input parameters don't match the schema
- `InternalError`: For server-side errors (e.g., missing API key)

## Development

The project uses TypeScript for type safety. The main source files are in the `src` directory, and the compiled JavaScript files will be in the `dist` directory.

- `src/types.ts`: Contains TypeScript interfaces and Zod schemas
- `src/index.ts`: Main server implementation with MCP protocol handlers