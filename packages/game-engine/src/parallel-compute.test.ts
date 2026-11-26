import { expect, test } from 'vitest'
import { adventureNodes } from '@infinite/game-config'
import { createRandomSnapshot, enterProtocolNode, slideOrdinaryNode, startOrdinaryNode } from './index'

const random = createRandomSnapshot(175)
const base = startOrdinaryNode(random,adventureNodes[2].goal,{obstacles:[],skillTiles:[],protocolTiles:[]},
  undefined,20,['parallel-compute'])
function pairs(values:number[]) {
  return Array.from({length:4},(_,r) => Array.from({length:4},(_,c) =>
    c < 2 && values[r] !== undefined ? {id:String(4*r+c),value:values[r]!} : null))
}

test('168 base plus 84 skill points count toward the score goal in the same turn', () => {
  const move = slideOrdinaryNode({...base,board:pairs([4,16,64]),nodeScore:48},'left')
  expect(move.state).toMatchObject({nodeScore:300,cleared:true,energy:8,validMoves:1})
})
test.each([[2,16,6],[3,36,8],[4,48,9]])('%i pairs trigger the bonus at most once', (count,score,energy) => {
  const move = slideOrdinaryNode({...base,board:pairs(Array(count).fill(4))},'left')
  expect(move.state).toMatchObject({nodeScore:score,energy})
})
test('extra EP respects the effective cap', () => {
  const state = enterProtocolNode(random,adventureNodes[2].goal,{protocol:'low-power',owned:base.owned,firstId:20})
  expect(slideOrdinaryNode({...state,board:pairs([2,4,8]),energy:5},'left').state.energy).toBe(6)
})
