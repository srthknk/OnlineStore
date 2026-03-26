import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Get all approved stores
export async function GET(request){
    try {
        const { userId } = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 })
        }

        const stores = await prisma.store.findMany({
            where: { status: 'approved' },
            include: { user: true }
        })

        return NextResponse.json({ stores })

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}

// Delete store
export async function DELETE(request){
    try {
        const { userId } = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 })
        }

        const { searchParams } = request.nextUrl
        const storeId = searchParams.get('storeId')

        if (!storeId) {
            return NextResponse.json({ error: 'Store ID is required' }, { status: 400 })
        }

        // Check if store exists
        const store = await prisma.store.findUnique({
            where: { id: storeId }
        })

        if (!store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 })
        }

        // Delete all products associated with the store (cascade will handle OrderItems)
        await prisma.product.deleteMany({
            where: { storeId }
        })

        // Delete all orders associated with the store
        await prisma.order.deleteMany({
            where: { storeId }
        })

        // Delete the store
        await prisma.store.delete({
            where: { id: storeId }
        })

        return NextResponse.json({ message: 'Store deleted successfully' })

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}