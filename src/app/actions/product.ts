
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProduct(currentState: any, formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('title') as string
    const categoryName = formData.get('category') as string // Now receiving name, we must fetch ID
    const price = parseFloat(formData.get('price') as string)
    const stock_quantity = parseInt(formData.get('stock_quantity') as string)
    const image_url = formData.get('image_url') as string
    const description = formData.get('description') as string

    if (!name || !price || !categoryName) {
        return { error: 'Preencha os campos obrigatórios.' }
    }

    // 1. Fetch Category ID from Name (slug match)
    const slug = categoryName.toLowerCase().replace(/ /g, '-')
    const { data: categoryData, error: catError } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', categoryName) // or try slug
        .single()

    let categoryId = categoryData?.id

    // Fallback: If not found, default to first or create? 
    // For now, let's assume valid selection from UI.
    if (!categoryId) {
        // Try to find by slug if ilike name failed
        const { data: slugData } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', slug)
            .single()
        categoryId = slugData?.id
    }

    if (!categoryId) {
        return { error: 'Categoria inválida.' }
    }

    // 2. Insert Product
    const { error } = await supabase.from('products').insert({
        name,
        category_id: categoryId,
        price,
        stock_quantity,
        images_url: image_url ? [image_url] : [],
        description: description || null,
        average_rating: 5,
        status: true
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/produtos')
    revalidatePath('/produtos')

    return { success: true }
}

export async function deleteProduct(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/produtos')
    revalidatePath('/produtos')
}

export async function updateProductField(id: string, field: string, value: any) {
    const supabase = await createClient()
    const { error } = await supabase.from('products').update({ [field]: value }).eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/produtos')
    revalidatePath('/produtos')
}
