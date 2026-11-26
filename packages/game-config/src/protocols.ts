/** Tuning baselines for the four beneficial protocols. */
export const beneficialProtocols = {
  'energy-surge': { name: '能量富集', initialEnergy: 8 },
  'capacity-boost': { name: '扩容协议', capacity: 15 },
  'advanced-cache': { name: '高级缓存', openingTile: 16 },
  'turbo-mode': { name: '运算加速', scoreMultiplier: 1.25 },
} as const

export type BeneficialProtocol = keyof typeof beneficialProtocols
