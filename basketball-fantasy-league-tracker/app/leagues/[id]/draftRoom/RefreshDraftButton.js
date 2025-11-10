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
    <div>
        <button onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh Draft'}
        </button>
    </div>
  )
}
