/** Design baseline. Base costs precede all protocol modifiers. */
export const skills = [
  { id: "advanced-spawn", family: "超频", name: "高阶生成", kind: "passive", baseCost: 0, description: "正常生成数字 4 概率从 10% 提高至 30%，2 为其补概率" },
  { id: "targeted-overclock", family: "超频", name: "定向超频", kind: "active", baseCost: 6, description: "选择一个未锁定普通方块，使数值翻倍；不直接产生合并分数/EP/Boss 伤害，可完成数字目标" },
  { id: "preload-energy", family: "超频", name: "预载能量", kind: "passive", baseCost: 0, description: "每关初始化额外生成一个 8 方块" },
  { id: "parallel-compute", family: "并行", name: "并行运算", kind: "passive", baseCost: 0, description: "单次有效滑动至少合并三对，额外增加该步基础合并分数的 50% 和 1 EP；每步至多触发一次" },
  { id: "continuous-compute", family: "并行", name: "连续运算", kind: "passive", baseCost: 0, description: "连续三次有效滑动均产生合并，额外 +32 分" },
  { id: "energy-recycle", family: "并行", name: "能量回收", kind: "passive", baseCost: 0, description: "每累计八对普通合并，额外获得 2 EP" },
  { id: "data-clear", family: "防御", name: "数据清除", kind: "active", baseCost: 3, description: "删除一个指定未锁定普通方块" },
  { id: "garbage-collect", family: "防御", name: "垃圾回收", kind: "passive", baseCost: 0, description: "每关棋盘首次填满时，自动删除一个最小未锁定普通方块；每关一次" },
  { id: "emergency-restart", family: "防御", name: "紧急重启", kind: "passive", baseCost: 0, description: "发生死局时清除四个最小未锁定普通方块；整轮冒险仅触发一次" },
  { id: "data-swap", family: "空间", name: "数据交换", kind: "active", baseCost: 3, description: "交换两个不同位置的未锁定普通方块；目标不包括空格/障碍" },
  { id: "matrix-rebuild", family: "空间", name: "矩阵重构", kind: "active", baseCost: 4, description: "随机重排未锁定普通方块，空位、障碍、锁定位置不动" },
  { id: "state-rollback", family: "空间", name: "状态回滚", kind: "active", baseCost: 3, description: "撤销最近一次有效滑动及其完整结算，恢复滑动前状态后再扣除有效回滚成本" },
] as const

export type SkillId = typeof skills[number]['id']

/** Baseline generation weights and fixed opening bonus, pending balance validation. */
export const spawnTuning = {
  totalWeight: 10,
  baseFourWeight: 1,
  advancedFourWeight: 3,
  preloadValue: 8,
} as const

export const parallelCompute = { minimumPairs: 3, scoreFraction: 0.5, extraEnergy: 1 } as const
