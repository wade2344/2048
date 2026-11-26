import { expect, test } from 'vitest'
import { createRandomSnapshot, drawIndex, drawUint32, restoreRandomSnapshot } from './index'

test('seed zero board stream matches the Mulberry32 reference sequence', () => {
  let state = createRandomSnapshot(0)
  for (const expected of [1144304738, 1416247, 958946056]) {
    const next = drawUint32(state, 'board')
    expect(next.value).toBe(expected)
    state = next.snapshot
  }
})

test('each draw advances only its chosen stream and leaves the input unchanged', () => {
  const start = createRandomSnapshot(42)
  Object.freeze(start.states)
  for (const stream of ['board','reward','protocol','boss'] as const) {
    const next = drawUint32(start, stream)
    for (const other of ['board','reward','protocol','boss'] as const) {
      if (other !== stream) expect(drawUint32(next.snapshot, other).value).toBe(drawUint32(start, other).value)
    }
    expect(next.snapshot.states[stream]).not.toBe(start.states[stream])
  }
})

test('a serialized checkpoint reproduces subsequent draws across streams', () => {
  let original = drawUint32(createRandomSnapshot(0xffffffff), 'protocol').snapshot
  let restored = restoreRandomSnapshot(JSON.parse(JSON.stringify(original)))
  for (const stream of ['reward','board','boss','protocol'] as const) {
    const expected = drawIndex(original, stream, 13)
    const actual = drawIndex(restored, stream, 13)
    expect(actual).toEqual(expected)
    original = expected.snapshot
    restored = actual.snapshot
  }
})

test('bounded sampling discards the biased tail and advances past rejected draws', () => {
  const start = createRandomSnapshot(1)
  const first = drawUint32(start, 'board')
  const second = drawUint32(first.snapshot, 'board')
  const count = 2 ** 31 + 1
  expect(first.value).toBeGreaterThanOrEqual(count)
  expect(second.value).toBeLessThan(count)
  expect(drawIndex(start, 'board', count)).toEqual(second)
})

test('invalid seeds, incompatible or partial snapshots and empty selections are rejected', () => {
  for (const seed of [-1, NaN, 1.5, 2 ** 32]) expect(() => createRandomSnapshot(seed)).toThrow()
  const valid = createRandomSnapshot(1)
  for (const input of [null, {...valid, algorithm: 'other'}, {...valid, states: {board: 0}}]) {
    expect(() => restoreRandomSnapshot(input)).toThrow()
  }
  expect(() => drawIndex(valid, 'board', 0)).toThrow()
})
