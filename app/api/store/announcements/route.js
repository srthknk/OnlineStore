import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Get announcements for a specific store
export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        const storeId = await authSeller(userId);

        if (!storeId) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const includeRead = searchParams.get('includeRead') === 'true';

        // Get announcements for this store
        const announcementStores = await prisma.announcementStore.findMany({
            where: {
                storeId,
                announcement: {
                    status: 'ACTIVE'
                }
            },
            include: {
                announcement: true,
                reads: {
                    where: { storeId }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Filter by type if specified
        let filtered = announcementStores;
        if (type) {
            filtered = announcementStores.filter(as => as.announcement.type === type);
        }

        // Filter unread if not specified to include read
        if (!includeRead) {
            filtered = filtered.filter(as => as.reads.length === 0);
        }

        const announcements = filtered.map(as => ({
            id: as.id,
            announcementId: as.announcement.id,
            title: as.announcement.title,
            content: as.announcement.content,
            type: as.announcement.type,
            createdAt: as.announcement.createdAt,
            updatedAt: as.announcement.updatedAt,
            isRead: as.reads.length > 0,
            readAt: as.reads[0]?.readAt,
            readStatus: as.reads[0]?.status
        }));

        // Get counts
        const unreadCount = announcements.filter(a => !a.isRead).length;
        const readCount = announcements.filter(a => a.isRead).length;

        return NextResponse.json({
            success: true,
            data: announcements,
            counts: {
                total: announcements.length,
                unread: unreadCount,
                read: readCount
            }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// Get specific announcement details
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const storeId = await authSeller(userId);

        if (!storeId) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 });
        }

        const { announcementStoreId, action } = await request.json();

        if (!announcementStoreId) {
            return NextResponse.json({ error: 'announcementStoreId is required' }, { status: 400 });
        }

        // Verify this announcement is for this store
        const announcementStore = await prisma.announcementStore.findUnique({
            where: { id: announcementStoreId }
        });

        if (!announcementStore || announcementStore.storeId !== storeId) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 });
        }

        // Update or create read record
        const read = await prisma.announcementRead.upsert({
            where: {
                announcementStoreId_storeId: {
                    announcementStoreId,
                    storeId
                }
            },
            update: {
                status: action || 'read',
                readAt: new Date()
            },
            create: {
                announcementStoreId,
                storeId,
                status: action || 'read'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Announcement marked as ' + (action || 'read'),
            data: read
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
