'use client'

const SkeletonLoader = ({ className = '' }) => {
    return (
        <div className={`animation-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg ${className}`}
            style={{
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
        />
    )
}

const SkeletonProductCard = () => {
    return (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden animate-pulse">
            {/* Image Skeleton */}
            <SkeletonLoader className="w-full h-40 md:h-48" />

            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
                <SkeletonLoader className="h-4 w-3/4" />
                <SkeletonLoader className="h-3 w-full" />
                <SkeletonLoader className="h-3 w-5/6" />

                {/* Price Skeleton */}
                <div className="pt-2 space-y-2">
                    <SkeletonLoader className="h-6 w-1/2" />
                    <SkeletonLoader className="h-4 w-1/3" />
                </div>

                {/* Button Skeleton */}
                <div className="flex gap-2 pt-2">
                    <SkeletonLoader className="flex-1 h-9" />
                    <SkeletonLoader className="flex-1 h-9" />
                </div>
            </div>
        </div>
    )
}

const SkeletonProductDetails = () => {
    return (
        <div className="flex max-lg:flex-col gap-12">
            {/* Image Skeleton */}
            <div className="flex max-sm:flex-col-reverse gap-3">
                <div className="flex sm:flex-col gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <SkeletonLoader key={i} className="size-26 rounded-lg" />
                    ))}
                </div>
                <SkeletonLoader className="h-100 sm:size-113 rounded-lg" />
            </div>

            {/* Details Skeleton */}
            <div className="flex-1 space-y-4">
                <SkeletonLoader className="h-8 w-3/4" />
                <SkeletonLoader className="h-4 w-1/2" />
                <SkeletonLoader className="h-6 w-1/4" />

                {/* Price Skeleton */}
                <div className="space-y-2">
                    <SkeletonLoader className="h-6 w-1/3" />
                    <SkeletonLoader className="h-4 w-1/4" />
                </div>

                {/* Dates Skeleton */}
                <SkeletonLoader className="h-20 w-full rounded-lg" />

                {/* Variant Skeleton */}
                <div className="space-y-2">
                    <SkeletonLoader className="h-4 w-1/4" />
                    <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <SkeletonLoader key={i} className="h-10" />
                        ))}
                    </div>
                </div>

                {/* Button Skeleton */}
                <div className="flex gap-4 mt-8">
                    <SkeletonLoader className="flex-1 h-10" />
                    <SkeletonLoader className="w-40 h-10" />
                </div>
            </div>
        </div>
    )
}

export default SkeletonLoader
export { SkeletonProductCard, SkeletonProductDetails }
