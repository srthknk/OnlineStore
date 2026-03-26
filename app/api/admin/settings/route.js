import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Get settings
export async function GET(request) {
    try {
        const settings = await prisma.settings.findUnique({
            where: { id: "default" }
        })

        if (!settings) {
            // Create default settings if they don't exist
            const newSettings = await prisma.settings.create({
                data: { id: "default" }
            })
            return NextResponse.json(newSettings)
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Settings API Error:', error);
        // Return default settings on error instead of 400
        return NextResponse.json({
            id: "default",
            storeName: "My Store",
            bannerImage1: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200",
            bannerImage2: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200",
            bannerImage3: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1200",
            bannerTitle1: "Explore Our Collection",
            bannerTitle2: "Special Offers",
            bannerTitle3: "New Arrivals",
            bannerLink1: "/shop",
            bannerLink2: "/shop",
            bannerLink3: "/shop",
            email: "contact@example.com",
            phone: "+1-212-456-7890",
            address: "794 Francisco, 94102",
            facebookUrl: "https://www.facebook.com",
            instagramUrl: "https://www.instagram.com",
            twitterUrl: "https://twitter.com",
            linkedinUrl: "https://www.linkedin.com",
            whatsappLink: "https://wa.me/"
        }, { status: 200 })
    }
}

// Update settings
export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 })
        }

        const { 
            storeName, 
            bannerImage1, bannerImage2, bannerImage3, bannerImage4, bannerImage5,
            bannerTitle1, bannerTitle2, bannerTitle3, bannerTitle4, bannerTitle5,
            bannerLink1, bannerLink2, bannerLink3, bannerLink4, bannerLink5,
            email, phone, address,
            facebookUrl, instagramUrl, twitterUrl, linkedinUrl, whatsappLink
        } = await request.json()

        const settings = await prisma.settings.upsert({
            where: { id: "default" },
            update: {
                ...(storeName && { storeName }),
                ...(bannerImage1 && { bannerImage1 }),
                ...(bannerImage2 && { bannerImage2 }),
                ...(bannerImage3 && { bannerImage3 }),
                ...(bannerImage4 && { bannerImage4 }),
                ...(bannerImage5 && { bannerImage5 }),
                ...(bannerTitle1 && { bannerTitle1 }),
                ...(bannerTitle2 && { bannerTitle2 }),
                ...(bannerTitle3 && { bannerTitle3 }),
                ...(bannerTitle4 && { bannerTitle4 }),
                ...(bannerTitle5 && { bannerTitle5 }),
                ...(bannerLink1 && { bannerLink1 }),
                ...(bannerLink2 && { bannerLink2 }),
                ...(bannerLink3 && { bannerLink3 }),
                ...(bannerLink4 && { bannerLink4 }),
                ...(bannerLink5 && { bannerLink5 }),
                ...(email && { email }),
                ...(phone && { phone }),
                ...(address && { address }),
                ...(facebookUrl && { facebookUrl }),
                ...(instagramUrl && { instagramUrl }),
                ...(twitterUrl && { twitterUrl }),
                ...(linkedinUrl && { linkedinUrl }),
                ...(whatsappLink && { whatsappLink })
            },
            create: {
                id: "default",
                storeName: storeName || "My Store",
                bannerImage1: bannerImage1 || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200",
                bannerImage2: bannerImage2 || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200",
                bannerImage3: bannerImage3 || "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1200",
                bannerImage4: bannerImage4 || "",
                bannerImage5: bannerImage5 || "",
                bannerTitle1: bannerTitle1 || "Explore Our Collection",
                bannerTitle2: bannerTitle2 || "Special Offers",
                bannerTitle3: bannerTitle3 || "New Arrivals",
                bannerTitle4: bannerTitle4 || "",
                bannerTitle5: bannerTitle5 || "",
                bannerLink1: bannerLink1 || "/shop",
                bannerLink2: bannerLink2 || "/shop",
                bannerLink3: bannerLink3 || "/shop",
                bannerLink4: bannerLink4 || "/shop",
                bannerLink5: bannerLink5 || "/shop",
                email: email || "contact@example.com",
                phone: phone || "+1-212-456-7890",
                address: address || "794 Francisco, 94102",
                facebookUrl: facebookUrl || "https://www.facebook.com",
                instagramUrl: instagramUrl || "https://www.instagram.com",
                twitterUrl: twitterUrl || "https://twitter.com",
                linkedinUrl: linkedinUrl || "https://www.linkedin.com",
                whatsappLink: whatsappLink || "https://wa.me/"
            }
        })

        return NextResponse.json({ message: "Settings updated", settings })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}
