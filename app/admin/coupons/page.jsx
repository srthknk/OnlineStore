'use client'
import { useEffect, useState } from "react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { DeleteIcon } from "lucide-react"
import { couponDummyData } from "@/assets/assets"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"

export default function AdminCoupons() {

    const { getToken } = useAuth()

    const [coupons, setCoupons] = useState([])

    const [newCoupon, setNewCoupon] = useState({
        code: '',
        description: '',
        discount: '',
        forNewUser: false,
        forMember: false,
        isPublic: false,
        expiresAt: new Date()
    })

    const fetchCoupons = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/admin/coupon', {headers: { Authorization: `Bearer ${token}` }})
            setCoupons(data.coupons)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    const handleAddCoupon = async (e) => {
        e.preventDefault()
        try {
            const token = await getToken()

            newCoupon.discount = Number(newCoupon.discount)
            newCoupon.expiresAt = new Date(newCoupon.expiresAt)

            const { data } = await axios.post('/api/admin/coupon',{coupon: newCoupon}, {headers: { Authorization: `Bearer ${token}` }})
            toast.success(data.message)
            await fetchCoupons()
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }


    }

    const handleChange = (e) => {
        setNewCoupon({ ...newCoupon, [e.target.name]: e.target.value })
    }

    const deleteCoupon = async (code) => {
        try {
            const confirm = window.confirm("Are you sure you want to delete this coupon?")
            if(!confirm) return;
            const token = await getToken()
            await axios.delete(`/api/admin/coupon?code=${code}`, {headers: { Authorization: `Bearer ${token}` }})
            await fetchCoupons()
            toast.success("Coupon deleted successfully")
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }

    }

    useEffect(() => {
        fetchCoupons();
    }, [])

    return (
        <div className="text-slate-500 mb-40 pb-10">

            {/* Add Coupon */}
            <form onSubmit={(e) => toast.promise(handleAddCoupon(e), { loading: "Adding coupon..." })} className="w-full max-w-2xl text-xs sm:text-sm">
                <h2 className="text-xl sm:text-2xl">Add <span className="text-slate-800 font-medium">Coupons</span></h2>
                <div className="flex gap-2 flex-col sm:flex-row mt-3">
                    <input type="text" placeholder="Coupon Code" className="flex-1 p-2 border border-slate-200 outline-slate-400 rounded-md text-xs sm:text-sm"
                        name="code" value={newCoupon.code} onChange={handleChange} required
                    />
                    <input type="number" placeholder="Discount (%)" min={1} max={100} className="flex-1 p-2 border border-slate-200 outline-slate-400 rounded-md text-xs sm:text-sm"
                        name="discount" value={newCoupon.discount} onChange={handleChange} required
                    />
                </div>
                <input type="text" placeholder="Coupon Description" className="w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md text-xs sm:text-sm"
                    name="description" value={newCoupon.description} onChange={handleChange} required
                />

                <label>
                    <p className="mt-3 text-xs sm:text-sm font-medium">Coupon Expiry Date</p>
                    <input type="date" placeholder="Coupon Expires At" className="w-full mt-1 p-2 border border-slate-200 outline-slate-400 rounded-md text-xs sm:text-sm"
                        name="expiresAt" value={format(newCoupon.expiresAt, 'yyyy-MM-dd')} onChange={handleChange}
                    />
                </label>

                <div className="mt-5 space-y-3">
                    <div className="flex gap-3 items-center">
                        <label className="relative inline-flex items-center cursor-pointer text-gray-900">
                            <input type="checkbox" className="sr-only peer"
                                name="forNewUser" checked={newCoupon.forNewUser}
                                onChange={(e) => setNewCoupon({ ...newCoupon, forNewUser: e.target.checked })}
                            />
                            <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                            <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                        </label>
                        <p className="text-xs sm:text-sm">For New User</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <label className="relative inline-flex items-center cursor-pointer text-gray-900">
                            <input type="checkbox" className="sr-only peer"
                                name="forMember" checked={newCoupon.forMember}
                                onChange={(e) => setNewCoupon({ ...newCoupon, forMember: e.target.checked })}
                            />
                            <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                            <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                        </label>
                        <p className="text-xs sm:text-sm">For Member</p>
                    </div>
                </div>
                <button className="mt-4 p-2 px-6 sm:px-10 rounded bg-slate-700 text-white btn-animate transition-all duration-300 text-xs sm:text-sm font-medium">Add Coupon</button>
            </form>

            {/* List Coupons */}
            <div className="mt-8 sm:mt-14">
                <h2 className="text-xl sm:text-2xl">List <span className="text-slate-800 font-medium">Coupons</span></h2>
                <div className="overflow-x-auto mt-4 rounded-lg border border-slate-200">
                    <table className="w-full bg-white text-xs sm:text-sm">
                        <thead className="bg-slate-50 sticky top-0">
                            <tr className="divide-x divide-slate-200">
                                <th className="py-2 sm:py-3 px-2 sm:px-4 text-left font-semibold text-slate-600 text-xs sm:text-sm">Code</th>
                                <th className="py-2 sm:py-3 px-2 sm:px-4 text-left font-semibold text-slate-600 hidden sm:table-cell text-xs sm:text-sm">Description</th>
                                <th className="py-2 sm:py-3 px-2 sm:px-4 text-left font-semibold text-slate-600 text-xs sm:text-sm">Discount</th>
                                <th className="py-2 sm:py-3 px-2 sm:px-4 text-left font-semibold text-slate-600 hidden md:table-cell text-xs sm:text-sm">Expires</th>
                                <th className="py-2 sm:py-3 px-2 sm:px-4 text-left font-semibold text-slate-600 hidden lg:table-cell text-xs sm:text-sm">New User</th>
                                <th className="py-2 sm:py-3 px-2 sm:px-4 text-left font-semibold text-slate-600 text-xs sm:text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {coupons.map((coupon) => (
                                <tr key={coupon.code} className="hover:bg-slate-50 divide-x divide-slate-200">
                                    <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-slate-800 text-xs sm:text-sm">{coupon.code}</td>
                                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-slate-800 hidden sm:table-cell text-xs sm:text-sm truncate">{coupon.description}</td>
                                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-slate-800 text-xs sm:text-sm font-medium">{coupon.discount}%</td>
                                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-slate-800 hidden md:table-cell text-xs sm:text-sm">{format(coupon.expiresAt, 'MMM dd')}</td>
                                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-slate-800 hidden lg:table-cell text-xs sm:text-sm">{coupon.forNewUser ? '✓' : '—'}</td>
                                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-slate-800 text-center">
                                        <DeleteIcon onClick={() => toast.promise(deleteCoupon(coupon.code), { loading: "Deleting coupon..." })} className="w-4 h-4 text-red-500 hover:text-red-800 cursor-pointer btn-animate btn-danger transition-all duration-300" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}