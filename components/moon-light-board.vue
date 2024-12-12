<script setup lang="ts">
import { ref } from 'vue'

type Color = 'orange' | 'blue' | 'purple' | 'pink' | 'yellow' | 'red' | 'green' | 'brown';
type Stone = `${'B' | 'W'}_${Color}`

const BOARD: Color[][] = [
  ['orange', 'blue', 'purple', 'pink', 'yellow', 'red', 'green', 'brown'],
  ['red', 'orange', 'pink', 'green', 'blue', 'yellow', 'brown', 'purple'],
  ['green', 'pink', 'orange', 'red', 'purple', 'brown', 'yellow', 'blue'],
  ['pink', 'purple', 'blue', 'orange', 'brown', 'green', 'red', 'yellow'],
  ['yellow', 'red', 'green', 'brown', 'orange', 'blue', 'purple', 'pink'],
  ['blue', 'yellow', 'brown', 'purple', 'red', 'orange', 'pink', 'green'],
  ['purple', 'brown', 'yellow', 'blue', 'green', 'pink', 'orange', 'red'],
  ['brown', 'green', 'red', 'yellow', 'pink', 'purple', 'blue', 'orange'],
]

const INITIAL_STATE: (Stone | null)[][] = [
  ['B_orange', 'B_blue', 'B_purple', 'B_pink', 'B_yellow', 'B_red', 'B_green', 'B_brown'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['W_brown', 'W_green', 'W_red', 'W_yellow', 'W_pink', 'W_purple', 'W_blue', 'W_orange'],
]

const COLOR_MAP: Record<Color, string> = {
  orange: '#FCC737',
  blue: '#074799',
  purple: '#8B5DFF',
  pink: '#F19ED2',
  yellow: '#FCFFC1',
  red: '#F95454',
  green: '#118B50',
  brown: '#AB886D',
}

const state = ref<(Stone | null)[][]>(INITIAL_STATE.map(row => ([...row])))

type Coord = {r: number, c: number}
const selectedCoord = ref<Coord | null>(null)
const lastMovedCoord = ref<Coord | null>(null)

const channel = useSocketChannel()
onMounted(() => {
  channel
    .on(
      'broadcast',
      { event: 'move-stone' },
      ({ payload }) => {
        state.value = payload.state
        lastMovedCoord.value = payload.lastMovedCoord
      }
    )
})
</script>

<template>
  <div class="relative aspect-square w-full bg-slate-400">
    <div
      v-for="row, rIndex in BOARD"
      :key="rIndex"
      class="flex h-[12.5%] w-full"
    >
      <div
        v-for="cell, cIndex in row"
        :key="cIndex"
        :style="`background-color: ${COLOR_MAP[cell]}`"
        class="flex h-full w-[12.5%] items-center justify-center"
        @click="() => {
          if (!selectedCoord) return
          if (state[rIndex][cIndex]) return
          state[rIndex][cIndex] = state[selectedCoord.r][selectedCoord.c]
          state[selectedCoord.r][selectedCoord.c] = null
          lastMovedCoord = {
            r: rIndex,
            c: cIndex,
          }
          channel.send({
            type: 'broadcast',
            event: 'move-stone',
            payload: { state, lastMovedCoord },
          })
          selectedCoord = null
        }"
      >
        <button
          v-if="state[rIndex][cIndex]" :class="`flex items-center justify-center size-[75%] rounded-full shadow-md shadow-gray-500 focus:scale-110 focus:contrast-150`" :style="`background-color: ${state[rIndex][cIndex].split('_')[0] === 'B' ? '#222' : '#fff'}`"
          @click.stop="() => selectedCoord = {r: rIndex, c: cIndex}"
          @blue="() => selectedCoord = null"
        >
          <div class="flex size-[70%] items-center justify-center rounded-full shadow-inner shadow-gray-500" :style="`background-color: ${COLOR_MAP[state[rIndex][cIndex].split('_')[1]]}`">
            <div v-if="lastMovedCoord?.r === rIndex && lastMovedCoord?.c === cIndex" class="size-2/5 rounded-full bg-blue-500" />
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style module></style>
