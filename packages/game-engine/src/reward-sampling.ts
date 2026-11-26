import { skills, type SkillId } from '@infinite/game-config'
import { drawIndex, type RandomSnapshot } from './random'
import type { RewardInventory } from './rewards'

/** Each legal three-skill set appears once, in catalog order. */
export function rewardCombinations(owned: readonly SkillId[], requireMixed: boolean) {
  const available = skills.filter(skill => !owned.includes(skill.id))
  const combinations: SkillId[][] = []
  for (const [i, first] of available.entries()) {
    for (let j = i + 1; j < available.length; j++) {
      const second = available[j]!
      for (const third of available.slice(j + 1)) {
        if (requireMixed && first.kind === second.kind && second.kind === third.kind) continue
        combinations.push([first.id, second.id, third.id])
      }
    }
  }
  return combinations
}

/** D17 review candidate: sample sets uniformly, display in catalog order. */
export function sampleUniformReward(inventory: RewardInventory, random: RandomSnapshot, requireMixed: boolean) {
  if (inventory.offer.length) return { inventory, random }
  const combinations = rewardCombinations(inventory.owned, requireMixed)
  if (!combinations.length) return { inventory, random }
  const draw = drawIndex(random, 'reward', combinations.length)
  return { inventory:{ owned:inventory.owned, offer:combinations[draw.value]! }, random:draw.snapshot }
}
