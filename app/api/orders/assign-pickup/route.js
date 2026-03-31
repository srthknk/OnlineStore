import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req, { params }) {
    try {
        const { userId } = auth()
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { orderId } = params
        const { deliveryPartnerId, pickupScheduledAt } = await req.json()

        // Validate input
        if (!orderId || !deliveryPartnerId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Get order
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { store: true }
        })

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Verify seller ownership
        const store = await prisma.store.findUnique({
            where: { id: order.storeId }
        })

        if (!store || store.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Check if order is cancelled or has return request
        if (!order.isCancelled && !order.returnRequestedAt) {
            return NextResponse.json({ error: 'Order is not eligible for pickup assignment' }, { status: 400 })
        }

        // Verify delivery partner exists and belongs to store
        const deliveryPartner = await prisma.deliveryPartner.findUnique({
            where: { id: deliveryPartnerId }
        })

        if (!deliveryPartner) {
            return NextResponse.json({ error: 'Delivery partner not found' }, { status: 404 })
        }

        // Update order with pickup assignment
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                pickupAssignedTo: deliveryPartnerId,
                pickupScheduledAt: pickupScheduledAt ? new Date(pickupScheduledAt) : null
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Delivery partner assigned for pickup',
            order: updatedOrder
        })
    } catch (error) {
        console.error('Assign pickup error:', error)
        return NextResponse.json({ error: error.message || 'Failed to assign delivery partner' }, { status: 500 })
    }
}
