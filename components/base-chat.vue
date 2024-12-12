<script setup lang="ts">
const channel = useSocketChannel()

const message = ref('')
const chats = ref<{ type: 'me' | 'other'; text: string }[]>([])

onMounted(() => {
  channel.on('broadcast', { event: 'chat' }, ({ payload: { message } }) => {
    chats.value.push({ type: 'other', text: message })
  })
})

function sendMessage() {
  if (message.value == null || message.value === '') {
    return false
  }

  channel.send({
    type: 'broadcast',
    event: 'chat',
    payload: { message: message.value },
  })

  chats.value.push({ type: 'me', text: message.value })
  message.value = ''
}

const reversedChats = computed(() => chats.value.toReversed())
</script>

<template>
  <div class="mt-1 flex w-full flex-1 flex-col overflow-auto text-sm">
    <div
      class="flex h-28 flex-1 flex-col-reverse gap-2 overflow-auto rounded-sm border p-2"
    >
      <div
        v-for="(chat, index) in reversedChats"
        :key="index"
        :class="`rounded bg-slate-100 px-2 py-0.5 ${chat.type === 'me' ? 'ml-auto' : 'mr-auto bg-yellow-100'}`"
      >
        {{ chat.text }}
      </div>
    </div>
    <form class="flex" @submit.prevent="sendMessage">
      <input v-model="message" class="flex-1 border px-1 py-0.5" />
      <button type="submit" class="border px-1">Send</button>
    </form>
  </div>
</template>
