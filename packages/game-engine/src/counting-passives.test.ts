import { expect, test } from 'vitest'
import { adventureNodes } from '@infinite/game-config'
import { createRandomSnapshot, dispatchEncounter, startEncounter, startOrdinaryNode, startZero, slideOrdinaryNode } from './index'

const seed = createRandomSnapshot(784)
const ordinary = startOrdinaryNode(seed, adventureNodes[2].goal,{obstacles:[],skillTiles:[],protocolTiles:[]},
  undefined,20,['continuous-compute','energy-recycle','state-rollback'])
const board = [[{id:'1',value:2},{id:'2',value:2},null,null],...Array.from({length:3},()=>[null,null,null,null])]
const before = {...ordinary,board,energy:4,mergeCounters:{streak:2,recycledPairs:7}}
test('one ordinary merge crosses both thresholds; undo restores both counters and RNG', () => {
  const step = dispatchEncounter(startEncounter(before),{type:'MOVE',direction:'left'})
  expect(step.encounter.node).toMatchObject({nodeScore:36,energy:7,mergeCounters:{streak:0,recycledPairs:0}})
  const undo = dispatchEncounter(step.encounter,{type:'USE_SKILL',skillId:'state-rollback',targets:[]})
  expect(undo.encounter.node).toEqual({...before,energy:1})
})
test('no-op retains progress; a valid slide without a merge breaks only the streak', () => {
  expect(slideOrdinaryNode(before,'up').state).toBe(before)
  expect(slideOrdinaryNode(before,'down').state).toMatchObject({energy:4,nodeScore:0,mergeCounters:{streak:0,recycledPairs:7}})
})
test('carry the within-node remainder and discard overflowing EP', () => {
  const doubled = {...before, energy:9, board:[board[0]!,[{id:'3',value:4},{id:'4',value:4},null,null],...board.slice(2)]}
  expect(slideOrdinaryNode(doubled,'left').state).toMatchObject({nodeScore:44,energy:10,mergeCounters:{streak:0,recycledPairs:1}})
})
test('continuous bonus can kill ZERO before a tile is generated', () => {
  const zero = startZero(seed,20,['continuous-compute','energy-recycle','data-clear','data-swap','preload-energy'])
  const node = {...zero,board,mergeCounters:before.mergeCounters,hp:36}
  const step = dispatchEncounter(startEncounter(node),{type:'MOVE',direction:'left'})
  expect(step.encounter.node).toMatchObject({hp:0,random:node.random,nextId:node.nextId,nodeScore:36,energy:7})
})
