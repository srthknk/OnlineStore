import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/delivery-partners/register
 * Register a new delivery partner
 */
export async function POST(req) {
  try {
    // Verify prisma client is initialized
    if (!prisma || !prisma.deliveryPartner) {
      console.error('Prisma client not initialized properly');
      return Response.json(
        { message: 'Database connection failed. Please try again.' },
        { status: 500 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { firstName, lastName, phone, email, address, photoUrl, selectedStoreId } = await req.json();

    // Validation
    if (!firstName || !lastName || !phone || !email || !address || !selectedStoreId) {
      return Response.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate first name starts with capital letter
    if (!/^[A-Z]/.test(firstName)) {
      return Response.json(
        { message: 'First name must start with a capital letter' },
        { status: 400 }
      );
    }

    // Validate last name starts with capital letter
    if (!/^[A-Z]/.test(lastName)) {
      return Response.json(
        { message: 'Last name must start with a capital letter' },
        { status: 400 }
      );
    }

    // Validate Gmail
    if (!email.includes('@gmail.com')) {
      return Response.json(
        { message: 'Only Gmail addresses are accepted' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingPartner = await prisma.deliveryPartner.findUnique({
      where: { email },
    });

    if (existingPartner) {
      return Response.json(
        { message: 'This Gmail is already registered' },
        { status: 400 }
      );
    }

    // Check if user already has a delivery partner profile
    const existingProfile = await prisma.deliveryPartner.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return Response.json(
        { message: 'You already have a delivery partner profile' },
        { status: 400 }
      );
    }

    // Verify store exists
    const store = await prisma.store.findUnique({
      where: { id: selectedStoreId },
    });

    if (!store) {
      return Response.json(
        { message: 'Selected store does not exist' },
        { status: 400 }
      );
    }

    // Create delivery partner record
    const deliveryPartner = await prisma.deliveryPartner.create({
      data: {
        userId,
        firstName,
        lastName,
        phone,
        email,
        address,
        photoUrl: photoUrl || null,
        selectedStoreId,
        status: 'PENDING', // Initially pending admin approval
      },
    });

    return Response.json(
      {
        message: 'Registration successful. Awaiting admin approval.',
        deliveryPartner,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
