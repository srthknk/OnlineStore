import { createRazorpayOrder, verifyPaymentSignature } from '@/configs/razorpay'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'

// POST: Create Razorpay order
export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { total, cartItems, addressId, storeId, coupon } = await request.json()

        if (!total || !addressId || !storeId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Create Razorpay order
        const razorpayOrder = await createRazorpayOrder(total, {
            userId,
            storeId,
            addressId
        })

        // Create database order record (PENDING status)
        const order = await prisma.order.create({
            data: {
                total,
                userId,
                storeId,
                addressId,
                paymentMethod: 'RAZORPAY_UPI', // Default, will be updated based on actual payment method
                paymentStatus: 'PENDING',
                razorpayOrderId: razorpayOrder.id,
                isCouponUsed: !!coupon,
                coupon: coupon || {},
                orderItems: {
                    create: cartItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        selectedVariant: item.selectedVariant || null
                    }))
                }
            },
            include: {
                orderItems: true
            }
        })

        return NextResponse.json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            orderId: order.id,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        })
    } catch (error) {
        console.error('Payment creation error:', error)
        return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
    }
}

// PUT: Verify and complete payment
export async function PUT(request) {
    try {
        const { userId } = getAuth(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMethod } = await request.json()

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
        }

        // Verify payment signature
        const isSignatureValid = verifyPaymentSignature(
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        )

        if (!isSignatureValid) {
            // Update order payment status to FAILED
            await prisma.order.updateMany({
                where: {
                    razorpayOrderId,
                    userId
                },
                data: {
                    paymentStatus: 'FAILED'
                }
            })
            return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 })
        }

        // Update order with payment details
        const updatedOrder = await prisma.order.updateMany({
            where: {
                razorpayOrderId,
                userId
            },
            data: {
                isPaid: true,
                paymentStatus: 'SUCCESS',
                razorpayPaymentId,
                razorpaySignature,
                paymentMethod: paymentMethod || 'RAZORPAY_UPI'
            }
        })

        if (updatedOrder.count === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Fetch the updated order
        const order = await prisma.order.findFirst({
            where: {
                razorpayOrderId,
                userId
            },
            include: {
                orderItems: true,
                user: true,
                store: true,
                address: true
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Payment successful',
            order
        })
    } catch (error) {
        console.error('Payment verification error:', error)
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
    }
}
