import { mergeRewards, type MergeCounters } from './merge-rewards'
import { shuffleUnlockedTiles } from './shuffle'
import { resolveSingleTarget, singleTargetIds, type TargetingContext, type SingleTargetSkill, type SingleTargetAction } from './single-target'
export type { TargetingContext, SingleTargetSkill, SingleTargetAction } from './single-target'
import { beneficialProtocols, type BeneficialProtocol, type ProtocolId, protocolGroups, defaultEnergy, spawnTuning, type SkillId, type EnergyRules, type NodeGoal } from '@infinite/game-config'
import { startLevelEnergy } from './energy'
import { enterLevel, spawnFixedTile, spawnOrdinaryTile, type Opening } from './generation'
import { goalReached } from './goal'
import { moveBoard, type AdventureBoard, type Direction } from './move'
import { drawIndex, type RandomSnapshot } from './random'
import { protocolCapacity } from './protocol-pool'

type OrdinaryGoal = Exclude<NodeGoal, { kind: 'boss' }>

export interface OrdinaryNodeState {
  readonly protocol: ProtocolId | null
  readonly owned: readonly SkillId[]
  readonly goal: OrdinaryGoal
  readonly board: AdventureBoard
  readonly nextId: number
  readonly random: RandomSnapshot
  readonly energyRules: EnergyRules
  readonly energy: number
  readonly mergeCounters?: MergeCounters
  readonly nodeScore: number
  readonly validMoves: number
  readonly cleared: boolean
}

function completed(goal: OrdinaryGoal, board: AdventureBoard, nodeScore: number, validMoves: number) {
  let largestTile = 0
  for (const row of board) {
    for (const cell of row) {
      if (cell && 'value' in cell) largestTile = Math.max(largestTile, cell.value)
    }
  }
  return goalReached(goal, { largestTile, nodeScore, validMoves })
}

export function startOrdinaryNode(random: RandomSnapshot, goal: OrdinaryGoal, opening: Opening,
  energyRules: EnergyRules = defaultEnergy, firstId = 1, owned: readonly SkillId[] = []): OrdinaryNodeState {
  const bonuses = owned.includes('preload-energy')
    ? { ...opening, skillTiles: [...opening.skillTiles, spawnTuning.preloadValue] } : opening
  const { board, nextId, random: afterOpening, cleared } = enterLevel(random, bonuses,
    board => completed(goal, board, 0, 0), firstId, owned.includes('advanced-spawn'))
  return { protocol: null, owned: [...owned], goal, board, nextId, random: afterOpening, cleared, energyRules,
    energy: startLevelEnergy(energyRules), nodeScore: 0, validMoves: 0 }
}

/** Enter with the already selected protocol; selection and its RNG belong to preparation. */
export function enterBeneficialNode(random: RandomSnapshot, goal: OrdinaryGoal, options: {
  readonly protocol: BeneficialProtocol
  readonly firstId: number
  readonly owned: readonly SkillId[]
}): OrdinaryNodeState {
  return enterProtocolNode(random, goal, options)
}

export function enterProtocolNode(random: RandomSnapshot, goal: OrdinaryGoal, options: {
  readonly protocol: ProtocolId
  readonly firstId: number
  readonly owned: readonly SkillId[]
}): OrdinaryNodeState {
  const { protocol, firstId, owned } = options
  const rules = { ...defaultEnergy, capacity: protocolCapacity(protocol) }
  const protocolTiles: number[] = []
  const obstacles: [number, number][] = []
  switch (protocol) {
    case 'energy-surge': rules.initial = beneficialProtocols[protocol].initialEnergy; break
    case 'advanced-cache': protocolTiles.push(beneficialProtocols[protocol].openingTile); break
    case 'unstable-matrix': protocolTiles.push(...protocolGroups.mixed[protocol].openingTiles); break
    case 'extreme-overload': rules.perMerge = protocolGroups.mixed[protocol].perMerge; break
    case 'fast-spawn':
      if (owned.includes('advanced-spawn')) throw new RangeError('D06: unresolved fast-spawn and advanced-spawn combination')
      break
    case 'data-corruption': {
      const position = drawIndex(random, 'board', 16)
      obstacles.push([Math.floor(position.value / 4), position.value % 4])
      random = position.snapshot
      break
    }
    case 'low-power': case 'capacity-boost': case 'command-tax': case 'periodic-error':
    case 'energy-compression': case 'turbo-mode': break
    default: throw new RangeError('Unknown or unsupported protocol')
  }
  const opening = { obstacles, skillTiles: [], protocolTiles }
  return { ...startOrdinaryNode(random, goal, opening, rules, firstId, owned), protocol }
}

