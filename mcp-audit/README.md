## gjq-audit（mcp-audit）— npm 依赖安全审计工具

`gjq-audit` 是一个基于 **npm 官方 `npm audit`** 的依赖漏洞审计工具，支持：

- **审计本地项目**（给定项目根目录）
- **审计远程仓库**（给定 Git 仓库 URL）
- 将审计结果渲染为**标准 Markdown 报告**并保存到文件（默认 `audit.md`）
- 作为 **MCP Server（stdio）** 启动，供 MCP Host 调用

> 该包在 npm 上同时暴露两个命令：`gjq-audit` 与 `mcp-audit`，功能等价。

---

## 适用场景（作用）

- 在发布/上线/合并前，对项目依赖进行漏洞扫描并生成可审阅的 Markdown 报告
- 在 CI 中自动产出 `audit.md`（可作为构建产物归档）
- 作为 MCP 工具接入到支持 MCP 的客户端/Agent，按需对指定工程进行审计

---

## 安装

### 全局安装（推荐用于本机常用）

```bash
npm i -g gjq-audit
```

安装后可直接使用：

```bash
gjq-audit --help
```

### 使用 npx（无需安装，推荐用于 CI/临时使用）

```bash
npx gjq-audit
```

---

## 快速开始

### 1）审计当前目录（默认输出到当前目录的 `audit.md`）

```bash
gjq-audit
```

### 2）审计指定本地项目目录

```bash
gjq-audit -p "C:\path\to\your-project"
```

### 3）审计远程仓库（URL）

```bash
gjq-audit -p "https://github.com/webpack/webpack"
```

### 4）自定义输出文件路径

```bash
gjq-audit -p "C:\path\to\your-project" -s "C:\path\to\report\audit.md"
```

---

## 命令与参数

### 命令

- `gjq-audit`：CLI 审计命令
- `mcp-audit`：同一个 CLI 的别名命令（等价）

### 参数解析规则（重要）

该 CLI 支持 **flag 参数**与**位置参数**两种写法：

- **flag 参数**
  - `-p` / `--projectRoot <pathOrUrl>`：要审计的项目根目录（本地绝对/相对路径，或远程仓库 URL）
  - `-s` / `--savePath <filePath>`：审计报告保存路径（可为相对路径）
  - `--mcp`：以 MCP Server（stdio）模式启动（不执行一次性审计）
- **位置参数**
  - 第 1 个位置参数：`projectRoot`
  - 第 2 个位置参数：`savePath`

> 当 `-p/-s` 和位置参数同时出现时，`-p/-s` 优先填充对应值；其余未填的部分再由位置参数补齐。

---

## 输出说明

- **默认输出文件**：若未提供 `-s/--savePath`，则输出到 `projectRoot/audit.md`  
  - 如果未提供 `projectRoot`，默认以当前工作目录作为 `projectRoot`
- **输出格式**：Markdown（`.md`）
- **内容来源**：内部使用 `npm audit --json` 获取审计结果，再渲染为 Markdown

---

## MCP 模式（stdio Server）

当你希望把它作为 MCP 工具接入到支持 MCP 的 Host（例如某些 IDE/Agent）时，可以使用 `--mcp` 启动：

```bash
gjq-audit --mcp
```

此模式下程序会启动 MCP Server 并通过 stdio 等待调用，**不会**直接生成 `audit.md`（除非 Host 发起对应工具调用）。

---

## 更多示例

### 使用位置参数（不写 `-p/-s`）

```bash
gjq-audit "C:\path\to\your-project" "C:\path\to\audit.md"
```

### 输出到项目目录下的自定义文件名

```bash
gjq-audit -p "C:\path\to\your-project" -s "C:\path\to\your-project\security-audit.md"
```

---

## 常见问题（FAQ）

### 1）为什么命令退出码可能为 1？

`npm audit` 在发现漏洞时通常会返回非 0 退出码（常见为 1）。本工具会尽量从 `npm audit --json` 的输出中解析结果并继续生成报告，但如果 `npm audit` 没有输出合法 JSON，仍可能失败。

### 2）运行需要联网吗？

- 远程仓库审计：需要联网拉取/解析仓库
- 本地项目审计：通常也需要联网以完成依赖信息/审计数据获取（取决于 npm 的行为与缓存）

### 3）会修改我的项目文件吗？

不会直接在你的项目目录里执行 `npm install`。工具会创建临时工作目录，在临时目录内生成 lock 并审计，然后清理临时目录；最终只会在你指定的 `savePath` 写入一份 Markdown 报告（默认写到 `projectRoot/audit.md`）。

---

## 许可证

MIT

