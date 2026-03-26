import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


// Verify coupon
export async function POST(request){
    try {
        const {userId, has} = getAuth(request)
        const { code } = await request.json()

        const coupon = await prisma.coupon.findUnique({
            where: {code: code.toUpperCase(),
                expiresAt: {gt: new Date()}
            }
        })

        if (!coupon){
            return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
        }

        // Check eligibility for both filters
        const userorders = await prisma.order.findMany({where: {userId}})
        const isNewUser = userorders.length === 0
        const hasPlusPlan = has({plan: 'plus'})

        // If either filter is set, check if user meets at least one condition
        if (coupon.forNewUser || coupon.forMember) {
            const canUseAsNewUser = coupon.forNewUser && isNewUser
            const canUseAsMember = coupon.forMember && hasPlusPlan
            
            // User must meet at least one eligibility condition
            if (!canUseAsNewUser && !canUseAsMember) {
                return NextResponse.json({ error: "Coupon not valid for your account type" }, { status: 400 })
            }
        }

        return NextResponse.json({coupon})
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}