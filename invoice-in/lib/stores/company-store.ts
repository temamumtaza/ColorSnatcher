"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Company = {
  id: string
  name: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  email?: string
  phone?: string
  website?: string
  logoUrl?: string
  taxId?: string
  colorScheme?: {
    accentColor: string
    logoUrl?: string
  }
}

type CompanyStore = {
  companies: Company[]
  activeCompany: Company | null
  addCompany: (company: Company) => void
  updateCompany: (company: Company) => void
  deleteCompany: (id: string) => void
  setActiveCompany: (company: Company) => void
}

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      companies: [],
      activeCompany: null,
      addCompany: (company) =>
        set((state) => ({
          companies: [...state.companies, company],
          activeCompany: state.activeCompany || company,
        })),
      updateCompany: (company) =>
        set((state) => ({
          companies: state.companies.map((c) => (c.id === company.id ? company : c)),
          activeCompany: state.activeCompany?.id === company.id ? company : state.activeCompany,
        })),
      deleteCompany: (id) =>
        set((state) => {
          const newCompanies = state.companies.filter((c) => c.id !== id)
          return {
            companies: newCompanies,
            activeCompany:
              state.activeCompany?.id === id ? (newCompanies.length > 0 ? newCompanies[0] : null) : state.activeCompany,
          }
        }),
      setActiveCompany: (company) => set({ activeCompany: company }),
    }),
    {
      name: "company-storage",
    },
  ),
)
