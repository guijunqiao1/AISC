import { createWorkDir, deleteWorkDir } from '../workDir/index.js';
import { parseProject } from '../parseProject/index.js';
import { generateLock } from '../generateLock/index.js';
import { audit } from '../audit/index.js';
import { render } from '../render/index.js';
import fs from 'fs';

/**
 * 根据项目根目录，审计项目中所有的包（含项目本身）
 * @param {string} projectRoot 项目根目录，可以是本地目录的绝对路径，也可以是远程仓库的URL
 * @param {string} savePath 保存审计结果的文件名，审计结果是一个标准格式的markdown字符串
 */
export async function auditPackage(projectRoot, savePath) {
  // 1. 创建工作目录
  console.log('[mcp-audit] create work dir...');
  const workDir = await createWorkDir();
  // 2. 解析项目，向工作目录添加pacakge.json
  console.log('[mcp-audit] parse project/package.json...');
  const packageJson = await parseProject(projectRoot);
  // 3. 生成lock文件
  console.log('[mcp-audit] generate lock (npm install --package-lock-only)...');
  await generateLock(workDir, packageJson);
  // 4. 对工作目录进行审计
  console.log('[mcp-audit] start audit...');
  const auditResult = await audit(workDir, packageJson);
  // 5. 渲染审计结果
  console.log('[mcp-audit] render markdown...');
  const renderedResult = await render(auditResult, packageJson);
  // 6. 删除工作目录
  console.log('[mcp-audit] cleanup work dir...');
  await deleteWorkDir(workDir);
  // 7. 将结果保存到指定路径
  console.log('[mcp-audit] write file...');
  await fs.promises.writeFile(savePath, renderedResult);
}
