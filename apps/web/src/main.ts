import { createApp, defineComponent, h } from 'vue'
import { defaultBoard } from '@infinite/game-config'
import { createEmptyBoard } from '@infinite/game-engine'

const board = createEmptyBoard(defaultBoard)
createApp(defineComponent({
  setup() {
    return () => h('section', [h('h1', '2048: INFINITE'), h('p', `工程预览 · ${board.length} × ${defaultBoard.size} 空棋盘`)])
  },
})).mount('#app')
