# 开发 Backlog 与依赖

> 文档版次：0.1.0-docs.1 · 2026-11-25 · Phase 0 文档交付；游戏尚未实现。
> 来源：[输入基准](../reference/SOURCE-BASELINE.md)；对应章节 / 说明：16；任务拆分为本次交付建议。
> 效力：仅 PRD 明列项为用户已确认；其余沿用设计基准。本文新增接口细化、测试设计、任务拆分属于交付建议；所有初始数值待模拟与试玩验证。
> 待决议建议没有生效；受影响规则落地前须关闭对应 [D 项](OPEN-DECISIONS.md)（验证型门按登记说明执行）。

## 范围和计数

保留源文件 39 个 M0–M8 工作包；新增 12 张技能子卡、12 张词缀子卡，共 63 张独立 Markdown 任务卡。新增子卡只拆小开发范围，没有增加第 13 个技能或词缀。M3-04/M4-04 作为集合集成验收，避免与子卡重复实施。

所有编号为计划 ID，未创建真实 GitHub Issue。依赖展开为本次实施建议；源粗粒度前置同时保留在各卡片。依赖图经过存在性和无环校验，状态均不是已完成代码。

## 原始 39 个工作包及精确前置

| ID / 任务 | 原前置 | 精确实施依赖 | 直接决议门 |
|---|---|---|---|
| [M0-01 pnpm Workspace 与共享配置](issues/M0-01.md) | Phase 0 | Phase 0 审阅（外部） | D15 |
| [M0-02 固化产品及工程文档](issues/M0-02.md) | Phase 0 审阅 | Phase 0 审阅（外部） | 继承前置 |
| [M0-03 AGENTS 与 Issue/PR 模板](issues/M0-03.md) | M0-02 | [M0-02](issues/M0-02.md) | 继承前置 |
| [M0-04 CI 与分支保护](issues/M0-04.md) | M0-01/03 | [M0-01](issues/M0-01.md), [M0-03](issues/M0-03.md) | 继承前置 |
| [M1-01 确定性 PRNG](issues/M1-01.md) | M0 | [M0-01](issues/M0-01.md), [M0-02](issues/M0-02.md), [M0-04](issues/M0-04.md) | D11、D16 |
| [M1-02 棋盘移动合并](issues/M1-02.md) | M0 | [M0-01](issues/M0-01.md), [M0-02](issues/M0-02.md), [M0-04](issues/M0-04.md) | D11 |
| [M1-03 初始化、生成、胜负](issues/M1-03.md) | M1-01/02 | [M1-01](issues/M1-01.md), [M1-02](issues/M1-02.md) | D01、D02、D11、D18 |
| [M1-04 H5 棋盘、键盘/触屏](issues/M1-04.md) | M1-03 | [M1-03](issues/M1-03.md) | D15 |
| [M1-05 移动与合并动画](issues/M1-05.md) | M1-04 | [M1-04](issues/M1-04.md) | D15 |
| [M2-01 冒险状态机](issues/M2-01.md) | M1 | [M1-03](issues/M1-03.md), [M1-05](issues/M1-05.md) | D02、D18、D19 |
| [M2-02 数字、分数、生存目标](issues/M2-02.md) | M2-01 | [M2-01](issues/M2-01.md) | D02 |
| [M2-03 通关奖励三选一](issues/M2-03.md) | M2-01 | [M2-01](issues/M2-01.md) | D17、D18 |
| [M2-04 关卡进度与结算 UI](issues/M2-04.md) | M2-02/03 | [M2-02](issues/M2-02.md), [M2-03](issues/M2-03.md) | D18 |
| [M3-01 共享 EP](issues/M3-01.md) | M1/M2 | [M1-03](issues/M1-03.md), [M2-01](issues/M2-01.md) | D03 |
| [M3-02 主动技能与目标交互](issues/M3-02.md) | M3-01 | [M3-01](issues/M3-01.md), [M2-03](issues/M2-03.md) | D08、D13 |
| [M3-03 被动与规则处理器](issues/M3-03.md) | M3-01 | [M3-01](issues/M3-01.md) | D03 |
| [M3-04 全部十二技能](issues/M3-04.md) | M3-02/03 | [M3-02](issues/M3-02.md), [M3-03](issues/M3-03.md), [M3-04-S01](issues/M3-04-S01.md), [M3-04-S02](issues/M3-04-S02.md), [M3-04-S03](issues/M3-04-S03.md), [M3-04-S04](issues/M3-04-S04.md), [M3-04-S05](issues/M3-04-S05.md), [M3-04-S06](issues/M3-04-S06.md), [M3-04-S07](issues/M3-04-S07.md), [M3-04-S08](issues/M3-04-S08.md), [M3-04-S09](issues/M3-04-S09.md), [M3-04-S10](issues/M3-04-S10.md), [M3-04-S11](issues/M3-04-S11.md), [M3-04-S12](issues/M3-04-S12.md) | 继承前置 |
| [M3-05 技能组合回归](issues/M3-05.md) | M3-04 | [M3-04](issues/M3-04.md) | D08、D10 |
| [M4-01 静态规则修饰器](issues/M4-01.md) | M3 | [M3-05](issues/M3-05.md) | D03、D05、D06 |
| [M4-02 障碍棋盘](issues/M4-02.md) | M1 | [M1-02](issues/M1-02.md) | 继承前置 |
| [M4-03 词缀抽取与兼容](issues/M4-03.md) | M2/M4-01 | [M2-03](issues/M2-03.md), [M4-01](issues/M4-01.md) | D06、D17、D18 |
| [M4-04 全部十二词缀](issues/M4-04.md) | M4-01/02/03 | [M4-01](issues/M4-01.md), [M4-02](issues/M4-02.md), [M4-03](issues/M4-03.md), [M4-04-P01](issues/M4-04-P01.md), [M4-04-P02](issues/M4-04-P02.md), [M4-04-P03](issues/M4-04-P03.md), [M4-04-P04](issues/M4-04-P04.md), [M4-04-P05](issues/M4-04-P05.md), [M4-04-P06](issues/M4-04-P06.md), [M4-04-P07](issues/M4-04-P07.md), [M4-04-P08](issues/M4-04-P08.md), [M4-04-P09](issues/M4-04-P09.md), [M4-04-P10](issues/M4-04-P10.md), [M4-04-P11](issues/M4-04-P11.md), [M4-04-P12](issues/M4-04-P12.md) | 继承前置 |
| [M5-01 Boss HP 与伤害](issues/M5-01.md) | M3/M4 | [M3-05](issues/M3-05.md), [M4-04](issues/M4-04.md) | D03、D19 |
| [M5-02 攻击预告与封锁](issues/M5-02.md) | M5-01/M4-02 | [M5-01](issues/M5-01.md), [M4-02](issues/M4-02.md) | D08、D09 |
| [M5-03 Boss UI](issues/M5-03.md) | M5-01/02 | [M5-01](issues/M5-01.md), [M5-02](issues/M5-02.md) | D09 |
| [M5-04 六关 E2E](issues/M5-04.md) | M5-03/M2–4 | [M5-03](issues/M5-03.md), [M2-04](issues/M2-04.md), [M4-04](issues/M4-04.md), [M3-05](issues/M3-05.md) | D02、D08、D09 |
| [M6-01 自动存档与版本校验](issues/M6-01.md) | M2–5 | [M5-04](issues/M5-04.md) | D11、D12、D18 |
| [M6-02 操作日志与回放引擎](issues/M6-02.md) | M1–5 | [M5-04](issues/M5-04.md) | D11、D16、D18、D19 |
| [M6-03 完整回滚回归](issues/M6-03.md) | M3-04/M5/M6-02 | [M3-04](issues/M3-04.md), [M5-02](issues/M5-02.md), [M6-02](issues/M6-02.md) | D10、D19 |
| [M6-04 回放 UI、Bug 导出](issues/M6-04.md) | M6-01/02 | [M6-01](issues/M6-01.md), [M6-02](issues/M6-02.md), [M6-03](issues/M6-03.md) | D12、D15 |
| [M7-01 Random Bot](issues/M7-01.md) | M5/M6-02 | [M5-04](issues/M5-04.md), [M6-02](issues/M6-02.md) | D08、D16 |
| [M7-02 Greedy Bot](issues/M7-02.md) | M7-01 | [M7-01](issues/M7-01.md) | 继承前置 |
| [M7-03 Strategic Bot](issues/M7-03.md) | M7-01/02 | [M7-01](issues/M7-01.md), [M7-02](issues/M7-02.md) | 继承前置 |
| [M7-04 批量模拟及 JSON 报告](issues/M7-04.md) | M7-01–03 | [M7-01](issues/M7-01.md), [M7-02](issues/M7-02.md), [M7-03](issues/M7-03.md) | D19 |
| [M7-05 数值 A/B 对照](issues/M7-05.md) | M7-04 | [M7-04](issues/M7-04.md) | D14 |
| [M8-01 H5 兼容与性能](issues/M8-01.md) | M1–7 | [M6-04](issues/M6-04.md), [M7-05](issues/M7-05.md) | D15 |
| [M8-02 人工试玩与调参](issues/M8-02.md) | M7 | [M7-05](issues/M7-05.md) | D14 |
| [M8-03 自动部署](issues/M8-03.md) | M0/M8-01 | [M0-04](issues/M0-04.md), [M8-01](issues/M8-01.md) | D15 |
| [M8-04 文档与发布](issues/M8-04.md) | M8-01–03 | [M8-01](issues/M8-01.md), [M8-02](issues/M8-02.md), [M8-03](issues/M8-03.md) | D14、D15 |

