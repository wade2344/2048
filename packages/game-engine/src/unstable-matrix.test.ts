import { expect,test } from 'vitest'
import { adventureNodes } from '@infinite/game-config'
import { createRandomSnapshot, dispatchEncounter, enterProtocolNode, legalSlides, slideOrdinaryNode, startEncounter } from './index'

const state = enterProtocolNode(createRandomSnapshot(781),adventureNodes[3].goal,
  { protocol:'unstable-matrix', owned:['state-rollback','preload-energy'],firstId:51 })
const direction = legalSlides(state.board)[0]!

test('opening bonuses keep their skill-then-protocol order', () => {
  expect(state.board.flat()).toEqual(expect.arrayContaining([{id:'53',value:8},{id:'54',value:16},{id:'55',value:16}]))
  expect(state).toMatchObject({nextId:56,energy:4,validMoves:0,nodeScore:0})
})

test('shuffle follows the tenth ordinary spawn and preserves its occupied cells and tile identities', () => {
  const before = {...state,validMoves:9}
  const control = slideOrdinaryNode({...before,protocol:null},direction)
  const moved = slideOrdinaryNode(before,direction)
  if (!moved.accepted || !control.accepted) throw Error('expected accepted moves')
  expect(moved.events.slice(0,-1)).toEqual(control.events)
  expect(moved.events.at(-1)?.type).toBe('PROTOCOL_SHUFFLED')
  const board = moved.state.board.flat(), original = control.state.board.flat()
  expect(board.map(Boolean)).toEqual(original.map(Boolean))
  expect(board.filter(Boolean)).toEqual(expect.arrayContaining(original.filter(Boolean)))
  expect(moved.state.random.states).toEqual({...control.state.random.states,board:expect.any(Number)})
  expect(moved.state.random.states.board).not.toBe(control.state.random.states.board)
  expect(moved.state).toMatchObject({nodeScore:control.state.nodeScore,energy:control.state.energy,nextId:control.state.nextId})
  const step = dispatchEncounter(startEncounter(before),{type:'MOVE',direction})
  const undone = dispatchEncounter(step.encounter,{type:'USE_SKILL',skillId:'state-rollback',targets:[]})
  expect(undone.encounter.node).toEqual({...before,energy:before.energy-3})
})

test('ordinary turns and the winning fortieth move skip the periodic shuffle', () => {
  for (const validMoves of [8,39]) {
    const moved = slideOrdinaryNode({...state,validMoves},direction)
    const baseline = slideOrdinaryNode({...state,validMoves,protocol:null},direction)
    if (!moved.accepted || !baseline.accepted) throw Error('expected moves')
    expect(moved.events).toEqual(baseline.events)
    expect(moved.state.random).toEqual(baseline.state.random)
    expect(moved.state.cleared).toBe(validMoves===39)
  }
})
