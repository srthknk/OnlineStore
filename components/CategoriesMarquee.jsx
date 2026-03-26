import { categories } from "@/assets/assets";

const CategoriesMarquee = () => {

    // Color palette matching website design
    const colors = [
        'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200',
        'bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border border-green-200',
        'bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-200',
        'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200',
        'bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white border border-amber-200',
        'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200',
    ];

    return (
        <div className="overflow-hidden w-full relative mx-auto max-w-full select-none group my-8 sm:my-12 md:my-16 lg:my-20 px-2 sm:px-4 md:px-6">
            {/* Left gradient overlay */}
            <div className="absolute left-0 top-0 h-full w-8 sm:w-16 md:w-24 z-10 pointer-events-none bg-gradient-to-r from-white via-white to-transparent" />
            
            {/* Marquee container */}
            <div className="flex min-w-[200%] animate-[marqueeScroll_20s_linear_infinite] md:animate-[marqueeScroll_60s_linear_infinite] group-hover:[animation-play-state:paused] gap-3 sm:gap-4 md:gap-6 h-auto min-h-14 sm:min-h-16 md:min-h-20 items-center py-3 sm:py-4 md:py-5">
                {[...categories, ...categories, ...categories, ...categories].map((company, index) => (
                    <button 
                        key={index} 
                        className={`flex items-center justify-center px-6 sm:px-8 md:px-12 py-3 sm:py-3.5 md:py-4 rounded-full text-xs sm:text-sm md:text-base font-semibold whitespace-nowrap active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 min-w-max ${
                            colors[index % colors.length]
                        }`}
                    >
                        {company}
                    </button>
                ))}
            </div>
            
            {/* Right gradient overlay */}
            <div className="absolute right-0 top-0 h-full w-8 sm:w-16 md:w-24 z-10 pointer-events-none bg-gradient-to-l from-white via-white to-transparent" />
        </div>
    );
};

export default CategoriesMarquee;