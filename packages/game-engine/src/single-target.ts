import { skills, type ProtocolId, type SkillId } from '@infinite/game-config'
import { useSkillEnergy } from './energy'
import type { AdventureBoard } from './move'
import { protocolSkillCost } from './protocol-pool'

export type SingleTargetSkill = 'targeted-overclock' | 'data-clear'

export interface SingleTargetAction {
  readonly type: 'USE_SKILL'
  readonly skillId: SingleTargetSkill
  readonly targets: readonly string[]
}

interface SkillState {
  readonly board: AdventureBoard
  readonly owned: readonly SkillId[]
  readonly energy: number
  readonly cleared: boolean
  readonly protocol?: ProtocolId | null
}

export interface TargetingContext {
  readonly lockedTileIds: readonly string[]
}

function eligibleTargets(state: SkillState, context: TargetingContext, skill: SingleTargetSkill | 'data-swap') {
  const definition = skills.find(entry => entry.id === skill)
  if (state.cleared || !state.owned.includes(skill) || !definition ||
    (skill !== 'targeted-overclock' && skill !== 'data-clear' && skill !== 'data-swap')) return []
  const cost = state.protocol ? protocolSkillCost(state.protocol, definition.baseCost) : definition.baseCost
  if (state.energy < cost) return []
  return state.board.flatMap((line, row) => line.flatMap((tile, col) =>
    tile && 'value' in tile && !context.lockedTileIds.includes(tile.id)
      ? [{ row, col, tile, cost }] : []))
}

export function singleTargetIds(state: SkillState, context: TargetingContext, skill: SingleTargetSkill) {
  return eligibleTargets(state, context, skill).map(target => target.tile.id)
}

export function resolveSingleTarget(state: SkillState, context: TargetingContext,
  action: SingleTargetAction) {
  const rejected = { accepted: false as const }
  if ((action.skillId !== 'targeted-overclock' && action.skillId !== 'data-clear') || action.targets.length !== 1) return rejected
  const target = eligibleTargets(state, context, action.skillId).find(entry => entry.tile.id === action.targets[0])
  if (!target) return rejected
  const { row, col, tile, cost } = target
  const result = useSkillEnergy(state.energy, cost, () => {
    const after = action.skillId === 'data-clear' ? null : { ...tile, value: tile.value * 2 }
    const board = state.board.map((line, r) => r === row ? line.map((cell, c) => c === col ? after : cell) : line)
    return { after, board }
  })
  if (!result.accepted) return rejected
  const { after, board } = result.effect
  return { accepted: true as const, board, energy: result.energy,
    events: [{ type: 'SKILL_APPLIED' as const, skillId: action.skillId, tileId: tile.id, row, col,
      previousValue: tile.value, value: after?.value ?? null }] }
}

export function swapTargets(state: SkillState, context: TargetingContext) {
  return eligibleTargets(state,context,'data-swap')
}
