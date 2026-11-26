import { expect, test } from 'vitest'
import { createRandomSnapshot, resolveGridLock, slideZero, startZero, warnGridLock } from './index'

const base = startZero(createRandomSnapshot(784),1,['advanced-spawn','preload-energy','data-clear','data-swap','parallel-compute'])
const empty = () => Array.from({length:4},()=>Array.from({length:4},(): { id:string; value:number } | null => null))

test('warning draws once from the boss stream and survives serialization', () => {
  const state = warnGridLock(base)
  expect(state.warning).not.toBeNull()
  expect(state.random.states).toEqual({...base.random.states,boss:expect.any(Number)})
  expect(state.random.states.boss).not.toEqual(base.random.states.boss)
  expect(warnGridLock(state)).toBe(state)
  expect(warnGridLock(JSON.parse(JSON.stringify(base)))).toEqual(state)
})

test('resolution locks the current occupant of the warned coordinate and misses empty cells', () => {
  const board = empty()
  board[0]![0] = {id:'replacement',value:4}
  board[0]![2] = {id:'other',value:4}
  const state = { ...base, board, warning:[0,0] as const }
  const hit = resolveGridLock(state)
  expect(hit.lock).toEqual({tileId:'replacement',remainingMoves:2})
  expect(hit.warning).toBeNull()
  expect(hit.random).toBe(state.random)
  expect(resolveGridLock({...state,warning:[1,0]})).toMatchObject({warning:null,lock:null})
  expect(resolveGridLock(hit)).toBe(hit)
  expect(slideZero(hit,'up').state).toBe(hit)
  const moved = slideZero(hit,'left')
  expect(moved.state.board[0]![0]).toEqual(board[0]![0])
  expect(moved.state.hp).toBe(hit.hp)
  expect(moved.state.lock?.remainingMoves).toBe(1)
  expect(slideZero(moved.state,'down').state.lock).toBeNull()
})

test('protection cancels a lock that removes the last legal slides', () => {
  const board = empty()
  board[0]![0] = {id:'only',value:8}
  const state = { ...base, board, warning:[0,0] as const }
  expect(resolveGridLock(state)).toEqual({...state,warning:null})
})
