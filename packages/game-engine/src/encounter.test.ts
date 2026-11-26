import { expect, test } from 'vitest'
import { adventureNodes } from '@infinite/game-config'
import { createRandomSnapshot, dispatchEncounter, enterProtocolNode, startEncounter, startOrdinaryNode, startZero } from './index'

const move = {type:'MOVE',direction:'left'} as const
const undo = {type:'USE_SKILL',skillId:'state-rollback',targets:[]} as const
const board = [[{id:'1',value:32},{id:'2',value:32},null,null],...Array.from({length:3},()=>[null,null,null,null])]
const random = createRandomSnapshot(197)
const base = { ...startOrdinaryNode(random,adventureNodes[2].goal,{ obstacles:[], skillTiles:[], protocolTiles:[] },
  undefined,1,['state-rollback','data-clear']), board, energy:5, nodeScore:100 }

test('5 → 6 → 2 → 3 EP with the identical second merge and append-only history', () => {
  const moved = dispatchEncounter(startEncounter(base),move).encounter
  expect(moved.node).toMatchObject({energy:6,nodeScore:164})
  const restored = dispatchEncounter(JSON.parse(JSON.stringify(moved)),undo).encounter
  expect(restored.node).toEqual({...base,energy:2})
  expect(restored.beforeMove).toBeNull()
  expect(dispatchEncounter(restored,undo).encounter).toBe(restored)
  const repeated = dispatchEncounter(restored,move).encounter
  expect(repeated.node).toEqual({...moved.node,energy:3})
  expect(repeated.actions).toEqual([move,undo,move])
})

test('both balances must cover the protocol-adjusted cost and failed actions preserve history', () => {
  const taxed = enterProtocolNode(random,adventureNodes[2].goal,{ protocol:'command-tax',owned:base.owned,firstId:3 })
  const saved = dispatchEncounter(startEncounter({...taxed,board,energy:3}),move).encounter
  expect(saved.node.energy).toBe(4)
  for (const attempt of [saved,{...saved,node:{...saved.node,energy:3},beforeMove:{...taxed,energy:4}}]) {
    expect(dispatchEncounter(attempt,undo).encounter).toBe(attempt)
  }
  const ready = dispatchEncounter(startEncounter({...taxed,board,energy:4}),move).encounter
  expect(dispatchEncounter(ready,undo).encounter.node.energy).toBe(0)
  const clear = {type:'USE_SKILL',skillId:'data-clear',targets:['missing']} as const
  expect(dispatchEncounter(ready,clear).encounter).toBe(ready)
  expect(dispatchEncounter(ready,{...clear,targets:['1']}).encounter.beforeMove).toBeNull()
})

test('restores ZERO HP, warning, lock, clocks and all RNG streams; kills are final', () => {
  const zero = {...startZero(random,10,['state-rollback','data-clear','data-swap','parallel-compute','targeted-overclock']),
    energy:5, board:[...board.slice(0,3),[null,null,null,{id:'9',value:8}]], hp:100,
    warning:[0,1] as const, lock:{tileId:'9',remainingMoves:1}}
  const moved = dispatchEncounter(startEncounter(zero),move).encounter
  expect(moved.node).toMatchObject({hp:36,lock:null})
  expect(dispatchEncounter(moved,undo).encounter.node).toEqual({...zero,energy:2})
  const victory = dispatchEncounter(startEncounter({...zero,hp:64}),move).encounter
  expect(victory.beforeMove).toBeNull()
  expect(dispatchEncounter(victory,undo).encounter).toBe(victory)
})
