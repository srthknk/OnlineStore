'use client'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faSearch, faLightbulb, faHeadset, faQuestionCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'

const FAQPage = () => {
    const [faqs, setFaqs] = useState([])
    const [expandedIndex, setExpandedIndex] = useState(null)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchFAQs()
    }, [])

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

    // Filter FAQs based on search term
    const filteredFaqs = faqs.filter((faq) =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className='min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100'>
            {/* Hero Section */}
            <div className='relative bg-gradient-to-r from-emerald-50 via-blue-50 to-emerald-50 border-b border-slate-200 overflow-hidden'>
                <div className='absolute inset-0 opacity-10'>
                    <div className='absolute top-10 left-10 w-40 h-40 bg-emerald-300 rounded-full blur-3xl'></div>
                    <div className='absolute bottom-10 right-10 w-40 h-40 bg-blue-300 rounded-full blur-3xl'></div>
                </div>

                <div className='relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20'>
                    <div className='text-center'>
                        <div className='flex justify-center mb-4 sm:mb-6'>
                            <div className='p-3 sm:p-4 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full'>
                                <FontAwesomeIcon icon={faQuestionCircle} className='text-emerald-600 text-3xl sm:text-4xl' />
                            </div>
                        </div>
                        <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-6'>
                            Frequently Asked <span className='bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent'>Questions</span>
                        </h1>
                        <p className='text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 sm:mb-10'>
                            Find quick answers to common questions. Can't find what you're looking for? Our support team is here to help!
                        </p>

                        {/* Search Bar */}
                        <div className='relative max-w-2xl mx-auto'>
                            <div className='relative group'>
                                <FontAwesomeIcon
                                    icon={faSearch}
                                    className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg pointer-events-none'
                                />
                                <input
                                    type='text'
                                    placeholder='Search FAQs...'
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className='w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white shadow-lg group-hover:shadow-xl'
                                />
                            </div>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className='mt-2 text-sm text-slate-600 hover:text-emerald-600 transition font-medium'
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20'>
                {loading ? (
                    <div className='flex justify-center py-16 sm:py-20'>
                        <div className='flex flex-col items-center gap-4'>
                            <div className='animate-spin rounded-full h-14 w-14 border-3 border-emerald-200 border-t-emerald-600'></div>
                            <p className='text-slate-600 text-sm sm:text-base'>Loading FAQs...</p>
                        </div>
                    </div>
                ) : filteredFaqs.length > 0 ? (
                    <>
                        {/* Results Info */}
                        <div className='mb-8 sm:mb-10'>
                            <p className='text-slate-600 text-sm sm:text-base font-medium'>
                                <span className='text-emerald-600 font-bold text-base sm:text-lg'>{filteredFaqs.length}</span> result{filteredFaqs.length !== 1 ? 's' : ''} found
                            </p>
                        </div>

                        {/* FAQ Items */}
                        <div className='space-y-3 sm:space-y-4'>
                            {filteredFaqs.map((faq, index) => (
                                <div
                                    key={faq.id}
                                    className='group border border-slate-200 rounded-xl overflow-hidden hover:border-emerald-300 transition-all duration-300 bg-white hover:shadow-md'
                                >
                                    <button
                                        onClick={() =>
                                            setExpandedIndex(expandedIndex === faq.id ? null : faq.id)
                                        }
                                        className='w-full flex items-start sm:items-center justify-between p-5 sm:p-6 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-transparent transition-all duration-300 text-left'
                                    >
                                        <div className='flex items-start sm:items-center gap-4 flex-1 min-w-0'>
                                            <div className='flex-shrink-0 mt-1 sm:mt-0'>
                                                <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors duration-300 ${
                                                    expandedIndex === faq.id ? 'bg-emerald-600' : 'bg-slate-300 group-hover:bg-emerald-500'
                                                }`}></div>
                                            </div>
                                            <span className='font-semibold text-slate-800 text-sm sm:text-base leading-relaxed group-hover:text-emerald-600 transition-colors duration-300'>
                                                {faq.question}
                                            </span>
                                        </div>
                                        <FontAwesomeIcon
                                            icon={faChevronDown}
                                            className={`text-emerald-600 transition-all duration-300 text-base flex-shrink-0 ms-3 ${
                                                expandedIndex === faq.id ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>

                                    {expandedIndex === faq.id && (
                                        <div className='border-t border-slate-100 bg-gradient-to-b from-emerald-50 to-white animate-in fade-in slide-in-from-top-2 duration-300'>
                                            <div className='px-5 sm:px-6 py-5 sm:py-6 flex gap-4'>
                                                <div className='flex-shrink-0 mt-1'>
                                                    <FontAwesomeIcon icon={faCheckCircle} className='text-emerald-600 text-lg' />
                                                </div>
                                                <p className='text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-light'>
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className='text-center py-16 sm:py-20 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200'>
                        <div className='flex justify-center mb-4 sm:mb-6'>
                            <div className='p-3 sm:p-4 bg-slate-100 rounded-full'>
                                <FontAwesomeIcon icon={faQuestionCircle} className='text-slate-400 text-3xl sm:text-4xl' />
                            </div>
                        </div>
                        <p className='text-slate-600 text-lg sm:text-xl font-medium mb-2'>
                            {searchTerm ? 'No results found' : 'No FAQs available yet'}
                        </p>
                        <p className='text-slate-500 text-sm sm:text-base mb-6'>
                            {searchTerm 
                                ? 'Try adjusting your search terms or contact support for assistance.' 
                                : 'Check back soon for frequently asked questions.'}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className='px-6 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold rounded-lg transition-colors duration-300 text-sm sm:text-base'
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}

                {/* Info Cards Section */}
                {filteredFaqs.length > 0 && (
                    <div className='mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6'>
                        <div className='p-6 sm:p-7 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300'>
                            <div className='flex items-center gap-4 mb-3'>
                                <div className='p-2.5 bg-blue-600 rounded-lg flex-shrink-0'>
                                    <FontAwesomeIcon icon={faLightbulb} className='text-white text-lg' />
                                </div>
                                <h3 className='font-bold text-slate-800 text-sm sm:text-base'>Tips</h3>
                            </div>
                            <p className='text-slate-700 text-xs sm:text-sm leading-relaxed'>Use keywords to find answers faster</p>
                        </div>

                        <div className='p-6 sm:p-7 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 hover:shadow-lg transition-all duration-300'>
                            <div className='flex items-center gap-4 mb-3'>
                                <div className='p-2.5 bg-emerald-600 rounded-lg flex-shrink-0'>
                                    <FontAwesomeIcon icon={faCheckCircle} className='text-white text-lg' />
                                </div>
                                <h3 className='font-bold text-slate-800 text-sm sm:text-base'>Always Help</h3>
                            </div>
                            <p className='text-slate-700 text-xs sm:text-sm leading-relaxed'>We regularly update our FAQ</p>
                        </div>

                        <div className='p-6 sm:p-7 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300'>
                            <div className='flex items-center gap-4 mb-3'>
                                <div className='p-2.5 bg-purple-600 rounded-lg flex-shrink-0'>
                                    <FontAwesomeIcon icon={faHeadset} className='text-white text-lg' />
                                </div>
                                <h3 className='font-bold text-slate-800 text-sm sm:text-base'>Support</h3>
                            </div>
                            <p className='text-slate-700 text-xs sm:text-sm leading-relaxed'>Contact us if you need help</p>
                        </div>
                    </div>
                )}

                {/* Contact Section */}
                <div className='mt-16 sm:mt-20 bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-600 rounded-2xl overflow-hidden shadow-xl'>
                    <div className='px-6 sm:px-8 lg:px-10 py-10 sm:py-12 lg:py-14 flex flex-col sm:flex-row items-center justify-between gap-6'>
                        <div className='text-white text-center sm:text-left'>
                            <h3 className='text-2xl sm:text-3xl font-bold mb-3 flex items-center justify-center sm:justify-start gap-2'>
                                <FontAwesomeIcon icon={faHeadset} className='text-lg sm:text-xl' />
                                Still have questions?
                            </h3>
                            <p className='text-emerald-50 text-sm sm:text-base'>
                                Our support team is ready to help. Get in touch with us today.
                            </p>
                        </div>
                        <a
                            href='/contact'
                            className='px-6 sm:px-8 py-3 sm:py-4 bg-white hover:bg-emerald-50 text-emerald-600 font-bold rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95 text-sm sm:text-base whitespace-nowrap'
                        >
                            Contact Us
                        </a>
                    </div>
                </div>

                {/* Statistics Footer */}
                {faqs.length > 0 && (
                    <div className='mt-12 sm:mt-16 text-center'>
                        <div className='inline-block px-6 py-4 bg-slate-100 rounded-full'>
                            <p className='text-slate-700 text-sm sm:text-base font-medium'>
                                <span className='font-bold text-emerald-600 text-lg sm:text-xl'>{faqs.length}</span>
                                <span className='ms-2'>frequently asked {faqs.length === 1 ? 'question' : 'questions'} available</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default FAQPage
