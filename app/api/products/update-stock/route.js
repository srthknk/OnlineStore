import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

// Update product stock after order placement
export async function POST(request) {
    try {
        const { userId } = getAuth(request)

        if (!userId) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 })
        }

        const { orderId } = await request.json()

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
        }

        // Get order with items
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                orderItems: {
                    include: {
                        product: {
                            include: {
                                productVariants: true
                            }
                        }
                    }
                }
            }
        })

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        if (order.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Update stock for each item
        for (const item of order.orderItems) {
            const product = item.product
            const hasVariants = product.productVariants && product.productVariants.length > 0

            if (hasVariants && item.selectedVariant) {
                // Update variant-specific stock
                const variant = product.productVariants.find(v => v.quantityUnit === item.selectedVariant)
                
                if (variant && variant.availableUnits >= item.quantity) {
                    await prisma.productVariant.update({
                        where: { id: variant.id },
                        data: {
                            availableUnits: {
                                decrement: item.quantity
                            }
                        }
                    })
                }
            } else if (!hasVariants) {
                // Update regular product stock
                if (product.totalUnits >= item.quantity) {
                    await prisma.product.update({
                        where: { id: product.id },
                        data: {
                            totalUnits: {
                                decrement: item.quantity
                            }
                        }
                    })
                }
            }
        }

        // Update product inStock status
        const productsToUpdate = new Set()
        for (const item of order.orderItems) {
            productsToUpdate.add(item.product.id)
        }

        for (const productId of productsToUpdate) {
            const product = await prisma.product.findUnique({
                where: { id: productId },
                include: { productVariants: true }
            })

            const hasVariants = product.productVariants && product.productVariants.length > 0

            if (hasVariants) {
                // Check if any variant has available units
                const hasStock = product.productVariants.some(v => v.availableUnits > 0)
                await prisma.product.update({
                    where: { id: productId },
                    data: { inStock: hasStock }
                })
            } else {
                await prisma.product.update({
                    where: { id: productId },
                    data: { inStock: product.totalUnits > 0 }
                })
            }
        }

        return NextResponse.json({ message: 'Stock updated successfully' })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}
