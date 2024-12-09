<script setup lang="ts">
const channel = useSocketChannel()

const message = ref('')
const chats = ref<{type: 'me' | 'other', text: string}[]>([{type: 'other', text: '쉽쉬'}])

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

</script>

<template>
  <div class="mt-2">
    채팅
    <form @submit.prevent="sendMessage">
      <input v-model="message" class="border">
      <button type="submit">Send</button>
    </form>

    <div class="flex flex-col gap-2 py-2">
      <div v-for="chat, index in chats" :key="index" :class="`px-2 py-0.5 rounded bg-slate-100 ${chat.type === 'me' ? 'ml-auto' : 'mr-auto bg-yellow-100'}`">
        {{ chat.text }}
      </div>
    </div>
  </div>
</template>