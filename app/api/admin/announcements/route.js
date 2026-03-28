import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Get all announcements (paginated)
export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const type = searchParams.get('type');
        const status = searchParams.get('status') || 'ACTIVE';

        const skip = (page - 1) * limit;

        // Build filter
        const filter = { status };
        if (type) filter.type = type;

        // Get announcements with store details
        const announcements = await prisma.announcement.findMany({
            where: filter,
            include: {
                storeAnnouncements: {
                    include: {
                        store: {
                            select: { id: true, name: true, username: true, logo: true }
                        },
                        reads: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });

        // Get total count
        const total = await prisma.announcement.count({ where: filter });

        // Format response
        const formattedAnnouncements = announcements.map(ann => ({
            ...ann,
            storeCount: ann.storeAnnouncements.length,
            stores: ann.storeAnnouncements.map(sa => ({
                id: sa.store.id,
                name: sa.store.name,
                username: sa.store.username,
                logo: sa.store.logo,
                readCount: sa.reads.length
            }))
        }));

        return NextResponse.json({
            success: true,
            data: formattedAnnouncements,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// Create new announcement
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 });
        }

        const { title, content, type, storeIds } = await request.json();

        // Validate input
        if (!title || !content || !storeIds || storeIds.length === 0) {
            return NextResponse.json({ 
                error: 'title, content, and at least one storeId are required' 
            }, { status: 400 });
        }

        if (!['NORMAL', 'URGENT', 'HIGHLY_URGENT'].includes(type)) {
            return NextResponse.json({ 
                error: 'Invalid announcement type' 
            }, { status: 400 });
        }

        // Create announcement
        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                type,
                createdBy: userId,
                storeAnnouncements: {
                    create: storeIds.map(storeId => ({
                        storeId
                    }))
                }
            },
            include: {
                storeAnnouncements: {
                    include: {
                        store: {
                            select: { id: true, name: true, username: true, logo: true }
                        }
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: `Announcement sent to ${storeIds.length} store(s)`,
            data: announcement
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// Delete announcement
export async function DELETE(request) {
    try {
        const { userId } = getAuth(request);
        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const announcementId = searchParams.get('id');

        if (!announcementId) {
            return NextResponse.json({ error: 'announcement id is required' }, { status: 400 });
        }

        await prisma.announcement.update({
            where: { id: announcementId },
            data: { status: 'ARCHIVED' }
        });

        return NextResponse.json({
            success: true,
            message: 'Announcement archived successfully'
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
