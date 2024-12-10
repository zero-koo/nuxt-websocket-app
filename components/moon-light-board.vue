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
        console.log('?????', payload)
        state.value = payload.state
        lastMovedCoord.value = payload.lastMovedCoord
      }
    )
})
</script>

<template>
  <div class="relative w-screen max-w-96 aspect-square bg-slate-400">
    <div
      v-for="row, rIndex in BOARD"
      :key="rIndex"
      class="flex w-full h-[12.5%]"
    >
      <div
        v-for="cell, cIndex in row"
        :key="cIndex"
        :style="`background-color: ${cell}`"
        :class="`w-[12.5%] h-full flex justify-center items-center`"
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
          v-if="state[rIndex][cIndex]" :class="`flex items-center justify-center size-[80%] rounded-full shadow-xl focus:scale-110`" :style="`background-color: ${state[rIndex][cIndex].split('_')[0] === 'B' ? 'black' : 'white'}`"
          @click.stop="() => selectedCoord = {r: rIndex, c: cIndex}"
          @blue="() => selectedCoord = null"
        >
          <div class="flex items-center justify-center size-[70%] rounded-full" :style="`background-color: ${state[rIndex][cIndex].split('_')[1]}`">
            <div v-if="lastMovedCoord?.r === rIndex && lastMovedCoord?.c === cIndex" class="size-[50%] rounded-full bg-blue-500" />
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style module></style>
