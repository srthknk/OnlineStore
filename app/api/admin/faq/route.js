import prisma from "@/lib/prisma"
import authAdmin from "@/middlewares/authAdmin"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Get all FAQs (Public - no auth required)
export async function GET(request) {
    try {
        console.log('Fetching FAQs...')
        const faqs = await prisma.fAQ.findMany({
            orderBy: { createdAt: 'desc' }
        })
        console.log('FAQs fetched successfully:', faqs.length)
        return NextResponse.json({ faqs })
    } catch (error) {
        console.error('FAQ GET Error:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        return NextResponse.json({ 
            error: 'Failed to fetch FAQs',
            message: error.message,
            code: error.code
        }, { status: 500 })
    }
}

// Add FAQ (Admin only)
export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 })
        }

        const { question, answer } = await request.json()

        if (!question || !answer) {
            return NextResponse.json({ error: 'missing fields' }, { status: 400 })
        }

        const faq = await prisma.fAQ.create({
            data: { question, answer }
        })

        return NextResponse.json({ faq })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}

// Delete FAQ (Admin only)
export async function DELETE(request) {
    try {
        const { userId } = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 })
        }

        await prisma.fAQ.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'FAQ deleted' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}
