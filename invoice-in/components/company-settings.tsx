"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Trash2, Check } from "lucide-react"
import { useCompanyStore } from "@/lib/stores/company-store"
import { createCompany, deleteCompany as deleteCompanyAction, getCompanies, updateCompany as updateCompanyAction } from "@/app/actions/company"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function CompanySettings() {
  const { companies, activeCompany, addCompany, updateCompany, deleteCompany, setActiveCompany } = useCompanyStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dbCompanies, setDbCompanies] = useState<any[]>([])

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    email: "",
    phone: "",
    website: "",
    taxId: "",
    colorScheme: {
      accentColor: "blue",
      logoUrl: ""
    },
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  // Fetch companies from the database
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const companies = await getCompanies()
        setDbCompanies(companies)
      } catch (error) {
        console.error('Failed to fetch companies:', error)
        toast.error('Failed to fetch companies')
      }
    }

    fetchCompanies()
  }, [])

  // Get color for display
  const getColorStyle = (colorName: string) => {
    switch (colorName) {
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

  useEffect(() => {
    if (activeCompany && isEditing) {
      setFormData({
        name: activeCompany.name,
        address: activeCompany.address || "",
        city: activeCompany.city || "",
        state: activeCompany.state || "",
        postalCode: activeCompany.postalCode || "",
        country: activeCompany.country || "",
        email: activeCompany.email || "",
        phone: activeCompany.phone || "",
        website: activeCompany.website || "",
        taxId: activeCompany.taxId || "",
        colorScheme: activeCompany.colorScheme || { accentColor: "blue", logoUrl: "" }
      })
      setEditId(activeCompany.id)
    }
  }, [activeCompany, isEditing])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleColorChange = (value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      colorScheme: { 
        ...prev.colorScheme, 
        accentColor: value 
      } 
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditing && editId) {
        await updateCompanyAction(editId, formData)
        toast.success('Company updated successfully')
        setIsEditing(false)
        setEditId(null)
      } else {
        const newCompany = await createCompany(formData)
        toast.success('Company created successfully')
      }

      // Refresh companies
      const updatedCompanies = await getCompanies()
      setDbCompanies(updatedCompanies)

      // Reset form
      setFormData({
        name: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        email: "",
        phone: "",
        website: "",
        taxId: "",
        colorScheme: {
          accentColor: "blue",
          logoUrl: ""
        },
      })

      router.refresh()
    } catch (error) {
      console.error('Failed to save company:', error)
      toast.error('Failed to save company')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (company: any) => {
    setIsEditing(true)
    setEditId(company.id)
    setFormData({
      name: company.name,
      address: company.address || "",
      city: company.city || "",
      state: company.state || "",
      postalCode: company.postalCode || "",
      country: company.country || "",
      email: company.email || "",
      phone: company.phone || "",
      website: company.website || "",
      taxId: company.taxId || "",
      colorScheme: company.colorScheme || { accentColor: "blue", logoUrl: "" }
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditId(null)
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      email: "",
      phone: "",
      website: "",
      taxId: "",
      colorScheme: {
        accentColor: "blue",
        logoUrl: ""
      },
    })
  }

  const handleDeleteCompany = async (id: string) => {
    if (confirm("Are you sure you want to delete this company?")) {
      try {
        await deleteCompanyAction(id)
        toast.success('Company deleted successfully')
        const updatedCompanies = await getCompanies()
        setDbCompanies(updatedCompanies)
        router.refresh()
      } catch (error) {
        console.error('Failed to delete company:', error)
        toast.error('Failed to delete company')
      }
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Template Perusahaan" : "Tambah Template Perusahaan"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Perusahaan</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="PT Example"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Jl. Contoh No. 123, Jakarta"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Kota</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Jakarta"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Kode Pos</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="12345"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
                type="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telepon</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="0812-3456-7890"
              />
            </div>

            <div className="space-y-2">
              <Label>Warna Aksen</Label>
              <RadioGroup
                value={formData.colorScheme.accentColor}
                onValueChange={handleColorChange}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="blue" id="blue" style={{ borderColor: "#2563eb" }} />
                  <Label htmlFor="blue" className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: "#2563eb" }}></div>
                    Biru
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="red" id="red" style={{ borderColor: "#dc2626" }} />
                  <Label htmlFor="red" className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: "#dc2626" }}></div>
                    Merah
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="green" id="green" style={{ borderColor: "#16a34a" }} />
                  <Label htmlFor="green" className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: "#16a34a" }}></div>
                    Hijau
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="purple" id="purple" style={{ borderColor: "#9333ea" }} />
                  <Label htmlFor="purple" className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: "#9333ea" }}></div>
                    Ungu
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="orange" id="orange" style={{ borderColor: "#ea580c" }} />
                  <Label htmlFor="orange" className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: "#ea580c" }}></div>
                    Oranye
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {isEditing ? (
                  <>
                    <Check className="h-4 w-4 mr-2" /> {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" /> {loading ? 'Menambahkan...' : 'Tambah Perusahaan'}
                  </>
                )}
              </Button>

              {isEditing && (
                <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                  Batal
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Template Tersimpan</CardTitle>
        </CardHeader>
        <CardContent>
          {dbCompanies.length === 0 ? (
            <p className="text-muted-foreground">Belum ada template perusahaan. Tambahkan template pertama Anda.</p>
          ) : (
            <div className="space-y-4">
              {dbCompanies.map((company) => (
                <div
                  key={company.id}
                  className={`p-4 border rounded-lg ${
                    activeCompany?.id === company.id ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{company.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{company.address}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(company)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCompany(company.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getColorStyle(company.colorScheme?.accentColor || 'blue') }}
                    ></div>
                    <span className="text-xs text-muted-foreground capitalize">{company.colorScheme?.accentColor || 'blue'}</span>
                  </div>

                  {activeCompany?.id !== company.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => setActiveCompany(company)}
                    >
                      Gunakan Template Ini
                    </Button>
                  )}

                  {activeCompany?.id === company.id && (
                    <div className="mt-2 text-center text-xs text-primary font-medium">Template Aktif</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
