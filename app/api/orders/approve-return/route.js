import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function POST(req) {
    try {
        const { userId } = await auth()
        
        if (!userId) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { orderId } = await req.json()

        // Validate input
        if (!orderId) {
            return Response.json({ error: 'Order ID is required' }, { status: 400 })
        }

        // Get order
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { store: true }
        })

        if (!order) {
            return Response.json({ error: 'Order not found' }, { status: 404 })
        }

        // Verify seller ownership
        const store = await prisma.store.findUnique({
            where: { id: order.storeId }
        })

        if (!store || store.userId !== userId) {
            return Response.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Check if return request exists
        if (!order.returnRequestedAt) {
            return Response.json({ error: 'No return request found for this order' }, { status: 400 })
        }

        // Check if already approved
        if (order.returnApprovedAt) {
            return Response.json({ error: 'Return request already approved' }, { status: 400 })
        }

        // Update order with return approval
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                returnApprovedAt: new Date()
            }
        })

        return Response.json({
            success: true,
            message: 'Return request approved',
            order: updatedOrder
        })
    } catch (error) {
        console.error('Approve return error:', error)
        return Response.json({ error: error.message || 'Failed to approve return' }, { status: 500 })
    }
}
