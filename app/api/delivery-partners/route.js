import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req) {
    try {
        const { userId } = auth()
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get seller's store
        const store = await prisma.store.findUnique({
            where: { userId }
        })

        if (!store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 })
        }

        // Get delivery partners associated with this store
        const deliveryPartners = await prisma.deliveryPartner.findMany({
            where: {
                // Assuming there's a relation or storeId field
                // Adjust based on your actual schema
            },
            select: {
                id: true,
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            deliveryPartners
        })
    } catch (error) {
        console.error('Get delivery partners error:', error)
        return NextResponse.json({ error: error.message || 'Failed to fetch delivery partners' }, { status: 500 })
    }
}
