# 确定性引擎与规则扩展

> 文档版次：0.1.0-docs.1 · 2026-11-25 · Phase 0 文档交付；游戏尚未实现。
> 来源：[输入基准](../reference/SOURCE-BASELINE.md)；对应章节 / 说明：10.2、10.4。
> 效力：仅 PRD 明列项为用户已确认；其余沿用设计基准。本文新增接口细化、测试设计、任务拆分属于交付建议；所有初始数值待模拟与试玩验证。
> 待决议建议没有生效；受影响规则落地前须关闭对应 [D 项](../development/OPEN-DECISIONS.md)（验证型门按登记说明执行）。

## 公共接口草案

```ts
type Direction = 'up' | 'down' | 'left' | 'right'
type Tile =
  | { id: string; type: 'normal'; value: number; lock?: LockState }
  | { id: string; type: 'obstacle' }
type Cell = Tile | null
type Board = Cell[][]

interface GameEngine {
  createRun(options: RunOptions): GameState
  dispatch(state: Readonly<GameState>, action: GameAction): ActionResult
  getLegalActions(state: Readonly<GameState>): readonly GameAction[]
}
type ActionResult =
  | { accepted: true; state: GameState; events: readonly GameEvent[] }
  | { accepted: false; state: GameState; reason: ActionError }
```

接口示例是设计草案而非可编译实现；LockState、RunOptions、GameState、ActionError、GameEvent 在规格与实现中定义。Readonly 为浅层类型限制，仍需用深只读约束/冻结测试保证不可变契约。getLegalActions 与 dispatch 的合法性必须一致；死局救场可采用可枚举技能操作及搜索边界，待第 15 节确定。纯 TS 引擎不依赖 Vue、Pinia、DOM、localStorage、系统时间；每个 Action 同步原子结算，不原地改传入状态，不使用异步事件总线改变规则。UI 和模拟器复用同一个 dispatch；事件用于展示、统计和调试，不替代状态真实来源。

## Action、Event 与 RuleEffect

Action 表示输入意图，Event 表示实际发生结果，如 TILE_MOVED、TILE_MERGED、TILE_SPAWNED、ENERGY_GAINED、ENERGY_CONSUMED、SKILL_ACTIVATED、SKILL_ACQUIRED、LEVEL_STARTED、MOVE_COMPLETED、BOARD_FILLED、DEADLOCK_DETECTED、LEVEL_COMPLETED、BOSS_DAMAGED、BOSS_ATTACKED。事件须按固定顺序输出，包含用于渲染/统计的关联 ID 与必要位置、数值和来源；动画依据事件而非从最终棋盘反推。操作日志由外层记录器在 dispatch 成功后追加。

```ts
const baseRules = {
  maxEnergy: 10, initialEnergy: 4, energyPerMerge: 1,
  spawnFourProbability: 0.1, skillCostOffset: 0,
  scoreMultiplier: 1,
}
const energyCompression = {
  id: 'energy-compression',
  modifiers: [
    { target: 'maxEnergy', operation: 'set', value: 6 },
    { target: 'skillCostOffset', operation: 'add', value: -1 },
  ],
}
interface RuleModule {
  id: string
  modifiers?: RuleModifier[]
  handlers?: RuleHandler[]
}
interface RuleHandler {
  event: GameEvent['type']
  priority: number
  execute(context: RuleContext): RuleEffect[]
}
```

规则分为静态数值修饰（基准值、覆盖、加法、倍率等）与动态处理器（例如周期故障、回收、封锁）。技能和词缀共用规则处理器；返回效果描述，由引擎统一执行，不允许处理器随意修改全局状态。明确优先级、同优先级排序、递归限制、事件去重；普通合并与技能生成/重排必须区分来源，避免无限触发。先实现实际需要的扩展点，不提前建设通用插件平台。

## 契约细化（交付建议，接口名尚未发布）

| 契约 | 接受条件 / 结果 | 拒绝或失败语义 |
|---|---|---|
| createRun | 接收 Seed、规则/配置身份及已校验配置，产生可进入关卡的状态 | 非法配置/种子边界由 D11/D16 决定；不产生半份可用存档 |
| MOVE | PLAYING 且确实产生布局变化/合并 | 不改变任何逻辑字段；无日志、无保存 |
| USE_SKILL | 已持有、阶段合法、目标合法、可支付；回滚另有双 EP 门槛 | 原子拒绝，不先扣能量再报错；无效果重排 D07/D13 |
| SELECT_REWARD | REWARD_SELECTION 且来自已生成候选 | 拒绝不在候选/重复确认；不重新抽取 |
| ENTER_LEVEL | LEVEL_READY 且正是合法下一节点 | 不能跳关/重复初始化；初次准备行为 D18 |
| getLegalActions | 与同版本 dispatch 的输入校验一致，含技能目标及奖励动作 | 不能泄漏 RNG；最终死局判定的救场路径见 D08 |

不将内部异常伪装为玩家非法操作；开发期应保留失败步骤和状态摘要，原事务不能部分提交。ActionError 的具体枚举、递归超限策略在规则基础任务中确定，并保持 UI/模拟器同义。

事件字段建议至少包含 action 序号内的事件顺序、事件类型、来源（普通合并/技能/词缀/Boss）、关联 tileId、必要位置、旧新数值与效果量。稳定排序、去重键、递归深度是 D03 的工程细化；UI 的事件订阅不得回写规则。

## 一次成功事务的外层责任

dispatch 完成 → 接受新逻辑根状态与事件 → 追加成功 Action → 保存完整 envelope → 播放 UI 事件。逻辑提交不以保存或动画成功为前提；保存失败的提示/重试/多标签协调按 D12 实施。拒绝动作不走成功链路。

完整事件溯源、通用插件运行时、自动加载不可信脚本均不在首版范围。新增规则先增加配置、处理器与测试，不无端改动合并核心。
