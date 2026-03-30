import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/delivery-partners/approved
 * Get all approved/active delivery partners (admin only)
 */
export async function GET(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminUser = await prisma.admin.findUnique({
      where: { userId },
    });

    if (!adminUser) {
      return Response.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get approved and active delivery partners
    const deliveryPartners = await prisma.deliveryPartner.findMany({
      where: {
        status: {
          in: ['APPROVED', 'ACTIVE'],
        }
      },
      include: {
        selectedStore: {
          select: {
            id: true,
            name: true,
          }
        },
      },
      orderBy: {
        totalDeliveries: 'desc',
      },
    });

    const formattedPartners = deliveryPartners.map(dp => ({
      id: dp.id,
      firstName: dp.firstName,
      lastName: dp.lastName,
      fullName: `${dp.firstName} ${dp.lastName}`,
      email: dp.email,
      phone: dp.phone,
      selectedStore: dp.selectedStore,
      totalDeliveries: dp.totalDeliveries,
      successfulDeliveries: dp.successfulDeliveries,
      averageRating: dp.averageRating,
      status: dp.status,
    }));

    return Response.json(
      {
        deliveryPartners: formattedPartners,
        total: formattedPartners.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching approved delivery partners:', error);
    return Response.json(
      { message: 'Error fetching delivery partners' },
      { status: 500 }
    );
  }
}
