<script setup lang="ts">
const { data, send } = useSocket()

const message = ref('')
const history = ref<string[]>([])

watch(data, (receiveMsg) => {
  history.value.push(`server: ${receiveMsg}`)
})

function sendMessage() {
  if (message.value == null || message.value === '') {
    return false
  }

  history.value.push(`client : ${message.value}`)
  send(message.value);
  message.value = '';
}

</script>

<template>
  <div>
    <h1>WebSocket - let's go</h1>
    <form @submit.prevent="sendMessage">
      <input v-model="message">
      <button type="submit">Send</button>
    </form>
    <div>
      <p v-for="entry, index in history" :key="index">{{ entry }}</p>
    </div>
  </div>
</template>