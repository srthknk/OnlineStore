import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import Stripe from "stripe"

// Lazy load stripe to avoid build errors when STRIPE_SECRET_KEY is not set
const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY)
}

export async function POST(request){
    try {
        const stripe = getStripe()
        const body = await request.text()
        const sig = request.headers.get('stripe-signature')

        const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)

        const handlePaymentIntent = async (paymentIntentId, isPaid) => {
            const session = await stripe.checkout.sessions.list({
                payment_intent: paymentIntentId
            })

            const {orderIds, userId, appId} = session.data[0].metadata
            
            if(appId !== process.env.NEXT_PUBLIC_APP_ID || appId !== 'gocart'){
                return NextResponse.json({received: true, message: 'Invalid app id'})
            }

            const orderIdsArray = orderIds.split(',')

            if(isPaid){
                // mark order as paid
                await Promise.all(orderIdsArray.map(async (orderId) => {
                    await prisma.order.update({
                        where: {id: orderId},
                        data: {isPaid: true}
                    })
                }))
                // delete cart from user
                await prisma.user.update({
                    where: {id: userId},
                    data: {cart : {}}
                })
            }else{
                 // delete order from db
                 await Promise.all(orderIdsArray.map(async (orderId) => {
                    await prisma.order.delete({
                        where: {id: orderId}
                    })
                 }))
            }
        }

    
        switch (event.type) {
            case 'payment_intent.succeeded': {
                await handlePaymentIntent(event.data.object.id, true)
                break;
            }

            case 'payment_intent.canceled': {
                await handlePaymentIntent(event.data.object.id, false)
                break;
            }
        
            default:
                console.log('Unhandled event type:', event.type)
                break;
        }

        return NextResponse.json({received: true})
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}

export const config = {
    api: {bodyparser: false }
}