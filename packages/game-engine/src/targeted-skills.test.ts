import { expect, test } from 'vitest'
import { adventureNodes } from '@infinite/game-config'
import { createRandomSnapshot, legalSingleTargets, startOrdinaryNode, useSingleTargetSkill } from './index'

const state = { ...startOrdinaryNode(createRandomSnapshot(42), adventureNodes[1].goal,
  { obstacles: [[0,0]], skillTiles: [32], protocolTiles: [] }, undefined, 1, ['targeted-overclock','data-clear']), energy: 6 }
const context = { lockedTileIds: ['2'] } as const
const cast = { type: 'USE_SKILL', skillId: 'targeted-overclock', targets: ['3'] } as const
const clear = { ...cast, skillId: 'data-clear' } as const

test('overclock doubles only its target and can finish the node', () => {
  const result = useSingleTargetSkill(state, context, cast)
  expect(result.accepted).toBe(true)
  if (!result.accepted) throw Error('expected overclock')
  expect(result.events).toMatchObject([{ type:'SKILL_APPLIED', tileId:'3', previousValue:32, value:64 }])
  expect(result.state).toEqual({ ...state, energy:0, cleared:true, board:state.board.map(line => line.map(cell =>
    cell && 'id' in cell && cell.id === '3' ? { ...cell, value:64 } : cell)) })
})

test('clear charges exactly 3 and rejects a stale target on resubmission', () => {
  const before = { ...state, energy:3 }
  const result = useSingleTargetSkill(before, context, clear)
  expect(result.accepted).toBe(true)
  expect(result.state).toEqual({ ...before, energy:0, board:before.board.map(line => line.map(cell =>
    cell && 'id' in cell && cell.id === '3' ? null : cell)) })
  const recharged = { ...result.state, energy:3 }
  expect(useSingleTargetSkill(recharged, context, clear).state).toBe(recharged)
})

test('enumeration and confirmation both enforce ownership, balance, locks and phase', () => {
  expect(legalSingleTargets(state, context, 'targeted-overclock').sort()).toEqual(['1','3'])
  for (const targets of [[], ['1','3'], ['2'], ['missing']]) {
    expect(useSingleTargetSkill(state, context, { ...cast, targets }).state).toBe(state)
  }
  for (const current of [{ ...state, energy:5 }, { ...state, cleared:true }]) {
    expect(legalSingleTargets(current, context, cast.skillId)).toEqual([])
    expect(useSingleTargetSkill(current, context, cast).state).toBe(current)
  }
  const untrained = { ...state, owned:[] }
  expect(useSingleTargetSkill(untrained, context, cast).state).toBe(untrained)
})
