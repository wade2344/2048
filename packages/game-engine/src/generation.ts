import { spawnTuning } from '@infinite/game-config'
import { moveBoard, type Board, type Direction, type Obstacle, type Tile } from './move'
import { drawIndex, type RandomSnapshot } from './random'

type Matrix<T> = readonly (readonly (T | null)[])[]
interface GridState<T> {
  readonly board: Matrix<T>
  readonly random: RandomSnapshot
  readonly nextId: number
}

function vacantCells<T>(board: Matrix<T>) {
  const empty: [number, number][] = []
  board.forEach((row, r) => row.forEach((cell, c) => {
    if (cell === null) empty.push([r, c])
  }))
  return empty
}

// Candidate sampling contract: row-major empty cells, position before value.
function place<T extends Tile | Obstacle>(state: GridState<T>, fixedValue?: number, advancedSpawn = false) {
  const empty = vacantCells(state.board)
  if (!empty.length) throw new RangeError('Placement requires an empty cell')
  const location = drawIndex(state.random, 'board', empty.length)
  const [row, col] = empty[location.value]!
  let random = location.snapshot
  let value = fixedValue
  if (value === undefined) {
    const roll = drawIndex(random, 'board', spawnTuning.totalWeight)
    value = roll.value < (advancedSpawn ? spawnTuning.advancedFourWeight : spawnTuning.baseFourWeight) ? 4 : 2
    random = roll.snapshot
  }
  const tile: Tile = { id: String(state.nextId), value }
  const board = state.board.map(line => [...line] as (T | Tile | null)[])
  board[row]![col] = tile
  return { board, random, nextId: state.nextId + 1, spawned: { row, col, tile } }
}

export interface Opening {
  readonly obstacles: readonly (readonly [number, number])[]
  readonly skillTiles: readonly number[]
  readonly protocolTiles: readonly number[]
}

/** Obstacles are selected by the level. Fixed bonuses use their supplied order. */
export function enterLevel(random: RandomSnapshot, opening: Opening,
  meetsGoal: (board: Matrix<Tile | Obstacle>) => boolean, firstId = 1, advancedSpawn = false) {
  const board: (Tile | Obstacle | null)[][] = Array.from({length: 4}, () => Array(4).fill(null))
  for (const [r,c] of opening.obstacles) {
    if (!Number.isInteger(r) || !Number.isInteger(c) || board[r]?.[c] !== null) {
      throw new RangeError('Invalid or repeated obstacle position')
    }
    board[r]![c] = {kind: 'obstacle'}
  }
  let state: GridState<Tile | Obstacle> = {board, random, nextId: firstId}
  const spawned = []
  for (const value of [undefined, undefined, ...opening.skillTiles, ...opening.protocolTiles]) {
    const next = place(state, value, advancedSpawn)
    state = next
    spawned.push(next.spawned)
  }
  return {board: state.board, random: state.random, nextId: state.nextId, spawned, cleared: meetsGoal(state.board)}
}

export function spawnOrdinaryTile<T extends Tile | Obstacle>(state: GridState<T>, advancedSpawn = false) {
  return place(state, undefined, advancedSpawn)
}

/** Ordinary tiles only. Boss damage and obstacle segments belong to their own rule stages. */
export function ordinaryMove(state: GridState<Tile>, direction: Direction,
  meetsGoal: (board: Board, baseScore: number) => boolean) {
  const move = moveBoard(state.board, direction)
  if (!move.changed) return { accepted: false as const, state }
  const next = spawnOrdinaryTile({...state, board: move.board})
  return { accepted: true as const, state: { board: next.board, random: next.random, nextId: next.nextId },
    events: [...move.events, {type: 'TILE_SPAWNED' as const, ...next.spawned}],
    score: move.score, cleared: meetsGoal(next.board, move.score) }
}
