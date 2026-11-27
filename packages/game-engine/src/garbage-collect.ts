import type { SkillId } from '@infinite/game-config'
import type { AdventureBoard, Tile } from './move'

interface CollectionState {
  readonly board: AdventureBoard
  readonly owned: readonly SkillId[]
  readonly garbageCollected?: boolean
}

/** D05 review candidate: row-major tie breaking among minimum unlocked tiles. */
export function collectFullBoard<T extends CollectionState>(state: T, lockedId?: string) {
  if (state.garbageCollected || !state.owned.includes('garbage-collect') ||
    state.board.some(row => row.includes(null))) return { state }
  let minimum: { tile:Tile; row:number; col:number } | undefined
  for (const [row,line] of state.board.entries()) {
    for (const [col,tile] of line.entries()) {
      if (tile && 'value' in tile && tile.id !== lockedId && (!minimum || tile.value < minimum.tile.value)) {
        minimum = { tile, row, col }
      }
    }
  }
  if (!minimum) return { state }
  const removed = minimum
  const board = state.board.map((line,row) => row === removed.row
    ? line.map((cell,col) => col === removed.col ? null : cell) : line)
  return { state:{ ...state, board, garbageCollected:true }, event:{ type:'GARBAGE_COLLECTED' as const, ...removed } }
}
