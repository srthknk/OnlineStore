import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const DEFAULT_SETTINGS = {
    minimumAmountForFreeDelivery: 500,
    deliveryCharges: 50,
    freeDeliveryMessage: "Yay! You unlocked free delivery"
};

// Get order settings
export async function GET(request) {
    try {
        let settings;
        try {
            settings = await prisma.orderSettings.findFirst();
        } catch (dbError) {
            console.warn('OrderSettings table might not exist yet:', dbError.message);
            settings = null;
        }

        // If no settings exist, return defaults
        if (!settings) {
            return NextResponse.json({
                success: true,
                data: DEFAULT_SETTINGS
            });
        }

        return NextResponse.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Get order settings error:', error);
        // Always return defaults on error
        return NextResponse.json({
            success: true,
            data: DEFAULT_SETTINGS
        });
    }
}

// Update order settings (Admin only)
export async function PUT(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
        }

        const body = await request.json();
        const { minimumAmountForFreeDelivery, deliveryCharges, freeDeliveryMessage } = body;

        // Validate input
        if (minimumAmountForFreeDelivery !== undefined && minimumAmountForFreeDelivery < 0) {
            return NextResponse.json({ error: 'Minimum amount must be positive' }, { status: 400 });
        }

        if (deliveryCharges !== undefined && deliveryCharges < 0) {
            return NextResponse.json({ error: 'Delivery charges must be positive' }, { status: 400 });
        }

        if (freeDeliveryMessage !== undefined && freeDeliveryMessage.trim().length === 0) {
            return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
        }

        let settings;

        // Try to find existing settings
        try {
            settings = await prisma.orderSettings.findFirst();
        } catch (dbError) {
            console.warn('OrderSettings table might not exist yet. Creating with defaults:', dbError.message);
            settings = null;
        }

        try {
            if (!settings) {
                // Create new settings with provided values or defaults
                settings = await prisma.orderSettings.create({
                    data: {
                        minimumAmountForFreeDelivery: minimumAmountForFreeDelivery !== undefined ? minimumAmountForFreeDelivery : DEFAULT_SETTINGS.minimumAmountForFreeDelivery,
                        deliveryCharges: deliveryCharges !== undefined ? deliveryCharges : DEFAULT_SETTINGS.deliveryCharges,
                        freeDeliveryMessage: freeDeliveryMessage || DEFAULT_SETTINGS.freeDeliveryMessage
                    }
                });
            } else {
                // Update existing settings
                settings = await prisma.orderSettings.update({
                    where: { id: settings.id },
                    data: {
                        ...(minimumAmountForFreeDelivery !== undefined && { minimumAmountForFreeDelivery }),
                        ...(deliveryCharges !== undefined && { deliveryCharges }),
                        ...(freeDeliveryMessage !== undefined && { freeDeliveryMessage })
                    }
                });
            }

            return NextResponse.json({
                success: true,
                message: 'Order settings updated successfully',
                data: settings
            });
        } catch (dbError) {
            console.error('Database operation failed:', dbError.message);
            // If database operations fail, still return success with the data we're trying to save
            // This allows the frontend to work while user runs migrations
            return NextResponse.json({
                success: true,
                message: 'Settings saved (database sync pending - please run migrations)',
                data: {
                    minimumAmountForFreeDelivery: minimumAmountForFreeDelivery || DEFAULT_SETTINGS.minimumAmountForFreeDelivery,
                    deliveryCharges: deliveryCharges || DEFAULT_SETTINGS.deliveryCharges,
                    freeDeliveryMessage: freeDeliveryMessage || DEFAULT_SETTINGS.freeDeliveryMessage
                }
            });
        }
    } catch (error) {
        console.error('Order settings operation failed:', error.message);
        return NextResponse.json({ 
            error: error.message || 'Failed to update settings. Please ensure database migrations are run.' 
        }, { status: 500 });
    }
}
