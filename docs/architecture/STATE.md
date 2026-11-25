# 状态模型与生命周期

> 文档版次：0.1.0-docs.1 · 2026-11-25 · Phase 0 文档交付；游戏尚未实现。
> 来源：[输入基准](../reference/SOURCE-BASELINE.md)；对应章节 / 说明：10.3、9.2–9.3。
> 效力：仅 PRD 明列项为用户已确认；其余沿用设计基准。本文新增接口细化、测试设计、任务拆分属于交付建议；所有初始数值待模拟与试玩验证。
> 待决议建议没有生效；受影响规则落地前须关闭对应 [D 项](../development/OPEN-DECISIONS.md)（验证型门按登记说明执行）。

## 源基准状态字段与状态机

建议至少包含：

| 领域 | 状态字段 |
|---|---|
| 冒险 | seed、规则身份、phase、关卡序号、已获得技能、已出现词缀、冒险统计、整轮一次性标志 |
| 关卡 | 棋盘、关卡分数、有效移动数、当前 EP、词缀、目标、合并/连击计数器、垃圾回收标志 |
| 奖励 | 已抽出的候选技能、选择状态 |
| Boss | HP、攻击倒计时、预告位置、锁定状态 |
| 确定性 | 四路 RNG state、tileId 计数器、最近合法滑动回滚快照 |

状态机：INITIALIZING → LEVEL_READY → PLAYING → LEVEL_CLEARED → REWARD_SELECTION → LEVEL_READY，循环至 Boss 完成或失败；终态 RUN_WON / RUN_LOST。LEVEL_CLEARED 可作为同一事务内瞬态，若持久化则须定义恢复行为；最终 Boss 不进入奖励。暂停、动画、目标选择由 UI 层管理。状态机只接受对应阶段的合法 Action：例如 REWARD_SELECTION 不能 MOVE，PLAYING 不能任意选择奖励，RUN_WON 不再接受技能。一次逻辑结算后保存。

## 字段字典（规格细化建议）

以下是数据责任模型，不是可编译类型定义。字段最终名字、空值与边界在 D11/D18 决议后固化。

| 字段组 / 建议内容 | 归属与生命周期 | 比较 / 持久化 |
|---|---|---|
| rulesIdentity（规则版本、配置身份、随机算法身份） | 创建冒险固定；A/B 各自独立 | 必须验证一致，进入逻辑等价 |
| seed、rngStates.board/reward/protocol/boss | 引擎唯一真源；各消费者独立推进 | 保存及回滚；禁止向 Bot 暴露 |
| phase、levelId | 冒险流程控制 | 保存；瞬态是否持久化见 D18 |
| board[4][4] | null / 普通数值方块含可选 lock / 障碍 | 保存；ID 唯一、锁保留原值 |
| nextTileId | 确定性编号序列 | 保存及回滚；边界见 D11 |
| levelScore、validMoves、energy | 每关重置；动作原子变更 | 保存及回滚；符合有效规则 |
| acquiredSkills、seenProtocols | 技能继承，词缀历史用于抽取 | 保存；不允许重复技能 |
| currentProtocol、goal、effectiveRules 引用 | 本关准备/进入确定 | 源配置可重建项不产生第二真源 |
| pendingRewards、selection 状态 | 一次生成后固定，直到合法选择 | 必须保存，不能刷新再抽 |
| 连击、累计合并、垃圾回收触发标志 | 每关；确切循环方式 D04 | 保存及回滚 |
| emergencyRestartUsed | 整轮一次性 | 跨关保留；回滚争议 D10 |
| boss.hp、attackClock、telegraph、锁定计时 | 第六关专用 | 保存及回滚；锁的归属不能双份更新 |
| undoSnapshot | 最近可撤销有效滑动前状态，不递归含自身 | 保存；跨关/其他主动技能/已撤销后失效 |
| runStats | 冒险统计 | 逻辑统计与行为统计的区别见 D19 |
| runId、createdAt、updatedAt、展示耗时 | 外层存储/展示元数据 | 不参与确定性状态比较 |
| pause、inputLock、selectedTargets、动画进度 | UI 状态 | 不保存为引擎规则状态 |

锁定信息可归 tile.lock，Boss 仅保存攻击预告；若另用索引必须视为派生数据并校验一致，不能两份独立修改。此处是防漂移约束，不是新的锁定玩法。

## 状态转换矩阵

| 起点 | 输入/内部原因 | 终点 | 约束 |
|---|---|---|---|
| INITIALIZING | createRun 内部 | LEVEL_READY | 不作为玩家 Action；初始抽取点 D18 |
| LEVEL_READY | ENTER_LEVEL | PLAYING 或达标分支 | 原子初始化；D01/D02/D18 |
| PLAYING | MOVE / USE_SKILL | PLAYING | 非通关/非终局；完整结算后提交 |
| PLAYING | 第 1–5 关达标 | LEVEL_CLEARED → REWARD_SELECTION | 候选一次生成；瞬态处理 D18 |
| REWARD_SELECTION | SELECT_REWARD | LEVEL_READY | 获得 1 技能；下一关准备，不跳过选择 |
| PLAYING | ZERO HP 归零 | RUN_WON | 无第六次奖励 |
| PLAYING | 无合法滑动且无法救场 | RUN_LOST | 先遵守 D08/D09 的救场/封锁决议 |
| RUN_WON / RUN_LOST | 游戏动作 | 拒绝，保持终态 | 新冒险由外层明确创建，不继续旧局 |

READY 页先显示词缀、ENTER_LEVEL 再初始化棋盘的切分尚需 D18 明确；快照与回放必须从同一 createRun 初态开始，不能以「继续游戏」时补抽的方式修复缺失字段。

## 深度不可变与序列化

Readonly 只是表面类型约束；验证输入深冻结不被改动，序列化不携带函数、响应式代理、Set/Map 隐式顺序或 DOM。恢复时同时校验 ID、棋盘形状、phase 对应字段和计数器范围。规范化状态比较排除外层元数据，不能排除会影响未来规则的计数器、候选、RNG 或 undoSnapshot。
