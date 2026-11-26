import { defineComponent, h, onBeforeUnmount, ref, shallowRef } from 'vue'
import { replayFirstNode, type OrdinaryNodeState } from '@infinite/game-engine'

export const ReplayPlayer = defineComponent({
  emits:['close'],
  setup(_, { emit }) {
    const frames = shallowRef<OrdinaryNodeState[]>([])
    const step = ref(0), speed = ref(1), playing = ref(false), error = ref('')
    let timer: ReturnType<typeof setInterval> | undefined
    let request = 0
    function pause() {
      clearInterval(timer)
      playing.value = false
    }
    function play() {
      pause()
      if (step.value >= frames.value.length - 1) return
      playing.value = true
      timer = setInterval(() => {
        step.value++
        if (step.value >= frames.value.length - 1) pause()
      }, 600 / speed.value)
    }
    function seek(index: number) {
      pause()
      step.value = index
    }
    async function load(event: Event) {
      const input = event.target as HTMLInputElement
      const file = input.files?.[0]
      if (!file) return
      const token = ++request
      input.value = ''
      pause()
      error.value = ''
      try {
        const data = await file.text()
        if (token !== request) return
        const next = [...replayFirstNode(JSON.parse(data))]
        frames.value = next
        step.value = 0
      } catch (cause) {
        if (token === request) error.value = '无法导入回放 · ' + (cause instanceof Error ? cause.message : String(cause))
      }
    }
    onBeforeUnmount(() => { request++; pause() })
    return () => {
      const current = frames.value[step.value]
      const last = frames.value.length - 1
      const action = (name: string, click: () => void, disabled = false) => h('button', { onClick:click, disabled },name)
      return h('section',{class:'console'},[
        h('header',[h('h1','首关回放'),action('返回对局',()=>emit('close'))]),
        h('label',{class:'replay-file'},['导入回放 JSON',h('input',{type:'file',accept:'.json,application/json',onChange:load})]),
        error.value && h('p',{role:'alert'},error.value),
        current && h('div',[
          h('p',{role:'status'},'第 ' + step.value + ' / ' + last + ' 步 · 分数 ' + current.nodeScore + ' · EP ' + current.energy),
          h('div',{class:'board','aria-label':'回放棋盘'},current.board.flat().map((cell,i)=>{
            const value = cell && 'value' in cell ? cell.value : 0
            return h('div',{key:i,class:'cell','data-value':value},value || '')
          })),
          h('input',{class:'replay-range',type:'range',min:0,max:last,value:step.value,'aria-label':'回放进度',
            onInput:(e:Event)=>seek(Number((e.target as HTMLInputElement).value))}),
          h('div',{class:'replay-controls'},[
            action('首步',()=>seek(0),step.value===0), action('上一步',()=>seek(step.value-1),step.value===0),
            action(playing.value?'暂停':'播放',()=>playing.value?pause():play(),step.value===last),
            action('下一步',()=>seek(step.value+1),step.value===last),action('末步',()=>seek(last),step.value===last),
            h('select',{'aria-label':'播放速度',value:speed.value,onChange:(e:Event)=>{
              speed.value=Number((e.target as HTMLSelectElement).value)
              if (playing.value) play()
            }},[0.5,1,2,4].map(value=>h('option',{value},value+'×'))),
          ]),
        ]),
      ])
    }
  },
})
