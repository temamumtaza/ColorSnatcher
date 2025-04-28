"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Video } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if there's a room ID in the URL (from a shared link)
  const sharedRoomId = searchParams.get("room")

  const [name, setName] = useState("")
  const [roomId, setRoomId] = useState(sharedRoomId || "")

  // Update roomId if searchParams changes
  useEffect(() => {
    if (sharedRoomId) {
      setRoomId(sharedRoomId)
    }
  }, [sharedRoomId])

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      // Use the entered room ID or generate a random one if empty
      const finalRoomId = roomId.trim() || `room-${Math.random().toString(36).substring(2, 7)}`
      router.push(`/room/${finalRoomId}?name=${encodeURIComponent(name)}`)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Video className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Majlas : anti ghibah video call</CardTitle>
          <CardDescription>Enter your details to join the video call</CardDescription>
        </CardHeader>
        <form onSubmit={handleJoin}>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Your Name
                </label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="roomId" className="text-sm font-medium">
                  Room ID
                </label>
                <Input
                  id="roomId"
                  placeholder="Enter room ID or leave empty for random room"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                />
                {sharedRoomId && <p className="text-xs text-green-600">You're joining a shared room: {sharedRoomId}</p>}
                {!sharedRoomId && (
                  <p className="text-xs text-muted-foreground">
                    Enter a specific room ID to join an existing room, or leave empty to create a new room.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              {sharedRoomId ? "Join Shared Room" : "Join Call"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
