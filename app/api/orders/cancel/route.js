import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function POST(req) {
    try {
        const { userId } = await auth()
        
        if (!userId) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { orderId, reason, description, cancelledBy } = await req.json()

        if (!orderId || !reason || !description) {
            return Response.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Get order and verify ownership
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true, store: true }
        })

        if (!order) {
            return Response.json({ error: 'Order not found' }, { status: 404 })
        }

        // Verify user is the buyer
        if (order.userId !== userId) {
            return Response.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Check if order can be cancelled (only if not already delivered or cancelled)
        if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
            return Response.json(
                { error: `Cannot cancel order with status: ${order.status}` },
                { status: 400 }
            )
        }

        // Cancel the order
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'CANCELLED',
                isCancelled: true,
                cancellationReason: reason,
                cancellationDescription: description,
                cancelledBy: cancelledBy,
                cancelledAt: new Date()
            },
            include: {
                user: true,
                orderItems: { include: { product: true } },
                address: true
            }
        })

        return Response.json(
            {
                success: true,
                message: 'Order cancelled successfully',
                order: updatedOrder
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Cancel order error:', error)
        return Response.json(
            { error: error.message || 'Failed to cancel order' },
            { status: 500 }
        )
    }
}
