import prisma from "@/lib/prisma"
import authSeller from "@/middlewares/authSeller"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const storeId = await authSeller(userId)

        if (!storeId) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 })
        }

        const { productId, hasVariants, stockData } = await request.json()

        if (!productId || !stockData) {
            return NextResponse.json({ error: 'missing required fields' }, { status: 400 })
        }

        // Check if product belongs to this seller
        const product = await prisma.product.findUnique({ 
            where: { id: productId },
            include: { productVariants: true }
        })

        if (!product || product.storeId !== storeId) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 })
        }

        let updatedProduct

        if (hasVariants && product.productVariants && product.productVariants.length > 0) {
            // Update variants for product with variants
            let totalUnits = 0
            
            // Update each variant's stock
            for (const [variantId, units] of Object.entries(stockData)) {
                const numUnits = Number(units)
                totalUnits += numUnits

                await prisma.productVariant.update({
                    where: {
                        id: variantId
                    },
                    data: {
                        availableUnits: numUnits,
                        totalUnits: numUnits
                    }
                })
            }

            // Check if any variant has stock
            const hasStock = totalUnits > 0

            updatedProduct = await prisma.product.update({
                where: { id: productId },
                data: {
                    totalUnits,
                    inStock: hasStock
                },
                include: { productVariants: true }
            })
        } else {
            // Update regular product stock
            const units = Number(stockData.units)
            updatedProduct = await prisma.product.update({
                where: { id: productId },
                data: {
                    totalUnits: units,
                    inStock: units > 0
                },
                include: { productVariants: true }
            })
        }

        return NextResponse.json({
            message: 'Stock updated successfully',
            updatedProduct
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.message || 'Failed to update stock' }, { status: 400 })
    }
}
