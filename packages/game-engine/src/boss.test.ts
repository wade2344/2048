import { expect, test } from 'vitest'
import type { SkillId } from '@infinite/game-config'
import { createRandomSnapshot, slideZero, startZero } from './index'

const owned: SkillId[] = ['advanced-spawn','preload-energy','data-clear','data-swap','parallel-compute']
const random = createRandomSnapshot(42)
const initial = startZero(random, 20, owned)
const board = [[4,4,0,0],[16,16,0,0],[64,64,0,0],[0,0,0,0]].map((row,r) =>
  row.map((value,c) => value ? { id:String(4*r+c), value } : null))

test('ZERO initialization carries exactly five skills and applies opening bonuses', () => {
  expect(initial).toMatchObject({ hp:1000, energy:4, validMoves:0, nodeScore:0, nextId:23, owned })
  expect(initial.board.flat()).toContainEqual({id:'22',value:8})
  expect(() => startZero(random,1,owned.slice(1))).toThrow(RangeError)
  expect(() => startZero(random,1,[...owned.slice(1),owned[1]!])).toThrow(RangeError)
})
test.each([[true,252,8],[false,168,7]] as const)('three merge pairs with parallel=%s', (parallel,damage,energy) => {
  const state = { ...initial, board, owned:parallel ? owned : owned.map(id => id === 'parallel-compute' ? 'matrix-rebuild' : id) }
  const after = slideZero(state,'left')
  expect(after.state).toMatchObject({ hp:1000-damage, nodeScore:damage, energy, validMoves:1, nextId:24 })
  if (!after.accepted) throw Error('expected move')
  expect(after.events.slice(-2).map(event => event.type)).toEqual(['BOSS_DAMAGED','TILE_SPAWNED'])
})
test.each([252,200])('lethal damage at HP %i stops before spawning', hp => {
  const state = { ...initial, board, hp, validMoves:4 }
  const after = slideZero(state,'left')
  expect(after.state).toMatchObject({ hp:0, nodeScore:252, validMoves:5, energy:8, nextId:initial.nextId })
  expect(after.state.random).toBe(state.random)
  if (!after.accepted) throw Error('expected move')
  expect(after.events.at(-1)?.type).toBe('BOSS_DAMAGED')
  expect(slideZero(after.state,'right').state).toBe(after.state)
  expect(slideZero(JSON.parse(JSON.stringify(state)),'left')).toEqual(after)
})
test('no-op preserves the state and pure movement does no damage', () => {
  const state = { ...initial, board:[[null,{id:'1',value:2},null,null],...board.slice(1).map(()=>[null,null,null,null])] }
  expect(slideZero(state,'up').state).toBe(state)
  expect(slideZero(state,'left').state).toMatchObject({hp:1000,energy:4,nodeScore:0,validMoves:1})
})
