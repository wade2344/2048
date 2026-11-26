import { expect, test } from 'vitest'
import { adventureNodes } from '@infinite/game-config'
import { createRandomSnapshot, drawIndex, legalSingleTargets, slideOrdinaryNode, startOrdinaryNode, takeReward } from './index'

const opening = { obstacles: [], skillTiles: [], protocolTiles: [] }
test('selected skills carry into successive openings before protocol bonus tiles', () => {
  const inventory = takeReward({ owned:['data-clear'], offer:['preload-energy','data-swap','advanced-spawn'] }, 'preload-energy')
  let random = createRandomSnapshot(90)
  let firstId = 1
  for (const node of [adventureNodes[2], adventureNodes[3]]) {
    const state = startOrdinaryNode(random, node.goal, { ...opening, protocolTiles:[16] }, undefined, firstId, inventory.owned)
    const tiles = state.board.flat().filter(cell => cell && 'id' in cell)
    expect(tiles).toContainEqual({ id:String(firstId + 2), value:8 })
    expect(tiles).toContainEqual({ id:String(firstId + 3), value:16 })
    expect(state).toMatchObject({ owned:inventory.owned, nodeScore:0, validMoves:0, energy:4, nextId:firstId + 4 })
    expect(legalSingleTargets(state, { lockedTileIds:[] }, 'data-clear')).toHaveLength(4)
    firstId = state.nextId
    random = state.random
  }
})

test('fixed seeds cover all ten value rolls in the opening and after an ordinary slide', () => {
  const rolls = new Set<number>()
  const moveRolls = new Set<number>()
  for (let seed = 0; seed < 100; seed++) {
    const random = createRandomSnapshot(seed)
    const ordinary = startOrdinaryNode(random, adventureNodes[0].goal, opening)
    const advanced = startOrdinaryNode(random, adventureNodes[0].goal, opening, undefined, 1, ['advanced-spawn'])
    const valueRoll = drawIndex(drawIndex(random, 'board', 16).snapshot, 'board', 10).value
    rolls.add(valueRoll)
    for (const [state, threshold] of [[ordinary,1],[advanced,3]] as const) {
      expect(state.board.flat()).toContainEqual({ id:'1', value:valueRoll < threshold ? 4 : 2 })
      const board = [[null,{ id:'1', value:2 },null,null],...Array.from({length:3},()=>[null,null,null,null])]
      const next = slideOrdinaryNode({ ...state, board }, 'left')
      if (!next.accepted) throw Error('expected slide')
      const roll = drawIndex(drawIndex(state.random, 'board', 15).snapshot, 'board', 10)
      moveRolls.add(roll.value)
      expect(next.state.random).toEqual(roll.snapshot)
      expect(next.state.board.flat()).toContainEqual({ id:'3', value:roll.value < threshold ? 4 : 2 })
    }
    expect(advanced.random).toEqual(ordinary.random)
  }
  expect([rolls.size,moveRolls.size]).toEqual([10,10])
})
