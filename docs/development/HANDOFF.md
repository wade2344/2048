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

## 2026-11-26 · Phase 1 提交核对

已核对工程基线提交 77cc730。核对时本地 phase1/workspace-ci 与远端跟踪分支指向同一提交，工作区干净。GitHub 按该分支查询未返回 PR。下一步为该分支向 main 开 Draft PR，记录 Engineering checks 的运行链接和结果，再核实 main 是否要求该检查通过才能合并。M0-04 远端验收仍待完成。

## 2026-11-26 · Phase 2 / M1-02 常规移动审阅稿

从远端 main 的 e5d4d40 建立 phase2/board-move。纯函数 moveBoard 压缩四方向的普通方块，每次滑动内每对仅合并一次，返回基础分数和含 ID、坐标的位移与合并事件。本次实现选择沿移动方向靠前的方块 ID 作为合并后的 ID，供人工审阅。

已执行 pnpm check，23 项测试通过，含 22 项移动用例。覆盖原五个数组的四方向变体、冻结输入、数值总和、无效滑动、纯位移与事件来源。类型检查、lint 与四包构建检查通过。当前入口供引擎调用，图形交互留给后续任务。

用户选择先审阅常规移动，D11 数值和溢出策略保持 OPEN。下一位开发者先核对 Draft PR、CI 与人工意见，批准数值边界后再补极值用例、验收并合并。GitHub 连接的 Issue 创建响应没有返回可验证编号，补关联前先检查重复项。

远端交接：功能提交 e65f423 已推送。GitHub 提示仓库已迁移至 wade2344/2048。在新地址按标题查询未找到对应 Issue，创建 Issue 和 Draft PR 均返回 HTTP 403（集成无写权限）。下一步由有权限的维护者建立 Issue 和 Draft PR，或为连接授予本仓库 Issues / Pull requests 写权限后重试。PR 工作流尚待触发，目标分支 main。
## 2026-11-26 · M1-01 可复现随机流

用户已审阅常规移动。[PR #3](https://github.com/wade2344/2048/pull/3) 的 [Engineering checks](https://github.com/wade2344/2048/actions/runs/45802211010) 成功。同步时 main 为 e5d4d40，移动分支尚待人工合并。本步骤独立从 main 构建。

已实现 D16 候选 mulberry32-streams-v1，使用无符号 32 位种子、固定偏移派生 board/reward/protocol/boss 四路状态、有版本标识的快照恢复及无偏索引抽样。改变算法或派生方式会改变回放序列，需明确版本身份。此方案供审阅，D11/D16 保持开放。

pnpm check 通过，包括 5 个新增用例与 1 个原有测试。已核对固定序列、四流隔离、JSON 快照恢复、拒绝抽样及非法参数。下一步审阅该独立分支；两项集成时注意两个分支均在引擎 index.ts 追加导出，保留 move 和 random。进入 M1-03 前确认 D01 初始棋盘、D02 判胜及 D18 初始化事务；每步继续更新本记录。
