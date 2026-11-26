import { enterLevel, ordinaryMove } from './generation'
import { moveBoard, type Board, type Direction } from './move'
import { createRandomSnapshot, type RandomSnapshot } from './random'

const directions: readonly Direction[] = ['up', 'down', 'left', 'right']
export function legalSlides(board: Board) {
  return directions.filter(direction => moveBoard(board, direction).changed)
}

export interface ClassicState {
  readonly seed: number
  readonly board: Board
  readonly random: RandomSnapshot
  readonly nextId: number
  readonly score: number
  readonly ended: boolean
  readonly actions: readonly Direction[]
}

export function startClassic(seed: number): ClassicState {
  const opening = enterLevel(createRandomSnapshot(seed),
    { obstacles: [], skillTiles: [], protocolTiles: [] }, () => false)
  // This opening contains only ordinary tiles.
  const board = opening.board.map(row => row.map(cell => {
    if (cell && 'kind' in cell) throw new Error('Unexpected obstacle in classic opening')
    return cell
  }))
  return { seed, board, random: opening.random, nextId: opening.nextId,
    score: 0, ended: false, actions: [] }
}

export function slideClassic(state: ClassicState, direction: Direction) {
  if (!directions.includes(direction) || state.ended) return { accepted: false as const, state }
  const move = ordinaryMove(state, direction, () => false)
  if (!move.accepted) return { accepted: false as const, state }
  const updated: ClassicState = { ...state, ...move.state, score: state.score + move.score,
    ended: legalSlides(move.state.board).length === 0, actions: [...state.actions, direction] }
  return { accepted: true as const, state: updated, events: move.events }
}

export function replayClassic(seed: number, actions: readonly Direction[]) {
  let state = startClassic(seed)
  for (const [index, direction] of actions.entries()) {
    const next = slideClassic(state, direction)
    if (!next.accepted) throw new RangeError(`Rejected classic move at action ${index + 1}`)
    state = next.state
  }
  return state
}
