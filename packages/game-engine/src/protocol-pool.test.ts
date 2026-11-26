import { expect, test } from 'vitest'
import { affordableNodeProtocols, allowedNodeProtocols, partitionProtocolPool, protocolCapacity, protocolSkillCost } from './index'

const benefits = ['energy-surge','capacity-boost','advanced-cache','turbo-mode']
const restrictions = ['low-power','command-tax','data-corruption','periodic-error']
const mixed = ['extreme-overload','fast-spawn','unstable-matrix','energy-compression']

test.each([[1,[]],[2,benefits],[3,[...benefits,...restrictions,...mixed]],
  [4,[...restrictions,...mixed]],[5,[...restrictions,...mixed]],[6,[]]] as const)(
  'node %d uses only its allowed protocol classes', (id, expected) => {
    expect(new Set(allowedNodeProtocols(id))).toEqual(new Set(expected))
    expect(allowedNodeProtocols(id)).toHaveLength(expected.length)
  })

test('historical candidates stay separate and incompatible candidates stay excluded', () => {
  const pool = partitionProtocolPool(2, ['energy-surge','turbo-mode'], id => id !== 'turbo-mode')
  expect(pool).toEqual({ unused:['capacity-boost','advanced-cache'], repeated:['energy-surge'] })
  expect(partitionProtocolPool(2, ['energy-surge'], id => id === 'energy-surge')).toEqual({
    unused:[], repeated:['energy-surge'],
  })
  expect(partitionProtocolPool(3, [], () => false)).toEqual({ unused:[], repeated:[] })
})

test('unknown node IDs fail explicitly', () => {
  expect(() => allowedNodeProtocols(0)).toThrow(RangeError)
})

test('single-protocol cost modifiers and capacity use the catalog baselines', () => {
  expect(protocolSkillCost('energy-compression', 1)).toBe(1)
  expect(protocolSkillCost('energy-compression', 6)).toBe(5)
  expect(protocolSkillCost('command-tax', 6)).toBe(7)
  expect(protocolSkillCost('extreme-overload', 6)).toBe(8)
  expect(protocolCapacity('low-power')).toBe(6)
  expect(protocolCapacity('capacity-boost')).toBe(15)
  const pool = affordableNodeProtocols(3, ['targeted-overclock','preload-energy'], ['low-power'],
    id => id !== 'turbo-mode')
  expect(pool.repeated).toEqual(['low-power'])
  expect(pool.unused).not.toContain('turbo-mode')
})
