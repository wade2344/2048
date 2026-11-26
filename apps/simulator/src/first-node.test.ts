import { expect, test } from 'vitest'
import { optionsForAgent, simulateFirstNode } from './first-node'

test('bot receives only legal directions and their public pre-spawn merge scores', () => {
  const board = [[{id:'a',value:2},{id:'b',value:2},null,null],...Array.from({length:3},()=>[null,null,null,null])]
  expect(optionsForAgent(board)).toEqual([{direction:'down',score:0},{direction:'left',score:4},{direction:'right',score:4}])
})
test.each(['random','greedy'] as const)('%s reproduces the complete trajectory', agent => {
  const run = () => simulateFirstNode(781,42,agent,500,5000,()=>0)
  const result = run()
  expect(result).toEqual(run())
  expect(['won','lost']).toContain(result.outcome)
  expect(result.actions.length).toBe(result.moves)
})
test('operation and time guards are distinct from game losses', () => {
  expect(simulateFirstNode(1,2,'random',0,5000).outcome).toBe('operationLimit')
  let time = 0
  expect(simulateFirstNode(1,2,'random',100,1,()=>time++).outcome).toBe('timeout')
})
