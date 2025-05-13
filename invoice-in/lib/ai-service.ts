"use client"

import { useProductStore } from "./stores/product-store"

export async function generateInvoiceFromText(text: string) {
  try {
    // Get product catalog from store
    const productStore = useProductStore.getState()
    const products = productStore.products || []

    try {
      // Call our server-side API route
      const response = await fetch("/api/generate-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, products }),
      })

      if (!response.ok) {
        // If the API call fails, fall back to mock data
        console.warn("API call failed, using mock data")
        return generateMockInvoiceData(text, products)
      }

      const data = await response.json()

      if (data.error || !data.invoiceData) {
        // If there's an error in the response, fall back to mock data
        console.warn("API returned an error, using mock data:", data.error)
        return generateMockInvoiceData(text, products)
      }

      return data
    } catch (error) {
      console.error("Error calling API:", error)
      // If API call fails, fall back to mock data
      return generateMockInvoiceData(text, products)
    }
  } catch (error) {
    console.error("Error generating invoice:", error)
    throw error
  }
}

// Helper function for generating mock data as fallback
function generateMockInvoiceData(text: string, products: any[]) {
  console.warn("Falling back to mock data generation")

  // Extract client name (simple regex)
  const clientMatch = text.match(/untuk\s+([^,:.]+)/i)
  const clientName = clientMatch ? clientMatch[1].trim() : "Client"

  // Parse items from the text
  const items = []

  // Look for patterns like "X pcs/unit/karung PRODUCT_NAME"
  const itemRegex =
    /(\d+)\s+(pcs|unit|karung|sak|batang|drum)\s+([^@,]+)(?:@\s*(\d+(?:[,.]\d+)?)\s*(rb|jt|ribu|juta|k)?)?/gi
  let match

  while ((match = itemRegex.exec(text)) !== null) {
    const quantity = Number.parseInt(match[1])
    const unit = match[2]
    const name = match[3].trim()

    // Check if this product exists in the catalog
    const catalogProduct = products.find(
      (p) => p.name.toLowerCase() === name.toLowerCase() || name.toLowerCase().includes(p.name.toLowerCase()),
    )

    let unitPrice = 0

    if (catalogProduct) {
      // Use price from catalog
      unitPrice = catalogProduct.price
    } else if (match[4]) {
      // Parse price from text if provided
      const price = Number.parseFloat(match[4].replace(",", "."))
      const multiplier = match[5] ? (match[5] === "rb" || match[5] === "ribu" || match[5] === "k" ? 1000 : 1000000) : 1
      unitPrice = price * multiplier
    } else {
      // Default price if nothing else is available
      unitPrice = 50000
    }

    items.push({
      name,
      quantity,
      unit,
      unit_price: unitPrice,
    })
  }

  // If no items were found, add a default item
  if (items.length === 0) {
    items.push({
      name: "Item dari instruksi",
      quantity: 10,
      unit: "pcs",
      unit_price: 50000,
    })
  }

  // Create mock response
  const mockData = {
    client: clientName,
    items: items,
  }

  const mockResponse = `\`\`\`json
${JSON.stringify(mockData, null, 2)}
\`\`\``

  return {
    invoiceData: mockData,
    rawResponse: mockResponse,
  }
}
