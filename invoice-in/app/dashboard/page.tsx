"use client"

import { useState } from "react"
import ChatInterface from "@/components/chat-interface"
import CompanySettings from "@/components/company-settings"
import ProductCatalog from "@/components/product-catalog"
import InvoiceHistory from "@/components/invoice-history"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("chat")

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">AI Chatbot Invoice Generator</h1>
        <p className="text-gray-500">Buat invoice dengan mudah menggunakan perintah teks biasa</p>
      </header>

      <div className="w-full">
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2 ${activeTab === "chat" ? "border-b-2 border-blue-500 font-medium" : ""}`}
          >
            Chat Invoice
          </button>
          <button
            onClick={() => setActiveTab("company")}
            className={`px-4 py-2 ${activeTab === "company" ? "border-b-2 border-blue-500 font-medium" : ""}`}
          >
            Template Perusahaan
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 ${activeTab === "products" ? "border-b-2 border-blue-500 font-medium" : ""}`}
          >
            Katalog Produk
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 ${activeTab === "history" ? "border-b-2 border-blue-500 font-medium" : ""}`}
          >
            Manajer Invoice
          </button>
        </div>

        <div className="mt-4">
          {activeTab === "chat" && <ChatInterface />}
          {activeTab === "company" && <CompanySettings />}
          {activeTab === "products" && <ProductCatalog />}
          {activeTab === "history" && <InvoiceHistory />}
        </div>
      </div>
    </div>
  )
} 