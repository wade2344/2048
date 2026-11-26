import { expect, test } from 'vitest'
import { adventureNodes } from '@infinite/game-config'
import { createRandomSnapshot, slideOrdinaryNode, startOrdinaryNode, type AdventureBoard } from './index'

const random = createRandomSnapshot(567)
const opening = { obstacles: [], skillTiles: [], protocolTiles: [] }
const pair: AdventureBoard = [
  [{kind:'obstacle'}, {id:'1',value:2}, {id:'2',value:2}, null],
  [null,null,null,null], [null,null,null,null], [null,null,null,null],
]

test('checks the opening after bonuses and blocks input when the node is cleared', () => {
  const state = startOrdinaryNode(random, adventureNodes[0].goal, { ...opening, skillTiles: [32] })
  expect(state).toMatchObject({ cleared: true, validMoves: 0, nodeScore: 0, energy: 4 })
  expect(slideOrdinaryNode(state, 'left').state).toBe(state)
})

test('one turn commits score, energy, generated tile and goal together after restoring JSON', () => {
  const state = { ...startOrdinaryNode(random, adventureNodes[2].goal, opening), board: pair, nodeScore: 296 }
  const result = slideOrdinaryNode(state, 'left')
  expect(result.accepted).toBe(true)
  if (!result.accepted) throw Error('expected an accepted slide')
  expect(result.state).toMatchObject({ nodeScore: 300, validMoves: 1, energy: 5, cleared: true, nextId: state.nextId + 1 })
  expect(result.state.board[0]![0]).toBe(pair[0]![0])
  expect(result.events.at(-1)?.type).toBe('TILE_SPAWNED')
  expect(slideOrdinaryNode(JSON.parse(JSON.stringify(state)), 'left')).toEqual(result)
  const next = startOrdinaryNode(result.state.random, adventureNodes[3].goal, opening, undefined, result.state.nextId)
  expect(next).toMatchObject({ nodeScore: 0, validMoves: 0, energy: 4, nextId: result.state.nextId + 2 })
})

test('only a valid move advances the survival goal', () => {
  const state = { ...startOrdinaryNode(random, adventureNodes[3].goal, opening), board: pair, validMoves: 39 }
  expect(slideOrdinaryNode(state,'up').state).toBe(state)
  expect(slideOrdinaryNode(state,'down').state).toMatchObject({ cleared: true, validMoves: 40, energy: 4 })
})
