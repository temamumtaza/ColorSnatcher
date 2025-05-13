"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Check, Search } from "lucide-react"
import { useProductStore } from "@/lib/stores/product-store"

export default function ProductCatalog() {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit: "",
    price: "",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const productData = {
      ...formData,
      price: Number.parseFloat(formData.price) || 0,
    }

    if (isEditing && editId) {
      updateProduct({
        id: editId,
        ...productData,
      })
      setIsEditing(false)
      setEditId(null)
    } else {
      addProduct({
        id: Date.now().toString(),
        ...productData,
      })
    }

    // Reset form
    setFormData({
      name: "",
      description: "",
      unit: "",
      price: "",
    })
  }

  const handleEdit = (product: any) => {
    setIsEditing(true)
    setEditId(product.id)
    setFormData({
      name: product.name,
      description: product.description,
      unit: product.unit,
      price: product.price.toString(),
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditId(null)
    setFormData({
      name: "",
      description: "",
      unit: "",
      price: "",
    })
  }

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Produk" : "Tambah Produk"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Produk</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Semen Holcim"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi (Opsional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Deskripsi produk"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Satuan</Label>
                <Input
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  placeholder="sak"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Harga Satuan (Rp)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="45000"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {isEditing ? (
                  <>
                    <Check className="h-4 w-4 mr-2" /> Simpan Perubahan
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" /> Tambah Produk
                  </>
                )}
              </Button>

              {isEditing && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Batal
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Katalog Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredProducts.length === 0 ? (
            <p className="text-muted-foreground">
              {searchTerm
                ? "Tidak ada produk yang cocok dengan pencarian Anda."
                : "Belum ada produk dalam katalog. Tambahkan produk pertama Anda."}
            </p>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-medium">Rp {product.price.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">per {product.unit}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteProduct(product.id)}>
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
    </div>
  )
}
