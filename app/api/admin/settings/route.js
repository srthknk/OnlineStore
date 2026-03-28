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

        const body = await request.json()
        console.log('Request body received:', JSON.stringify(body, null, 2))
        
        const { 
            storeName = "My Store", 
            bannerImage1 = "", 
            bannerImage2 = "", 
            bannerImage3 = "", 
            bannerImage4 = "", 
            bannerImage5 = "",
            bannerTitle1 = "Best Products", 
            bannerTitle2 = "20% Discount", 
            bannerTitle3 = "New Arrivals", 
            bannerTitle4 = "", 
            bannerTitle5 = "",
            bannerLink1 = "/shop", 
            bannerLink2 = "/shop", 
            bannerLink3 = "/shop", 
            bannerLink4 = "/shop", 
            bannerLink5 = "/shop",
            featureCardTitle1 = "Pharmacy at your doorstep!", 
            featureCardDesc1 = "Cough syrups, pain relief sprays & more", 
            featureCardButton1 = "Order Now", 
            featureCardLink1 = "/shop?category=pharmacy",
            featureCardTitle2 = "Pet care supplies at your door", 
            featureCardDesc2 = "Food, treats, toys & more", 
            featureCardButton2 = "Order Now", 
            featureCardLink2 = "/shop?category=petcare",
            featureCardTitle3 = "No time for a diaper run?", 
            featureCardDesc3 = "Get baby care essentials", 
            featureCardButton3 = "Order Now", 
            featureCardLink3 = "/shop?category=baby",
            featureCardImage1 = "", 
            featureCardImage2 = "", 
            featureCardImage3 = "",
            email = "contact@example.com", 
            phone = "+1-212-456-7890", 
            address = "794 Francisco, 94102",
            facebookUrl = "https://www.facebook.com", 
            instagramUrl = "https://www.instagram.com", 
            twitterUrl = "https://twitter.com", 
            linkedinUrl = "https://www.linkedin.com", 
            whatsappLink = "https://wa.me/"
        } = body

        const settings = await prisma.settings.upsert({
            where: { id: "default" },
            update: {
                ...(storeName !== undefined && { storeName }),
                ...(bannerImage1 !== undefined && { bannerImage1 }),
                ...(bannerImage2 !== undefined && { bannerImage2 }),
                ...(bannerImage3 !== undefined && { bannerImage3 }),
                ...(bannerImage4 !== undefined && { bannerImage4 }),
                ...(bannerImage5 !== undefined && { bannerImage5 }),
                ...(bannerTitle1 !== undefined && { bannerTitle1 }),
                ...(bannerTitle2 !== undefined && { bannerTitle2 }),
                ...(bannerTitle3 !== undefined && { bannerTitle3 }),
                ...(bannerTitle4 !== undefined && { bannerTitle4 }),
                ...(bannerTitle5 !== undefined && { bannerTitle5 }),
                ...(bannerLink1 !== undefined && { bannerLink1 }),
                ...(bannerLink2 !== undefined && { bannerLink2 }),
                ...(bannerLink3 !== undefined && { bannerLink3 }),
                ...(bannerLink4 !== undefined && { bannerLink4 }),
                ...(bannerLink5 !== undefined && { bannerLink5 }),
                ...(featureCardTitle1 !== undefined && { featureCardTitle1 }),
                ...(featureCardDesc1 !== undefined && { featureCardDesc1 }),
                ...(featureCardButton1 !== undefined && { featureCardButton1 }),
                ...(featureCardLink1 !== undefined && { featureCardLink1 }),
                ...(featureCardTitle2 !== undefined && { featureCardTitle2 }),
                ...(featureCardDesc2 !== undefined && { featureCardDesc2 }),
                ...(featureCardButton2 !== undefined && { featureCardButton2 }),
                ...(featureCardLink2 !== undefined && { featureCardLink2 }),
                ...(featureCardTitle3 !== undefined && { featureCardTitle3 }),
                ...(featureCardDesc3 !== undefined && { featureCardDesc3 }),
                ...(featureCardButton3 !== undefined && { featureCardButton3 }),
                ...(featureCardLink3 !== undefined && { featureCardLink3 }),
                ...(featureCardImage1 !== undefined && { featureCardImage1 }),
                ...(featureCardImage2 !== undefined && { featureCardImage2 }),
                ...(featureCardImage3 !== undefined && { featureCardImage3 }),
                ...(email !== undefined && { email }),
                ...(phone !== undefined && { phone }),
                ...(address !== undefined && { address }),
                ...(facebookUrl !== undefined && { facebookUrl }),
                ...(instagramUrl !== undefined && { instagramUrl }),
                ...(twitterUrl !== undefined && { twitterUrl }),
                ...(linkedinUrl !== undefined && { linkedinUrl }),
                ...(whatsappLink !== undefined && { whatsappLink })
            },
            create: {
                id: "default",
                storeName: storeName || "",
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
                featureCardTitle1: featureCardTitle1 || "Pharmacy at your doorstep!",
                featureCardDesc1: featureCardDesc1 || "Cough syrups, pain relief sprays & more",
                featureCardButton1: featureCardButton1 || "Order Now",
                featureCardLink1: featureCardLink1 || "/shop?category=pharmacy",
                featureCardTitle2: featureCardTitle2 || "Pet care supplies at your door",
                featureCardDesc2: featureCardDesc2 || "Food, treats, toys & more",
                featureCardButton2: featureCardButton2 || "Order Now",
                featureCardLink2: featureCardLink2 || "/shop?category=petcare",
                featureCardTitle3: featureCardTitle3 || "No time for a diaper run?",
                featureCardDesc3: featureCardDesc3 || "Get baby care essentials",
                featureCardButton3: featureCardButton3 || "Order Now",
                featureCardLink3: featureCardLink3 || "/shop?category=baby",
                featureCardImage1: featureCardImage1 || "",
                featureCardImage2: featureCardImage2 || "",
                featureCardImage3: featureCardImage3 || "",
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
        console.error('Settings Update Error:', error);
        console.error('Error Details:', {
            message: error.message,
            code: error.code,
            meta: error.meta
        });
        return NextResponse.json({ 
            error: error.message,
            details: error.meta || error.code
        }, { status: 400 })
    }
}
