

'use client'

import { useState } from "react"

import { useRouter } from "next/navigation"

/**
 * Client component that allows the admin to start the draft
 * Sends a POST request to /api/leagues/startDraft
 * Redirects all users to the draft room upon success
 * 
 * @param {string} leagueId - The ID of the league to start the draft for
 */

export default function StartDraftButton({leagueId}) {


    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    

    const router = useRouter()
    
    async function handleStartDraft() {

        setIsLoading(true)

        setError('')

        try {
            const response = await fetch('/api/leagues/startDraft', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({leagueId })
            })

            const result = await response.json()

            if (response.ok) {
                setIsLoading(false)

                //redirects user back to the draft room
                router.push(`/leagues/${leagueId}/draftRoom`)
            }
            else{
                setError(result.error)
                setIsLoading(false)
            }
        } catch (error) {
            setError("Network error. Please retry")
            setIsLoading(false)
        }

    }

  return (
    <div>
        {error && <p>{error}</p>}
        <button onClick={handleStartDraft} disabled= {isLoading}>
            {isLoading ? 'Starting Draft...' : 'Begin Draft'}
        </button>
    </div>
  )
}
