import { parseArgs } from 'node:util'
import { simulateFirstNode } from './first-node'

const { values } = parseArgs({ options:{
  agent:{ type:'string', default:'random' }, runs:{ type:'string', default:'100' },
  seed:{ type:'string', default:'0' }, 'policy-seed':{ type:'string', default:'314159' },
  'max-moves':{ type:'string', default:'1000' }, 'timeout-ms':{ type:'string', default:'5000' },
} })
function integer(name: keyof typeof values, min: number) {
  const raw = values[name] ?? ''
  const value = Number(raw)
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(value) || value < min || value > 0xffffffff) {
    throw new RangeError('Invalid --' + name)
  }
  return value
}
const agent = values.agent
if (agent !== 'random' && agent !== 'greedy') throw new RangeError('Expected random or greedy agent')
const runs = integer('runs',1), seed = integer('seed',0), policySeed = integer('policy-seed',0)
const maxMoves = integer('max-moves',0), timeoutMs = integer('timeout-ms',1)
const counts = { won:0, lost:0, operationLimit:0, timeout:0, invalidAction:0, crash:0 }
const reproductions = []
let totalMoves = 0
for (let index = 0; index < runs; index++) {
  const gameSeed = (seed + index) >>> 0, botSeed = (policySeed + index) >>> 0
  try {
    const result = simulateFirstNode(gameSeed,botSeed,agent,maxMoves,timeoutMs)
    counts[result.outcome]++
    totalMoves += result.moves
    if (result.outcome !== 'won' && result.outcome !== 'lost') reproductions.push(result)
  } catch (error) {
    counts.crash++
    reproductions.push({ seed:gameSeed, policySeed:botSeed, error:String(error) })
  }
}
const completed = counts.won + counts.lost
console.log(JSON.stringify({ experiment:{ node:1, agent, strategyVersion:1, seed, policySeed, runs, maxMoves, timeoutMs },
  counts, completed, completedWinRate:completed ? counts.won / completed : null, totalMoves, reproductions }))
if (counts.crash || counts.invalidAction) process.exitCode = 1
