'use client'
import { useEffect, useState } from "react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash } from "@fortawesome/free-solid-svg-icons"
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
            <form onSubmit={(e) => toast.promise(handleAddCoupon(e), { loading: "Adding coupon..." })} className="w-full max-w-4xl text-xs md:text-sm">
                <h2 className="text-2xl md:text-3xl font-semibold">Add <span className="text-slate-800 font-bold">Coupons</span></h2>
                <div className="flex gap-3 flex-col md:flex-row mt-4">
                    <input type="text" placeholder="Coupon Code" className="flex-1 p-3 md:p-2 border border-slate-300 outline-green-500 rounded-lg text-base md:text-sm font-medium"
                        name="code" value={newCoupon.code} onChange={handleChange} required
                    />
                    <input type="number" placeholder="Discount (%)" min={1} max={100} className="flex-1 p-3 md:p-2 border border-slate-300 outline-green-500 rounded-lg text-base md:text-sm font-medium"
                        name="discount" value={newCoupon.discount} onChange={handleChange} required
                    />
                </div>
                <input type="text" placeholder="Coupon Description" className="w-full mt-3 md:mt-2 p-3 md:p-2 border border-slate-300 outline-green-500 rounded-lg text-base md:text-sm font-medium"
                    name="description" value={newCoupon.description} onChange={handleChange} required
                />

                <label>
                    <p className="mt-4 md:mt-3 text-base md:text-sm font-semibold text-slate-700">Coupon Expiry Date</p>
                    <input type="date" placeholder="Coupon Expires At" className="w-full mt-2 md:mt-1 p-3 md:p-2 border border-slate-300 outline-green-500 rounded-lg text-base md:text-sm font-medium"
                        name="expiresAt" value={format(newCoupon.expiresAt, 'yyyy-MM-dd')} onChange={handleChange}
                    />
                </label>

                <div className="mt-6 md:mt-5 space-y-4 md:space-y-3 bg-slate-50 p-4 md:p-3 rounded-lg">
                    <div className="flex gap-4 md:gap-3 items-center">
                        <label className="relative inline-flex items-center cursor-pointer text-gray-900">
                            <input type="checkbox" className="sr-only peer"
                                name="forNewUser" checked={newCoupon.forNewUser}
                                onChange={(e) => setNewCoupon({ ...newCoupon, forNewUser: e.target.checked })}
                            />
                            <div className="w-11 md:w-9 h-6 md:h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                            <span className="dot absolute left-1 md:left-1 top-1 w-4 md:w-3 h-4 md:h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5 md:peer-checked:translate-x-4"></span>
                        </label>
                        <p className="text-base md:text-sm font-medium text-slate-700">For New User</p>
                    </div>
                    <div className="flex gap-4 md:gap-3 items-center">
                        <label className="relative inline-flex items-center cursor-pointer text-gray-900">
                            <input type="checkbox" className="sr-only peer"
                                name="forMember" checked={newCoupon.forMember}
                                onChange={(e) => setNewCoupon({ ...newCoupon, forMember: e.target.checked })}
                            />
                            <div className="w-11 md:w-9 h-6 md:h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                            <span className="dot absolute left-1 md:left-1 top-1 w-4 md:w-3 h-4 md:h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5 md:peer-checked:translate-x-4"></span>
                        </label>
                        <p className="text-base md:text-sm font-medium text-slate-700">For Member</p>
                    </div>
                </div>
                <button className="mt-6 md:mt-4 w-full md:w-auto p-3 md:p-2 px-8 md:px-6 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg text-white btn-animate transition-all duration-300 text-base md:text-sm font-semibold active:scale-95">Add Coupon</button>
            </form>

            {/* List Coupons */}
            <div className="mt-10 md:mt-14">
                <h2 className="text-2xl md:text-3xl font-semibold">List <span className="text-slate-800 font-bold">Coupons</span></h2>
                
                {/* Mobile Card View */}
                <div className="md:hidden mt-4 space-y-3">
                    {coupons.length > 0 ? (
                        coupons.map((coupon) => (
                            <div key={coupon.code} className="bg-white border-2 border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="text-xl font-bold text-slate-800">{coupon.code}</p>
                                        <p className="text-sm text-slate-600 mt-1">{coupon.description}</p>
                                    </div>
                                    <button onClick={() => toast.promise(deleteCoupon(coupon.code), { loading: "Deleting coupon..." })} className="text-red-500 hover:text-red-700 transition-colors active:scale-90" title="Delete coupon">
                                        <FontAwesomeIcon icon={faTrash} className="text-lg" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-600">Discount</p>
                                        <p className="text-lg font-bold text-green-600 mt-1">{coupon.discount}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-600">Expires</p>
                                        <p className="text-base font-bold text-slate-800 mt-1">{format(coupon.expiresAt, 'MMM dd')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-600">New User</p>
                                        <p className="text-lg font-bold text-slate-800 mt-1">{coupon.forNewUser ? '✓' : '−'}</p>
                                    </div>
                                </div>
                                {coupon.forMember && (
                                    <div className="mt-2 text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded inline-block">
                                        For Member
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            <p className="text-base font-medium">No coupons found</p>
                        </div>
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto mt-4 rounded-lg border border-slate-200">
                    <table className="w-full bg-white text-xs md:text-sm">
                        <thead className="bg-slate-50 sticky top-0">
                            <tr className="divide-x divide-slate-200">
                                <th className="py-3 px-4 text-left font-semibold text-slate-700 text-sm">Code</th>
                                <th className="py-3 px-4 text-left font-semibold text-slate-700 hidden lg:table-cell text-sm">Description</th>
                                <th className="py-3 px-4 text-left font-semibold text-slate-700 text-sm">Discount</th>
                                <th className="py-3 px-4 text-left font-semibold text-slate-700 hidden md:table-cell text-sm">Expires</th>
                                <th className="py-3 px-4 text-left font-semibold text-slate-700 hidden lg:table-cell text-sm">New User</th>
                                <th className="py-3 px-4 text-left font-semibold text-slate-700 text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {coupons.map((coupon) => (
                                <tr key={coupon.code} className="hover:bg-slate-50 divide-x divide-slate-200">
                                    <td className="py-3 px-4 font-semibold text-slate-800 text-sm">{coupon.code}</td>
                                    <td className="py-3 px-4 text-slate-700 hidden lg:table-cell text-sm truncate">{coupon.description}</td>
                                    <td className="py-3 px-4 text-slate-800 text-sm font-bold text-green-600">{coupon.discount}%</td>
                                    <td className="py-3 px-4 text-slate-800 hidden md:table-cell text-sm">{format(coupon.expiresAt, 'MMM dd')}</td>
                                    <td className="py-3 px-4 text-slate-800 hidden lg:table-cell text-sm font-semibold">{coupon.forNewUser ? '✓' : '—'}</td>
                                    <td className="py-3 px-4 text-slate-800 text-center">
                                        <button onClick={() => toast.promise(deleteCoupon(coupon.code), { loading: "Deleting coupon..." })} className="text-red-500 hover:text-red-700 cursor-pointer btn-animate transition-all duration-300 active:scale-90" title="Delete coupon">
                                            <FontAwesomeIcon icon={faTrash} className="text-lg" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {coupons.length === 0 && (
                    <div className="hidden md:block text-center py-8 text-slate-500 border border-slate-200 rounded-lg mt-4">
                        <p className="text-base font-medium">No coupons found</p>
                    </div>
                )}
            </div>
        </div>
    )
}