export type Direction = 'left' | 'right' | 'up' | 'down'
export interface Tile { readonly id: string; readonly value: number }
export type Board = readonly (readonly (Tile | null)[])[]
export interface Obstacle { readonly kind: 'obstacle' }
export type AdventureBoard = readonly (readonly (Tile | Obstacle | null)[])[]
type Position = readonly [row: number, column: number]
type Event =
  | { type: 'TILE_MOVED'; id: string; from: Position; to: Position }
  | { type: 'TILE_MERGED'; ids: readonly [string, string]; to: Position; value: number }

function position(line: number, offset: number, direction: Direction): Position {
  switch (direction) {
    case 'left': return [line, offset]
    case 'right': return [line, 3 - offset]
    case 'up': return [offset, line]
    case 'down': return [3 - offset, line]
  }
}

type MoveResult<B> = { board: B; changed: boolean; score: number; events: Event[] }

export function moveBoard(board: Board, direction: Direction): MoveResult<Board>
export function moveBoard(board: AdventureBoard, direction: Direction): MoveResult<AdventureBoard>
export function moveBoard(board: AdventureBoard, direction: Direction): MoveResult<AdventureBoard> {
  if (board.length !== 4 || board.some(row => row.length !== 4)) {
    throw new RangeError('Expected a 4x4 board')
  }
  const result = board.map(row => row.map((): Tile | Obstacle | null => null))
  const events: Event[] = []
  let score = 0
  function slideSegment(line: number, write: number, occupied: {tile: Tile; from: Position}[]) {
    for (let read = 0; read < occupied.length; read++) {
      const first = occupied[read]!
      const next = occupied[read + 1]
      const to = position(line, write++, direction)
      let output = first.tile
      const merge = next && first.tile.value === next.tile.value
      for (const entry of merge ? [first, next] : [first]) {
        if (entry.from[0] !== to[0] || entry.from[1] !== to[1]) {
          events.push({ type: 'TILE_MOVED', id: entry.tile.id, from: entry.from, to })
        }
      }
      if (merge) {
        output = { id: first.tile.id, value: first.tile.value * 2 }
        score += output.value
        events.push({ type: 'TILE_MERGED', ids: [first.tile.id, next.tile.id], to, value: output.value })
        read++
      }
      result[to[0]]![to[1]] = output
    }
  }
  for (let line = 0; line < 4; line++) {
    let start = 0
    const occupied: { tile: Tile; from: Position }[] = []
    for (let offset = 0; offset < 4; offset++) {
      const from = position(line, offset, direction)
      const cell = board[from[0]]![from[1]]
      if (!cell) continue
      if ('kind' in cell) {
        slideSegment(line, start, occupied)
        occupied.length = 0
        start = offset + 1
        result[from[0]]![from[1]] = cell
      } else {
        occupied.push({tile: cell, from})
      }
    }
    slideSegment(line, start, occupied)
  }
  const changed = events.length > 0
  return { board: changed ? result : board, changed, score, events }
}
