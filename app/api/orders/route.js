import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sendSMS, formatOrderNotificationMessage } from "@/lib/twilio";


export async function POST(request){
    try {
        console.log('[Orders API] 🚀 Order creation started');
        
        const { userId, has } = getAuth(request)
        console.log('[Orders API] User ID:', userId);
        
        if(!userId){
            console.log('[Orders API] ❌ Not authorized');
            return NextResponse.json({ error: "not authorized" }, { status: 401 });
        }
        const { addressId, items, couponCode, paymentMethod, deliveryCharges } = await request.json()
        
        console.log('[Orders API] Payment method:', paymentMethod);
        console.log('[Orders API] Items count:', items?.length);
        console.log('[Orders API] 📝 Basic validation passed');

        // Check if all required fields are present
        if(!addressId || !paymentMethod || !items || !Array.isArray(items) || items.length === 0){
           console.log('[Orders API] ❌ Missing order details');
           return NextResponse.json({ error: "missing order details." }, { status: 401 }); 
        }

        let coupon = null;

        if (couponCode) {
        coupon = await prisma.coupon.findUnique({
                    where: {code: couponCode }
                })
                if (!coupon){
            return NextResponse.json({ error: "Coupon not found" }, { status: 400 })
        }
        }
         
            // Check if coupon is applicable for new users
        if(couponCode && coupon.forNewUser){
            const userorders = await prisma.order.findMany({where: {userId}})
            if(userorders.length > 0){
                return NextResponse.json({ error: "Coupon valid for new users" }, { status: 400 })
            }
        }

        const isPlusMember = has({plan: 'plus'})

        // Check if coupon is applicable for members
        if (couponCode && coupon.forMember){
            if(!isPlusMember){
                return NextResponse.json({ error: "Coupon valid for members only" }, { status: 400 })
            }
        }

         // Group orders by storeId using a Map
         const ordersByStore = new Map()

         for(const item of items){
            const product = await prisma.product.findUnique({where: {id: item.id}})
            const storeId = product.storeId
            if(!ordersByStore.has(storeId)){
                ordersByStore.set(storeId, [])
            }
            ordersByStore.get(storeId).push({...item, price: product.price})
         }

         let orderIds = [];
         let fullAmount = 0;

         // Create orders for each seller
         for(const [storeId, sellerItems] of ordersByStore.entries()){
            let total = sellerItems.reduce((acc, item)=>acc + (item.price * item.quantity), 0)

            if(couponCode){
                total -= (total * coupon.discount) / 100;
            }

            // Add delivery charges to total
            const finalTotal = total + (deliveryCharges || 0);
            fullAmount += parseFloat(finalTotal.toFixed(2))

            const order = await prisma.order.create({
                data: {
                    userId,
                     storeId,
                     addressId,
                     total: parseFloat(finalTotal.toFixed(2)),
                     deliveryCharges: deliveryCharges || 0,
                     paymentMethod,
                     isCouponUsed: coupon ? true : false,
                     coupon: coupon ? {code: coupon.code, discount: coupon.discount} : {},
                      orderItems: {
                        create: sellerItems.map(item => ({
                            productId: item.id,
                            quantity: item.quantity,
                            price: item.price,
                            selectedVariant: item.selectedVariant || null
                        }))
                      }
                },
                include: {
                    orderItems: true,
                    user: true,
                    store: true
                }
            })
            orderIds.push(order.id)

            // Send SMS notification to seller
            try {
                console.log('[Order SMS] 📱 Starting SMS notification process...');
                console.log('[Order SMS] Order ID:', order.id);
                console.log('[Order SMS] Store ID:', order.storeId);
                console.log('[Order SMS] Store contact number:', order.store.contact);
                
                // Use store contact number (available on Store model)
                const sellerPhone = order.store.contact;

                if (sellerPhone) {
                    console.log('[Order SMS] ✅ Phone found, sending SMS...');
                    const message = formatOrderNotificationMessage(order, order.user);
                    console.log('[Order SMS] Message:', message);
                    const result = await sendSMS(sellerPhone, message);
                    console.log(`[Order SMS] ✅ SMS sent to seller: ${sellerPhone}`, result?.sid);
                } else {
                    console.log('[Order SMS] ⚠️ Seller phone number not found in store contact');
                }
            } catch (smsError) {
                console.error('[Order SMS] ❌ Failed to send SMS notification:', smsError.message);
                console.error('[Order SMS] Full error:', smsError);
                // Don't fail the order if SMS fails - continue with order creation
            }
         }

         if(paymentMethod === 'STRIPE'){
            const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
            const origin = await request.headers.get('origin')

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data:{
                        currency: 'usd',
                        product_data:{
                            name: 'Order'
                        },
                        unit_amount: Math.round(fullAmount * 100)
                    },
                    quantity: 1
                }],
                expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // current time + 30 minutes
                mode: 'payment',
                success_url: `${origin}/loading?nextUrl=orders`,
                cancel_url: `${origin}/cart`,
                metadata: {
                    orderIds: orderIds.join(','),
                    userId,
                    appId: process.env.NEXT_PUBLIC_APP_ID || 'gocart'
                }
            })
            return NextResponse.json({session})
         }

          // clear the cart
          await prisma.user.update({
            where: {id: userId},
            data: {cart : {}}
          })

          return NextResponse.json({message: 'Orders Placed Successfully'})

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}

// Get all orders for a user
export async function GET(request){
    try {
        const { userId } = getAuth(request)
        const orders = await prisma.order.findMany({
            where: {userId, OR: [
                {paymentMethod: PaymentMethod.COD},
                {AND: [{paymentMethod: PaymentMethod.STRIPE}, {isPaid: true}]}
            ]},
            include: {
                orderItems: {include: {product: true}},
                address: true,
                store: true
            },
            orderBy: {createdAt: 'desc'}
        })

        return NextResponse.json({orders})
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}