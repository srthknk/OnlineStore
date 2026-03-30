import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Seed default categories on first request
async function seedDefaultCategories() {
    try {
        const count = await prisma.heroCategory.count()
        if (count === 0) {
            const defaults = [
                { title: 'Paan Corner', image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd64b73?w=200', displayOrder: 1 },
                { title: 'Dairy/Bread/Eggs', image: 'https://images.unsplash.com/photo-1585707567949-5d1b2e4e3c4a?w=200', displayOrder: 2 },
                { title: 'Fruits & Vegetables', image: 'https://images.unsplash.com/photo-1488459716781-6818bcad7f5d?w=200', displayOrder: 3 },
                { title: 'Cold Drinks & Juices', image: 'https://images.unsplash.com/photo-1556821552-5d2b49ebc8d5?w=200', displayOrder: 4 },
                { title: 'Snacks & Munchies', image: 'https://images.unsplash.com/photo-1599599810964-a8eae8cd6bfd?w=200', displayOrder: 5 },
                { title: 'Breakfast & Instant Food', image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=200', displayOrder: 6 },
                { title: 'Sweet Tooth', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200', displayOrder: 7 },
                { title: 'Bakery & Biscuits', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200', displayOrder: 8 },
                { title: 'Tea/Coffee/Milk Drinks', image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=200', displayOrder: 9 },
                { title: 'Atta/Rice/Dal', image: 'https://images.unsplash.com/photo-1595697911007-6b2b3b773b91?w=200', displayOrder: 10 }
            ]

            for (const cat of defaults) {
                await prisma.heroCategory.create({ data: cat })
            }
            console.log('[Hero Categories] ✅ Seeded default categories')
        }
    } catch (error) {
        console.error('[Hero Categories] Error seeding:', error)
    }
}

// GET - Fetch all hero categories
export async function GET(request) {
    try {
        await seedDefaultCategories()

        const categories = await prisma.heroCategory.findMany({
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' }
        })

        return NextResponse.json({
            success: true,
            categories
        })
    } catch (error) {
        console.error('[Hero Categories API] Error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch categories', error: error.message },
            { status: 500 }
        )
    }
}

// POST - Add new category (auth required)
export async function POST(request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            )
        }

        const data = await request.json()
        const { title, image, redirectUrl } = data

        if (!title?.trim()) {
            return NextResponse.json(
                { success: false, message: 'Title is required' },
                { status: 400 }
            )
        }

        // Get max displayOrder
        const maxOrder = await prisma.heroCategory.aggregate({
            _max: { displayOrder: true }
        })

        const newCategory = await prisma.heroCategory.create({
            data: {
                title: title.trim(),
                image: image || '',
                redirectUrl: redirectUrl || `/shop?category=${title.trim()}`,
                displayOrder: (maxOrder._max.displayOrder || 0) + 1
            }
        })

        console.log('[Hero Categories API] ✅ Category created:', newCategory.title)
        return NextResponse.json({
            success: true,
            message: 'Category added successfully',
            category: newCategory
        })
    } catch (error) {
        console.error('[Hero Categories API] POST Error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to add category', error: error.message },
            { status: 500 }
        )
    }
}

// PUT - Update existing category (auth required)
export async function PUT(request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            )
        }

        const data = await request.json()
        const { id, title, image, redirectUrl, displayOrder } = data

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Category ID is required' },
                { status: 400 }
            )
        }

        // Verify category exists
        const existing = await prisma.heroCategory.findUnique({ where: { id } })
        if (!existing) {
            return NextResponse.json(
                { success: false, message: 'Category not found' },
                { status: 404 }
            )
        }

        const updated = await prisma.heroCategory.update({
            where: { id },
            data: {
                ...(title && { title: title.trim() }),
                ...(image !== undefined && { image }),
                ...(redirectUrl !== undefined && { redirectUrl }),
                ...(displayOrder !== undefined && { displayOrder })
            }
        })

        console.log('[Hero Categories API] ✅ Category updated:', updated.title)
        return NextResponse.json({
            success: true,
            message: 'Category updated successfully',
            category: updated
        })
    } catch (error) {
        console.error('[Hero Categories API] PUT Error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to update category', error: error.message },
            { status: 500 }
        )
    }
}

// DELETE - Remove category (auth required)
export async function DELETE(request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            )
        }

        const data = await request.json()
        const { id } = data

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Category ID is required' },
                { status: 400 }
            )
        }

        const deleted = await prisma.heroCategory.delete({ where: { id } })

        console.log('[Hero Categories API] ✅ Category deleted:', deleted.title)
        return NextResponse.json({
            success: true,
            message: 'Category deleted successfully'
        })
    } catch (error) {
        console.error('[Hero Categories API] DELETE Error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to delete category', error: error.message },
            { status: 500 }
        )
    }
}
