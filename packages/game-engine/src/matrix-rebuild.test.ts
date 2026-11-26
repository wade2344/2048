import { expect,test } from 'vitest'
import { adventureNodes } from '@infinite/game-config'
import { createRandomSnapshot, dispatchEncounter, enterProtocolNode, startEncounter, startZero } from './index'

const action = {type:'USE_SKILL',skillId:'matrix-rebuild',targets:[]} as const
const board = [[{id:'1',value:2},null,{kind:'obstacle'},{id:'2',value:4}],
  [null,{id:'3',value:8},null,{id:'4',value:16}], [null,null,null,null], [null,null,null,null]] as const
const node = {...enterProtocolNode(createRandomSnapshot(781),adventureNodes[3].goal,
  { protocol:'command-tax',owned:['matrix-rebuild'],firstId:10 }),board,energy:5}
const before = {...startEncounter(node),beforeMove:node}

test('rebuild commits one deterministic board permutation and only pays the effective cost', () => {
  const result = dispatchEncounter(before,action)
  expect(result.accepted).toBe(true)
  const after = result.encounter.node
  expect(after.board).not.toEqual(board)
  const ids = (cells: typeof after.board) => cells.flat().flatMap(tile=>tile && 'id' in tile ? [tile.id+'='+tile.value] : []).sort()
  expect(ids(after.board)).toEqual(ids(board))
  board.forEach((row,r)=>row.forEach((tile,c)=>{ if (!tile || 'kind' in tile) expect(after.board[r]![c]).toBe(tile) }))
  expect(after).toEqual({...node,board:after.board,random:after.random,energy:0})
  expect(after.random.states).toEqual({...node.random.states,board:expect.any(Number)})
  expect(after.random.states.board).not.toBe(node.random.states.board)
  expect(result.encounter.beforeMove).toBeNull()
  expect(dispatchEncounter(JSON.parse(JSON.stringify(before)),action)).toEqual(result)
})
test('invalid and unresolved uses do not commit a partial transaction', () => {
  for (const attempt of [{...node,energy:4},{...node,owned:[]},{...node,cleared:true}]) {
    const start = startEncounter(attempt)
    expect(dispatchEncounter(start,action).encounter).toBe(start)
  }
  expect(dispatchEncounter(before,{...action,targets:['1']}).encounter).toBe(before)
  const identical = startEncounter({...node,board:board.map(row=>row.map(tile=>tile && 'id' in tile ? {...tile,value:2}:tile))})
  expect(dispatchEncounter(identical,action)).toEqual({accepted:false,encounter:identical,pendingDecision:'D07/D13'})
})
test('Boss lock, warning, HP and clocks survive a successful rebuild', () => {
  const boss = startZero(createRandomSnapshot(5),10,['matrix-rebuild','data-swap','data-clear','energy-recycle','parallel-compute'])
  const encounter = startEncounter({...boss,board,random:createRandomSnapshot(781),lock:{tileId:'4',remainingMoves:2},warning:[2,2]})
  const result = dispatchEncounter(encounter,action)
  expect(result.accepted).toBe(true)
  expect(result.encounter.node.board[1]![3]).toBe(board[1][3])
  expect(result.encounter.node).toMatchObject({energy:0,hp:boss.hp,validMoves:0,nodeScore:0,lock:{tileId:'4',remainingMoves:2},warning:[2,2]})
})
