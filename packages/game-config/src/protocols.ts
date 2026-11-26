/** Tuning baselines for the four beneficial protocols. */
export const beneficialProtocols = {
  'energy-surge': { name: '能量富集', initialEnergy: 8 },
  'capacity-boost': { name: '扩容协议', capacity: 15 },
  'advanced-cache': { name: '高级缓存', openingTile: 16 },
  'turbo-mode': { name: '运算加速', scoreMultiplier: 1.25 },
} as const

export type BeneficialProtocol = keyof typeof beneficialProtocols

export const protocolGroups = {
  beneficial: beneficialProtocols,
  restrictive: {
    'low-power': { name: '低功耗模式', capacity: 6 },
    'command-tax': { name: '指令税', costOffset: 1 },
    'data-corruption': { name: '数据污染', obstacles: 1 },
    'periodic-error': { name: '周期性故障', interval: 5, energyLoss: 1 },
  },
  mixed: {
    'extreme-overload': { name: '极限超载', perMerge: 2, costOffset: 2 },
    'fast-spawn': { name: '高速生成', ordinaryValue: 4, interval: 4, extraValue: 2 },
    'unstable-matrix': { name: '不稳定矩阵', openingTiles: [16, 16], interval: 10 },
    'energy-compression': { name: '能量压缩', costOffset: -1, minimumCost: 1, capacity: 6 },
  },
} as const

export type ProtocolCategory = keyof typeof protocolGroups
export type ProtocolId = { [K in ProtocolCategory]: keyof typeof protocolGroups[K] }[ProtocolCategory]
