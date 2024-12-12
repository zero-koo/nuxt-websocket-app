<script setup lang="ts">
import { ref } from 'vue'

type Color = 'black' | 'white'
type CellState = {
  type: Color,
  order: number,
} | {
  type: 'blocker',
} | {
  type: 'occupied',
  color: Color,
} | null
type BoardState = (CellState)[][]

const SIZE = 9;
const INITIAL_STATE: BoardState = [
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, {type: 'blocker'}, null, null, null, null],
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

const evaluatedBoard = computed(() => evaluateOccupied(boardState.value)!)
const countOccupied = computed<Record<Color, number>>(() => {
  const count: Record<Color, number> = {
    black: 0,
    white: 0
  }

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++ ) {
      const cell = evaluatedBoard.value[r][c]
      if (cell?.type === 'occupied') {
        count[cell.color]++
      }
    }
  }
  return count
})

function evaluateOccupied(board: BoardState) {
  const evaluated = board.map(row => [...row])
  const visited = board.map(row => row.map(col => !!col))

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (visited[r][c]) continue

      const result = search(r, c, board)
      if (!result) continue

      const { nodes, color } = result
      nodes.forEach(([r, c]) => {
        evaluated[r][c] = {
          type: 'occupied',
          color,  
        }
      })
    }
  }
  return evaluated
  
  function search(r: number, c: number, board: BoardState) {
    const queue: Array<[number, number]> = [[r, c]]

    const adjacentWalls = new Set<'T' | 'B' | 'L' | 'R'>()
    const adjacentStones = new Set<'black' | 'white'>()

    const nodes: Array<[number, number]> = [[r, c]]
    while (queue.length) {
      const node = queue.shift()!
      nodes.push(node)

      const [r, c] = node

      visited[r][c] = true

      if (r - 1 >= 0) {
        if (board[r - 1][c]?.type === 'black') {
          adjacentStones.add('black')
        }
        if (board[r - 1][c]?.type === 'white') {
          adjacentStones.add('white')
        }
        if (!visited[r - 1][c]) {
          queue.push([r - 1, c])
        } 
      } else {
        adjacentWalls.add('T')
      }
      
      if (r + 1 < SIZE) {
        if (board[r + 1][c]?.type === 'black') {
          adjacentStones.add('black')
        }
        if (board[r + 1][c]?.type === 'white') {
          adjacentStones.add('white')
        }
        if (!visited[r + 1][c]) {
          queue.push([r + 1, c])
        } 
      } else {
        adjacentWalls.add('B')
      }

      if (c - 1 >= 0) {
        if (board[r][c - 1]?.type === 'black') {
          adjacentStones.add('black')
        }
        if (board[r][c - 1]?.type === 'white') {
          adjacentStones.add('white')
        }
        if (!visited[r][c - 1]) {
          queue.push([r, c - 1])
        }
      } else {
        adjacentWalls.add('L')
      }

      if (c + 1 < SIZE) {
        if (board[r][c + 1]?.type === 'black') {
          adjacentStones.add('black')
        }
        if (board[r][c + 1]?.type === 'white') {
          adjacentStones.add('white')
        }
        if (!visited[r][c + 1]) {
          queue.push([r, c + 1])
        }
      } else {
        adjacentWalls.add('R')
      }
    }

    if (adjacentWalls.size < 4 && adjacentStones.size === 1) {
      return {
        nodes,
        color: Array.from(adjacentStones)[0]
      }
    }

  }


}
</script>

<template>
  <div class="w-full">
    GreatKindom
    <div :class="$style.board">
      <div v-for="row, r in evaluatedBoard" :key="r" :class="$style.row">
        <button v-for="col, c in row" :key="c" :class="$style.cell" :disabled="evaluatedBoard[r][c] !== null" @click="() => handleClick(r, c)">
          <div v-if="evaluatedBoard[r][c]?.type === 'blocker'" class="size-4/5 bg-red-500" />
          <div v-else-if="evaluatedBoard[r][c]?.type === 'black'" :class="[$style.stone, $style.black]">
            {{ evaluatedBoard[r][c].order }}
          </div>
          <div v-else-if="evaluatedBoard[r][c]?.type === 'white'" :class="[$style.stone, $style.white]">
            {{ evaluatedBoard[r][c].order }}
          </div>
          <div v-else-if="evaluatedBoard[r][c]?.type === 'occupied'" :style="`color: ${evaluatedBoard[r][c].color}`">
            x
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
      <div>
        <span>흑</span>
        <span>{{ countOccupied.black }}</span>
      </div>
      <div>
        <span>백</span>
        <span>{{ countOccupied.white }}</span>
      </div>
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
