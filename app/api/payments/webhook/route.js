import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Razorpay sends webhooks for payment events
export async function POST(request) {
    try {
        const body = await request.text()
        const signature = request.headers.get('x-razorpay-signature')

        // Verify webhook signature
        const hash = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(body)
            .digest('hex')

        if (hash !== signature) {
            console.error('Invalid webhook signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const event = JSON.parse(body)

        // Handle different webhook events
        switch (event.event) {
            case 'payment.authorized':
                await handlePaymentAuthorized(event.payload.payment)
                break
            case 'payment.failed':
                await handlePaymentFailed(event.payload.payment)
                break
            case 'payment.captured':
                await handlePaymentCaptured(event.payload.payment)
                break
            case 'refund.created':
                await handleRefund(event.payload.refund)
                break
            default:
                console.log(`Unhandled event: ${event.event}`)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}

// Handle successful payment authorization
async function handlePaymentAuthorized(payment) {
    try {
        const order = await prisma.order.findFirst({
            where: {
                razorpayOrderId: payment.order_id
            }
        })

        if (order) {
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    paymentStatus: 'SUCCESS',
                    razorpayPaymentId: payment.id,
                    isPaid: true
                }
            })
            console.log(`Payment authorized for order: ${order.id}`)
        }
    } catch (error) {
        console.error('Error handling payment authorized:', error)
    }
}

// Handle failed payment
async function handlePaymentFailed(payment) {
    try {
        const order = await prisma.order.findFirst({
            where: {
                razorpayOrderId: payment.order_id
            }
        })

        if (order) {
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    paymentStatus: 'FAILED',
                    isPaid: false
                }
            })
            console.log(`Payment failed for order: ${order.id}`)
        }
    } catch (error) {
        console.error('Error handling payment failed:', error)
    }
}

// Handle payment captured
async function handlePaymentCaptured(payment) {
    try {
        const order = await prisma.order.findFirst({
            where: {
                razorpayOrderId: payment.order_id
            }
        })

        if (order) {
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    paymentStatus: 'SUCCESS',
                    razorpayPaymentId: payment.id,
                    isPaid: true
                }
            })
            console.log(`Payment captured for order: ${order.id}`)
        }
    } catch (error) {
        console.error('Error handling payment captured:', error)
    }
}

// Handle refund
async function handleRefund(refund) {
    try {
        const order = await prisma.order.findFirst({
            where: {
                razorpayPaymentId: refund.payment_id
            }
        })

        if (order) {
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    paymentStatus: 'REFUNDED',
                    isPaid: false
                }
            })
            console.log(`Refund processed for order: ${order.id}`)
        }
    } catch (error) {
        console.error('Error handling refund:', error)
    }
}
