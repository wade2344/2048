import { expect, test } from 'vitest'
import { legalSlides, replayClassic, slideClassic, startClassic } from './index'

const boardOf = (values: number[][]) => values.map((row,r) => row.map((value,c) =>
  value ? { id: String(4*r+c), value } : null))

test('a full board with a vertical pair still permits vertical slides', () => {
  const board = boardOf([[2,4,2,4],[4,2,4,2],[2,4,2,4],[2,8,16,32]])
  expect(legalSlides(board)).toEqual(['up','down'])
})
test('a non-merging slide can fill the last gap and end the session', () => {
  // Neither possible spawn value can merge with the neighbours of the vacated cell.
  const board = boardOf([[8,16,32,0],[16,32,8,16],[8,16,32,8],[16,32,8,16]])
  const state = {...startClassic(17), board, nextId:16}
  expect(slideClassic(state,'left').state).toBe(state)
  const next = slideClassic(state,'right')
  expect(next.state.ended).toBe(true)
  expect(next.state.actions).toEqual(['right'])
  expect(legalSlides(next.state.board)).toEqual([])
  expect(slideClassic(next.state,'up').state).toBe(next.state)
})
test('seed and accepted moves reproduce all state including score, IDs and random streams', () => {
  let state = startClassic(781)
  for (let i = 0; i < 80; i++) {
    const moves = legalSlides(state.board)
    if (!moves.length) break
    state = slideClassic(state, moves[i % moves.length]!).state
  }
  expect(state.actions.length).toBeGreaterThan(10)
  expect(state.score).toBeGreaterThan(0)
  expect(replayClassic(state.seed, state.actions)).toEqual(state)
})
