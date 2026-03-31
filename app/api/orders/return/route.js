import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function POST(req) {
    try {
        const { userId } = await auth()
        console.log('Auth userId:', userId)
        
        if (!userId) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { orderId, reason, description } = await req.json()
        console.log('Request payload:', { orderId, reason, description })

        // Validate input
        if (!orderId || !reason || !description) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Get order
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true }
        })

        if (!order) {
            return Response.json({ error: 'Order not found' }, { status: 404 })
        }

        // Verify user ownership
        if (order.userId !== userId) {
            return Response.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Check if order is eligible for return (DELIVERED and within 3 days)
        if (order.status !== 'DELIVERED') {
            return Response.json({ error: 'Order is not delivered yet' }, { status: 400 })
        }

        const deliveredDate = new Date(order.deliveryCompletedAt || order.createdAt)
        const currentDate = new Date()
        const daysSinceDelivery = Math.floor((currentDate - deliveredDate) / (1000 * 60 * 60 * 24))

        // Return window: 3 days means day 0, 1, 2 after delivery
        // Day 3 and beyond: return window expired
        if (daysSinceDelivery >= 3) {
            return Response.json({ error: 'Return window expired. Returns are only allowed within 3 days of delivery' }, { status: 400 })
        }

        // Check if already cancelled or returned
        if (order.isCancelled || order.returnRequestedAt) {
            return Response.json({ error: 'This order has already been cancelled or has a return request' }, { status: 400 })
        }

        // Update order with return request
        console.log('Attempting to update order with:', { id: orderId, returnRequestedAt: new Date(), returnReason: reason, returnDescription: description })
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                returnRequestedAt: new Date(),
                returnReason: reason,
                returnDescription: description
            },
            include: {
                user: true,
                orderItems: { include: { product: true } }
            }
        })
        console.log('Order updated successfully:', updatedOrder.id)

        return Response.json({
            success: true,
            message: 'Return request submitted successfully',
            order: updatedOrder
        })
    } catch (error) {
        console.error('Return request error:', error)
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack
        })
        return Response.json({ 
            error: error.message || 'Failed to submit return request',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 })
    }
}
