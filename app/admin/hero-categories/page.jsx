import AdminHeroProducts from '@/components/admin/AdminHeroProducts'

export const metadata = {
    title: 'Hero Categories - Admin',
    description: 'Manage hero category carousel'
}

export default function AdminHeroCategoriesPage() {
    return (
        <div className='min-h-screen bg-slate-50'>
            <AdminHeroProducts />
        </div>
    )
}
