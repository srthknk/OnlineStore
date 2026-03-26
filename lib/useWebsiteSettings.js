import { useEffect } from 'react'
import axios from 'axios'

export function useWebsiteSettings() {
    useEffect(() => {
        const fetchAndUpdateTitle = async () => {
            try {
                const res = await axios.get('/api/admin/settings')
                if (res.data?.storeName) {
                    document.title = `${res.data.storeName} - Shop smarter`
                }
            } catch (error) {
                console.error('Error fetching website settings:', error)
            }
        }

        // Fetch on mount
        fetchAndUpdateTitle()

        // Optionally set up interval to check for changes every 10 seconds
        const interval = setInterval(fetchAndUpdateTitle, 10000)

        return () => clearInterval(interval)
    }, [])
}
