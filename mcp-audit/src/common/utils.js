import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';

/**
 * 运行外部命令并返回 stdout（字符串）。
 * - 使用 spawn 以避免 exec 的输出缓冲/卡死问题
 * - 默认实时透传 stdout/stderr，便于用户看到进度
 * - 支持超时，避免命令无期限挂起
 */
export async function runCommand(
  cmd,
  cwd,
  {
    timeoutMs = 10 * 60 * 1000,
    pipeToParent = true,
    prefix = '',
  } = {}
) {
  return await new Promise((resolve, reject) => {
    const child = spawn(cmd, {
      cwd,
      shell: true,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    const onStdout = (buf) => {
      const s = buf.toString('utf8');
      stdout += s;
      if (pipeToParent) process.stdout.write(prefix ? `${prefix}${s}` : s);
    };
    const onStderr = (buf) => {
      const s = buf.toString('utf8');
      stderr += s;
      if (pipeToParent) process.stderr.write(prefix ? `${prefix}${s}` : s);
    };

    child.stdout?.on('data', onStdout);
    child.stderr?.on('data', onStderr);

    const timer =
      timeoutMs > 0
        ? setTimeout(() => {
            child.kill();
            reject(
              new Error(
                `Command timed out after ${timeoutMs}ms: ${cmd} (cwd: ${cwd})`
              )
            );
          }, timeoutMs)
        : null;

    child.on('error', (err) => {
      if (timer) clearTimeout(timer);
      reject(err);
    });

    child.on('close', (code, signal) => {
      if (timer) clearTimeout(timer);
      if (code === 0) return resolve(stdout);

      const err = new Error(
        `Command failed (code=${code ?? 'null'}, signal=${signal ?? 'null'}): ${cmd}\n` +
          (stderr ? `stderr:\n${stderr}\n` : '') +
          (stdout ? `stdout:\n${stdout}\n` : '')
      );
      reject(err);
    });
  });
}

export function uniqueId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function getFilename(importMetaUrl) {
  return fileURLToPath(importMetaUrl);
}

export function getDirname(importMetaUrl) {
  return dirname(getFilename(importMetaUrl));
}