## 24 张内容子卡

| ID / 内容 | 规格 ID | 用例 | 直接决议门 |
|---|---|---|---|
| [M3-04-S01 高阶生成](issues/M3-04-S01.md) | `advanced-spawn` | SK-01 | D06、D16 |
| [M3-04-S02 定向超频](issues/M3-04-S02.md) | `targeted-overclock` | SK-02 | D02、D11 |
| [M3-04-S03 预载能量](issues/M3-04-S03.md) | `preload-energy` | SK-03 | D01 |
| [M3-04-S04 并行运算](issues/M3-04-S04.md) | `parallel-compute` | SK-04 | D03、D05 |
| [M3-04-S05 连续运算](issues/M3-04-S05.md) | `continuous-compute` | SK-05 | D04 |
| [M3-04-S06 能量回收](issues/M3-04-S06.md) | `energy-recycle` | SK-06 | D04 |
| [M3-04-S07 数据清除](issues/M3-04-S07.md) | `data-clear` | SK-07 | D08 |
| [M3-04-S08 垃圾回收](issues/M3-04-S08.md) | `garbage-collect` | SK-08 | D03、D05、D08 |
| [M3-04-S09 紧急重启](issues/M3-04-S09.md) | `emergency-restart` | SK-09 | D05、D08、D10 |
| [M3-04-S10 数据交换](issues/M3-04-S10.md) | `data-swap` | SK-10 | D13 |
| [M3-04-S11 矩阵重构](issues/M3-04-S11.md) | `matrix-rebuild` | SK-11 | D07、D13、D16 |
| [M3-04-S12 状态回滚](issues/M3-04-S12.md) | `state-rollback` | SK-12 | D10、D11、D19 |
| [M4-04-P01 能量富集](issues/M4-04-P01.md) | `energy-surge` | PT-01 | D01 |
| [M4-04-P02 扩容协议](issues/M4-04-P02.md) | `capacity-boost` | PT-02 | D03 |
| [M4-04-P03 高级缓存](issues/M4-04-P03.md) | `advanced-cache` | PT-03 | D01 |
| [M4-04-P04 运算加速](issues/M4-04-P04.md) | `turbo-mode` | PT-04 | D03、D05 |
| [M4-04-P05 低功耗模式](issues/M4-04-P05.md) | `low-power` | PT-05 | D03、D06 |
| [M4-04-P06 指令税](issues/M4-04-P06.md) | `command-tax` | PT-06 | D03 |
| [M4-04-P07 数据污染](issues/M4-04-P07.md) | `data-corruption` | PT-07 | D01 |
| [M4-04-P08 周期性故障](issues/M4-04-P08.md) | `periodic-error` | PT-08 | D03 |
| [M4-04-P09 极限超载](issues/M4-04-P09.md) | `extreme-overload` | PT-09 | D03 |
| [M4-04-P10 高速生成](issues/M4-04-P10.md) | `fast-spawn` | PT-10 | D03、D06 |
| [M4-04-P11 不稳定矩阵](issues/M4-04-P11.md) | `unstable-matrix` | PT-11 | D01、D03、D07 |
| [M4-04-P12 能量压缩](issues/M4-04-P12.md) | `energy-compression` | PT-12 | D03 |

## 开工与验收门

1. 查看直接前置，并沿依赖图确认全部间接依赖已完成；图中的 Phase 0 审阅是外部门，不伪造一个已关闭 Issue。
2. 逐项检查 [OPEN-DECISIONS](OPEN-DECISIONS.md)。D14 允许先跑基准实验，采纳参数变更才需决议；D15 可分阶段关闭。
3. 只做卡片范围，交付指定可观察结果；父子任务不得重复计功。
4. 若新增需求改变依赖，更新本表与任务卡并重新检查无环；不通过扩大父任务掩盖细分卡缺失。
5. 将实际测试证据与人工验收记录附在 Draft PR；文档计划完成与功能代码完成分开记录。

原第 16 节完整工作包表保留在 [来源快照](../reference/SOURCE-BASELINE.md)。测试总纲见 [TESTING](TESTING.md)，阶段出口见 [ROADMAP](ROADMAP.md)。

## 后续新增里程碑

2026-11-26 新增的 M9 小程序版含真机样机、完整体验版和正式发布三个步骤，依赖和验收见[路线图](ROADMAP.md)。原 Phase 0 工作包统计保留为历史基线。
