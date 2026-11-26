// Candidate for D16. Keep this identifier in every saved RNG snapshot.
export const rngAlgorithm = 'mulberry32-streams-v1' as const
const salts = { board: 0, reward: 0x9e3779b9, protocol: 0x3c6ef372, boss: 0xdaa66d2b }
type Stream = keyof typeof salts
export interface RandomSnapshot {
  readonly algorithm: typeof rngAlgorithm
  readonly states: Readonly<Record<Stream, number>>
}

function uint32(value: number) {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) {
    throw new RangeError('Expected an unsigned 32-bit integer')
  }
  return value
}

export function createRandomSnapshot(seed: number): RandomSnapshot {
  uint32(seed)
  const initial = (stream: Stream) => (seed + salts[stream]) >>> 0
  return { algorithm: rngAlgorithm, states: {
    board: initial('board'), reward: initial('reward'), protocol: initial('protocol'), boss: initial('boss'),
  } }
}

export function restoreRandomSnapshot(input: unknown): RandomSnapshot {
  if (!input || typeof input !== 'object' || !('algorithm' in input) ||
      input.algorithm !== rngAlgorithm || !('states' in input) || !input.states ||
      typeof input.states !== 'object') throw new TypeError('Invalid RNG snapshot')
  const states = input.states as Record<Stream, number>
  return { algorithm: rngAlgorithm, states: {
    board: uint32(states.board), reward: uint32(states.reward),
    protocol: uint32(states.protocol), boss: uint32(states.boss),
  } }
}

export function drawUint32(snapshot: RandomSnapshot, stream: Stream) {
  const state = (snapshot.states[stream] + 0x6d2b79f5) >>> 0
  let mixed = Math.imul(state ^ (state >>> 15), state | 1)
  mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)
  const value = (mixed ^ (mixed >>> 14)) >>> 0
  return { value, snapshot: { algorithm: rngAlgorithm, states: { ...snapshot.states, [stream]: state } } }
}

/** Uniform index using rejection sampling over unsigned 32-bit output. */
export function drawIndex(snapshot: RandomSnapshot, stream: Stream, count: number) {
  if (!Number.isInteger(count) || count < 1 || count > 2 ** 32) throw new RangeError('Invalid index count')
  const limit = 2 ** 32 - (2 ** 32 % count)
  let current = snapshot
  for (;;) {
    const draw = drawUint32(current, stream)
    if (draw.value < limit) return { value: draw.value % count, snapshot: draw.snapshot }
    current = draw.snapshot
  }
}
