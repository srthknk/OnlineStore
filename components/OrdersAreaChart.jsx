'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useState, useEffect } from 'react'

export default function OrdersAreaChart({ allOrders }) {

    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }
        
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Group orders by date
    const ordersPerDay = allOrders.reduce((acc, order) => {
        const date = new Date(order.createdAt).toISOString().split('T')[0] // format: YYYY-MM-DD
        acc[date] = (acc[date] || 0) + 1
        return acc
    }, {})

    // Convert to array for Recharts
    const chartData = Object.entries(ordersPerDay).map(([date, count]) => ({
        date,
        orders: count
    }))

    return (
        <div className="w-full bg-white border border-slate-200 rounded-lg p-4 sm:p-6 animate-fadeIn">
            <h3 className="text-lg sm:text-xl font-medium text-slate-800 mb-4 text-right">
                <span className='text-slate-500'>Orders /</span> Day
            </h3>
            
            <div className="w-full h-64 sm:h-80 md:h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                        data={chartData}
                        margin={{ 
                            top: 10, 
                            right: isMobile ? 10 : 30, 
                            left: isMobile ? 0 : 60, 
                            bottom: isMobile ? 10 : 30 
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: isMobile ? 12 : 14 }}
                            angle={isMobile ? -45 : 0}
                            height={isMobile ? 60 : 40}
                        />
                        <YAxis 
                            allowDecimals={false} 
                            tick={{ fontSize: isMobile ? 12 : 14 }}
                            label={!isMobile ? { value: 'Orders', angle: -90, position: 'insideLeft' } : {}}
                            width={isMobile ? 30 : 60}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#1e293b', 
                                border: 'none', 
                                borderRadius: '8px',
                                fontSize: isMobile ? '12px' : '14px'
                            }}
                            labelStyle={{ color: '#fff' }}
                            formatter={(value) => [`${value} orders`, 'Total']}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="orders" 
                            stroke="#4f46e5" 
                            fill="#c7d2fe"
                            strokeWidth={isMobile ? 1.5 : 2}
                            isAnimationActive={true}
                            animationDuration={800}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
