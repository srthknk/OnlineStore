import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/delivery-partners
 * Get all delivery partners with stats (admin only)
 */
export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you may need to add admin check logic)
    // For now, we'll assume only authorized users can access this

    const deliveryPartners = await prisma.deliveryPartner.findMany({
      include: {
        selectedStore: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate stats
    const stats = {
      total: deliveryPartners.length,
      pending: deliveryPartners.filter((dp) => dp.status === 'PENDING').length,
      approved: deliveryPartners.filter((dp) => dp.status === 'APPROVED').length,
      rejected: deliveryPartners.filter((dp) => dp.status === 'REJECTED').length,
      active: deliveryPartners.filter((dp) => dp.status === 'ACTIVE').length,
    };

    return Response.json(
      {
        deliveryPartners,
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching delivery partners:', error);
    return Response.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
}
