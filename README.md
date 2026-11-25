# 2048: INFINITE — Phase 0 文档包

> 文档版次：0.1.0-docs.1 · 2026-11-25 · Phase 0 文档交付；游戏尚未实现。
> 来源：[输入基准](docs/reference/SOURCE-BASELINE.md)；对应章节 / 说明：17。
> 效力：仅 PRD 明列项为用户已确认；其余沿用设计基准。本文新增接口细化、测试设计、任务拆分属于交付建议；所有初始数值待模拟与试玩验证。
> 待决议建议没有生效；受影响规则落地前须关闭对应 [D 项](docs/development/OPEN-DECISIONS.md)（验证型门按登记说明执行）。

本目录是可复制进 Git 仓库的 Markdown 设计包。当前交付仅包含文档，不含游戏业务代码、依赖文件、工作流实现或游戏构建；也未修改任何真实仓库、创建远程 Issue/PR 或部署。

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

## 如何入库

解压后保留本目录内部的相对路径，将需要的文件复制到目标仓库；若仓库已有 README、AGENTS 或同名文档，先比较后人工合并，不覆盖团队已有规则。本次没有执行复制入真实仓库的操作。

目录中的 `.github` 是模板文档，请让文件浏览器显示隐藏目录。`pnpm` 命令仅为未来规划；当前没有 package.json、锁文件或可运行游戏。后续 Phase 1 再核实依赖版本并建立工程。

`AGENTS.md`、ADR、路线图及任务卡均为用户本次明确要求的项目交付文件，不是自动安装的全局个人配置。完整路径清单与用途见交付目录旁的 DELIVERY-FILES.md。
