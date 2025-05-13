import { NextResponse } from "next/server"
import { generateText } from "ai"
import { createDeepSeek } from "@ai-sdk/deepseek"

// Create DeepSeek client on the server side
const deepseekClient = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
})

export async function POST(request: Request) {
  try {
    const { text, products } = await request.json()

    // Create a prompt that includes product catalog information if available
    let productCatalogInfo = ""
    if (products && products.length > 0) {
      productCatalogInfo = `
Berikut adalah katalog produk yang tersedia:
${products.map((p: any) => `- ${p.name}: ${p.unit}, Rp${p.price}`).join("\n")}

Jika ada produk dalam instruksi yang cocok dengan katalog, gunakan informasi dari katalog.
`
    }

    const prompt = `
Ubah instruksi berikut menjadi data invoice dalam format JSON.

Instruksi:
"${text}"

${productCatalogInfo}

Format output JSON:
{
  "client": "Nama Perusahaan",
  "items": [
    {
      "name": "Nama Barang",
      "quantity": Jumlah,
      "unit": "Satuan",
      "unit_price": HargaPerUnit
    }
  ]
}

Pastikan output hanya berisi JSON yang valid tanpa komentar atau teks tambahan.
`

    // Check if API key is available
    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: "DeepSeek API key not configured" }, { status: 500 })
    }

    // Use AI SDK to generate the invoice data with DeepSeek
    const { text: response } = await generateText({
      model: deepseekClient("deepseek-chat"),
      messages: [
        { role: "system", content: "Kamu adalah pembuat invoice JSON dari instruksi user." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2, // Lower temperature for more deterministic output
    })

    // Extract JSON from the response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)```/) || response.match(/```\s*([\s\S]*?)```/)
    const jsonText = jsonMatch ? jsonMatch[1] : response

    try {
      const invoiceData = JSON.parse(jsonText)
      return NextResponse.json({ invoiceData, rawResponse: response })
    } catch (e) {
      console.error("Failed to parse JSON from response:", e)
      return NextResponse.json({ error: "Failed to parse JSON from response" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error generating invoice:", error)
    return NextResponse.json({ error: "Error generating invoice" }, { status: 500 })
  }
}
