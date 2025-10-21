'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateLeaguePage() {

    const [leagueName, setLeagueName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const router = useRouter()

    async function handleLeagueSubmit(e) {
        e.preventDefault()

        setIsLoading(true)

        setError('')

        const LeagueInfo = {leagueName}

        try {
            const response = await fetch('/api/leagues', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(LeagueInfo)
            })

            const result = await response.json()

            //if the response is successful
            if (response.ok) {
                // store the success message from our api route page
                setMessage(result.message)
                setIsLoading(false)
                //redirect to the new league page by using its unique id
                //this also passes the league id
                router.push(`/leagues/${result.league.id}`) 
                
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
        <h1>Create Your League</h1>
        {error && <p>{error}</p>}
        {message && <p>{message}</p>}
        <form onSubmit={handleLeagueSubmit}>
            <input 
                type="name"
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                name="league name"
                placeholder="Enter league name"
            />

            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating League' : 'Ready to create league'}
            </button>
        </form>
    </div>
  )
}
