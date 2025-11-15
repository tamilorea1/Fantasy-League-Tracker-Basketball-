'use client'

import { useState } from "react"

import { useRouter } from "next/navigation"



export default function RefreshDraftButton() {

    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)

    function handleRefresh() {
        setIsLoading(true)
        router.refresh()

        setTimeout(() => {
            setIsLoading(false)
            
        },
            1000
        )
    }


  return (
    <button 
            onClick={handleRefresh} 
            disabled={isLoading}
            className="btn btn-outline"
            style={{ fontSize: '0.875rem', padding: '8px 16px' }}
        >
            {isLoading ? 'Refreshing...' : '🔄 Refresh Draft'}
        </button>
  )
}
