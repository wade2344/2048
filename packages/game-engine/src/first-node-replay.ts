import { adventureNodes } from '@infinite/game-config'
import { slideOrdinaryNode, startOrdinaryNode } from './adventure'
import type { Direction } from './move'
import { createRandomSnapshot, rngAlgorithm } from './random'

const replayVersion = 'first-node-preview-v1' as const
export function startFirstNode(seed: number) {
  return startOrdinaryNode(createRandomSnapshot(seed), adventureNodes[0].goal,
    { obstacles:[], skillTiles:[], protocolTiles:[] })
}

export function firstNodeRecording(seed: number, actions: readonly Direction[]) {
  return { version:replayVersion, rng:rngAlgorithm, seed, actions:actions.map(direction => ({type:'MOVE',direction})) }
}

/** Reconstruct the state after each accepted action, without touching a live session. */
export function* replayFirstNode(input: unknown) {
  if (!input || typeof input !== 'object' || !('version' in input) || input.version !== replayVersion ||
    !('rng' in input) || input.rng !== rngAlgorithm) throw new Error('Unsupported first-node replay version')
  if (!('seed' in input) || typeof input.seed !== 'number' || !('actions' in input) ||
    !Array.isArray(input.actions)) throw new TypeError('Invalid first-node replay')
  let state = startFirstNode(input.seed)
  yield state
  for (const [index,action] of input.actions.entries()) {
    if (action?.type !== 'MOVE' || !['left','right','up','down'].includes(action.direction)) {
      throw new TypeError('Invalid action at step ' + (index+1))
    }
    const move = slideOrdinaryNode(state,action.direction)
    if (!move.accepted) throw new Error('Rejected move at step ' + (index+1))
    state = move.state
    yield state
  }
}
