import prisma from "@/lib/prisma"

export async function GET() {
    try {
        // Check if prisma is connected
        if (!prisma) {
            console.error('[Alerts API] Prisma client not initialized')
            return Response.json({
                success: false,
                message: 'Database connection failed'
            }, { status: 500 })
        }

        console.log('[Alerts API] 🔍 Fetching active alert...')

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

        console.log('[Alerts API] ✅ Alert fetched:', alert ? 'Found' : 'No active alert')

        return Response.json({
            success: true,
            alert: alert || null
        })
    } catch (error) {
        console.error('[Alerts API] ❌ Error fetching alert:', error)
        console.error('[Alerts API] Error code:', error.code)
        console.error('[Alerts API] Error message:', error.message)
        console.error('[Alerts API] Full error:', JSON.stringify(error, null, 2))

        // Return gracefully instead of 500
        return Response.json({
            success: true,
            alert: null,
            message: 'Could not fetch alert, returning null'
        }, { status: 200 })
    }
}
