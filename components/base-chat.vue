<script setup lang="ts">
const channel = useSocketChannel()

const message = ref('')
const chats = ref<{type: 'me' | 'other', text: string}[]>([])

onMounted(()=> {
  channel
    .on(
      'broadcast',
      { event: 'chat' },
      ({payload: {message}}) => {
        chats.value.push({type: 'other', text: message})
      }
    )
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

  chats.value.push({type: 'me', text: message.value})
  message.value = '';
}

const reversedChats = computed(() => chats.value.toReversed())

</script>

<template>
  <div class="mt-1 w-full flex flex-col flex-1 text-sm overflow-auto">
    <div class="flex flex-col-reverse flex-1 gap-2 p-2 h-28 overflow-auto border rounded-sm">
      <div v-for="chat, index in reversedChats" :key="index" :class="`px-2 py-0.5 rounded bg-slate-100 ${chat.type === 'me' ? 'ml-auto' : 'mr-auto bg-yellow-100'}`">
        {{ chat.text }}
      </div>
    </div>
    <form class="flex" @submit.prevent="sendMessage">
      <input v-model="message" class="border flex-1 px-1 py-0.5">
      <button type="submit" class="px-1 border">Send</button>
    </form>
  </div>
</template>