<script setup lang="ts">
import { ref } from 'vue'

type Color = 'black' | 'white'
type CellStateType = 'black' | 'white' | 'blocker'
type CellState = {
  type: CellStateType,
  order: number,
} | null
type BoardState = (CellState)[][]

const INITIAL_STATE: BoardState = [
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, {type: 'blocker', order: -1}, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
]

const boardState = computed<BoardState>(() => {
  return history.value.reduce((state, [r, c, color], index) => {
    state[r][c] = {
      type: color,
      order: index + 1
    }
    return state
  }, INITIAL_STATE.map(row => ([...row])))
})

const stone = ref<Color>('black')
const singleMode = ref(false)
const history = ref<Array<[number, number, Color]>>([])

function handleClick(r: number, c: number) {
  history.value.push([r, c, stone.value])
  if (singleMode.value) {
    stone.value = stone.value === 'black' ? 'white' : 'black'
  }
  sendHistory()
}

function handleBack() {
  history.value.pop()
  sendHistory()
}

function sendHistory() {
  channel.send({
    type: 'broadcast',
    event: 'change-history',
    payload: { history: history.value },
  })
}

const channel = useSocketChannel()
onMounted(() => {
  channel
    .on(
      'broadcast',
      { event: 'change-history' },
      ({ payload }) => {
        history.value = payload.history
      }
    )
})
</script>

<template>
  <div class="w-full">
    GreatKindom
    <div :class="$style.board">
      <div v-for="row, r in boardState" :key="r" :class="$style.row">
        <button v-for="col, c in row" :key="c" :class="$style.cell" :disabled="boardState[r][c] !== null" @click="() => handleClick(r, c)">
          <div v-if="boardState[r][c]?.type === 'blocker'" class="size-[80%] bg-red-500" />
          <div v-else-if="boardState[r][c]?.type === 'black'" :class="[$style.stone, $style.black]">
            {{ boardState[r][c].order }}
          </div>
          <div v-else-if="boardState[r][c]?.type === 'white'" :class="[$style.stone, $style.white]">
            {{ boardState[r][c].order }}
          </div>
        </button>
      </div>
    </div>
    <div :class="$style.controls">
      <label>
        <input type="radio" name="stone" value="black" :checked="stone === 'black'" :disabled="singleMode" @click="() => stone = 'black'">
        <span>흑</span>
      </label>
      <label>
        <input type="radio" name="stone" value="white" :checked="stone === 'white'" :disabled="singleMode" @click="() => stone = 'white'">
        <span>백</span>
      </label>
      <label>
        <input v-model="singleMode" type="checkbox">
        <span>1인모드</span>
      </label>
      <button :class="$style.back" @click="handleBack">뒤로</button>
    </div>
  </div>
</template>

<style module>
  .board {
    @apply relative w-full aspect-square bg-stone-700 grid p-1 gap-1;

    grid-template-columns: repeat(9, 1fr);
    grid-template-rows: repeat(9, 1fr);

    .row {
      @apply grid grid-cols-subgrid;
      grid-column: 1 / -1;
      
      .cell {
        @apply relative aspect-square bg-stone-300 flex justify-center items-center;

        .stone {
          @apply relative shadow-md rounded-full flex items-center justify-center text-xs font-bold;

          width: 80%;
          height: 80%;

          &::after {
            content: '';
            @apply absolute inset-0 shadow-inner rounded-full;
          }

          &.black {
            @apply bg-stone-800 text-stone-100;

            &::after {
              @apply shadow-gray-300;
            }
          }
          
          &.white {
            @apply bg-stone-50 text-stone-800;

            &::after {
              @apply shadow-gray-500;
            }
          }
        }
      }
    }
  }

  .controls {
    @apply flex gap-1 p-1 items-center;

    > label {
      @apply flex gap-0.5 items-center;
    }

    .back {
      @apply ml-auto rounded bg-slate-600 p-1 py-0.5 text-white;
    }
  }
</style>
