'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getCompany(id: string) {
  try {
    return await prisma.company.findUnique({
      where: { id }
    })
  } catch (error) {
    console.error('Failed to fetch company:', error)
    throw new Error('Failed to fetch company')
  }
}

export async function getCompanies() {
  try {
    return await prisma.company.findMany({
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error('Failed to fetch companies:', error)
    throw new Error('Failed to fetch companies')
  }
}

export async function createCompany(data: {
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
  colorScheme?: any
}) {
  try {
    const company = await prisma.company.create({
      data
    })
    
    revalidatePath('/company')
    return company
  } catch (error) {
    console.error('Failed to create company:', error)
    throw new Error('Failed to create company')
  }
}

export async function updateCompany(
  id: string,
  data: {
    name?: string
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
    colorScheme?: any
  }
) {
  try {
    const company = await prisma.company.update({
      where: { id },
      data
    })
    
    revalidatePath('/company')
    return company
  } catch (error) {
    console.error('Failed to update company:', error)
    throw new Error('Failed to update company')
  }
}

export async function deleteCompany(id: string) {
  try {
    await prisma.company.delete({
      where: { id }
    })
    
    revalidatePath('/company')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete company:', error)
    throw new Error('Failed to delete company')
  }
} 