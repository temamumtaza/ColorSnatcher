"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2, Send } from "lucide-react"
import InvoiceViewer from "./invoice-viewer"
import { useCompanyStore } from "@/lib/stores/company-store"
import { useInvoiceStore } from "@/lib/stores/invoice-store"
import { generateInvoiceFromText } from "@/lib/ai-service"

type Message = {
  role: "user" | "assistant"
  content: string
}

type InvoiceData = {
  client: string
  items: {
    name: string
    quantity: number
    unit: string
    unit_price: number
  }[]
  date?: string
  invoiceNumber?: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        'Halo! Saya akan membantu Anda membuat invoice. Silakan berikan instruksi seperti: "buat invoice untuk PT XYZ, 50 sak semen @40rb, dan 2 truk pasir @2,1jt"',
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { activeCompany } = useCompanyStore()
  const { addInvoice } = useInvoiceStore()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage = { role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Generate invoice data using AI
      const { invoiceData, rawResponse } = await generateInvoiceFromText(input)

      // Add assistant message - hide JSON response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "✅ Invoice berhasil dibuat! Silakan lihat hasilnya di panel sebelah kanan.",
        },
      ])

      // Set current invoice
      if (invoiceData) {
        // Add date and invoice number
        const now = new Date()
        const invoiceWithMeta = {
          ...invoiceData,
          date: now.toISOString().split("T")[0],
          invoiceNumber: `INV-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${Math.floor(
            Math.random() * 1000,
          )
            .toString()
            .padStart(3, "0")}`,
        }

        setCurrentInvoice(invoiceWithMeta)
      }
    } catch (error) {
      console.error("Error generating invoice:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="flex flex-col h-[calc(100vh-250px)]">
        <Card className="flex-1 p-4 overflow-y-auto mb-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis perintah invoice..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>

      <div className="h-[calc(100vh-250px)] overflow-y-auto">
        {currentInvoice && <InvoiceViewer invoice={currentInvoice} />}
      </div>
    </div>
  )
}
