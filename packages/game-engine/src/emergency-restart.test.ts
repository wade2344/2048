import {expect,test} from 'vitest'
import {adventureNodes} from '@infinite/game-config'
import {createRandomSnapshot,dispatchEncounter,legalSlides,startEncounter,startOrdinaryNode,startZero} from './index'

const seed = createRandomSnapshot(901)
const board = [[0,8,16,8],[16,8,16,8],[8,16,8,16],[16,8,16,8]].map((row,r) =>
  row.map((value,c)=>value ? {id:String(4*r+c),value}:null))
const base = {...startOrdinaryNode(seed,adventureNodes[3].goal,{obstacles:[],skillTiles:[],protocolTiles:[]},
  undefined,20,['emergency-restart','state-rollback']),board}
const left = {type:'MOVE',direction:'left'} as const

test('a dead board triggers exactly one automatic rescue across node transitions',()=>{
  const control = dispatchEncounter(startEncounter({...base,owned:[]}),left)
  expect(legalSlides(control.encounter.node.board)).toEqual([])
  const moved = dispatchEncounter(startEncounter(base),left)
  expect(moved.accepted).toBe(true)
  if (!moved.accepted) throw Error('expected move')
  const node = moved.encounter.node
  expect(node.emergencyRestartUsed).toBe(true)
  expect(node.board.flat().filter(Boolean)).toHaveLength(12)
  expect(legalSlides(node.board).length).toBeGreaterThan(0)
  expect(moved.events.at(-1)?.type).toBe('EMERGENCY_RESTART')
  expect(node).toMatchObject({random:control.encounter.node.random,energy:base.energy,validMoves:1,nodeScore:0})
  const again = dispatchEncounter(startEncounter(base,moved.encounter),left)
  expect(again.encounter.node.board.flat().filter(Boolean)).toHaveLength(16)
  const restored = dispatchEncounter(moved.encounter,{type:'USE_SKILL',skillId:'state-rollback',targets:[]})
  expect(restored.encounter.node).toEqual({...base,energy:1})
})

test('ZERO keeps its locked tile while the smallest eligible tiles are cleared',()=>{
  const boss = startZero(seed,20,['emergency-restart','data-clear','state-rollback','data-swap','parallel-compute'])
  const node = {...boss,board,lock:{tileId:'5',remainingMoves:2}}
  const result = dispatchEncounter(startEncounter(node),left)
  expect(result.encounter.node).toMatchObject({emergencyRestartUsed:true,hp:boss.hp,lock:{tileId:'5',remainingMoves:1}})
  expect(result.encounter.node.board[1]![1]).toBe(board[1]![1])
  expect(result.encounter.node.board[0]![3]).toBeNull()
})
test('an otherwise dead winning move does not spend the run rescue',()=>{
  const result = dispatchEncounter(startEncounter({...base,validMoves:39}),left)
  expect(result.encounter.node).toMatchObject({cleared:true})
  expect(result.encounter.node.emergencyRestartUsed).toBeUndefined()
})
