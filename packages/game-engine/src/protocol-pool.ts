import { adventureNodes, defaultEnergy, protocolGroups, skills, type ProtocolId, type SkillId } from '@infinite/game-config'

/** Apply category restrictions before compatibility checks or random selection. */
export function allowedNodeProtocols(nodeId: number): ProtocolId[] {
  const node = adventureNodes.find(entry => entry.id === nodeId)
  if (!node) throw new RangeError('Unknown adventure node')
  return node.protocolCategories.flatMap(category => Object.keys(protocolGroups[category]) as ProtocolId[])
}

/** Separate compatible candidates by history; choosing a fallback is a rules decision. */
export function partitionProtocolPool(nodeId: number, seen: readonly ProtocolId[],
  compatible: (id: ProtocolId) => boolean) {
  const unused: ProtocolId[] = []
  const repeated: ProtocolId[] = []
  for (const id of allowedNodeProtocols(nodeId)) {
    if (compatible(id)) (seen.includes(id) ? repeated : unused).push(id)
  }
  return { unused, repeated }
}

export function protocolCapacity(id: ProtocolId) {
  switch (id) {
    case 'capacity-boost': return protocolGroups.beneficial[id].capacity
    case 'low-power': return protocolGroups.restrictive[id].capacity
    case 'energy-compression': return protocolGroups.mixed[id].capacity
    default: return defaultEnergy.capacity
  }
}

export function protocolSkillCost(id: ProtocolId, baseCost: number) {
  switch (id) {
    case 'command-tax': return baseCost + protocolGroups.restrictive[id].costOffset
    case 'extreme-overload': return baseCost + protocolGroups.mixed[id].costOffset
    case 'energy-compression': {
      const rule = protocolGroups.mixed[id]
      return Math.max(rule.minimumCost, baseCost + rule.costOffset)
    }
    default: return baseCost
  }
}

/** Baseline active costs only; other future cost modifiers require a resolved ruleset. */
export function affordableNodeProtocols(nodeId: number, owned: readonly SkillId[], seen: readonly ProtocolId[],
  relevant: (id: ProtocolId) => boolean) {
  const active = skills.filter(entry => entry.kind === 'active' && owned.includes(entry.id))
  return partitionProtocolPool(nodeId, seen, id => relevant(id) &&
    active.every(skill => protocolSkillCost(id, skill.baseCost) <= protocolCapacity(id)))
}
