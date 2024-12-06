const localUrl = `${process.env.NODE_ENV === 'production' ? 'wss' : 'ws'}://${location.host}/api/websocket`;

export const useSocket = () => useWebSocket(localUrl)