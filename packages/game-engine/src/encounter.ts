import { skills } from '@infinite/game-config'
import { slideOrdinaryNode, useSingleTargetSkill, type OrdinaryNodeState, type SingleTargetAction } from './adventure'
import { slideZero, useZeroTargetSkill, type ZeroState } from './boss'
import type { Direction } from './move'
import { protocolSkillCost } from './protocol-pool'

type Node = OrdinaryNodeState | ZeroState
type EncounterAction = { readonly type:'MOVE'; readonly direction:Direction } | SingleTargetAction |
  { readonly type:'USE_SKILL'; readonly skillId:'state-rollback'; readonly targets:readonly string[] }

export interface Encounter {
  readonly node:Node
  readonly beforeMove:Node | null
  readonly actions:readonly EncounterAction[]
}

export function startEncounter(node:Node): Encounter {
  return { node, beforeMove:null, actions:[] }
}

const rollbackCost = skills.find(skill => skill.id === 'state-rollback')!.baseCost

export function dispatchEncounter(encounter:Encounter, action:EncounterAction) {
  const { node, beforeMove } = encounter
  const rejected = { accepted:false as const, encounter }
  if (!action || (action.type !== 'MOVE' && action.type !== 'USE_SKILL')) return rejected
  if (action.type === 'USE_SKILL' && !Array.isArray(action.targets)) return rejected
  if ('hp' in node ? node.hp <= 0 : node.cleared) return rejected
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
