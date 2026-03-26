import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Enable caching for 60 seconds
export const revalidate = 60;

export async function GET(request){
    try {
        let products = await prisma.product.findMany({
            where: {inStock: true },
            include: {
                rating: {
                    select: {
                        createdAt: true, rating: true, review: true,
                        user: {select: {name: true, image: true}}
                    }
                },
                store: true,
                productVariants: true
            },
            orderBy: {createdAt: 'desc'}
        })

        // remove products with store isActive false
        products = products.filter(product => product.store.isActive)
        const response = NextResponse.json({products})
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
        return response
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
    }
}