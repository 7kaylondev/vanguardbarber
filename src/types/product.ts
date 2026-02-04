
export type Product = {
    id: string
    name: string
    description: string | null
    price: number
    images_url: string[]
    category_id: number
    stock_quantity: number
    min_stock_alert: number
    average_rating: number
    status: boolean
    created_at: string
}
