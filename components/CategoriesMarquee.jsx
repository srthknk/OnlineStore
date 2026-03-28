import { categories } from "@/assets/assets";

const CategoriesMarquee = () => {

    return (
        <div className="overflow-hidden w-full relative mx-auto max-w-full select-none group my-12 sm:my-16 md:my-20 lg:my-24 px-0">
            {/* Left gradient overlay */}
            <div className="absolute left-0 top-0 h-full w-12 sm:w-20 md:w-32 z-10 pointer-events-none bg-gradient-to-r from-white via-white/60 to-transparent" />
            
            {/* Marquee container with subtle background */}
            <div className="relative">
                {/* Subtle background line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                
                <div className="flex min-w-[200%] animate-[marqueeScroll_20s_linear_infinite] md:animate-[marqueeScroll_55s_linear_infinite] group-hover:[animation-play-state:paused] gap-4 sm:gap-6 md:gap-8 h-auto min-h-16 sm:min-h-20 md:min-h-24 items-center py-6 sm:py-7 md:py-9 px-4">
                    {[...categories, ...categories, ...categories, ...categories].map((company, index) => (
                        <button 
                            key={index} 
                            className="flex items-center justify-center px-8 sm:px-11 md:px-16 py-3 sm:py-4 md:py-6 rounded-xl text-xs sm:text-sm md:text-base font-semibold whitespace-nowrap active:scale-95 transition-all duration-300 min-w-max group/btn relative overflow-hidden hover:shadow-lg hover:-translate-y-0.5"
                        >
                            {/* Premium gradient background on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-black/0 via-black/0 to-black/0 group-hover/btn:from-black/8 group-hover/btn:via-black/5 group-hover/btn:to-black/8 transition-all duration-300" />
                            
                            {/* Premium border with gradient */}
                            <div className="absolute inset-0 rounded-xl border-2 border-black/20 group-hover/btn:border-black/50 transition-all duration-300 shadow-sm group-hover/btn:shadow-md" />
                            
                            {/* Inner highlight on hover */}
                            <div className="absolute inset-1 rounded-lg border border-white opacity-0 group-hover/btn:opacity-30 transition-opacity duration-300" />
                            
                            {/* Text with premium typography */}
                            <span className="relative text-black/80 font-semibold tracking-wide group-hover/btn:text-black group-hover/btn:font-bold transition-all duration-300 uppercase text-center leading-tight">
                                {company}
                            </span>
                            
                            {/* Hover glow effect */}
                            <div className="absolute inset-0 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-black/8 via-transparent to-black/8 pointer-events-none" />
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Right gradient overlay */}
            <div className="absolute right-0 top-0 h-full w-12 sm:w-20 md:w-32 z-10 pointer-events-none bg-gradient-to-l from-white via-white/60 to-transparent" />
        </div>
    );
};

export default CategoriesMarquee;