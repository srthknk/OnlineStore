'use client'
import { addAddress } from "@/lib/features/address/addressSlice"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useDispatch } from "react-redux"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark } from "@fortawesome/free-solid-svg-icons"

// Define field components OUTSIDE to prevent remounting on re-render
const InputField = ({ label, name, type = 'text', placeholder, required = true, value, errors, handleChange }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-colors ${
                errors[name]
                    ? 'border-red-500 bg-red-50 text-gray-900'
                    : 'border-gray-300 bg-white text-gray-900'
            } focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50`}
        />
        {errors[name] && <p className="text-red-600 text-xs font-medium">{errors[name]}</p>}
    </div>
)

const SelectField = ({ label, name, options = [], placeholder = 'Select option', required = true, value, errors, handleChange }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <select
            name={name}
            value={value || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-colors appearance-none cursor-pointer ${
                errors[name]
                    ? 'border-red-500 bg-red-50 text-gray-900'
                    : 'border-gray-300 bg-white text-gray-900'
            } focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50`}
            style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
            }}
        >
            <option value="">{placeholder}</option>
            {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
        {errors[name] && <p className="text-red-600 text-xs font-medium">{errors[name]}</p>}
    </div>
)

const AddressModal = ({ setShowAddressModal }) => {
    const { getToken } = useAuth()
    const dispatch = useDispatch()

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        house: '',
        area: '',
        landmark: '',
        city: '',
        state: '',
        district: '',
        pin: '',
        addressType: 'Home',
        isDefault: false
    })

    const [states, setStates] = useState([])
    const [districts, setDistricts] = useState([])
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    // Fetch states on mount
    useEffect(() => {
        const loadStates = async () => {
            try {
                const res = await axios.get('/api/state-districts')
                setStates(res.data.states || [])
            } catch (err) {
                console.error('Error loading states:', err)
                toast.error('Failed to load states')
            }
        }
        loadStates()
    }, [])

    // Fetch districts when state changes
    useEffect(() => {
        if (formData.state) {
            const loadDistricts = async () => {
                try {
                    const res = await axios.get(`/api/state-districts?state=${formData.state}`)
                    setDistricts(res.data.districts || [])
                    setFormData(prev => ({ ...prev, district: '' }))
                } catch (err) {
                    console.error('Error loading districts:', err)
                    toast.error('Failed to load districts')
                }
            }
            loadDistricts()
        } else {
            setDistricts([])
        }
    }, [formData.state])

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    // Validation functions
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone.replace(/\D/g, ''))
    const isValidPin = (pin) => /^[0-9]{6}$/.test(pin.replace(/\D/g, ''))

    // Validate form
    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) newErrors.name = 'Full name required'
        if (!formData.email.trim()) newErrors.email = 'Email required'
        else if (!isValidEmail(formData.email)) newErrors.email = 'Invalid email'
        
        if (!formData.phone.trim()) newErrors.phone = 'Phone required'
        else if (!isValidPhone(formData.phone)) newErrors.phone = 'Phone must be 10 digits'
        
        if (!formData.house.trim()) newErrors.house = 'House/Flat/Building required'
        if (!formData.area.trim()) newErrors.area = 'Area/Street/Locality required'
        if (!formData.city.trim()) newErrors.city = 'City/Town/Village required'
        
        if (!formData.state) newErrors.state = 'State required'
        if (!formData.district) newErrors.district = 'District required'
        
        if (!formData.pin.trim()) newErrors.pin = 'PIN code required'
        else if (!isValidPin(formData.pin)) newErrors.pin = 'PIN must be 6 digits'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error('Please fix the errors above')
            return
        }

        setLoading(true)
        try {
            const token = await getToken()
            const { data } = await axios.post('/api/address', { address: formData }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            dispatch(addAddress(data.newAddress))
            toast.success('Address saved successfully!')
            setShowAddressModal(false)
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to save address')
        } finally {
            setLoading(false)
        }
    }



    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto pt-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-900">Add Address</h2>
                    <button
                        type="button"
                        onClick={() => setShowAddressModal(false)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-gray-600" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Personal Information */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900">Personal Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Full Name"
                                name="name"
                                placeholder="Your full name"
                                value={formData.name}
                                errors={errors}
                                handleChange={handleChange}
                            />
                            <InputField
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="your@email.com"
                                value={formData.email}
                                errors={errors}
                                handleChange={handleChange}
                            />
                            <InputField
                                label="Phone"
                                name="phone"
                                placeholder="10-digit number"
                                value={formData.phone}
                                errors={errors}
                                handleChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-200"></div>

                    {/* Address Details */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900">Address Details</h3>
                        <div className="space-y-4">
                            <InputField
                                label="House / Flat / Building"
                                name="house"
                                placeholder="123, Apt 501"
                                value={formData.house}
                                errors={errors}
                                handleChange={handleChange}
                            />
                            <InputField
                                label="Area / Street / Locality"
                                name="area"
                                placeholder="Indiranagar"
                                value={formData.area}
                                errors={errors}
                                handleChange={handleChange}
                            />
                            <InputField
                                label="Landmark (Optional)"
                                name="landmark"
                                placeholder="e.g., Near Cafe"
                                required={false}
                                value={formData.landmark}
                                errors={errors}
                                handleChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-200"></div>

                    {/* Location */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectField
                                label="State"
                                name="state"
                                options={states}
                                placeholder="Select state"
                                value={formData.state}
                                errors={errors}
                                handleChange={handleChange}
                            />
                            <SelectField
                                label="District"
                                name="district"
                                options={districts}
                                placeholder={formData.state ? 'Select district' : 'Select state first'}
                                value={formData.district}
                                errors={errors}
                                handleChange={handleChange}
                            />
                            <InputField
                                label="City / Town"
                                name="city"
                                placeholder="Bangalore"
                                value={formData.city}
                                errors={errors}
                                handleChange={handleChange}
                            />
                            <InputField
                                label="PIN Code"
                                name="pin"
                                placeholder="560001"
                                value={formData.pin}
                                errors={errors}
                                handleChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-200"></div>

                    {/* Address Type */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900">Address Type</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectField
                                label="Type"
                                name="addressType"
                                options={['Home', 'Work', 'Other']}
                                placeholder="Select type"
                                value={formData.addressType}
                                errors={errors}
                                handleChange={handleChange}
                            />
                            <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        name="isDefault"
                                        checked={formData.isDefault}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Set as default</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 pt-5 flex gap-2">
                        <button
                            type="button"
                            onClick={() => setShowAddressModal(false)}
                            className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 px-4 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'SAVING...' : 'SAVE'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddressModal