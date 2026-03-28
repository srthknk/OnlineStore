import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

// GET all alerts
export async function GET() {
    try {
        console.log('📍 GET /api/admin/alerts - Starting request')
        
        let userId;
        try {
            const authData = await auth()
            userId = authData?.userId
            console.log('✅ Auth data retrieved, userId:', userId)
        } catch (authError) {
            console.error('⚠️ Auth error (might be expected):', authError.message)
            userId = null
        }

        if (!userId) {
            console.log('❌ No userId found, returning 401')
            return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        // Test if Prisma is working
        console.log('🔍 Attempting to fetch alerts from database...')
        const alerts = await prisma.alert.findMany({
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' }
            ]
        })
        
        console.log('✅ Successfully fetched alerts:', alerts.length)
        return Response.json({
            success: true,
            alerts: alerts,
            total: alerts.length
        })
    } catch (error) {
        console.error('❌ Error in GET /api/admin/alerts:')
        console.error('   Error name:', error.name)
        console.error('   Error message:', error.message)
        console.error('   Error code:', error.code)
        console.error('   Stack:', error.stack)
        
        return Response.json({
            success: false,
            message: 'Failed to fetch alerts',
            error: error.message,
            errorCode: error.code
        }, { status: 500 })
    }
}

// POST create new alert
export async function POST(req) {
    try {
        console.log('📍 POST /api/admin/alerts - Starting request')
        
        let userId;
        try {
            const authData = await auth()
            userId = authData?.userId
            console.log('✅ Auth data retrieved, userId:', userId)
        } catch (authError) {
            console.error('⚠️ Auth error (might be expected):', authError.message)
            userId = null
        }

        if (!userId) {
            console.log('❌ No userId found, returning 401')
            return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const { title, message, type = 'INFO', bgColor = 'from-emerald-600 to-green-600', textColor = 'text-white', icon, priority = 1, expiresAt } = await req.json()

        if (!title || !message) {
            return Response.json({
                success: false,
                message: 'Title and message are required'
            }, { status: 400 })
        }

        console.log('📝 Creating alert with data:', { title, message, type, priority })
        const alert = await prisma.alert.create({
            data: {
                title,
                message,
                type,
                bgColor,
                textColor,
                icon,
                priority,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                createdBy: userId,
                isActive: true
            }
        })

        console.log('✅ Alert created successfully:', alert.id)
        return Response.json({
            success: true,
            message: 'Alert created successfully',
            alert: alert
        }, { status: 201 })
    } catch (error) {
        console.error('❌ Error in POST /api/admin/alerts:')
        console.error('   Error name:', error.name)
        console.error('   Error message:', error.message)
        console.error('   Error code:', error.code)
        console.error('   Stack:', error.stack)
        
        return Response.json({
            success: false,
            message: 'Failed to create alert',
            error: error.message,
            errorCode: error.code
        }, { status: 500 })
    }
}
