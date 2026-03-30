import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/admin/delivery-partners/[id]/approve
 * Approve a delivery partner
 */
export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const deliveryPartner = await prisma.deliveryPartner.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: userId,
      },
    });

    return Response.json(
      {
        message: 'Delivery partner approved successfully',
        deliveryPartner,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error approving delivery partner:', error);
    return Response.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
}
