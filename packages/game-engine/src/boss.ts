import { mergeRewards } from './merge-rewards'
import { resolveSingleTarget, singleTargetIds, type SingleTargetSkill, type SingleTargetAction } from './single-target'
import { skills, spawnTuning, zeroConfig, type SkillId } from '@infinite/game-config'
import { startLevelEnergy } from './energy'
import { enterLevel, spawnOrdinaryTile } from './generation'
import { moveBoard, type AdventureBoard, type Direction } from './move'
import { legalSlides } from './classic'
import { drawIndex, type RandomSnapshot } from './random'

export interface ZeroState {
  readonly warning: readonly [row: number, col: number] | null
  readonly lock: { readonly tileId: string; readonly remainingMoves: number } | null
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
  return { warning: null, lock: null, hp: zeroConfig.maxHp, owned: [...owned], board: opening.board, random: opening.random,
    nextId: opening.nextId, energy: startLevelEnergy(), nodeScore: 0, validMoves: 0 }
}

/** Resolve through damage and ordinary generation. GRID LOCK follows a surviving turn. */
export function slideZero(state: ZeroState, direction: Direction) {
  if (state.hp <= 0 || !['left','right','up','down'].includes(direction)) return { accepted: false as const, state }
  const move = moveBoard(state.board, direction, state.lock ? [state.lock.tileId] : [])
  if (!move.changed) return { accepted: false as const, state }
  const { bonusScore, energy } = mergeRewards(move, state.energy, state.owned)
  const damage = move.score + bonusScore
  const hp = Math.max(0, state.hp - damage)
  const after: ZeroState = { ...state, hp, board: move.board, energy,
    nodeScore: state.nodeScore + damage, validMoves: state.validMoves + 1 }
  const damageEvents = damage ? [{ type:'BOSS_DAMAGED' as const, before:state.hp, after:hp, damage }] : []
  const events = [...move.events, ...damageEvents]
  if (!hp) return { accepted:true as const, state:after, events }
  const next = spawnOrdinaryTile(after, state.owned.includes('advanced-spawn'))
  const lock = state.lock && state.lock.remainingMoves > 1
    ? { ...state.lock, remainingMoves:state.lock.remainingMoves - 1 } : null
  return { accepted:true as const, state:{ ...after, lock, board:next.board, nextId:next.nextId, random:next.random },
    events:[...events, { type:'TILE_SPAWNED' as const, ...next.spawned }] }
}

/** The encounter clock invokes these stages when its timing policy requests them. */
export function warnGridLock(state: ZeroState): ZeroState {
  if (state.hp <= 0 || state.warning) return state
  const draw = drawIndex(state.random, 'boss', 16)
  return { ...state, warning:[Math.floor(draw.value / 4), draw.value % 4], random:draw.snapshot }
}

export function resolveGridLock(state: ZeroState): ZeroState {
  if (state.hp <= 0 || !state.warning) return state
  const [row, col] = state.warning
  const cell = state.board[row]?.[col]
  const resolved = { ...state, warning:null }
  if (!cell || 'kind' in cell || state.lock) return resolved
  if (legalSlides(state.board).length && !legalSlides(state.board, [cell.id]).length) return resolved
  return { ...resolved, lock:{ tileId:cell.id, remainingMoves:zeroConfig.lockDuration } }
}

function zeroTargeting(state: ZeroState) {
  return { lockedTileIds:state.lock ? [state.lock.tileId] : [] }
}

export function legalZeroTargets(state: ZeroState, skill: SingleTargetSkill) {
  return singleTargetIds({ ...state, cleared:state.hp <= 0 }, zeroTargeting(state), skill)
}

export function useZeroTargetSkill(state: ZeroState, action: SingleTargetAction) {
  const result = resolveSingleTarget({ ...state, cleared:state.hp <= 0 }, zeroTargeting(state), action)
  if (!result.accepted) return { accepted:false as const, state }
  return { accepted:true as const, state:{ ...state, board:result.board, energy:result.energy }, events:result.events }
}
