'use client'
import React from 'react'
import toast from 'react-hot-toast';

export default function Banner() {

    const [isOpen, setIsOpen] = React.useState(true);

    const handleClaim = () => {
        setIsOpen(false);
        toast.success('Coupon copied to clipboard!');
        navigator.clipboard.writeText('NEW20');
    };

    return isOpen && (
        <div className="w-full px-3 sm:px-4 md:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm text-white text-center bg-gradient-to-r from-violet-500 via-[#9938CA] to-[#E0724A]">
            <div className='flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto'>
                <p className='flex-1 min-w-0'>Get 20% OFF on Your First Order!</p>
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <button onClick={handleClaim} type="button" className="font-normal text-gray-800 bg-white px-3 sm:px-5 md:px-7 py-1.5 sm:py-2 rounded-full hidden sm:inline-block text-xs sm:text-sm whitespace-nowrap">Claim Offer</button>
                    <button onClick={() => setIsOpen(false)} type="button" className="font-normal text-gray-800 py-1 sm:py-2 rounded-full flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect y="12.532" width="17.498" height="2.1" rx="1.05" transform="rotate(-45.74 0 12.532)" fill="#fff" />
                            <rect x="12.533" y="13.915" width="17.498" height="2.1" rx="1.05" transform="rotate(-135.74 12.533 13.915)" fill="#fff" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};