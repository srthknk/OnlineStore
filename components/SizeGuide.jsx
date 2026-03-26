'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfo, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useState } from "react"

const SIZE_GUIDE = {
    XS: { chest: '30-32"', waist: '24-26"', length: '25-26"' },
    S: { chest: '34-36"', waist: '28-30"', length: '26-27"' },
    M: { chest: '38-40"', waist: '32-34"', length: '27-28"' },
    L: { chest: '42-44"', waist: '36-38"', length: '28-29"' },
    XL: { chest: '46-48"', waist: '40-42"', length: '29-30"' },
    XXL: { chest: '50-52"', waist: '44-46"', length: '30-31"' },
    XXXL: { chest: '54-56"', waist: '48-50"', length: '31-32"' },
}

export default function SizeGuide() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all text-sm font-medium"
            >
                <FontAwesomeIcon icon={faInfo} className="text-sm" /> Size Guide
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-slate-800">Size Guide</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-xl" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {Object.entries(SIZE_GUIDE).map(([size, measurements]) => (
                                <div key={size} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <h3 className="font-semibold text-slate-800 mb-2">Size {size}</h3>
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                        <div>
                                            <p className="text-slate-500 text-xs">Chest</p>
                                            <p className="font-medium text-slate-700">{measurements.chest}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs">Waist</p>
                                            <p className="font-medium text-slate-700">{measurements.waist}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs">Length</p>
                                            <p className="font-medium text-slate-700">{measurements.length}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs text-slate-500 mt-6 p-3 bg-blue-50 rounded-lg">
                            💡 Tips: Measure your current well-fitted garment for the most accurate size.
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}
