import { describe, expect, it, vi } from 'vitest'
import { energyAfterSlide, moveBoard, startLevelEnergy, useSkillEnergy } from './index'

function slide(values: number[]) {
  const row = values.map((value, i) => value ? { id: String(i), value } : null)
  return moveBoard([row, ...Array.from({ length: 3 }, () => [null, null, null, null])], 'left').events
}

describe('shared EP', () => {
  it.each([
    [[0, 2, 4, 0], 4], [[2, 2, 4, 0], 5], [[64, 64, 2, 2], 6],
  ] as const)('settles ordinary slide %j', (values, expected) => {
    expect(energyAfterSlide(startLevelEnergy(), slide([...values]))).toBe(expected)
  })
  it('discards overflow and resets on entering another level', () => {
    expect(energyAfterSlide(9, slide([2, 2, 4, 4]))).toBe(10)
    expect(startLevelEnergy()).toBe(4)
  })
  it('applies effective values supplied for this level', () => {
    const rules = { initial: 1, capacity: 7, perMerge: 2 }
    expect(energyAfterSlide(startLevelEnergy(rules), slide([2, 2, 4, 4]), rules)).toBe(5)
  })
  it('rejects unaffordable skills before evaluating their effects', () => {
    const effect = vi.fn()
    expect(useSkillEnergy(3, 4, effect)).toEqual({ accepted: false, energy: 3 })
    expect(effect).not.toHaveBeenCalled()
  })
  it('charges exactly once on success and retains EP on invalid targets', () => {
    const resolve = vi.fn(() => 'cleared')
    expect(useSkillEnergy(4, 4, resolve)).toEqual({ accepted: true, energy: 0, effect: 'cleared' })
    expect(resolve).toHaveBeenCalledTimes(1)
    expect(useSkillEnergy(4, 4, () => null)).toEqual({ accepted: false, energy: 4 })
  })
  it('rejects malformed balances and costs', () => {
    expect(() => energyAfterSlide(11, [])).toThrow(RangeError)
    expect(() => useSkillEnergy(4, -1, () => true)).toThrow(RangeError)
    expect(() => startLevelEnergy({ initial: NaN, capacity: 10, perMerge: 1 })).toThrow(RangeError)
  })
})
