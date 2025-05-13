"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Trash2 } from "lucide-react"
import { useInvoiceStore } from "@/lib/stores/invoice-store"
import { useCompanyStore } from "@/lib/stores/company-store"
import InvoiceViewer from "./invoice-viewer"

export default function InvoiceHistory() {
  const { invoices, deleteInvoice } = useInvoiceStore()
  const { companies } = useCompanyStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)

  const getCompanyName = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId)
    return company ? company.name : "Perusahaan Tidak Diketahui"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date)
  }

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCompanyName(invoice.companyId).toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Manajer Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredInvoices.length === 0 ? (
            <p className="text-muted-foreground">
              {searchTerm ? "Tidak ada invoice yang cocok dengan pencarian Anda." : "Belum ada invoice tersimpan."}
            </p>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.invoiceNumber} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{invoice.invoiceNumber}</h3>
                      <p className="text-sm">
                        <span className="font-medium">Klien:</span> {invoice.client}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Perusahaan:</span> {getCompanyName(invoice.companyId)}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(invoice.createdAt)}</p>
                      <p className="text-sm font-medium mt-1">
                        Total: Rp{" "}
                        {invoice.items.reduce((acc, item) => acc + item.quantity * item.unit_price, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                        <Eye className="h-4 w-4 mr-1" /> Lihat
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteInvoice(invoice.invoiceNumber || "")}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="h-[calc(100vh-250px)] overflow-y-auto">
        {selectedInvoice && <InvoiceViewer invoice={selectedInvoice} />}
      </div>
    </div>
  )
}
