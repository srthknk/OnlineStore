'use client'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faXmark } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'

const FAQModal = ({ isOpen, onClose }) => {
    const [faqs, setFaqs] = useState([])
    const [expandedIndex, setExpandedIndex] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isOpen) {
            fetchFAQs()
        }
    }, [isOpen])

    const fetchFAQs = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get('/api/admin/faq')
            setFaqs(data.faqs || [])
        } catch (error) {
            console.error('Error fetching FAQs:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6'>
            <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in duration-300'>
                {/* Header */}
                <div className='sticky top-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between rounded-t-2xl'>
                    <div>
                        <h2 className='text-2xl sm:text-3xl font-bold text-slate-800'>
                            Frequently Asked <span className='text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-green-600'>Questions</span>
                        </h2>
                        <p className='text-xs sm:text-sm text-slate-500 mt-1'>Find answers to common questions</p>
                    </div>
                    <button
                        onClick={onClose}
                        className='p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0'
                    >
                        <FontAwesomeIcon icon={faXmark} className='text-xl text-slate-600' />
                    </button>
                </div>

                {/* Content */}
                <div className='px-4 sm:px-6 py-6 sm:py-8'>
                    {loading ? (
                        <div className='flex items-center justify-center py-12'>
                            <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600'></div>
                        </div>
                    ) : faqs.length > 0 ? (
                        <div className='space-y-3'>
                            {faqs.map((faq, index) => (
                                <div
                                    key={faq.id}
                                    className='border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300'
                                >
                                    <button
                                        onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                                        className='w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all duration-300'
                                    >
                                        <span className='text-left font-semibold text-slate-800 text-xs sm:text-sm pr-3'>
                                            {faq.question}
                                        </span>
                                        <FontAwesomeIcon
                                            icon={faChevronDown}
                                            className={`text-indigo-600 transition-transform duration-300 text-sm flex-shrink-0 ${
                                                expandedIndex === index ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>

                                    {expandedIndex === index && (
                                        <div className='px-3 sm:px-4 py-3 sm:py-4 bg-white border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300'>
                                            <p className='text-slate-600 text-xs sm:text-sm leading-relaxed'>
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='text-center py-12'>
                            <p className='text-slate-500'>No FAQs available yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FAQModal
