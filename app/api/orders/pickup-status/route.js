import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(req, { params }) {
    try {
        const { userId } = auth()
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { orderId } = params
        const { pickupStatus, notes } = await req.json()

        // Validate input
        if (!orderId || !pickupStatus) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Get order
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        })

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Verify delivery partner (check if userId is the assigned delivery partner)
        const deliveryPartner = await prisma.deliveryPartner.findUnique({
            where: { userId }
        })

        if (!deliveryPartner || order.pickupAssignedTo !== deliveryPartner.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Check if pickup is assigned
        if (!order.pickupAssignedTo) {
            return NextResponse.json({ error: 'No pickup assigned for this order' }, { status: 400 })
        }

        // Update order with pickup status
        const data = {}
        
        if (pickupStatus === 'PICKED_UP') {
            data.pickupCompletedAt = new Date()
            // Can also update order status or create pickup record
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data
        })

        return NextResponse.json({
            success: true,
            message: 'Pickup status updated',
            order: updatedOrder
        })
    } catch (error) {
        console.error('Update pickup status error:', error)
        return NextResponse.json({ error: error.message || 'Failed to update pickup status' }, { status: 500 })
    }
}
