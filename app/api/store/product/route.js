import imagekit from "@/configs/imageKit"
import prisma from "@/lib/prisma"
import authSeller from "@/middlewares/authSeller"
import {getAuth} from "@clerk/nextjs/server"
import { NextResponse } from "next/server";

// Add a new product
export async function POST(request){
    try {
        const { userId } = getAuth(request)
        const storeId = await authSeller(userId)

        if(!storeId){
            return NextResponse.json({error: 'not authorized'}, { status: 401 } )
        }
        // Get the data from the form
        const formData = await request.formData()
        const name = formData.get("name")
        const description = formData.get("description")
        const mrp =  Number(formData.get("mrp"))
        const price = Number(formData.get("price"))
        const category = formData.get("category")
        const images = formData.getAll("images")
        const imageUrls = formData.get("imageUrls") ? JSON.parse(formData.get("imageUrls")) : []
        const manufacturingDate = formData.get("manufacturingDate") || null
        const expiryDate = formData.get("expiryDate") || null
        const isOrganic = formData.get("isOrganic") === "true"
        const isVegan = formData.get("isVegan") === "true"
        const manufacturer = formData.get("manufacturer") || null
        const hasVariants = formData.get("hasVariants") === "true"
        const variantsData = formData.get("variantsData") ? JSON.parse(formData.get("variantsData")) : []

        if(!name || !description || !mrp || !price || !category){
            return NextResponse.json({error: 'missing product details'}, { status: 400 } )
        }

        if(images.length < 1 && imageUrls.length < 1){
            return NextResponse.json({error: 'must provide at least one image (file or URL)'}, { status: 400 } )
        }

        if(hasVariants && variantsData.length === 0){
            return NextResponse.json({error: 'products with variants must have at least one variant'}, { status: 400 } )
        }

        // Handle Images - combine uploaded files and URLs
        let imagesUrl = [...imageUrls]

        // Upload file-based images to ImageKit
        if(images.length > 0) {
            const uploadedImages = await Promise.all(images.map(async (image) => {
                try {
                    const buffer = Buffer.from(await image.arrayBuffer());
                    const response = await imagekit.upload({
                        file: buffer,
                        fileName: image.name,
                        folder: "products",
                    })
                    // Use the direct URL from ImageKit response with transformations as query params
                    const imageUrl = response.url || `${process.env.IMAGEKIT_URL_ENDPOINT}${response.filePath}`
                    // Add transformations as query parameters
                    const urlWithTransforms = `${imageUrl}?tr=q-auto,f-webp,w-1024`
                    return urlWithTransforms
                } catch (error) {
                    console.error('Error uploading image to ImageKit:', error)
                    throw new Error(`Failed to upload image: ${error.message}`)
                }
            }))
            imagesUrl = [...imagesUrl, ...uploadedImages]
        }

        // Validate dates
        if(manufacturingDate && expiryDate) {
            if(new Date(manufacturingDate) > new Date(expiryDate)) {
                return NextResponse.json({error: 'expiry date must be after manufacturing date'}, { status: 400 })
            }
        }

        // Calculate total units
        let totalUnits = 0
        if(!hasVariants){
            totalUnits = formData.get("units") ? Number(formData.get("units")) : 0
        } else {
            totalUnits = variantsData.reduce((sum, variant) => sum + variant.totalUnits, 0)
        }

        const product = await prisma.product.create({
             data: {
                name,
                description,
                mrp,
                price,
                category,
                images: imagesUrl,
                storeId,
                totalUnits,
                inStock: totalUnits > 0,
                manufacturingDate: manufacturingDate ? new Date(manufacturingDate) : null,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                isOrganic,
                isVegan,
                manufacturer
             }
        })

        // Create variants if product has variants
        if(hasVariants && variantsData.length > 0){
            await prisma.productVariant.createMany({
                data: variantsData.map(variant => ({
                    productId: product.id,
                    quantityUnit: variant.quantityUnit,
                    quantity: variant.quantity,
                    totalUnits: variant.totalUnits,
                    availableUnits: variant.totalUnits
                }))
            })
        }

         return NextResponse.json({message: "Product added successfully", productId: product.id})

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}

// Get all products for a seller
export async function GET(request){
    try {
        const { userId } = getAuth(request)
        const storeId = await authSeller(userId)

        if(!storeId){
            return NextResponse.json({error: 'not authorized'}, { status: 401 } )
        }
        const products = await prisma.product.findMany({ 
            where: { storeId },
            include: {
                productVariants: true
            }
        })

        return NextResponse.json({products})
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}

// Update a product
export async function PUT(request){
    try {
        const { userId } = getAuth(request)
        const storeId = await authSeller(userId)

        if(!storeId){
            return NextResponse.json({error: 'not authorized'}, { status: 401 } )
        }

        const formData = await request.formData()
        const productId = formData.get("productId")
        const name = formData.get("name")
        const description = formData.get("description")
        const mrp = Number(formData.get("mrp"))
        const price = Number(formData.get("price"))
        const category = formData.get("category")
        const manufacturingDate = formData.get("manufacturingDate") || null
        const expiryDate = formData.get("expiryDate") || null
        const isVegan = formData.get("isVegan") === "true"
        const isOrganic = formData.get("isOrganic") === "true"
        const manufacturer = formData.get("manufacturer") || null
        const newImages = formData.getAll("newImages")
        const imageUrls = formData.get("imageUrls") ? JSON.parse(formData.get("imageUrls")) : []
        const variantsJson = formData.get("variants")
        const variants = variantsJson ? JSON.parse(variantsJson) : []

        if(!productId || !name || !description || !mrp || !price || !category){
            return NextResponse.json({error: 'missing product details'}, { status: 400 } )
        }

        // Date validation
        if(manufacturingDate && expiryDate) {
            const mfgDate = new Date(manufacturingDate)
            const expDate = new Date(expiryDate)
            if(expDate <= mfgDate) {
                return NextResponse.json({error: 'expiry date must be after manufacturing date'}, { status: 400 } )
            }
        }

        // Check if product belongs to this seller
        const product = await prisma.product.findUnique({ where: { id: productId } })
        if(!product || product.storeId !== storeId){
            return NextResponse.json({error: 'not authorized'}, { status: 401 } )
        }

        // Handle images: start with URL images, then add uploaded images
        let imagesUrl = [...imageUrls]
        
        // Upload new file-based images if provided
        if(newImages.length > 0){
            const uploadedImages = await Promise.all(newImages.map(async (image) => {
                try {
                    const buffer = Buffer.from(await image.arrayBuffer());
                    const response = await imagekit.upload({
                        file: buffer,
                        fileName: image.name,
                        folder: "products",
                    })
                    // Use the direct URL from ImageKit response with transformations as query params
                    const imageUrl = response.url || `${process.env.IMAGEKIT_URL_ENDPOINT}${response.filePath}`
                    // Add transformations as query parameters
                    const urlWithTransforms = `${imageUrl}?tr=q-auto,f-webp,w-1024`
                    return urlWithTransforms
                } catch (error) {
                    console.error('Error uploading image to ImageKit:', error)
                    throw new Error(`Failed to upload image: ${error.message}`)
                }
            }))
            imagesUrl = [...imagesUrl, ...uploadedImages]
        }

        // If no new images provided, keep existing images
        if(imagesUrl.length === 0) {
            imagesUrl = product.images
        }

        // Handle variants
        if(variants.length > 0) {
            // Delete existing variants
            await prisma.productVariant.deleteMany({
                where: { productId: productId }
            })

            // Create new variants
            for(const variant of variants) {
                if(!variant.id?.toString().startsWith('new-')) {
                    // Skip existing variants that weren't modified
                    continue
                }
                
                await prisma.productVariant.create({
                    data: {
                        productId: productId,
                        quantity: parseFloat(variant.quantity),
                        quantityUnit: variant.quantityUnit,
                        totalUnits: parseFloat(variant.totalUnits),
                        availableUnits: parseFloat(variant.availableUnits)
                    }
                })
            }
        }

        // Update product
        await prisma.product.update({
            where: { id: productId },
            data: {
                name,
                description,
                mrp,
                price,
                category,
                images: imagesUrl,
                manufacturingDate: manufacturingDate ? new Date(manufacturingDate) : null,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                isVegan,
                isOrganic,
                manufacturer
            }
        })

        return NextResponse.json({message: "Product updated successfully"})
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}

// Delete a product
export async function DELETE(request){
    try {
        const { userId } = getAuth(request)
        const storeId = await authSeller(userId)

        if(!storeId){
            return NextResponse.json({error: 'not authorized'}, { status: 401 } )
        }

        const { searchParams } = new URL(request.url)
        const productId = searchParams.get("productId")

        if(!productId){
            return NextResponse.json({error: 'product id required'}, { status: 400 } )
        }

        // Check if product belongs to this seller
        const product = await prisma.product.findUnique({ where: { id: productId } })
        if(!product || product.storeId !== storeId){
            return NextResponse.json({error: 'not authorized'}, { status: 401 } )
        }

        // Delete related ratings first (they have onDelete: Cascade but let's be explicit)
        await prisma.rating.deleteMany({
            where: { productId }
        })

        // Delete related order items
        await prisma.orderItem.deleteMany({
            where: { productId }
        })

        // Now delete the product
        await prisma.product.delete({ where: { id: productId } })

        return NextResponse.json({message: "Product deleted successfully"})
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}