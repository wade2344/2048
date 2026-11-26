import { expect, test } from 'vitest'
import { firstNodeRecording, replayFirstNode, startFirstNode, slideOrdinaryNode, type Direction } from './index'

test('exported successful commands reproduce every full first-node state through victory', () => {
  const seed = 781
  let state = startFirstNode(seed)
  const states = [state], accepted: Direction[] = []
  const pattern = ['left','down','right','down','left','up'] as const
  for (let i = 0; i < 200 && !state.cleared; i++) {
    const direction = pattern[i%pattern.length]!
    const move = slideOrdinaryNode(state,direction)
    if (!move.accepted) continue
    state = move.state
    accepted.push(direction)
    states.push(state)
  }
  expect(state.cleared).toBe(true)
  const recording = JSON.parse(JSON.stringify(firstNodeRecording(seed,accepted)))
  expect([...replayFirstNode(recording)]).toEqual(states)
  recording.actions.push({type:'MOVE',direction:'down'})
  expect(() => [...replayFirstNode(recording)]).toThrow('step ' + (accepted.length+1))
})
test('validates versions, seed and action including its one-based index', () => {
  const input = firstNodeRecording(781,[])
  expect(() => [...replayFirstNode({...input, version:'future'})]).toThrow(/version/)
  expect(() => [...replayFirstNode({...input, seed:-1})]).toThrow()
  expect(() => [...replayFirstNode({...input, actions:[null]})]).toThrow('step 1')
})
