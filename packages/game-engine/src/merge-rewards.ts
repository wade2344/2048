import { defaultEnergy, parallelCompute, type EnergyRules, type SkillId } from '@infinite/game-config'
import { energyAfterSlide } from './energy'
import type { moveBoard } from './move'

/** Both node types derive parallel rewards from the unmodified ordinary merge. */
export function mergeRewards(move: Pick<ReturnType<typeof moveBoard>, 'score' | 'events'>,
  currentEnergy: number, owned: readonly SkillId[], rules: EnergyRules = defaultEnergy) {
  const pairs = move.events.filter(event => event.type === 'TILE_MERGED').length
  const triggered = owned.includes('parallel-compute') && pairs >= parallelCompute.minimumPairs
  const bonusScore = triggered ? move.score * parallelCompute.scoreFraction : 0
  const energy = Math.min(rules.capacity, energyAfterSlide(currentEnergy, move.events, rules) +
    (triggered ? parallelCompute.extraEnergy : 0))
  return { bonusScore, energy }
}
