<script setup lang="ts">
import { useSupabaseClient } from '~/composables/useSupabaseClient';

const supabase = useSupabaseClient()

const channelA = supabase.channel('room-1')

onMounted(()=> {
  // Subscribe to the Channel
  channelA
    .on(
      'broadcast',
      { event: 'test' },
      (payload) => {
        console.log({payload})
      }
    )

  channelA.subscribe((status) => {
    // Wait for successful connection
    if (status !== 'SUBSCRIBED') {
      return null
    }

    // Send a message once the client is subscribed
    channelA.send({
      type: 'broadcast',
      event: 'test',
      payload: { message: 'hello, world' },
    })
  })
})

const message = ref('')

function sendMessage() {
  if (message.value == null || message.value === '') {
    return false
  }

  channelA.send({
    type: 'broadcast',
    event: 'test',
    payload: { message: message.value },
  })

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
  </div>
</template>