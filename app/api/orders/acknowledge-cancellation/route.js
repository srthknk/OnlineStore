import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"

export async function POST(req) {
    try {
        const { orderId } = await req.json()

        if (!orderId) {
            return Response.json({ error: 'Order ID is required' }, { status: 400 })
        }

        // Get user from Clerk
        const { userId } = await auth()
        if (!userId) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify the order belongs to this seller's store
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { store: true }
        })

        if (!order) {
            return Response.json({ error: 'Order not found' }, { status: 404 })
        }

        // Check if user is the seller of this store
        if (order.store.userId !== userId) {
            return Response.json({ error: 'Unauthorized - not store owner' }, { status: 403 })
        }

        // Check if order is cancelled
        if (!order.isCancelled) {
            return Response.json({ error: 'Order is not cancelled' }, { status: 400 })
        }

        // Update the order to mark cancellation as acknowledged
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                pickupCompletedAt: new Date()
            }
        })

        return Response.json({ success: true, order: updatedOrder })
    } catch (error) {
        console.error('Error acknowledging cancellation:', error)
        return Response.json({ error: error.message }, { status: 500 })
    }
}
