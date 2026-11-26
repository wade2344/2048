import { expect, test } from 'vitest'
import { adventureNodes, type BeneficialProtocol, type SkillId } from '@infinite/game-config'
import { createRandomSnapshot, enterBeneficialNode, slideOrdinaryNode, startOrdinaryNode, useSingleTargetSkill } from './index'

function enter(protocol: BeneficialProtocol, owned: readonly SkillId[] = []) {
  return enterBeneficialNode(createRandomSnapshot(100), adventureNodes[1].goal, { protocol, firstId:10, owned })
}
const board = [[{id:'10',value:2},{id:'11',value:2},null,null], ...Array.from({length:3},()=>[null,null,null,null])]

test('surge grants eight on entry, does not refill on movement or carry to the next node', () => {
  const state = enter('energy-surge',['data-clear'])
  expect(state.energy).toBe(8)
  const used = useSingleTargetSkill(state, { lockedTileIds:[] }, { type:'USE_SKILL', skillId:'data-clear', targets:['10'] })
  expect(used.state.energy).toBe(5)
  expect(slideOrdinaryNode({ ...used.state, board }, 'left').state.energy).toBe(6)
  const next = startOrdinaryNode(state.random, adventureNodes[2].goal, { obstacles:[], skillTiles:[], protocolTiles:[] })
  expect(next).toMatchObject({ energy:4, protocol:null })
})

test('capacity starts at four and caps multiple merge rewards at fifteen', () => {
  const state = enter('capacity-boost',['advanced-spawn'])
  expect(state).toMatchObject({ energy:4, energyRules:{capacity:15} })
  const fullRow = [[2,2,4,4].map((value,i)=>({id:String(i),value})), ...board.slice(1)]
  expect(slideOrdinaryNode({ ...state, board:fullRow, energy:14 },'left').state.energy).toBe(15)
})

test('cache places its sixteen after the preload eight and leaves opening counters at zero', () => {
  const state = enter('advanced-cache',['preload-energy'])
  expect(state.board.flat()).toContainEqual({ id:'12', value:8 })
  expect(state.board.flat()).toContainEqual({ id:'13', value:16 })
  expect(state).toMatchObject({ nodeScore:0, validMoves:0, energy:4, nextId:14 })
})

test('turbo awards five points for a four merge, adds one EP and checks the modified score', () => {
  const state = enter('turbo-mode',['advanced-spawn'])
  const before = { ...state, goal:adventureNodes[2].goal, nodeScore:295, board }
  const after = slideOrdinaryNode(before,'left')
  expect(after.state).toMatchObject({ nodeScore:300, energy:5, validMoves:1, cleared:true })
  expect(slideOrdinaryNode(JSON.parse(JSON.stringify(before)), 'left')).toEqual(after)
  expect(slideOrdinaryNode(before,'down').state.nodeScore).toBe(295)
})
