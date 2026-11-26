import { expect, test } from 'vitest'
import { adventureNodes } from '@infinite/game-config'
import { goalReached } from './goal'

const nodes = adventureNodes.map(node => node.goal)
const zero = { largestTile:0, nodeScore:0, validMoves:0 }
test.each([
  [0,'largestTile',32],[1,'largestTile',64],[2,'nodeScore',300],
  [3,'validMoves',40],[4,'largestTile',256],
] as const)('node %i uses its own goal threshold', (i, field, threshold) => {
  const progress = {largestTile:8192,nodeScore:5000,validMoves:1000}
  for (const delta of [-1,0,1]) {
    expect(goalReached(nodes[i]!,{...progress,[field]:threshold+delta})).toBe(delta>=0)
  }
})
test('final node requires a defeated boss', () => {
  expect(goalReached(nodes[5]!, zero)).toBe(false)
  expect(goalReached(nodes[5]!, {...zero,bossHp:1})).toBe(false)
  expect(goalReached(nodes[5]!, {...zero,bossHp:0})).toBe(true)
})
