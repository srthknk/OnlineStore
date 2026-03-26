import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Validation helper functions
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/[^\d]/g, ''));
};

const validatePin = (pin) => {
    const pinRegex = /^[0-9]{6}$/;
    return pinRegex.test(pin.replace(/[^\d]/g, ''));
};

// Add new address
export async function POST(request){
    try {
        const { userId } = getAuth(request)
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { address } = await request.json()

        // Validation checks
        const errors = [];

        // Required field validation
        if (!address.name || address.name.trim() === '') {
            errors.push('Full Name is required');
        }
        if (!address.email || address.email.trim() === '') {
            errors.push('Email is required');
        } else if (!validateEmail(address.email)) {
            errors.push('Invalid email format');
        }
        if (!address.phone || address.phone.trim() === '') {
            errors.push('Phone number is required');
        } else if (!validatePhone(address.phone)) {
            errors.push('Phone number must be exactly 10 digits');
        }
        if (!address.house || address.house.trim() === '') {
            errors.push('House/Flat/Building number is required');
        }
        if (!address.area || address.area.trim() === '') {
            errors.push('Area/Street/Locality is required');
        }
        if (!address.city || address.city.trim() === '') {
            errors.push('City/Town/Village is required');
        }
        if (!address.state || address.state.trim() === '') {
            errors.push('State is required');
        }
        if (!address.district || address.district.trim() === '') {
            errors.push('District is required');
        }
        if (!address.pin || address.pin.trim() === '') {
            errors.push('PIN code is required');
        } else if (!validatePin(address.pin)) {
            errors.push('PIN code must be exactly 6 digits');
        }
        if (!address.addressType || address.addressType.trim() === '') {
            errors.push('Address type is required');
        }

        if (errors.length > 0) {
            return NextResponse.json({ error: errors.join('; ') }, { status: 422 })
        }

        address.userId = userId
        address.country = 'India' // Always set to India

        // If marking as default, unset default from all other addresses
        if (address.isDefault === true) {
            await prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false }
            })
        }

        const newAddress = await prisma.address.create({
            data: address
        })

        return NextResponse.json({newAddress, message: 'Address added successfully' })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}

// Get all addresses for a user
export async function GET(request){
    try {
        const { userId } = getAuth(request)

        const addresses = await prisma.address.findMany({
            where: { userId }
        })

        return NextResponse.json({addresses})
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}