import { io } from "socket.io-client"

let socket: any

export const initializeSocket = () => {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER || window.location.origin

    console.log(`Initializing socket connection to: ${socketUrl}`)

    // Simplified connection configuration
    socket = io(socketUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      transports: ["polling", "websocket"], // Start with polling, then upgrade to websocket
    })

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id)
    })

    socket.on("connect_error", (err: any) => {
      console.error("Socket connection error:", err.message)
    })

    socket.on("error", (err: any) => {
      console.error("Socket error:", err)
    })
  }

  return socket
}

export const getSocket = () => {
  if (!socket) {
    return initializeSocket()
  }
  return socket
}
