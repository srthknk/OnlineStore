import { useEffect } from 'react'

export function useStoreSettings() {
    useEffect(() => {
        // Fetch settings on mount and update document title
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/admin/settings')
                if (response.ok) {
                    const data = await response.json()
                    if (data.storeName) {
                        document.title = data.storeName
                    }
                }
            } catch (error) {
                console.error('Error fetching store settings:', error)
            }
        }

        fetchSettings()

        // Set up polling to check for changes every 10 seconds (when admin updates settings)
        const interval = setInterval(fetchSettings, 10000)

        return () => clearInterval(interval)
    }, [])

    return null
}
