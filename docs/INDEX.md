# Phase 0 文档索引

> 文档版次：0.1.0-docs.1 · 2026-11-25 · Phase 0 文档交付；游戏尚未实现。
> 来源：[输入基准](reference/SOURCE-BASELINE.md)；对应章节 / 说明：17。
> 效力：仅 PRD 明列项为用户已确认；其余沿用设计基准。本文新增接口细化、测试设计、任务拆分属于交付建议；所有初始数值待模拟与试玩验证。
> 待决议建议没有生效；受影响规则落地前须关闭对应 [D 项](development/OPEN-DECISIONS.md)（验证型门按登记说明执行）。

## 阅读规则与唯一来源

先读 [README](../README.md)、[PRD](product/PRD.md) 和 [OPEN-DECISIONS](development/OPEN-DECISIONS.md)。源文件只有第 1.1 节明确用户选择是已确认；参数与其余机制是设计基准；所有初值待验证。新增技术细化均不替代人工决议。

技能/EP 只以 SKILLS 的表为权威；词缀以 PROTOCOLS；关卡以 LEVELS；Boss 以 BOSS；回滚/回放以 SAVE-REPLAY。其他文件只引用或提供验收例，不能另定冲突规则。

## 文档目录

### 入口与产品

- [2048: INFINITE — Phase 0 文档包](../README.md)
- [AGENTS.md](../AGENTS.md)
- [产品需求 PRD](product/PRD.md)

### 游戏设计

- [数值平衡 BALANCE](game-design/BALANCE.md)
- [中央控制协议 ZERO BOSS](game-design/BOSS.md)
- [游戏设计总纲 GDD](game-design/GDD.md)
- [六个系统节点 LEVELS](game-design/LEVELS.md)
- [十二环境词缀 PROTOCOLS](game-design/PROTOCOLS.md)
- [棋盘与通用规则 RULES](game-design/RULES.md)
- [成长、共享 EP 与十二技能 SKILLS](game-design/SKILLS.md)
- [视觉、页面与交互 UI-UX](game-design/UI-UX.md)

### 工程架构

- [Monorepo 技术架构](architecture/ARCHITECTURE.md)
- [确定性引擎与规则扩展](architecture/ENGINE.md)
- [存档、随机数、回滚与回放](architecture/SAVE-REPLAY.md)
- [数值模拟器规格](architecture/SIMULATION.md)
- [状态模型与生命周期](architecture/STATE.md)

### 开发与质量

- [AI Coding 工作流](development/AI-WORKFLOW.md)
- [开发 Backlog 与依赖](development/BACKLOG.md)
- [CI、质量门禁与部署](development/CI-CD.md)
- [待决议与冲突登记 OPEN-DECISIONS](development/OPEN-DECISIONS.md)
- [Phase 0 验收](development/PHASE0-ACCEPTANCE.md)
- [里程碑与实施路线 ROADMAP](development/ROADMAP.md)
- [来源、覆盖与变更追溯](development/SOURCE-TRACEABILITY.md)
- [可追溯测试用例目录](development/TEST-CASES.md)
- [测试策略与验收规范](development/TESTING.md)

### ADR

- [ADR-001 Monorepo 多包架构](adr/001-monorepo.md)
- [ADR-002 确定性纯 TypeScript 引擎](adr/002-deterministic-engine.md)
- [ADR-003 共享 EP 能量池](adr/003-shared-energy.md)
- [ADR-004 快照、日志与种子](adr/004-save-replay.md)
- [ADR-005 关卡重置与通关成长](adr/005-level-growth.md)
- [ADR-006 固定目标与单随机词缀](adr/006-protocols.md)
- [ADR-007 ZERO A→D 渐进演进](adr/007-boss-evolution.md)
- [ADR-008 模拟与人工试玩](adr/008-simulation-playtest.md)
- [ADR-009 轻量规则扩展](adr/009-rule-modules.md)
- [ADR-010 Vue H5 与 CSS/WAAPI](adr/010-vue-rendering.md)
- [ADR-011 Issue、Agent、Draft PR 与人工合并](adr/011-human-review.md)

### 仓库模板

- [问题与影响](../.github/ISSUE_TEMPLATE/bug.md)
- [背景与目标](../.github/ISSUE_TEMPLATE/feature.md)
- [变更摘要](../.github/pull_request_template.md)

### 来源快照

- [2048: INFINITE（2048：无限进化）](reference/SOURCE-BASELINE.md)

## 任务卡入口

[全部 63 张任务卡及依赖](development/BACKLOG.md)。原 39 工作包没有重新编号；12 技能子卡前缀 M3-04-S，12 词缀子卡前缀 M4-04-P。
