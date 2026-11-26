export type NodeGoal =
  | { readonly kind: 'tile' | 'score' | 'moves'; readonly target: number }
  | { readonly kind: 'boss' }

export interface AdventureNode {
  readonly id: number
  readonly name: string
  readonly goal: NodeGoal
}

export const adventureNodes = [
  {id: 1, name: '核心启动', goal: {kind: 'tile', target: 32}},
  {id: 2, name: '能量聚合', goal: {kind: 'tile', target: 64}},
  {id: 3, name: '过载运算', goal: {kind: 'score', target: 300}},
  {id: 4, name: '稳定性测试', goal: {kind: 'moves', target: 40}},
  {id: 5, name: '极限超频', goal: {kind: 'tile', target: 256}},
  {id: 6, name: '终极协议', goal: {kind: 'boss'}},
] as const satisfies readonly AdventureNode[]
