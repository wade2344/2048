import type { AdventureBoard } from './move'
import { drawIndex, type RandomSnapshot } from './random'

/** D07/D16 candidate: row-major eligible tiles and descending Fisher–Yates. */
export function shuffleUnlockedTiles(board: AdventureBoard, random: RandomSnapshot, lockedId?: string) {
  const eligible = board.flatMap((row,r) => row.flatMap((tile,c) =>
    tile && 'value' in tile && tile.id !== lockedId ? [{tile,r,c}] : []))
  const shuffled = eligible.map(entry => entry.tile)
  let nextRandom = random
  for (let i = shuffled.length - 1; i > 0; i--) {
    const draw = drawIndex(nextRandom,'board',i+1)
    nextRandom = draw.snapshot
    const other = shuffled[draw.value]!
    shuffled[draw.value] = shuffled[i]!
    shuffled[i] = other
  }
  const next = board.map(row => [...row])
  let valuesChanged = false
  for (const [i,{r,c,tile}] of eligible.entries()) {
    const replacement = shuffled[i]!
    next[r]![c] = replacement
    if (replacement.value !== tile.value) valuesChanged = true
  }
  return { board:next, random:nextRandom, valuesChanged }
}
