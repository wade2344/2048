import type { SkillId } from '@infinite/game-config'

export interface RewardSkill {
  readonly id: SkillId
  readonly kind: 'active' | 'passive'
}

/** Validate the proposed offer before storing it as the stable reward selection. */
export function validOffer(catalog: readonly RewardSkill[], owned: readonly SkillId[],
  offer: readonly SkillId[], requireMixed: boolean): boolean {
  if (offer.length !== 3 || new Set(offer).size !== 3) return false
  const kinds = new Set<RewardSkill['kind']>()
  for (const id of offer) {
    const skill = catalog.find(entry => entry.id === id)
    if (!skill || owned.includes(id)) return false
    kinds.add(skill.kind)
  }
  return !requireMixed || kinds.size === 2
}

export interface RewardInventory {
  readonly owned: readonly SkillId[]
  readonly offer: readonly SkillId[]
}

export function takeReward(inventory: RewardInventory, selected: SkillId): RewardInventory {
  if (!inventory.offer.includes(selected) || inventory.owned.includes(selected)) return inventory
  return { owned: [...inventory.owned, selected], offer: [] }
}
