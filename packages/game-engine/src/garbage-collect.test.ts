import { expect,test } from 'vitest'
import { adventureNodes } from '@infinite/game-config'
import { createRandomSnapshot, dispatchEncounter, legalSlides, slideOrdinaryNode, slideZero,
  startEncounter, startOrdinaryNode, startZero } from './index'

const seed = createRandomSnapshot(42)
const board = [[8,8,16,32],[2,4,8,16],[2,4,8,16],[4,8,16,32]].map((row,r) =>
  row.map((value,c)=>({id:String(4*r+c),value})))
const node = {...startOrdinaryNode(seed,adventureNodes[3].goal,{obstacles:[],skillTiles:[],protocolTiles:[]},
  undefined,20,['garbage-collect','state-rollback']),board}

test('first fill collects one minimum even on a playable board and only once per node', () => {
  const plain = slideOrdinaryNode({...node,owned:[]},'left').state
  expect(legalSlides(plain.board).length).toBeGreaterThan(0)
  const result = slideOrdinaryNode(node,'left')
  if (!result.accepted) throw Error('expected slide')
  expect(result.state.board.flat().filter(Boolean)).toHaveLength(15)
  const cells = plain.board.flat()
  const first = cells.findIndex(cell=>cell && 'value' in cell && cell.value===2)
  expect(result.state.board.flat()[first]).toBeNull()
  expect(result.state).toMatchObject({garbageCollected:true,random:plain.random,energy:plain.energy,nextId:plain.nextId})
  expect(result.events.at(-1)?.type).toBe('GARBAGE_COLLECTED')
  const later = slideOrdinaryNode({...result.state,board},'left').state
  expect(later.board.flat().filter(Boolean)).toHaveLength(16)
})
test('victory skips collection and rollback restores the node-local flag', () => {
  const won = slideOrdinaryNode({...node,validMoves:39},'left')
  expect(won.state.cleared).toBe(true)
  expect(won.state.garbageCollected).toBeUndefined()
  const moved = dispatchEncounter(startEncounter(node),{type:'MOVE',direction:'left'})
  const undone = dispatchEncounter(moved.encounter,{type:'USE_SKILL',skillId:'state-rollback',targets:[]})
  expect(undone.encounter.node).toEqual({...node,energy:1})
})
test('ZERO keeps a locked minimum tile through collection', () => {
  const zero = startZero(seed,20,['garbage-collect','data-clear','data-swap','state-rollback','targeted-overclock'])
  const moved = slideZero({...zero,board,lock:{tileId:'4',remainingMoves:2}},'left')
  expect(moved.state.board[1]![0]).toBe(board[1]![0])
  expect(moved.state).toMatchObject({garbageCollected:true,lock:{tileId:'4',remainingMoves:1}})
  expect(moved.state.board.flat().filter(Boolean)).toHaveLength(15)
})
