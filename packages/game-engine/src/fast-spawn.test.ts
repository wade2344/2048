import { expect,test } from 'vitest'
import { adventureNodes } from '@infinite/game-config'
import { createRandomSnapshot, drawIndex, enterProtocolNode, slideOrdinaryNode, useSingleTargetSkill } from './index'

const random = createRandomSnapshot(781)
const start = enterProtocolNode(random,adventureNodes[3].goal,{protocol:'fast-spawn',owned:['data-clear'],firstId:1})
const empty = [null,null,null,null]
const board = [[{id:'1',value:8},null,null,null],empty,empty,empty]
const state = {...start,board,validMoves:3}
test('fourth valid slide spawns a four then a two, consuming only position draws', () => {
  const moved = slideOrdinaryNode(state,'right')
  if (!moved.accepted) throw Error('expected move')
  const spawns = moved.events.filter(e => e.type === 'TILE_SPAWNED')
  expect(spawns.map(e=>e.tile)).toEqual([{id:String(state.nextId),value:4},{id:String(state.nextId+1),value:2}])
  expect(moved.state.random).toEqual(drawIndex(drawIndex(state.random,'board',15).snapshot,'board',14).snapshot)
  expect(moved.state).toMatchObject({nodeScore:0,validMoves:4,energy:4})
  expect(slideOrdinaryNode(JSON.parse(JSON.stringify(state)),'right')).toEqual(moved)
})
test('pure skills and ineffective slides leave the periodic clock untouched', () => {
  expect(slideOrdinaryNode(state,'left').state).toBe(state)
  const skill = useSingleTargetSkill(state,{lockedTileIds:[]},{type:'USE_SKILL',skillId:'data-clear',targets:['1']})
  expect(skill.state).toMatchObject({validMoves:3,random:state.random,nextId:state.nextId})
  expect(slideOrdinaryNode({...state,validMoves:2},'right').state.nextId).toBe(state.nextId+1)
})
test('skip the extra tile at victory or when the ordinary spawn fills the only vacancy', () => {
  const win = slideOrdinaryNode({...state,validMoves:39},'right')
  expect(win.state).toMatchObject({cleared:true,nextId:state.nextId+1})
  const full = [[2,2,4,8],[8,16,32,64],[2,4,8,16],[4,8,16,32]].map((row,r)=>
    row.map((value,c)=>({id:String(4*r+c),value})))
  const moved = slideOrdinaryNode({...state,board:full,nextId:16},'left')
  expect(moved.state.board.flat().filter(Boolean)).toHaveLength(16)
  expect(moved.state.nextId).toBe(17)
  expect(moved.state.random).toEqual(drawIndex(state.random,'board',1).snapshot)
})
test('unresolved passive conflict is explicit at entry', () => {
  expect(()=>enterProtocolNode(random,adventureNodes[3].goal,{protocol:'fast-spawn',owned:['advanced-spawn'],firstId:1})).toThrow(/D06/)
})
