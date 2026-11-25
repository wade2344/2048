# 数值模拟器规格

> 文档版次：0.1.0-docs.1 · 2026-11-25 · Phase 0 文档交付；游戏尚未实现。
> 来源：[输入基准](../reference/SOURCE-BASELINE.md)；对应章节 / 说明：11.2–11.3、10.5。
> 效力：仅 PRD 明列项为用户已确认；其余沿用设计基准。本文新增接口细化、测试设计、任务拆分属于交付建议；所有初始数值待模拟与试玩验证。
> 待决议建议没有生效；受影响规则落地前须关闭对应 [D 项](../development/OPEN-DECISIONS.md)（验证型门按登记说明执行）。

## Bot 与评估基准

| Bot | 策略 / 作用 |
|---|---|
| Random | 随机合法操作与技能/奖励选择；稳定性、边界检查 |
| Greedy | 优先即时合并收益，验证短期策略 |
| Strategic | 评价棋盘空位、单调性、可合并机会、当前收益、角落优势及能量；按关卡目标动态调整权重 |
| Expectimax | 后续版本：搜索未来可能状态和随机分布的期望收益，不读取实际未来 RNG |

Strategic 初始归一化权重：空位 30%、单调性 20%、合并机会 15%、当前收益 15%、最大方块角落 10%、能量收益 10%。主动技能及目标、技能奖励也应参与评估；不能只评估四方向。模拟候选时不得借用真实引擎 RNG 预知实际下一步结果，可评价生成前状态或按概率分布取期望。设定独立操作上限、最大耗时保护；超限单独统计，不等同于正常失败。

```ts
interface GameAgent {
  id: string
  decide(state: Readonly<ObservableGameState>,
         actions: readonly GameAction[]): GameAction
}
```

计划 CLI（未实现）：

```bash
pnpm simulate --agent random --runs 100
pnpm simulate --agent strategic --runs 1000
pnpm simulate --agent strategic --runs 10000
pnpm balance:compare --baseline v1 --candidate v2
```

## 数据与实验

记录关卡进入人数/通过率/步数/失败位置/最大数字；技能出现率、选择率、使用次数、取得关卡、搭配；词缀通过率及失败原因；EP 获取、消费、平均剩余及溢出；Boss 伤害来源、击杀步数、攻击命中率；异常/超限数、策略版本与种子集合。报告需区分条件通关率与整轮通关率。

定向超频对照：A=6 EP，B=7 EP，C=8 EP，D=6 EP 但目标不超过 64。使用相同种子集合、同版 Bot 与策略参数，比较通关率、置信区间、选择/释放次数、取得时点、其他技能组合；分别分析已持有该技能的对照样本。不能把持有通关率直接当成因果效果。原讨论的 64%、53%、43%、38% 等图表为虚构演示数据，不属于测试结果。

高优先级：定向超频/回滚/障碍死局（P0）；第五关 256 难度断层、第三关 300 分、Boss 1000 HP、能量回收循环（P1）；矩阵重构价值、生存 40 步趣味（P2）。CLI 和 JSON 报告先行，开发环境 /dev/balance 可视化后续实现，展示条件通过率、流派、EP 和异常提示。

## 输入、输出与隔离契约（交付建议）

输入：规则/配置身份、固定 seed 集合、agentId/version、参数、独立策略 RNG 种子、运行次数、操作上限、耗时保护。未指定保护值前不能宣称大规模批处理已可用。超时是模拟器外层保护，不是玩家失败条件。

输出 JSON 建议包含以下域：

| 域 | 必填意义 |
|---|---|
| experiment | 基线/候选、规则身份、配置身份、引擎/策略版本、种子集摘要、参数 |
| counts | attempted、won、lost、operationLimit、timeout、invalidAction、crash；分开记录 |
| levels | entered、cleared、条件通过率、完成步数；未进入不能算该关失败 |
| skills | offered、selected、acquiredAt、activations、持有通关率、共同技能 |
| protocols | 抽取分布、过滤/回退原因、按关卡的通过与失败 |
| energy | 获取、消耗、溢出、剩余；统计口径见 D19 |
| boss | 造成伤害、实际扣血/溢出、击杀步数、预告/命中/落空/取消 |
| reproductions | 非法状态/崩溃/拒绝动作的 Seed、版本、日志和失败序号 |

报告同时显示总尝试数与有效胜败样本数；正常完成局的胜率以 won/(won+lost) 展示，并紧邻报告异常占比，避免排除异常后掩盖偏差。若无完成样本，显示不可计算而非 0%。这是分析口径建议，不是玩法决议；区间方法与统计配置写入报告。

共同种子不意味着改配置后每一步随机消费完全相同，应记录真实轨迹差异。随机策略平局选择使用策略 RNG，不调用引擎 board/reward/protocol/boss。候选评价不得调用带真实未来 RNG 的完整 dispatch 来偷看将生成的格子；可采用生成前确定性评价或公开概率分布采样，需记录策略实现版本。

禁止把 UndoSnapshot、原始 Seed 或能反推出未来的完整记录交给 Bot。公开状态筛选应有泄漏测试；合法动作列表不能暗中编码未来随机结果。合法动作与「可恢复死局」的搜索边界由 D08 决定。

CI 阶段和规模见 [CI-CD](../development/CI-CD.md)；体验与人工采样见 [BALANCE](../game-design/BALANCE.md)。未运行实验，不提供虚构通关率。
