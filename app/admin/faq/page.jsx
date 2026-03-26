'use client'
import FAQSection from "@/components/FAQSection"

export default function AdminFAQ() {
    return (
        <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-800 mb-6">Manage <span className="text-slate-800 font-medium">FAQs</span></h1>
            <FAQSection isAdmin={true} />
        </div>
    )
}
