import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


// Update user cart 
export async function POST(request){
    try {
        const { userId } = getAuth(request)
        const { cart } = await request.json()

        // Check if user exists, if not create it
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        })

        if(!existingUser){
            // Get user data from Clerk
            const { clerkClient } = await import('@clerk/nextjs/server')
            const client = await clerkClient()
            const clerkUser = await client.users.getUser(userId)
            
            // Create user in Prisma
            await prisma.user.create({
                data: {
                    id: userId,
                    name: (clerkUser.firstName || '') + ' ' + (clerkUser.lastName || '') || 'User',
                    email: clerkUser.emailAddresses[0].emailAddress,
                    image: clerkUser.imageUrl || '',
                    cart: cart
                }
            })
        } else {
            // Update existing user's cart
            await prisma.user.update({
                where: {id: userId},
                data: {cart: cart}
            })
        }

        return NextResponse.json({ message: 'Cart updated' })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}

// Get user cart 
export async function GET(request){
    try {
        const { userId } = getAuth(request)
        
        const user = await prisma.user.findUnique({
            where: {id: userId}
        })

        if(!user){
            return NextResponse.json({ cart: {} })
        }

        return NextResponse.json({ cart: user.cart })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}