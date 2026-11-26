import { expect, test } from 'vitest'
import { skills, type SkillId } from '@infinite/game-config'
import { takeReward, validOffer } from './index'

const mixed = ['data-clear','advanced-spawn','data-swap'] as const
test('the catalog has four families and all five active base costs', () => {
  expect(new Set(skills.map(s => s.id)).size).toBe(12)
  expect(new Set(skills.map(s => s.family)).size).toBe(4)
  expect(Object.fromEntries(skills.filter(s => s.kind === 'active').map(s => [s.id,s.baseCost]))).toEqual({
    'targeted-overclock':6,'data-clear':3,'data-swap':3,'matrix-rebuild':4,'state-rollback':3,
  })
})
test('offers require three distinct unowned catalog entries', () => {
  expect(validOffer(skills, [], mixed, true)).toBe(true)
  for (const invalid of [mixed.slice(1),[...mixed,'state-rollback'],[mixed[0],mixed[0],mixed[2]],['invalid',mixed[1],mixed[2]]]) {
    expect(validOffer(skills, [], invalid as SkillId[], false)).toBe(false)
  }
  expect(validOffer(skills, ['data-clear'], mixed, false)).toBe(false)
})
test('type diversity can be required independently of the sampling policy', () => {
  const passive = ['advanced-spawn','preload-energy','energy-recycle'] as const
  expect(validOffer(skills, [], passive, true)).toBe(false)
  expect(validOffer(skills, [], passive, false)).toBe(true)
})
test('selecting one offer consumes the choice, including after JSON round-trip', () => {
  const inventory = Object.freeze({owned:Object.freeze([]),offer:Object.freeze(mixed)})
  expect(takeReward(inventory,'state-rollback')).toBe(inventory)
  const next = takeReward(JSON.parse(JSON.stringify(inventory)), 'data-swap')
  expect(next).toEqual({owned:['data-swap'],offer:[]})
  expect(takeReward(next,'advanced-spawn')).toBe(next)
  expect(inventory.owned).toEqual([])
})
