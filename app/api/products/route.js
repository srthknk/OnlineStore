import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Enable caching for 60 seconds
export const revalidate = 60;

export async function GET(request) {
    try {
        console.log('[Products API] 🔍 Fetching products...')

        // Check if prisma is connected
        if (!prisma) {
            console.error('[Products API] ❌ Prisma client not initialized')
            return NextResponse.json({
                products: [],
                message: 'Database connection failed'
            }, { status: 200 })
        }

        let products = await prisma.product.findMany({
            where: {
                inStock: true,
                // Exclude expired products
                OR: [
                    { expiryDate: null },  // No expiry date set
                    { expiryDate: { gt: new Date() } }  // Expiry date is in the future
                ]
            },
            include: {
                rating: {
                    select: {
                        createdAt: true, rating: true, review: true,
                        user: { select: { name: true, image: true } }
                    }
                },
                store: true,
                productVariants: true
            },
            orderBy: { createdAt: 'desc' }
        })

        console.log(`[Products API] ✅ Found ${products.length} products`)

        // remove products with store isActive false
        products = products.filter(product => product.store && product.store.isActive)
        console.log(`[Products API] ✅ After filtering: ${products.length} active products`)

        const response = NextResponse.json({ products })
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
        return response
    } catch (error) {
        console.error('[Products API] ❌ Error fetching products:', error)
        console.error('[Products API] Error code:', error.code)
        console.error('[Products API] Error message:', error.message)
        console.error('[Products API] Full error:', JSON.stringify(error, null, 2))

        // Return empty array instead of 500 error
        const response = NextResponse.json({
            products: [],
            message: 'Could not fetch products, returning empty list'
        }, { status: 200 })
        response.headers.set('Cache-Control', 'public, s-maxage=10');
        return response
    }
}