import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import WebsiteTitleUpdater from "@/components/WebsiteTitleUpdater";
import { StoreTitle } from "@/components/StoreTitle";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import prisma from "@/lib/prisma";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

// Fetch settings server-side for metadata
export async function generateMetadata() {
    try {
        const settings = await prisma.settings.findUnique({
            where: { id: "default" }
        })
        
        const title = settings?.storeName || "Welcome to Our Store"
        const description = settings?.description || "Shop the best products"
        
        return {
            title: title,
            description: description,
        }
    } catch (error) {
        return {
            title: "Welcome to Our Store",
            description: "Shop the best products",
        }
    }
}

export default function RootLayout({ children }) {
    return (
        <ClerkProvider 
            appearance={{
                layout: {
                    logoImageUrl: '',
                    socialButtonsVariant: 'iconButton',
                }
            }}
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        >
            <html lang="en">
                <body className={`${outfit.className} antialiased`}>
                    <StoreProvider>
                        <StoreTitle />
                        <WebsiteTitleUpdater />
                        <Toaster />
                        {children}
                    </StoreProvider>
                    {/* Razorpay Payment Gateway */}
                    <Script 
                        src="https://checkout.razorpay.com/v1/checkout.js" 
                        strategy="lazyOnload"
                    />
                </body>
            </html>
        </ClerkProvider>
    );
}
