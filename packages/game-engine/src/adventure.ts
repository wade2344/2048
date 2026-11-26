import { defaultEnergy, skills, type SkillId, type EnergyRules, type NodeGoal } from '@infinite/game-config'
import { energyAfterSlide, startLevelEnergy, useSkillEnergy } from './energy'
import { enterLevel, spawnOrdinaryTile, type Opening } from './generation'
import { goalReached } from './goal'
import { moveBoard, type AdventureBoard, type Direction } from './move'
import type { RandomSnapshot } from './random'

type OrdinaryGoal = Exclude<NodeGoal, { kind: 'boss' }>

export interface OrdinaryNodeState {
  readonly goal: OrdinaryGoal
  readonly board: AdventureBoard
  readonly nextId: number
  readonly random: RandomSnapshot
  readonly energyRules: EnergyRules
  readonly energy: number
  readonly nodeScore: number
  readonly validMoves: number
  readonly cleared: boolean
}

function completed(goal: OrdinaryGoal, board: AdventureBoard, nodeScore: number, validMoves: number) {
  let largestTile = 0
  for (const row of board) {
    for (const cell of row) {
      if (cell && 'value' in cell) largestTile = Math.max(largestTile, cell.value)
    }
  }
  return goalReached(goal, { largestTile, nodeScore, validMoves })
}

export function startOrdinaryNode(random: RandomSnapshot, goal: OrdinaryGoal, opening: Opening,
  energyRules: EnergyRules = defaultEnergy, firstId = 1): OrdinaryNodeState {
  const { board, nextId, random: afterOpening, cleared } = enterLevel(random, opening,
    board => completed(goal, board, 0, 0), firstId)
  return { goal, board, nextId, random: afterOpening, cleared, energyRules,
    energy: startLevelEnergy(energyRules), nodeScore: 0, validMoves: 0 }
}

export function slideOrdinaryNode(state: OrdinaryNodeState, direction: Direction) {
  if (state.cleared || !['left', 'right', 'up', 'down'].includes(direction)) {
    return { accepted: false as const, state }
  }
  const move = moveBoard(state.board, direction)
  if (!move.changed) return { accepted: false as const, state }
  const nodeScore = state.nodeScore + move.score
  const validMoves = state.validMoves + 1
  const energy = energyAfterSlide(state.energy, move.events, state.energyRules)
  const next = spawnOrdinaryTile({ ...state, board: move.board })
  const updated: OrdinaryNodeState = { ...state, board: next.board, nextId: next.nextId,
    random: next.random, nodeScore, validMoves, energy, cleared: completed(state.goal, next.board, nodeScore, validMoves) }
  return { accepted: true as const, state: updated,
    events: [...move.events, { type: 'TILE_SPAWNED' as const, ...next.spawned }] }
}

type SingleTargetSkill = 'targeted-overclock' | 'data-clear'

export interface TargetingContext {
  readonly owned: readonly SkillId[]
  readonly lockedTileIds: readonly string[]
}

function eligibleTargets(state: OrdinaryNodeState, context: TargetingContext, skill: SingleTargetSkill) {
  const definition = skills.find(entry => entry.id === skill)
  if (state.cleared || !context.owned.includes(skill) || !definition ||
    (skill !== 'targeted-overclock' && skill !== 'data-clear') || state.energy < definition.baseCost) return []
  return state.board.flatMap((line, row) => line.flatMap((tile, col) =>
    tile && 'value' in tile && !context.lockedTileIds.includes(tile.id)
      ? [{ row, col, tile, cost: definition.baseCost }] : []))
}

export function legalSingleTargets(state: OrdinaryNodeState, context: TargetingContext, skill: SingleTargetSkill) {
  return eligibleTargets(state, context, skill).map(target => target.tile.id)
}

export function useSingleTargetSkill(state: OrdinaryNodeState, context: TargetingContext,
  action: { readonly type: 'USE_SKILL'; readonly skillId: SingleTargetSkill; readonly targets: readonly string[] }) {
  const rejected = { accepted: false as const, state }
  if (action.targets.length !== 1) return rejected
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
  return { accepted: true as const, state: { ...state, board, energy: result.energy,
    cleared: completed(state.goal, board, state.nodeScore, state.validMoves) },
    events: [{ type: 'SKILL_APPLIED' as const, skillId: action.skillId, tileId: tile.id, row, col,
      previousValue: tile.value, value: after?.value ?? null }] }
}
