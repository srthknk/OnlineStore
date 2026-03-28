'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import React from 'react'

const Title = ({ title, description, visibleButton = true, href = '' }) => {

    return (
        <div className='flex flex-col items-center gap-2 sm:gap-3 md:gap-4' suppressHydrationWarning>
            <h2 className='text-xl sm:text-2xl md:text-3xl font-semibold text-slate-800 text-center px-2'>{title}</h2>
            <Link href={href} className='flex flex-col sm:flex-row items-center gap-2 sm:gap-3 md:gap-5 text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2'>
                <p className='max-w-lg text-center px-2'>{description}</p>
                {visibleButton && <button className='text-green-500 flex items-center gap-1 whitespace-nowrap font-medium' suppressHydrationWarning>View more <FontAwesomeIcon icon={faArrowRight} className='text-sm' /></button>}
            </Link>
        </div>
    )
}

export default Title