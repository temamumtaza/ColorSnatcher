"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type InvoiceItem = {
  name: string
  quantity: number
  unit: string
  unit_price: number
}

export type Invoice = {
  invoiceNumber: string
  date: string
  client: string
  items: InvoiceItem[]
  companyId: string
  createdAt: string
}

type InvoiceStore = {
  invoices: Invoice[]
  addInvoice: (invoice: Invoice) => void
  deleteInvoice: (invoiceNumber: string) => void
}

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set) => ({
      invoices: [],
      addInvoice: (invoice) =>
        set((state) => ({
          invoices: [invoice, ...state.invoices],
        })),
      deleteInvoice: (invoiceNumber) =>
        set((state) => ({
          invoices: state.invoices.filter((i) => i.invoiceNumber !== invoiceNumber),
        })),
    }),
    {
      name: "invoice-storage",
    },
  ),
)
