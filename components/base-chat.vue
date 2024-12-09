<script setup lang="ts">
const channel = useSocketChannel()

const message = ref('')
const chats = ref<string[]>([])

onMounted(()=> {
  channel
    .on(
      'broadcast',
      { event: 'chat' },
      ({payload: {message}}) => {
        chats.value.push(message)
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

  chats.value.push(message.value)
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

    <div>
      <div v-for="chat, index in chats" :key="index">
        {{ chat }}
      </div>
    </div>
  </div>
</template>