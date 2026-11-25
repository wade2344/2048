# 来源、覆盖与变更追溯

> 文档版次：0.1.0-docs.1 · 2026-11-25 · Phase 0 文档交付；游戏尚未实现。
> 来源：[输入基准](../reference/SOURCE-BASELINE.md)；对应章节 / 说明：全篇。
> 效力：仅 PRD 明列项为用户已确认；其余沿用设计基准。本文新增接口细化、测试设计、任务拆分属于交付建议；所有初始数值待模拟与试玩验证。
> 待决议建议没有生效；受影响规则落地前须关闭对应 [D 项](OPEN-DECISIONS.md)（验证型门按登记说明执行）。

## 来源与效力

唯一主输入：用户上传《2048-INFINITE-Phase0-完整设计基准.md》，版本 0.1.0，日期 2026-11-25。本次不再读取聊天分享链接；前次不完整聊天片段未用来补写或覆盖本文件。

来源快照按原文件字节保存，保留全部 17 节；快照只用于审计，未来规范修订在分规格中进行并记录决议。文件 SHA-256：`3cc2f54cee2d81d7cdda027504ca580805e57c7f12d18ed776e5a918c239dd60`。

| 输入节 | 主目标文档 | 保留/拆分方式 |
|---|---|---|
| 1 | [PRD](../product/PRD.md) | 已确认选择、首版范围、版本路线原文 |
| 2 | [GDD](../game-design/GDD.md) | 世界观、术语、循环与继承原文 |
| 3 | [RULES](../game-design/RULES.md) | 移动/障碍示例、结算冲突、事务原文 |
| 4 | [LEVELS](../game-design/LEVELS.md) | 六关名称、目标、词缀池、奖励原表 |
| 5 | [SKILLS](../game-design/SKILLS.md) | 奖励、EP、12 技能、组合与风险原文 |
| 6 | [PROTOCOLS](../game-design/PROTOCOLS.md) | 12 词缀、效果、代价、兼容原文 |
| 7 | [BOSS](../game-design/BOSS.md) | 1000 HP/伤害/封锁/保护与 A→D 原文 |
| 8 | [UI-UX](../game-design/UI-UX.md) | Token、数字色阶、页面、输入/时长原文 |
| 9 | [SAVE-REPLAY](../architecture/SAVE-REPLAY.md) | 四流、接口草案、回滚、回放原文 |
| 10.1/10.5 | [ARCHITECTURE](../architecture/ARCHITECTURE.md) | 技术栈/目录/依赖、Web/模拟隔离原文 |
| 10.2/10.4 | [ENGINE](../architecture/ENGINE.md) | 纯引擎接口、事件/修饰器原文 |
| 10.3 | [STATE](../architecture/STATE.md) | 字段/状态机原文，加明确标注的字典细化 |
| 11.1/11.3/11.4 | [BALANCE](../game-design/BALANCE.md) | 全部目标、实验初值、试玩标准原文 |
| 11.2/11.3 | [SIMULATION](../architecture/SIMULATION.md) | Bot/CLI/指标原文，加报告契约建议 |
| 12.1 | [TESTING](TESTING.md)、[CI-CD](CI-CD.md) | 测试矩阵与 CI/脚本要求分离，未声称执行 |
| 12.2 | [AI-WORKFLOW](AI-WORKFLOW.md) | 原流程及人工控制 |
| 13 | [AGENTS](../../AGENTS.md) | 原正文及来源/授权边界说明 |
| 14 | [11 项 ADR](../INDEX.md) | 逐条保留决定与替代方案，未自动 Accepted |
| 15 | [OPEN-DECISIONS](OPEN-DECISIONS.md) | D01–D15 原问题/建议逐字保留；另增 D16–D19 |
| 16 | [BACKLOG](BACKLOG.md)、[ROADMAP](ROADMAP.md) | 39 ID/名称/原前置/原验收保留；新增 24 子卡 |
| 17 | [INDEX](../INDEX.md)、[验收](PHASE0-ACCEPTANCE.md) | 要求目录与验收逐项映射 |

## 本次新增内容的性质

新增字段字典、验收用例、依赖展开、子卡、报告建议和 ADR 验证条目均是文档组织/实施细化建议，不是新的已确认玩法。D16–D19 记录由原规格未闭合的接口契约，未选择具体答案。完整数值参数未修改。

旧稿中的经验成长、独立次数、玩家 HP/多阶段 Boss 均仅作为淘汰或未来范围讨论，不进入首版。数学示例、虚构图表与计划 CLI 的「非实测/未实现」标识保留。
