import { firstNodeRecording, replayFirstNode, type Direction, type OrdinaryNodeState } from '@infinite/game-engine'

export const firstNodeSlot = '2048-infinite:first-node-save'
const schema = 'first-node-save-preview-v1'

export function encodeFirstNodeSave(state: OrdinaryNodeState, seed: number, moves: readonly Direction[]) {
  return JSON.stringify({ schema, recording:firstNodeRecording(seed,moves), state })
}

export function decodeFirstNodeSave(raw: string) {
  const data = JSON.parse(raw)
  if (data?.schema !== schema) throw new Error('首关存档版本不兼容')
  let state: OrdinaryNodeState | undefined
  for (const frame of replayFirstNode(data.recording)) state = frame
  if (!state || JSON.stringify(state) !== JSON.stringify(data.state)) throw new Error('首关状态与操作记录不一致')
  return { state, seed:data.recording.seed as number,
    moves:data.recording.actions.map((action: {direction:Direction}) => action.direction) as Direction[] }
}
