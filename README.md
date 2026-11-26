# 2048: INFINITE

## 本地开发

使用 Node.js 22.12 或更高版本和 pnpm 10.32.1。在仓库根目录执行：

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm dev
```

Web 显示工程预览。执行 `pnpm simulate` 可检查命令行应用是否通过公共包建立空棋盘。

每次开始或交接开发前，请读[开发交接记录](docs/development/HANDOFF.md)。

## 开始阅读

1. [文档索引](docs/INDEX.md)：按职责导航。
2. [PRD](docs/product/PRD.md)：用户已确认的产品选择及首版边界。
3. [GDD](docs/game-design/GDD.md)：完整玩法总纲与分规格入口。
4. [待决议登记](docs/development/OPEN-DECISIONS.md)：19 项 OPEN；其中原稿 15 项，本次补识别 4 项。
5. [Backlog](docs/development/BACKLOG.md)：39 原工作包 + 24 内容子卡，共 63 张任务卡。
6. [Phase 0 验收](docs/development/PHASE0-ACCEPTANCE.md)：真实检查结果与剩余问题。

## 效力和数值

「用户已确认」限于 PRD 第 1.1 节的明确选择；具体效果/参数沿用设计基准；待决议建议不自动生效。本包新增测试设计、字段字典、依赖细化属于交付建议。所有游戏初值与难度目标待模拟和人工试玩验证。

源稿原样保存在 [来源快照](docs/reference/SOURCE-BASELINE.md)，覆盖映射与 SHA-256 见 [来源追溯](docs/development/SOURCE-TRACEABILITY.md)。快照为审计，不是第二套可独立修改的规则真源；日常规范以索引指定分规格为入口，冲突先登记并人工裁决。
