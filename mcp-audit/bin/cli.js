#!/usr/bin/env node

// 通过 npx mcp-audit 启动 MCP Server（使用 stdio 通信）
// 由于 mcpServer.js 里已经完成了 server.connect(transport)，这里只需要导入即可。
import "../src/mcpServer.js";

