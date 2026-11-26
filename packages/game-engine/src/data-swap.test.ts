import { expect,test } from 'vitest'
import { adventureNodes } from '@infinite/game-config'
import { createRandomSnapshot, dispatchEncounter, enterProtocolNode, legalSwapPairs, startEncounter, startZero } from './index'

const board = [[{id:'1',value:4},null,{kind:'obstacle'},null],[null,{id:'2',value:8},{id:'3',value:4},null],
  [null,null,null,null],[null,null,null,null]] as const
const random = createRandomSnapshot(42)
const state = {...enterProtocolNode(random,adventureNodes[3].goal,{ protocol:'command-tax',firstId:4,owned:['data-swap'] }),board}
const action = { type:'USE_SKILL',skillId:'data-swap',targets:['1','2'] } as const

test('swaps identities across rows and charges the effective cost without any move side effects', () => {
  const before = {...startEncounter(state),beforeMove:state}
  expect(legalSwapPairs(state)).toEqual([['1','2'],['2','3']])
  const next = dispatchEncounter(before,action)
  expect(next.accepted).toBe(true)
  expect(next.encounter).toEqual({ node:{...state,energy:0,board:[
    [board[1][1],null,board[0][2],null],[null,board[0][0],board[1][2],null],...board.slice(2),
  ]},beforeMove:null,actions:[action] })
  expect(dispatchEncounter(startEncounter({...state,energy:3}),action).accepted).toBe(false)
})

test('invalid targets preserve resources, snapshot and log; equal values identify D13', () => {
  const before = startEncounter(state)
  for (const targets of [[],['1'],['1','1'],['1','missing'],['1','2','3']]) {
    expect(dispatchEncounter(before,{...action,targets}).encounter).toBe(before)
  }
  expect(dispatchEncounter(before,{...action,targets:['1','3']})).toMatchObject({accepted:false,pendingDecision:'D13'})
})
test('ZERO excludes locked tiles and allows a swap without damage or clock advancement', () => {
  const base = startZero(random,4,['data-clear','data-swap','preload-energy','parallel-compute','energy-recycle'])
  const node = {...base,board,energy:3,lock:{tileId:'3',remainingMoves:2},warning:[0,0] as const}
  expect(legalSwapPairs(node)).toEqual([['1','2']])
  const before = startEncounter(node)
  expect(dispatchEncounter(before,{...action,targets:['2','3']}).encounter).toBe(before)
  const next = dispatchEncounter(before,action)
  expect(next.encounter.node).toMatchObject({hp:node.hp,validMoves:0,energy:0,lock:node.lock,warning:node.warning})
})
