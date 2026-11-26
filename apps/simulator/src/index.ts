import { defaultBoard } from '@infinite/game-config'
import { createEmptyBoard } from '@infinite/game-engine'

console.log(JSON.stringify({ board: createEmptyBoard(defaultBoard) }))
