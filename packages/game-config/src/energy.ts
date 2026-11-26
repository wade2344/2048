/** Baseline tuning values, pending simulation and playtesting. */
export interface EnergyRules {
  readonly initial: number
  readonly capacity: number
  readonly perMerge: number
}

export const defaultEnergy: EnergyRules = { initial: 4, capacity: 10, perMerge: 1 }