export function slideOrdinaryNode(state: OrdinaryNodeState, direction: Direction) {
  if (state.cleared || !['left', 'right', 'up', 'down'].includes(direction)) {
    return { accepted: false as const, state }
  }
  const move = moveBoard(state.board, direction)
  if (!move.changed) return { accepted: false as const, state }
  const mergeScore = state.protocol === 'turbo-mode'
    ? move.score * beneficialProtocols['turbo-mode'].scoreMultiplier : move.score
  const rewards = mergeRewards(move,state.energy,state.owned,state.energyRules,state.mergeCounters)
  // D03/D05 review candidate: turbo and parallel each use the unmodified merge score.
  const nodeScore = state.nodeScore + mergeScore + rewards.bonusScore
  const validMoves = state.validMoves + 1
  let energy = rewards.energy
  const slid = { ...state, board:move.board }
  const fast = state.protocol === 'fast-spawn' ? protocolGroups.mixed['fast-spawn'] : null
  let next = fast ? spawnFixedTile(slid,fast.ordinaryValue) : spawnOrdinaryTile(slid,state.owned.includes('advanced-spawn'))
  type TurnEvent = typeof move.events[number] | ({type:'TILE_SPAWNED'} & typeof next.spawned)
    | {type:'PROTOCOL_SHUFFLED'; valuesChanged:boolean}
  const events:TurnEvent[] = [...move.events, { type:'TILE_SPAWNED', ...next.spawned }]
  const cleared = completed(state.goal, next.board, nodeScore, validMoves)
  if (!cleared && state.protocol === 'periodic-error') {
    const rule = protocolGroups.restrictive[state.protocol]
    if (validMoves % rule.interval === 0) energy = Math.max(0, energy - rule.energyLoss)
  }
  if (fast && !cleared && validMoves % fast.interval === 0 && next.board.some(row => row.includes(null))) {
    next = spawnFixedTile(next,fast.extraValue)
    events.push({ type:'TILE_SPAWNED', ...next.spawned })
  }
  const updated: OrdinaryNodeState = { ...state, ...(rewards.counters && {mergeCounters:rewards.counters}), board: next.board, nextId: next.nextId,
    random: next.random, nodeScore, validMoves, energy, cleared }
  if (!cleared && state.protocol === 'unstable-matrix' && validMoves % protocolGroups.mixed['unstable-matrix'].interval === 0) {
    // D07 candidate: an environmental shuffle commits one draw sequence even if values match.
    const shuffle = shuffleUnlockedTiles(updated.board,updated.random)
    events.push({type:'PROTOCOL_SHUFFLED',valuesChanged:shuffle.valuesChanged})
    return { accepted:true as const, state:{ ...updated, board:shuffle.board, random:shuffle.random }, events }
  }
  return { accepted: true as const, state: updated, events }
}

export function legalSingleTargets(state: OrdinaryNodeState, context: TargetingContext, skill: SingleTargetSkill) {
  return singleTargetIds(state, context, skill)
}

export function useSingleTargetSkill(state: OrdinaryNodeState, context: TargetingContext, action: SingleTargetAction) {
  const result = resolveSingleTarget(state, context, action)
  if (!result.accepted) return { accepted:false as const, state }
  const { board, energy, events } = result
  return { accepted:true as const, state:{ ...state, board, energy,
    cleared:completed(state.goal, board, state.nodeScore, state.validMoves) }, events }
}
