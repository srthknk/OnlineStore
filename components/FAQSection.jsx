'use client'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@clerk/nextjs'

const FAQSection = ({ isAdmin = false }) => {
    const [faqs, setFaqs] = useState([])
    const [expandedIndex, setExpandedIndex] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [newFAQ, setNewFAQ] = useState({ question: '', answer: '' })
    const [loading, setLoading] = useState(false)
    const { getToken } = useAuth()

    useEffect(() => {
        fetchFAQs()
    }, [])

    const fetchFAQs = async () => {
        try {
            const { data } = await axios.get('/api/admin/faq')
            setFaqs(data.faqs || [])
        } catch (error) {
            console.error('Error fetching FAQs:', error)
        }
    }

    const handleAddFAQ = async () => {
        if (!newFAQ.question.trim() || !newFAQ.answer.trim()) {
            toast.error('Please fill in both question and answer')
            return
        }

        try {
            setLoading(true)
            const token = await getToken()
            const { data } = await axios.post('/api/admin/faq', newFAQ, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setFaqs([...faqs, data.faq])
            setNewFAQ({ question: '', answer: '' })
            setIsEditing(false)
            toast.success('FAQ added successfully!')
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to add FAQ')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteFAQ = async (id) => {
        if (!confirm('Are you sure you want to delete this FAQ?')) return

        try {
            const token = await getToken()
            await axios.delete(`/api/admin/faq?id=${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setFaqs(faqs.filter(faq => faq.id !== id))
            toast.success('FAQ deleted successfully!')
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to delete FAQ')
        }
    }

    return (
        <section className="bg-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Section Title */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                        Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-green-600">Questions</span>
                    </h2>
                    <p className="text-slate-600 text-base sm:text-lg">
                        Find answers to common questions about our products and services
                    </p>
                </div>

                {/* FAQs List */}
                <div className="space-y-3 mb-8">
                    {faqs.length > 0 ? (
                        faqs.map((faq, index) => (
                            <div
                                key={faq.id}
                                className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300"
                            >
                                <button
                                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                                    className="w-full flex items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all duration-300"
                                >
                                    <span className="text-left font-semibold text-slate-800 text-sm sm:text-base pr-4">
                                        {faq.question}
                                    </span>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {isAdmin && (
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteFAQ(faq.id)
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="text-sm" />
                                            </div>
                                        )}
                                        <FontAwesomeIcon
                                            icon={faChevronDown}
                                            className={`text-indigo-600 transition-transform duration-300 text-lg ${
                                                expandedIndex === index ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </div>
                                </button>

                                {expandedIndex === index && (
                                    <div className="px-4 sm:px-6 py-4 sm:py-6 bg-white border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-slate-500 text-lg">No FAQs available yet</p>
                        </div>
                    )}
                </div>

                {/* Add FAQ Form (Admin Only) */}
                {isAdmin && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold mb-4"
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-lg" />
                            {isEditing ? 'Cancel' : 'Add New FAQ'}
                        </button>

                        {isEditing && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Question
                                    </label>
                                    <input
                                        type="text"
                                        value={newFAQ.question}
                                        onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                                        placeholder="Enter your question"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Answer
                                    </label>
                                    <textarea
                                        value={newFAQ.answer}
                                        onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                                        placeholder="Enter your answer"
                                        rows="4"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    />
                                </div>

                                <button
                                    onClick={handleAddFAQ}
                                    disabled={loading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                                >
                                    {loading ? 'Adding...' : 'Add FAQ'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}

export default FAQSection
