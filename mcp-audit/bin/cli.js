#!/usr/bin/env node
import path from 'path';
import { auditPackage } from '../src/entry/index.js';

function parseArgs(argv) {
  // 极简参数解析：支持
  // -p/--projectRoot <path>
  // -s/--savePath <path>
  // --mcp 启动 MCP stdio server
  const args = { projectRoot: undefined, savePath: undefined, mcp: false };
  const list = [...argv];

  function peekValue(i) {
    const v = list[i + 1];
    if (!v) return undefined;
    if (typeof v !== 'string') return undefined;
    // 如果下一个 token 还是 flag，则视为“未填写路径”
    if (v.startsWith('-')) return undefined;
    return v;
  }

  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    if (a === '--mcp') {
      args.mcp = true;
      continue;
    }
    if (a === '-p' || a === '--projectRoot') {
      const v = peekValue(i);
      if (v !== undefined) {
        args.projectRoot = v;
        i++;
      }
      continue;
    }
    if (a === '-s' || a === '--savePath') {
      const v = peekValue(i);
      if (v !== undefined) {
        args.savePath = v;
        i++;
      }
      continue;
    }
    // 不带 flag 的位置参数：第一个 projectRoot，第二个 savePath
    if (!a.startsWith('-') && !args.projectRoot) {
      args.projectRoot = a;
      continue;
    }
    if (!a.startsWith('-') && args.projectRoot && !args.savePath) {
      args.savePath = a;
      continue;
    }
  }

  return args;
}

function toAbs(p) {
  if (!p) return p;
  return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
}

(async () => {
  const { projectRoot, savePath, mcp } = parseArgs(process.argv.slice(2));

  if (mcp) {
    // 作为 MCP server 运行：stdio 等待上层 host 调用
    await import('../src/mcpServer.js');
    return;
  }

  const root = toAbs(projectRoot) ?? process.cwd();

  // 默认输出：当前项目目录下的 audit.md
  // 用户也可以通过 -s/--savePath 覆盖输出文件名
  const outFile = toAbs(savePath) ?? path.join(root, 'audit.md');

  try {
    console.log(`[mcp-audit] projectRoot: ${root}`);
    console.log(`[mcp-audit] savePath: ${outFile}`);
    console.log('[mcp-audit] start audit...');

    await auditPackage(root, outFile);

    console.log('[mcp-audit] done.');
  } catch (err) {
    console.error('[mcp-audit] failed:', err?.message ?? err);
    process.exitCode = 1;
  }
})();

