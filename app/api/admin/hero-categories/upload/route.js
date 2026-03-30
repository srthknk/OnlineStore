import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import imagekit from '@/configs/imageKit'

// POST - Upload image using ImageKit
export async function POST(request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            )
        }

        const formData = await request.formData()
        const file = formData.get('file')

        if (!file) {
            return NextResponse.json(
                { success: false, message: 'No file provided' },
                { status: 400 }
            )
        }

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer())
        const fileName = `hero-${Date.now()}-${file.name}`

        // Upload to ImageKit
        const response = await imagekit.upload({
            file: buffer,
            fileName: fileName,
            folder: '/hero-categories'
        })

        console.log('[Hero Upload] ✅ Image uploaded:', response.url)

        return NextResponse.json({
            success: true,
            message: 'Image uploaded successfully',
            url: response.url,
            fileId: response.fileId
        })
    } catch (error) {
        console.error('[Hero Upload] ❌ Error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to upload image', error: error.message },
            { status: 500 }
        )
    }
}
