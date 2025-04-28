import type { Server as NetServer } from "http"
import type { NextRequest } from "next/server"
import { Server as SocketIOServer } from "socket.io"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

// Keep track of the socket.io server instance
let io: SocketIOServer

export async function GET(req: NextRequest) {
  // @ts-ignore - NextRequest doesn't have socket property in types but it exists
  const res = req as unknown as { socket: { server: NetServer } }

  if (!res.socket) {
    return new Response("Socket initialization failed", { status: 500 })
  }

  // Check if socket.io server is already initialized
  if (!res.socket.server.io) {
    console.log("Initializing Socket.io server...")

    // Create a new socket.io server with simplified configuration
    io = new SocketIOServer(res.socket.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      // Simplified transport configuration
      transports: ["polling", "websocket"],
    })

    // Store the socket.io server instance
    res.socket.server.io = io

    // Set up socket event handlers
    io.on("connection", (socket) => {
      console.log(`User connected: ${socket.id}`)

      // Handle joining a room
      socket.on("join-room", ({ roomId, name }) => {
        console.log(`User ${socket.id} (${name}) joining room: ${roomId}`)

        // Leave any previous rooms
        Array.from(socket.rooms).forEach((room) => {
          if (room !== socket.id) {
            socket.leave(room)
          }
        })

        // Join the new room
        socket.join(roomId)

        // Store user data
        socket.data.name = name
        socket.data.roomId = roomId

        try {
          // Get all users in the room except the current user
          const roomUsers = io.sockets.adapter.rooms.get(roomId)
          const users = roomUsers
            ? Array.from(roomUsers)
                .filter((id) => id !== socket.id)
                .map((id) => {
                  const userSocket = io.sockets.sockets.get(id)
                  return {
                    peerId: id,
                    name: userSocket?.data?.name || "Anonymous",
                  }
                })
            : []

          console.log(`Room ${roomId} has ${users.length + 1} users`)

          // Send existing users to the new user
          socket.emit("all-users", users)

          // Notify other users that someone joined
          socket.to(roomId).emit("user-joined", {
            peerId: socket.id,
            name,
          })
        } catch (error) {
          console.error("Error in join-room handler:", error)
          socket.emit("error", { message: "Failed to join room" })
        }
      })

      // Handle sending signal
      socket.on("sending-signal", ({ userToSignal, callerId, signal, name }) => {
        try {
          console.log(`User ${callerId} sending signal to ${userToSignal}`)
          io.to(userToSignal).emit("receiving-signal", {
            signal,
            from: callerId,
            name,
          })
        } catch (error) {
          console.error("Error in sending-signal handler:", error)
        }
      })

      // Handle returning signal
      socket.on("returning-signal", ({ signal, callerId }) => {
        try {
          console.log(`User ${socket.id} returning signal to ${callerId}`)
          io.to(callerId).emit("receiving-returned-signal", {
            signal,
            from: socket.id,
          })
        } catch (error) {
          console.error("Error in returning-signal handler:", error)
        }
      })

      // Handle disconnection
      socket.on("disconnect", () => {
        try {
          console.log(`User disconnected: ${socket.id}`)
          const roomId = socket.data?.roomId

          if (roomId) {
            console.log(`Notifying room ${roomId} that user ${socket.id} disconnected`)
            socket.to(roomId).emit("user-disconnected", socket.id)
          }
        } catch (error) {
          console.error("Error in disconnect handler:", error)
        }
      })
    })
  } else {
    console.log("Socket.io server already running")
  }

  return new Response("Socket.io server is running", {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new Response("", {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
