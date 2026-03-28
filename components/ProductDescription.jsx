'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faStar } from '@fortawesome/free-solid-svg-icons'
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const ProductDescription = ({ product }) => {

    const [selectedTab, setSelectedTab] = useState('Description')

    return (
        <div className="my-18 text-sm text-slate-600">

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
                {['Description', 'Reviews'].map((tab, index) => (
                    <button className={`${tab === selectedTab ? 'border-b-[1.5px] font-semibold' : 'text-slate-400'} px-3 py-2 font-medium`} key={index} onClick={() => setSelectedTab(tab)}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Description */}
            {selectedTab === "Description" && (
                <p className="max-w-xl">{product.description}</p>
            )}

            {/* Reviews */}
            {selectedTab === "Reviews" && (
                <div className="flex flex-col gap-3 mt-14">
                    {product.rating.map((item,index) => (
                        <div key={index} className="flex gap-5 mb-10">
                            <Image 
                                src={item.user.image} 
                                alt={item.user.name}
                                className="size-10 rounded-full object-cover" 
                                width={40} 
                                height={40}
                                loading="lazy"
                            />
                            <div>
                                <div className="flex items-center gap-0.5" >
                                    {Array(5).fill('').map((_, index) => (
                                        <FontAwesomeIcon key={index} icon={faStar} className={`text-sm mt-0.5 ${item.rating >= index + 1 ? 'text-green-400' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                <p className="text-sm max-w-lg my-4">{item.review}</p>
                                <p className="text-sm font-medium text-slate-800">{item.user.name}</p>
                                <p className="mt-3 text-xs font-light text-slate-500">{new Date(item.createdAt).toDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Store Page */}
            <div className="flex gap-3 mt-14">
                <Image 
                    src={product.store.logo} 
                    alt={product.store.name}
                    className="size-11 rounded-full ring ring-slate-400 object-cover" 
                    width={44} 
                    height={44}
                    loading="lazy"
                />
                <div>
                    <p className="font-medium text-slate-600">Product by {product.store.name}</p>
                    <Link href={`/shop/${product.store.username}`} className="flex items-center gap-1.5 text-green-500"> view store <FontAwesomeIcon icon={faArrowRight} className="text-sm" /></Link>
                </div>
            </div>
        </div>
    )
}

export default ProductDescription