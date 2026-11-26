import { defaultEnergy, type EnergyRules } from '@infinite/game-config'
import type { moveBoard } from './move'

function natural(value: number) {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError('Expected nonnegative integer EP')
  return value
}

export function startLevelEnergy(rules: EnergyRules = defaultEnergy) {
  return Math.min(natural(rules.initial), natural(rules.capacity))
}

/** Only pass events from the ordinary slide, before applying any skill effects. */
export function energyAfterSlide(current: number, events: Readonly<ReturnType<typeof moveBoard>['events']>,
  rules: EnergyRules = defaultEnergy) {
  if (natural(current) > natural(rules.capacity)) throw new RangeError('EP exceeds capacity')
  const perMerge = natural(rules.perMerge)
  let energy = current
  for (const event of events) {
    if (event.type === 'TILE_MERGED') energy += Math.min(perMerge, rules.capacity - energy)
  }
  return energy
}

/** Resolve a confirmed action against immutable state. Null means the target/effect was invalid. */
export function useSkillEnergy<T>(energy: number, cost: number, resolve: () => T | null) {
  if (natural(energy) < natural(cost)) return { accepted: false as const, energy }
  const effect = resolve()
  if (effect === null) return { accepted: false as const, energy }
  return { accepted: true as const, energy: energy - cost, effect }
}
