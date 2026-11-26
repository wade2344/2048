# 开发交接记录

每个可验收步骤完成或中断时追加一条，注明日期、任务、当前步骤、做了什么、完成证据、剩余工作或优化，以及下一位开发者的第一步。历史记录以当时的提交或基线为准。开工前先核对当前分支和未提交改动。

## 2026-11-25 · M0-01 · 工程初始化

- 当前步骤：从已提交的 Phase 0 基线 d78554b 开始 Phase 1。工作分支为 phase1/workspace-ci。
- 做了什么：建立 Vue/Vite Web 和 Node/tsx 命令行应用，公共引擎和配置使用 workspace 包导出。仓库统一维护严格 TypeScript、ESLint、Vitest、pnpm Catalog 与锁文件。
- 已完成：pnpm check 通过，涵盖 lint、类型检查、1 项独立棋盘行测试和四包构建检查。Web 生成 dist，其他三个包走源码消费和类型检查。pnpm simulate 返回 4×4 空矩阵。人为添加循环依赖、跨包深层导入均被检查拒绝。两项临时修改均已撤回。
- 环境与边界：本机 pnpm 10.32.1，锁定版本详见 pnpm-workspace.yaml 和 pnpm-lock.yaml。D15 的设备、性能和部署部分仍开放。小游戏规则及平衡参数继续按设计文档推进。
- 剩余优化：命令行入口目前只检查共享引擎是否可用，真正的批量模拟在 M7。后续在 CI 核实 Node 22 上的结果，记录实际版本。

## 2026-11-25 · M0-04 · 基础 CI 与协作约定

- 做了什么：加入 GitHub Actions 的 Engineering checks，在 PR 或手动触发时按锁文件安装并运行 pnpm check 和命令行冒烟检查。README 提供本地入口，AGENTS.md 将逐步写交接记录列入交付要求。
- 已完成：本地验证工作流中的命令。远端 Actions 运行、main 的 required checks 与失败 PR 阻止合并仍待验证。
- 下一位开发者：在本工作分支运行 pnpm install --frozen-lockfile 和 pnpm check。审阅后通过 Draft PR 首次运行 CI，在 GitHub 验证 Engineering checks 的 check 作业与分支保护。将 PR、运行结果、保护验证及待办追加到此处。随后按 M1-01/M1-02 查看随机数与数值安全边界的待决议。

## 2026-11-26 · M9 小程序版排期

当前处于 Phase 1。已将小程序版加入路线图与 Backlog，列明三步交付、依赖、双端一致性和真机验收。完成范围为排期，平台选型与工期等待样机验证。当前开发者继续 M0-04 远端验收。随后保持引擎独立于浏览器，M5 后由接手者确认目标平台，安排 M9-01 真机样机。
