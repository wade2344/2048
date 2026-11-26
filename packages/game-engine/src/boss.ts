import { defaultEnergy, parallelCompute, skills, spawnTuning, zeroConfig, type SkillId } from '@infinite/game-config'
import { energyAfterSlide, startLevelEnergy } from './energy'
import { enterLevel, spawnOrdinaryTile } from './generation'
import { moveBoard, type AdventureBoard, type Direction } from './move'
import type { RandomSnapshot } from './random'

export interface ZeroState {
  readonly hp: number
  readonly owned: readonly SkillId[]
  readonly board: AdventureBoard
  readonly random: RandomSnapshot
  readonly nextId: number
  readonly energy: number
  readonly nodeScore: number
  readonly validMoves: number
}

export function startZero(random: RandomSnapshot, firstId: number, owned: readonly SkillId[]): ZeroState {
  if (owned.length !== zeroConfig.inheritedSkillCount || new Set(owned).size !== owned.length ||
    owned.some(id => !skills.some(skill => skill.id === id))) throw new RangeError('Expected five distinct acquired skills')
  const skillTiles = owned.includes('preload-energy') ? [spawnTuning.preloadValue] : []
  const opening = enterLevel(random, { obstacles: [], skillTiles, protocolTiles: [] },
    () => false, firstId, owned.includes('advanced-spawn'))
  return { hp: zeroConfig.maxHp, owned: [...owned], board: opening.board, random: opening.random,
    nextId: opening.nextId, energy: startLevelEnergy(), nodeScore: 0, validMoves: 0 }
}

/** Resolve through damage and ordinary generation. GRID LOCK follows a surviving turn. */
export function slideZero(state: ZeroState, direction: Direction) {
  if (state.hp <= 0 || !['left','right','up','down'].includes(direction)) return { accepted: false as const, state }
  const move = moveBoard(state.board, direction)
  if (!move.changed) return { accepted: false as const, state }
  const pairs = move.events.filter(event => event.type === 'TILE_MERGED').length
  const parallel = state.owned.includes('parallel-compute') && pairs >= parallelCompute.minimumPairs
  const damage = move.score + (parallel ? move.score * parallelCompute.scoreFraction : 0)
  const energy = Math.min(defaultEnergy.capacity, energyAfterSlide(state.energy, move.events) +
    (parallel ? parallelCompute.extraEnergy : 0))
  const hp = Math.max(0, state.hp - damage)
  const after: ZeroState = { ...state, hp, board: move.board, energy,
    nodeScore: state.nodeScore + damage, validMoves: state.validMoves + 1 }
  const damageEvents = damage ? [{ type:'BOSS_DAMAGED' as const, before:state.hp, after:hp, damage }] : []
  const events = [...move.events, ...damageEvents]
  if (!hp) return { accepted:true as const, state:after, events }
  const next = spawnOrdinaryTile(after, state.owned.includes('advanced-spawn'))
  return { accepted:true as const, state:{ ...after, board:next.board, nextId:next.nextId, random:next.random },
    events:[...events, { type:'TILE_SPAWNED' as const, ...next.spawned }] }
}
