"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import Peer from "simple-peer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, MicOff, VideoIcon, VideoOff, PhoneOff, Share2, Copy, AlertCircle, RefreshCw } from "lucide-react"
import { initializeSocket } from "@/lib/socket-init"

type PeerType = {
  peerId: string
  peer: Peer.Instance
  name: string
}

export default function Room({ params }: { params: { roomId: string } }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const userName = searchParams.get("name") || "Anonymous"
  const roomId = params.roomId

  const [peers, setPeers] = useState<PeerType[]>([])
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [linkCopied, setLinkCopied] = useState(false)
  const [roomIdCopied, setRoomIdCopied] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error">("connecting")
  const [errorMessage, setErrorMessage] = useState("")
  const [isReconnecting, setIsReconnecting] = useState(false)

  const socketRef = useRef<any>(null)
  const userVideoRef = useRef<HTMLVideoElement>(null)
  const peersRef = useRef<PeerType[]>([])

  const setupConnection = () => {
    setConnectionStatus("connecting")
    setIsReconnecting(true)

    // Clean up any existing connections
    if (socketRef.current) {
      socketRef.current.disconnect()
    }

    peersRef.current.forEach((p) => {
      try {
        p.peer.destroy()
      } catch (e) {
        console.error("Error destroying peer:", e)
      }
    })

    peersRef.current = []
    setPeers([])

    // Initialize socket connection
    try {
      socketRef.current = initializeSocket()

      // Handle connection status
      socketRef.current.on("connect", () => {
        setConnectionStatus("connected")
        setIsReconnecting(false)
        console.log("Connected to socket server with ID:", socketRef.current.id)

        // Join room if we have media
        if (stream) {
          joinRoom(stream)
        }
      })

      socketRef.current.on("connect_error", (err: any) => {
        console.error("Socket connection error:", err)
        setConnectionStatus("error")
        setIsReconnecting(false)
        setErrorMessage(`Connection error: ${err.message}. Please try again.`)
      })
    } catch (err: any) {
      console.error("Socket initialization error:", err)
      setConnectionStatus("error")
      setIsReconnecting(false)
      setErrorMessage(`Failed to initialize connection: ${err.message}`)
    }
  }

  useEffect(() => {
    // Get user media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream)
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = mediaStream
        }

        // Setup connection after we have media
        setupConnection()
      })
      .catch((err) => {
        console.error("Error accessing media devices:", err)
        setConnectionStatus("error")
        setErrorMessage("Please allow camera and microphone access to use this app")
      })

    return () => {
      // Clean up
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop()
        })
      }

      // Clean up peers
      peersRef.current.forEach((peer) => {
        try {
          peer.peer.destroy()
        } catch (err) {
          console.error("Error destroying peer:", err)
        }
      })

      // Remove socket listeners and disconnect
      if (socketRef.current) {
        socketRef.current.off("user-joined")
        socketRef.current.off("receiving-signal")
        socketRef.current.off("user-disconnected")
        socketRef.current.off("all-users")
        socketRef.current.off("receiving-returned-signal")
        socketRef.current.off("connect")
        socketRef.current.off("connect_error")
        socketRef.current.disconnect()
      }
    }
  }, [])

  const joinRoom = (stream: MediaStream) => {
    console.log(`Joining room ${roomId} as ${userName}`)
    socketRef.current.emit("join-room", { roomId, name: userName })

    // Handle new user joining
    socketRef.current.on("user-joined", ({ peerId, name }: { peerId: string; name: string }) => {
      console.log("New user joined:", peerId, name)
      try {
        const peer = createPeer(peerId, socketRef.current.id, stream)
        peersRef.current.push({
          peerId,
          peer,
          name,
        })

        setPeers((users) => [...users, { peerId, peer, name }])
      } catch (err) {
        console.error("Error creating peer for new user:", err)
      }
    })

    // Handle receiving signal
    socketRef.current.on(
      "receiving-signal",
      ({ signal, from, name }: { signal: Peer.SignalData; from: string; name: string }) => {
        console.log("Received signal from:", from)
        try {
          const existingPeer = peersRef.current.find((p) => p.peerId === from)

          if (existingPeer) {
            existingPeer.peer.signal(signal)
          } else {
            const peer = addPeer(signal, from, stream)
            peersRef.current.push({
              peerId: from,
              peer,
              name: name || "Anonymous",
            })

            setPeers((users) => [...users, { peerId: from, peer, name: name || "Anonymous" }])
          }
        } catch (err) {
          console.error("Error handling received signal:", err)
        }
      },
    )

    // Handle user disconnect
    socketRef.current.on("user-disconnected", (peerId: string) => {
      console.log("User disconnected:", peerId)
      try {
        const peerObj = peersRef.current.find((p) => p.peerId === peerId)
        if (peerObj) {
          peerObj.peer.destroy()
        }

        const peers = peersRef.current.filter((p) => p.peerId !== peerId)
        peersRef.current = peers
        setPeers(peers)
      } catch (err) {
        console.error("Error handling user disconnect:", err)
      }
    })

    // Handle existing users in room
    socketRef.current.on("all-users", (users: Array<{ peerId: string; name: string }>) => {
      console.log("All users in room:", users)
      try {
        users.forEach(({ peerId, name }) => {
          const peer = createPeer(peerId, socketRef.current.id, stream)
          peersRef.current.push({
            peerId,
            peer,
            name,
          })
        })

        setPeers(peersRef.current)
      } catch (err) {
        console.error("Error handling existing users:", err)
      }
    })

    // Handle receiving returned signal
    socketRef.current.on("receiving-returned-signal", ({ signal, from }: { signal: Peer.SignalData; from: string }) => {
      console.log("Received returned signal from:", from)
      try {
        const item = peersRef.current.find((p) => p.peerId === from)
        if (item) {
          item.peer.signal(signal)
        }
      } catch (err) {
        console.error("Error handling returned signal:", err)
      }
    })
  }

  function createPeer(userToSignal: string, callerId: string, stream: MediaStream) {
    try {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
        config: {
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:global.stun.twilio.com:3478" }],
        },
      })

      peer.on("signal", (signal) => {
        socketRef.current.emit("sending-signal", { userToSignal, callerId, signal, name: userName })
      })

      peer.on("error", (err) => {
        console.error("Peer error:", err)
      })

      return peer
    } catch (err) {
      console.error("Error creating peer:", err)
      throw err
    }
  }

  function addPeer(incomingSignal: Peer.SignalData, callerId: string, stream: MediaStream) {
    try {
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
        config: {
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:global.stun.twilio.com:3478" }],
        },
      })

      peer.on("signal", (signal) => {
        socketRef.current.emit("returning-signal", { signal, callerId })
      })

      peer.on("error", (err) => {
        console.error("Peer error:", err)
      })

      peer.signal(incomingSignal)

      return peer
    } catch (err) {
      console.error("Error adding peer:", err)
      throw err
    }
  }

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !audioEnabled
      })
      setAudioEnabled(!audioEnabled)
    }
  }

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !videoEnabled
      })
      setVideoEnabled(!videoEnabled)
    }
  }

  const leaveCall = () => {
    router.push("/")
  }

  const shareRoomLink = () => {
    // Create a shareable link that includes the room ID but allows the recipient to enter their own name
    const url = `${window.location.origin}/?room=${roomId}`
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    })
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setRoomIdCopied(true)
      setTimeout(() => setRoomIdCopied(false), 2000)
    })
  }

  // Show error state
  if (connectionStatus === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <div className="mb-4 rounded-full bg-red-100 p-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="mb-2 text-xl font-semibold">Connection Error</h1>
        <p className="mb-4 text-center text-muted-foreground">{errorMessage}</p>
        <div className="flex gap-4">
          <Button onClick={() => setupConnection()} disabled={isReconnecting}>
            {isReconnecting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Reconnecting...
              </>
            ) : (
              "Try Again"
            )}
          </Button>
          <Button variant="outline" onClick={() => router.push("/")}>
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  // Show loading state
  if (connectionStatus === "connecting") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-center text-muted-foreground">
          {isReconnecting ? "Reconnecting to room..." : "Connecting to room..."}
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 p-4">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Majlas</h1>
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-md">
            <span className="text-sm font-medium">Room: {roomId}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyRoomId}>
              <Copy className="h-3.5 w-3.5" />
              <span className="sr-only">Copy room ID</span>
            </Button>
            {roomIdCopied && <span className="text-xs text-green-600">Copied!</span>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={shareRoomLink} className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            {linkCopied ? "Link copied!" : "Share room"}
          </Button>
          <div className="text-sm text-muted-foreground">You: {userName}</div>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Your video */}
        <Card className="relative overflow-hidden">
          <div className="absolute bottom-2 left-2 z-10 rounded bg-black/50 px-2 py-1 text-xs text-white">
            You ({userName})
          </div>
          <video ref={userVideoRef} muted autoPlay playsInline className="h-full w-full object-cover" />
        </Card>

        {/* Peer videos */}
        {peers.map((peer) => (
          <PeerVideo key={peer.peerId} peer={peer.peer} name={peer.name} />
        ))}

        {/* Empty state when no peers */}
        {peers.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-4">
              <Share2 className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium">No one else is here</h3>
            <p className="mt-2 text-sm text-muted-foreground">Share the room link to invite others to join your call</p>
            <Button onClick={shareRoomLink} className="mt-4">
              Share room link
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center space-x-4">
        <Button
          variant={audioEnabled ? "outline" : "destructive"}
          size="icon"
          onClick={toggleAudio}
          className="h-12 w-12 rounded-full"
        >
          {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        <Button
          variant={videoEnabled ? "outline" : "destructive"}
          size="icon"
          onClick={toggleVideo}
          className="h-12 w-12 rounded-full"
        >
          {videoEnabled ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>

        <Button variant="outline" size="icon" onClick={shareRoomLink} className="h-12 w-12 rounded-full relative">
          <Share2 className="h-5 w-5" />
          {linkCopied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white whitespace-nowrap">
              Link copied!
            </span>
          )}
        </Button>

        <Button variant="destructive" size="icon" onClick={leaveCall} className="h-12 w-12 rounded-full">
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

interface PeerVideoProps {
  peer: Peer.Instance
  name: string
}

const PeerVideo = ({ peer, name }: PeerVideoProps) => {
  const ref = useRef<HTMLVideoElement>(null)
  const [videoActive, setVideoActive] = useState(false)

  useEffect(() => {
    peer.on("stream", (stream) => {
      console.log("Received stream from peer")
      if (ref.current) {
        ref.current.srcObject = stream
        setVideoActive(true)
      }
    })

    peer.on("error", (err) => {
      console.error("Peer video error:", err)
    })

    return () => {
      if (ref.current && ref.current.srcObject) {
        const stream = ref.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [peer])

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute bottom-2 left-2 z-10 rounded bg-black/50 px-2 py-1 text-xs text-white">{name}</div>
      {!videoActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
          <div className="h-16 w-16 rounded-full bg-slate-300 flex items-center justify-center">
            <span className="text-xl font-medium text-slate-600">{name.charAt(0).toUpperCase()}</span>
          </div>
        </div>
      )}
      <video ref={ref} autoPlay playsInline className="h-full w-full object-cover" />
    </Card>
  )
}
