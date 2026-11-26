import { defaultEnergy, type EnergyRules, type NodeGoal } from '@infinite/game-config'
import { energyAfterSlide, startLevelEnergy } from './energy'
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
