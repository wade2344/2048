import { expect, test } from 'vitest'
import { adventureNodes } from '@infinite/game-config'
import { createRandomSnapshot, enterProtocolNode, legalSingleTargets, slideOrdinaryNode, useSingleTargetSkill } from './index'

function enter(protocol: Parameters<typeof enterProtocolNode>[2]['protocol']) {
  return enterProtocolNode(createRandomSnapshot(42), adventureNodes[3].goal,
    { protocol, owned:['data-clear','targeted-overclock'], firstId:1 })
}
const board = [[{id:'1',value:2},{id:'2',value:2},null,null],...Array.from({length:3},()=>[null,null,null,null])]
const ctx = { lockedTileIds:[] }
const clear = { type:'USE_SKILL', skillId:'data-clear', targets:['1'] } as const

test('low power caps a merge at six', () => {
  const state = { ...enter('low-power'), energy:6, board }
  expect(slideOrdinaryNode(state,'left').state.energy).toBe(6)
})
test.each([['command-tax',4],['extreme-overload',5],['energy-compression',2]] as const)(
  '%s checks and charges the effective cost', (protocol, cost) => {
    const state = { ...enter(protocol), energy:cost, board }
    expect(useSingleTargetSkill(state,ctx,clear).state.energy).toBe(0)
    const insufficient = { ...state, energy:cost-1 }
    expect(legalSingleTargets(insufficient,ctx,'data-clear')).toEqual([])
    expect(useSingleTargetSkill(insufficient,ctx,clear).state).toBe(insufficient)
  })
test('overload doubles merge income and compression limits capacity', () => {
  expect(slideOrdinaryNode({ ...enter('extreme-overload'), board },'left').state.energy).toBe(6)
  expect(enter('energy-compression').energyRules.capacity).toBe(6)
})
test('corruption initializes one fixed obstacle and two targetable tiles deterministically', () => {
  const state = enter('data-corruption')
  const cells = state.board.flat()
  const position = cells.findIndex(cell => cell && 'kind' in cell)
  expect(cells.filter(cell => cell && 'kind' in cell)).toHaveLength(1)
  expect(legalSingleTargets(state,ctx,'data-clear').sort()).toEqual(['1','2'])
  expect(enter('data-corruption')).toEqual(state)
  expect(slideOrdinaryNode(state,'down').state.board.flat()[position]).toEqual({kind:'obstacle'})
})
test('periodic loss only follows each fifth valid move, floors at zero, and victory skips it', () => {
  const state = { ...enter('periodic-error'), board, validMoves:4 }
  expect(slideOrdinaryNode(state,'up').state).toBe(state)
  expect(useSingleTargetSkill(state,ctx,clear).state.validMoves).toBe(4)
  expect(slideOrdinaryNode(state,'down').state.energy).toBe(3)
  expect(slideOrdinaryNode({ ...state, energy:0 },'down').state.energy).toBe(0)
  expect(slideOrdinaryNode({ ...state, validMoves:3 },'down').state.energy).toBe(4)
  expect(slideOrdinaryNode({ ...state, validMoves:39 },'down').state).toMatchObject({cleared:true,energy:4})
})
