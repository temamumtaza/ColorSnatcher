"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save, Download } from "lucide-react"
import { useCompanyStore } from "@/lib/stores/company-store"
import { useInvoiceStore } from "@/lib/stores/invoice-store"
import { useRef, useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import jsPDF from "jspdf"

type InvoiceProps = {
  invoice: {
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
}

export default function InvoiceViewer({ invoice }: InvoiceProps) {
  const { activeCompany } = useCompanyStore()
  const { addInvoice, invoices } = useInvoiceStore()
  const invoiceRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const total = invoice.items.reduce((acc, item) => acc + item.quantity * item.unit_price, 0)

  // Get header color based on company accent color
  const getHeaderColor = () => {
    switch (activeCompany?.accentColor) {
      case "blue":
        return "#2563eb"
      case "red":
        return "#dc2626"
      case "green":
        return "#16a34a"
      case "purple":
        return "#9333ea"
      case "orange":
        return "#ea580c"
      default:
        return "#2563eb"
    }
  }

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return

    setIsDownloading(true)

    try {
      // Create a PDF directly without using html2canvas
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Add company info
      pdf.setFontSize(18)
      pdf.text("INVOICE", 20, 20)

      pdf.setFontSize(12)
      pdf.text(activeCompany?.name || "Perusahaan Anda", 20, 30)
      pdf.setFontSize(10)
      pdf.text(activeCompany?.address || "Alamat Perusahaan", 20, 35)
      pdf.text(activeCompany?.contact || "Kontak Perusahaan", 20, 40)

      // Add invoice info
      pdf.setFontSize(12)
      pdf.text(`No: ${invoice.invoiceNumber || "INV-00001"}`, 150, 30)
      pdf.text(`Tanggal: ${invoice.date || new Date().toLocaleDateString()}`, 150, 35)

      // Add client info
      pdf.setFontSize(12)
      pdf.text("Kepada:", 20, 55)
      pdf.text(invoice.client, 20, 60)

      // Add table header
      pdf.setFillColor(240, 240, 240)
      pdf.rect(20, 70, 170, 8, "F")
      pdf.setFontSize(10)
      pdf.text("Deskripsi", 25, 75)
      pdf.text("Jumlah", 100, 75)
      pdf.text("Harga Satuan", 125, 75)
      pdf.text("Subtotal", 160, 75)

      // Add table content
      let y = 85
      invoice.items.forEach((item, index) => {
        pdf.text(item.name, 25, y)
        pdf.text(`${item.quantity} ${item.unit}`, 100, y)
        pdf.text(`Rp ${item.unit_price.toLocaleString()}`, 125, y)
        pdf.text(`Rp ${(item.quantity * item.unit_price).toLocaleString()}`, 160, y)
        y += 10

        // Add line
        pdf.setDrawColor(220, 220, 220)
        pdf.line(20, y - 5, 190, y - 5)
      })

      // Add total
      pdf.setFontSize(12)
      pdf.text("Total:", 125, y + 5)
      pdf.text(`Rp ${total.toLocaleString()}`, 160, y + 5)

      // Add notes
      pdf.setDrawColor(220, 220, 220)
      pdf.line(20, y + 10, 190, y + 10)
      pdf.setFontSize(10)
      pdf.text("Catatan:", 20, y + 20)
      pdf.text(activeCompany?.notes || "Terima kasih atas kerjasamanya.", 20, y + 25)

      // Save the PDF
      pdf.save(`Invoice-${invoice.invoiceNumber || "Generated"}.pdf`)

      toast({
        title: "PDF berhasil diunduh",
        description: `Invoice-${invoice.invoiceNumber || "Generated"}.pdf`,
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Gagal mengunduh PDF",
        description: "Terjadi kesalahan saat membuat PDF.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSave = () => {
    if (!activeCompany) {
      toast({
        title: "Perusahaan tidak ditemukan",
        description: "Silakan buat template perusahaan terlebih dahulu.",
        variant: "destructive",
      })
      return
    }

    // Check if invoice is already saved
    const isAlreadySaved = invoices.some((inv) => inv.invoiceNumber === invoice.invoiceNumber)

    if (isAlreadySaved || isSaved) {
      toast({
        title: "Invoice sudah tersimpan",
        description: "Invoice ini sudah tersimpan di Manajer Invoice.",
      })
      return
    }

    // Save to invoice store
    addInvoice({
      ...invoice,
      companyId: activeCompany.id,
      createdAt: new Date().toISOString(),
    })

    setIsSaved(true)

    toast({
      title: "Invoice berhasil disimpan",
      description: "Invoice telah ditambahkan ke Manajer Invoice.",
      action: <ToastAction altText="Lihat Manajer Invoice">Lihat</ToastAction>,
    })
  }

  return (
    <Card className="shadow-lg" ref={invoiceRef}>
      <div
        className="px-6 py-4 flex justify-between items-center text-white"
        style={{ backgroundColor: getHeaderColor() }}
      >
        <h3 className="text-xl font-semibold">Invoice</h3>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadPDF}
            className="text-xs"
            disabled={isDownloading}
          >
            <Download className="h-4 w-4 mr-1" /> {isDownloading ? "Mengunduh..." : "Unduh PDF"}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleSave} className="text-xs" disabled={isSaved}>
            <Save className="h-4 w-4 mr-1" /> Simpan
          </Button>
        </div>
      </div>
      <CardContent className="p-6" ref={contentRef}>
        <div className="flex justify-between mb-8">
          <div>
            <h3 className="font-bold text-xl mb-1">{activeCompany?.name || "Perusahaan Anda"}</h3>
            <p className="text-sm text-gray-600">{activeCompany?.address || "Alamat Perusahaan"}</p>
            <p className="text-sm text-gray-600">{activeCompany?.contact || "Kontak Perusahaan"}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">{invoice.invoiceNumber || "INV-00001"}</p>
            <p className="text-sm text-gray-600">Tanggal: {invoice.date || new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="font-bold mb-2">Kepada:</h4>
          <p>{invoice.client}</p>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Deskripsi</th>
              <th className="text-right py-2">Jumlah</th>
              <th className="text-right py-2">Harga Satuan</th>
              <th className="text-right py-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{item.name}</td>
                <td className="text-right py-2">
                  {item.quantity} {item.unit}
                </td>
                <td className="text-right py-2">Rp {item.unit_price.toLocaleString()}</td>
                <td className="text-right py-2">Rp {(item.quantity * item.unit_price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="text-right font-bold py-4">
                Total:
              </td>
              <td className="text-right font-bold py-4">Rp {total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div className="border-t pt-4">
          <h4 className="font-bold mb-2">Catatan:</h4>
          <p className="text-sm text-gray-600">{activeCompany?.notes || "Terima kasih atas kerjasamanya."}</p>
        </div>
      </CardContent>
    </Card>
  )
}
