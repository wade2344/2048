import { expect, test, vi } from 'vitest'
import { createRandomSnapshot, enterLevel, ordinaryMove, type Board } from './index'

const random = createRandomSnapshot(42)
test('obstacles, two normal tiles, skill tiles, protocol tiles, then goal', () => {
  const opening = { obstacles: [[0,0] as const], skillTiles: [8], protocolTiles: [16,16] }
  const goal = vi.fn((board: readonly (readonly unknown[])[]) => board.flat().filter(Boolean).length === 6)
  const result = enterLevel(random, opening, goal)
  expect(result.board[0]![0]).toEqual({kind:'obstacle'})
  const values = result.spawned.map(s => s.tile.value)
  expect(values.slice(0,2).every(v => v === 2 || v === 4)).toBe(true)
  expect(values.slice(2)).toEqual([8,16,16])
  expect(result.nextId).toBe(6)
  expect(result.cleared).toBe(true)
  expect(goal).toHaveBeenCalledTimes(1)
  expect(enterLevel(random, opening, goal)).toEqual(result)
})

test('invalid slide does not spend random state or IDs; valid slide spawns before goal', () => {
  const board: Board = [[{id:'1',value:2},null,null,null], ...Array.from({length:3},()=>Array(4).fill(null))]
  const state = { board, nextId:2, random }
  const goal = vi.fn((b: Board) => b.flat().filter(Boolean).length === 2)
  expect(ordinaryMove(state,'left',goal)).toEqual({accepted:false, state})
  expect(goal).not.toHaveBeenCalled()
  const move = ordinaryMove(state,'right',goal)
  expect(move.accepted).toBe(true)
  if (!move.accepted) throw Error('expected a slide')
  expect(move.cleared).toBe(true)
  expect(move.events.at(-1)?.type).toBe('TILE_SPAWNED')
  expect(move.state.nextId).toBe(3)
  expect(move.state.random.states.reward).toBe(random.states.reward)
})
