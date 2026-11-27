import { shuffleUnlockedTiles } from './shuffle'
import { swapTargets } from './single-target'
import { legalSlides } from './classic'
import { emergencyRestart, skills } from '@infinite/game-config'
import { slideOrdinaryNode, useSingleTargetSkill, type OrdinaryNodeState, type SingleTargetAction } from './adventure'
import { slideZero, useZeroTargetSkill, type ZeroState } from './boss'
import type { Direction } from './move'
import { protocolSkillCost } from './protocol-pool'

type Node = OrdinaryNodeState | ZeroState
interface SwapAction {
  readonly type:'USE_SKILL'
  readonly skillId:'data-swap'
  readonly targets:readonly string[]
}
type EncounterAction = SwapAction | { readonly type:'MOVE'; readonly direction:Direction } | SingleTargetAction |
  { readonly type:'USE_SKILL'; readonly skillId:'state-rollback'; readonly targets:readonly string[] } |
  { readonly type:'USE_SKILL'; readonly skillId:'matrix-rebuild'; readonly targets:readonly string[] }

export interface Encounter {
  readonly node:Node
  readonly beforeMove:Node | null
  readonly actions:readonly EncounterAction[]
}

export function startEncounter(node:Node, previous?: Encounter): Encounter {
  const entered = previous?.node.emergencyRestartUsed ? { ...node, emergencyRestartUsed:true } : node
  return { node:entered, beforeMove:null, actions:[] }
}

const rebuildCost = skills.find(skill => skill.id === 'matrix-rebuild')!.baseCost
const rollbackCost = skills.find(skill => skill.id === 'state-rollback')!.baseCost

function swappableTiles(node:Node) {
  const boss = 'hp' in node
  return swapTargets({ ...node, cleared:boss ? node.hp <= 0 : node.cleared },
    { lockedTileIds:boss && node.lock ? [node.lock.tileId] : [] })
}

/** D13 equal-value pairs await a decision. Offer the established different-value pairs. */
export function legalSwapPairs(node:Node) {
  const tiles = swappableTiles(node)
  return tiles.flatMap((first,i) => tiles.slice(i+1).filter(other => first.tile.value !== other.tile.value)
    .map(other => [first.tile.id,other.tile.id] as const))
}

function swap(encounter:Encounter, action:SwapAction) {
  const rejected = { accepted:false as const, encounter }
  const [a,b] = action.targets
  if (action.targets.length !== 2 || a === b) return rejected
  const targets = swappableTiles(encounter.node)
  const first = targets.find(target => target.tile.id === a)
  const second = targets.find(target => target.tile.id === b)
  if (!first || !second) return rejected
  if (first.tile.value === second.tile.value) return { ...rejected, pendingDecision:'D13' as const }
  const board = encounter.node.board.map((line,r) => {
    if (r !== first.row && r !== second.row) return line
    return line.map((tile,c) => {
      if (r === first.row && c === first.col) return second.tile
      if (r === second.row && c === second.col) return first.tile
      return tile
    })
  })
  return { accepted:true as const, encounter:{ node:{ ...encounter.node, board, energy:encounter.node.energy-first.cost },
    beforeMove:null, actions:[...encounter.actions,action] }, events:[{ type:'TILES_SWAPPED' as const,
    first:{ id:first.tile.id, row:first.row, col:first.col }, second:{ id:second.tile.id, row:second.row, col:second.col } }] }
}

function applyAction(encounter:Encounter, action:EncounterAction) {
  const { node, beforeMove } = encounter
  const rejected = { accepted:false as const, encounter }
  if (!action || (action.type !== 'MOVE' && action.type !== 'USE_SKILL')) return rejected
  if (action.type === 'USE_SKILL' && !Array.isArray(action.targets)) return rejected
  if ('hp' in node ? node.hp <= 0 : node.cleared) return rejected
  if (action.type === 'USE_SKILL' && action.skillId === 'data-swap') return swap(encounter,action)
  if (action.type === 'USE_SKILL' && action.skillId === 'matrix-rebuild') {
    if (action.targets.length || !node.owned.includes('matrix-rebuild')) return rejected
    const cost = 'protocol' in node && node.protocol ? protocolSkillCost(node.protocol,rebuildCost) : rebuildCost
    if (node.energy < cost) return rejected
    const shuffled = shuffleUnlockedTiles(node.board,node.random,'lock' in node ? node.lock?.tileId : undefined)
    if (!shuffled.valuesChanged) return { ...rejected, pendingDecision:'D07/D13' as const }
    const after = { ...node, board:shuffled.board, random:shuffled.random, energy:node.energy-cost }
    return { accepted:true as const, encounter:{ node:after, beforeMove:null, actions:[...encounter.actions,action] },
      events:[{ type:'MATRIX_REBUILT' as const }] }
  }
  if (action.type === 'USE_SKILL' && action.skillId === 'state-rollback') {
    if (action.targets.length || !node.owned.includes('state-rollback') || !beforeMove) return rejected
    const cost = 'protocol' in node && node.protocol ? protocolSkillCost(node.protocol,rollbackCost) : rollbackCost
    if (node.energy < cost || beforeMove.energy < cost) return rejected
    return { accepted:true as const, encounter:{ node:{ ...beforeMove, energy:beforeMove.energy-cost },
      beforeMove:null, actions:[...encounter.actions,action] }, events:[{type:'STATE_RESTORED' as const}] }
  }
  const result = action.type === 'MOVE'
    ? ('hp' in node ? slideZero(node,action.direction) : slideOrdinaryNode(node,action.direction))
    : ('hp' in node ? useZeroTargetSkill(node,action) : useSingleTargetSkill(node,{lockedTileIds:[]},action))
  if (!result.accepted) return rejected
  const retain = action.type === 'MOVE' && node.owned.includes('state-rollback') &&
    !('hp' in result.state ? result.state.hp <= 0 : result.state.cleared)
  return { accepted:true as const, encounter:{ node:result.state, beforeMove:retain ? node : null,
    actions:[...encounter.actions,action] }, events:result.events }
}

/** D08 candidate: after a committed action, resolve automatic rescue before manual rescue. */
export function dispatchEncounter(encounter:Encounter, action:EncounterAction) {
  const result = applyAction(encounter,action)
  if (!result.accepted) return result
  const { node } = result.encounter
  if (node.emergencyRestartUsed || !node.owned.includes('emergency-restart') ||
    ('hp' in node ? node.hp <= 0 : node.cleared)) return result
  const lockedId = 'lock' in node ? node.lock?.tileId : undefined
  if (legalSlides(node.board,lockedId ? [lockedId] : []).length) return result
  // Stable row-major tie breaking and up-to-four removal are D05 review candidates.
  const removed = node.board.flatMap((line,row) => line.flatMap((tile,col) =>
    tile && 'value' in tile && tile.id !== lockedId ? [{tile,row,col}] : []))
    .sort((a,b) => a.tile.value-b.tile.value).slice(0,emergencyRestart.removeCount)
  if (!removed.length) return result
  const board = node.board.map(line=>[...line])
  for (const {row,col} of removed) board[row]![col] = null
  return { ...result, encounter:{ ...result.encounter, node:{ ...node,board,emergencyRestartUsed:true } },
    events:[...result.events,{ type:'EMERGENCY_RESTART' as const, removed }] }
}
