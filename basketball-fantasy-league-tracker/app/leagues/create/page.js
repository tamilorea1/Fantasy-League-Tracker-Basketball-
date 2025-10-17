'use client'

import { useState } from "react"

export default function CreateLeaguePage() {

    const [leagueName, setLeagueName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

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

            //Finish showing the league on UI



            
        } catch (error) {
            
        }
    }

  return (
    <div>
        <h1>Create Your League</h1>
        {error && <p>Invalid</p>}
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
