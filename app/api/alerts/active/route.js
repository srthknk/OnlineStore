import prisma from "@/lib/prisma"

export async function GET() {
    try {
        const alert = await prisma.alert.findFirst({
            where: {
                isActive: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' }
            ]
        })

        return Response.json({
            success: true,
            alert: alert || null
        })
    } catch (error) {
        console.error('Error fetching alert:', error)
        return Response.json({
            success: false,
            message: 'Failed to fetch alert'
        }, { status: 500 })
    }
}
