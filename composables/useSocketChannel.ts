const CHANNEL_ID = 'CHANNEL'
export const useSocketChannel = () => {
  const supabase = useSupabaseClient()
  const channel = supabase.channel(CHANNEL_ID).subscribe()

  return channel
}