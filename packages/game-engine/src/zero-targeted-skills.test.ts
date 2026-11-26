import { expect, test } from 'vitest'
import { createRandomSnapshot, legalZeroTargets, resolveGridLock, startZero, useZeroTargetSkill } from './index'

const opening = startZero(createRandomSnapshot(8), 1,
  ['targeted-overclock','data-clear','preload-energy','energy-recycle','advanced-spawn'])
const board = [[{id:'1',value:16},{id:'2',value:32},null,null],
  ...Array.from({length:3},()=>[null,null,null,null])]
const state = resolveGridLock({ ...opening, board, energy:6, warning:[0,0] })

test.each([['targeted-overclock',64,0],['data-clear',null,3]] as const)(
  '%s respects an active lock and only changes the chosen tile and EP', (skillId,value,energy) => {
    const before = { ...state, warning:[2,2] as const }
    const action = { type:'USE_SKILL', skillId, targets:['2'] } as const
    expect(before.lock?.tileId).toBe('1')
    expect(legalZeroTargets(before, skillId)).toEqual(['2'])
    expect(useZeroTargetSkill(before, { ...action, targets:['1'] }).state).toBe(before)
    const result = useZeroTargetSkill(before, action)
    if (!result.accepted) throw Error('expected valid target')
    const expected = value === null ? null : { id:'2', value }
    expect(result.state).toEqual({ ...before, energy, board:[[board[0]![0],expected,null,null],...board.slice(1)] })
    expect(result.events.map(event=>event.type)).toEqual(['SKILL_APPLIED'])
    expect(useZeroTargetSkill(JSON.parse(JSON.stringify(before)),action)).toEqual(result)
  })

test('defeated ZERO and insufficient EP reject the action before committing', () => {
  const action = { type:'USE_SKILL', skillId:'targeted-overclock', targets:['2'] } as const
  for (const before of [{...state,hp:0},{...state,energy:5}]) {
    expect(legalZeroTargets(before,action.skillId)).toEqual([])
    expect(useZeroTargetSkill(before,action).state).toBe(before)
  }
})
