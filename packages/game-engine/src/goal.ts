import type { NodeGoal } from '@infinite/game-config'

export interface NodeProgress {
  readonly largestTile: number
  readonly nodeScore: number
  readonly validMoves: number
  readonly bossHp?: number
}

export function goalReached(goal: NodeGoal, progress: NodeProgress): boolean {
  switch (goal.kind) {
    case 'tile': return progress.largestTile >= goal.target
    case 'score': return progress.nodeScore >= goal.target
    case 'moves': return progress.validMoves >= goal.target
    case 'boss': return progress.bossHp !== undefined && progress.bossHp <= 0
  }
}
