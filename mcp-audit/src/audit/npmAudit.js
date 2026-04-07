import fs from 'fs';
import { join } from 'path';
import { runCommand } from '../common/utils.js';

export async function npmAudit(workDir) {
  const cmd = `npm audit --json`;
  let jsonResult = '';
  try {
    jsonResult = await runCommand(cmd, workDir); // 在工作目录中执行命令
  } catch (err) {
    // npm audit 发现漏洞时通常会返回 exit code=1，但 stdout 仍然是合法 JSON
    // runCommand 会把 stdout 拼在 err.message 里（带 "stdout:" 前缀）
    const msg = err?.message ?? '';
    const m = msg.match(/stdout:\s*([\s\S]*)$/);
    if (!m?.[1]) throw err;
    jsonResult = m[1];
  }

  // 防御性处理：截取第一个 { 到最后一个 }，避免 stdout 混入其它输出导致 JSON.parse 失败
  const start = jsonResult.indexOf('{');
  const end = jsonResult.lastIndexOf('}');
  const jsonText =
    start >= 0 && end >= start ? jsonResult.slice(start, end + 1) : jsonResult;

  return JSON.parse(jsonText);
}
