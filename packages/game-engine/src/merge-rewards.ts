import { continuousCompute, defaultEnergy, energyRecycle, parallelCompute, type EnergyRules, type SkillId } from '@infinite/game-config'
import { energyAfterSlide } from './energy'
import type { moveBoard } from './move'

export interface MergeCounters {
  readonly streak: number
  readonly recycledPairs: number
}

/** Both node types derive parallel rewards from the unmodified ordinary merge. */
export function mergeRewards(move: Pick<ReturnType<typeof moveBoard>, 'score' | 'events'>,
  currentEnergy: number, owned: readonly SkillId[], rules: EnergyRules = defaultEnergy, previous?: MergeCounters) {
  const pairs = move.events.filter(event => event.type === 'TILE_MERGED').length
  const triggered = owned.includes('parallel-compute') && pairs >= parallelCompute.minimumPairs
  let bonusScore = triggered ? move.score * parallelCompute.scoreFraction : 0
  let extraEnergy: number = triggered ? parallelCompute.extraEnergy : 0
  let counters: MergeCounters | undefined
  const continuous = owned.includes('continuous-compute')
  const recycle = owned.includes('energy-recycle')
  if (continuous || recycle) {
    // D04 review candidate: non-overlapping streaks and node-local pair remainder.
    const streak = continuous && pairs > 0 ? (previous?.streak ?? 0) + 1 : 0
    const total = recycle ? (previous?.recycledPairs ?? 0) + pairs : 0
    if (streak === continuousCompute.requiredSlides) bonusScore += continuousCompute.bonusScore
    extraEnergy += Math.floor(total / energyRecycle.requiredPairs) * energyRecycle.bonusEnergy
    counters = { streak:streak % continuousCompute.requiredSlides, recycledPairs:total % energyRecycle.requiredPairs }
  }
  const energy = Math.min(rules.capacity, energyAfterSlide(currentEnergy, move.events, rules) + extraEnergy)
  return { bonusScore, energy, counters }
}
