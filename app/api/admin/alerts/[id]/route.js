import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

// PUT update alert
export async function PUT(req, { params }) {
    try {
        console.log('📍 PUT /api/admin/alerts/[id] - Starting request')
        
        let userId;
        try {
            const authData = await auth()
            userId = authData?.userId
        } catch (authError) {
            console.error('⚠️ Auth error:', authError.message)
            userId = null
        }

        if (!userId) {
            return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const { title, message, type, bgColor, textColor, icon, priority, isActive, expiresAt } = await req.json()

        const alert = await prisma.alert.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(message && { message }),
                ...(type && { type }),
                ...(bgColor && { bgColor }),
                ...(textColor && { textColor }),
                ...(icon !== undefined && { icon }),
                ...(priority !== undefined && { priority }),
                ...(isActive !== undefined && { isActive }),
                ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null })
            }
        })

        console.log('✅ Alert updated successfully:', id)
        return Response.json({
            success: true,
            message: 'Alert updated successfully',
            alert: alert
        })
    } catch (error) {
        console.error('❌ Error updating alert:', error.message)
        return Response.json({
            success: false,
            message: 'Failed to update alert',
            error: error.message
        }, { status: 500 })
    }
}

// DELETE alert
export async function DELETE(req, { params }) {
    try {
        console.log('📍 DELETE /api/admin/alerts/[id] - Starting request')
        
        let userId;
        try {
            const authData = await auth()
            userId = authData?.userId
        } catch (authError) {
            console.error('⚠️ Auth error:', authError.message)
            userId = null
        }

        if (!userId) {
            return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        await prisma.alert.delete({
            where: { id }
        })

        console.log('✅ Alert deleted successfully:', id)
        return Response.json({
            success: true,
            message: 'Alert deleted successfully'
        })
    } catch (error) {
        console.error('❌ Error deleting alert:', error.message)
        return Response.json({
            success: false,
            message: 'Failed to delete alert',
            error: error.message
        }, { status: 500 })
    }
}
