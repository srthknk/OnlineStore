import prisma from '@/lib/prisma';

/**
 * GET /api/stores/list
 * Get list of all active stores
 */
export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        username: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return Response.json({ stores }, { status: 200 });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return Response.json(
      { message: 'An error occurred while fetching stores' },
      { status: 500 }
    );
  }
}
