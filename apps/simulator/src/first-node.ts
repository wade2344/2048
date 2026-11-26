import { adventureNodes } from '@infinite/game-config'
import { createRandomSnapshot, drawIndex, moveBoard, slideOrdinaryNode, startOrdinaryNode,
  type AdventureBoard, type Direction } from '@infinite/game-engine'

type Agent = 'random' | 'greedy'
const directions: Direction[] = ['up','down','left','right']

/** Only pre-spawn, publicly derivable action information crosses the agent boundary. */
export function optionsForAgent(board: AdventureBoard) {
  return directions.flatMap(direction => {
    const move = moveBoard(board, direction)
    return move.changed ? [{ direction, score:move.score }] : []
  })
}

function createAgent(agent: Agent, policySeed: number) {
  let policy = createRandomSnapshot(policySeed)
  return (options: ReturnType<typeof optionsForAgent>) => {
    const highest = Math.max(...options.map(option => option.score))
    const pool = agent === 'greedy' ? options.filter(option => option.score === highest) : options
    const draw = drawIndex(policy, 'board', pool.length)
    policy = draw.snapshot
    return pool[draw.value]!.direction
  }
}

export function simulateFirstNode(seed: number, policySeed: number, agent: Agent, maxMoves: number,
  timeoutMs: number, now = () => performance.now()) {
  const deadline = now() + timeoutMs
  const actions: Direction[] = []
  let state = startOrdinaryNode(createRandomSnapshot(seed), adventureNodes[0].goal,
    { obstacles:[], skillTiles:[], protocolTiles:[] })
  const decide = createAgent(agent, policySeed)
  function finish(outcome: 'won' | 'lost' | 'operationLimit' | 'timeout' | 'invalidAction') {
    return { outcome, seed, policySeed, actions, moves:state.validMoves, score:state.nodeScore, energy:state.energy }
  }
  for (;;) {
    if (state.cleared) return finish('won')
    const choices = optionsForAgent(state.board)
    if (!choices.length) return finish('lost')
    if (actions.length >= maxMoves) return finish('operationLimit')
    if (now() >= deadline) return finish('timeout')
    const direction = decide(choices)
    actions.push(direction)
    const result = slideOrdinaryNode(state,direction)
    if (!result.accepted) return finish('invalidAction')
    state = result.state
  }
}
