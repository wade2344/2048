import { expect, test } from 'vitest'
import { adventureNodes, skills } from '@infinite/game-config'
import { createRandomSnapshot, enterBeneficialNode, legalSlides, rewardCombinations, sampleUniformReward,
  slideOrdinaryNode, startOrdinaryNode, takeReward, validOffer } from './index'

test('candidate set enumeration contains every allowed combination exactly once', () => {
  for (const mixed of [true,false]) {
    const sets = rewardCombinations([],mixed)
    expect(sets.length).toBe(mixed ? 175 : 220)
    expect(new Set(sets.map(set => [...set].sort().join(','))).size).toBe(sets.length)
    expect(sets.every(set => validOffer(skills,[],set,mixed))).toBe(true)
  }
  expect(rewardCombinations(['data-clear'],false).every(set => !set.includes('data-clear'))).toBe(true)
})

test('existing offers and empty pools preserve RNG identity', () => {
  const random = createRandomSnapshot(71)
  const draw = sampleUniformReward({ owned:[], offer:[] },random,true)
  expect(draw.random.states.reward).not.toBe(random.states.reward)
  expect(draw.random.states).toEqual({ ...random.states, reward:draw.random.states.reward })
  const restored = JSON.parse(JSON.stringify(draw))
  const again = sampleUniformReward(restored.inventory,restored.random,true)
  expect(again.inventory).toBe(restored.inventory)
  expect(again.random).toBe(restored.random)
  const empty = { owned:skills.map(skill=>skill.id), offer:[] }
  expect(sampleUniformReward(empty,random,false).random).toBe(random)
})

test('a completed first node can feed a reward choice into a fresh second node', () => {
  let state = startOrdinaryNode(createRandomSnapshot(781),adventureNodes[0].goal,
    {obstacles:[],skillTiles:[],protocolTiles:[]})
  const sequence = ['left','down','right','down','left','up'] as const
  for (let i = 0; i < 200 && !state.cleared; i++) state = slideOrdinaryNode(state,sequence[i%sequence.length]!).state
  expect(state.cleared).toBe(true)
  const draw = sampleUniformReward({ owned:state.owned, offer:[] },state.random,true)
  const inventory = takeReward(draw.inventory,draw.inventory.offer[0]!)
  expect(takeReward(inventory,draw.inventory.offer[1]!)).toBe(inventory)
  const next = enterBeneficialNode(draw.random,adventureNodes[1].goal,
    { owned:inventory.owned, firstId:state.nextId, protocol:'energy-surge' })
  expect(next).toMatchObject({ owned:[draw.inventory.offer[0]], energy:8, validMoves:0, nodeScore:0,
    goal:{kind:'tile',target:64} })
  expect(next.random.states.reward).toBe(draw.random.states.reward)
  expect(slideOrdinaryNode(next,legalSlides(next.board)[0]!).accepted).toBe(true)
})
