import { resolveSingleTarget, singleTargetIds, type TargetingContext, type SingleTargetSkill, type SingleTargetAction } from './single-target'
export type { TargetingContext, SingleTargetSkill, SingleTargetAction } from './single-target'
import { beneficialProtocols, type BeneficialProtocol, protocolGroups, defaultEnergy, spawnTuning, type SkillId, type EnergyRules, type NodeGoal } from '@infinite/game-config'
import { energyAfterSlide, startLevelEnergy } from './energy'
import { enterLevel, spawnOrdinaryTile, type Opening } from './generation'
import { goalReached } from './goal'
import { moveBoard, type AdventureBoard, type Direction } from './move'
import { drawIndex, type RandomSnapshot } from './random'
import { protocolCapacity } from './protocol-pool'

type OrdinaryGoal = Exclude<NodeGoal, { kind: 'boss' }>

type SupportedProtocol = BeneficialProtocol | keyof typeof protocolGroups.restrictive | 'extreme-overload' | 'energy-compression'

export interface OrdinaryNodeState {
  readonly protocol: SupportedProtocol | null
  readonly owned: readonly SkillId[]
  readonly goal: OrdinaryGoal
  readonly board: AdventureBoard
  readonly nextId: number
  readonly random: RandomSnapshot
  readonly energyRules: EnergyRules
  readonly energy: number
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
  readonly protocol: SupportedProtocol
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
    case 'extreme-overload': rules.perMerge = protocolGroups.mixed[protocol].perMerge; break
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
  const nodeScore = state.nodeScore + mergeScore
  const validMoves = state.validMoves + 1
  let energy = energyAfterSlide(state.energy, move.events, state.energyRules)
  const next = spawnOrdinaryTile({ ...state, board: move.board }, state.owned.includes('advanced-spawn'))
  const cleared = completed(state.goal, next.board, nodeScore, validMoves)
  if (!cleared && state.protocol === 'periodic-error') {
    const rule = protocolGroups.restrictive[state.protocol]
    if (validMoves % rule.interval === 0) energy = Math.max(0, energy - rule.energyLoss)
  }
  const updated: OrdinaryNodeState = { ...state, board: next.board, nextId: next.nextId,
    random: next.random, nodeScore, validMoves, energy, cleared }
  return { accepted: true as const, state: updated,
    events: [...move.events, { type: 'TILE_SPAWNED' as const, ...next.spawned }] }
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
