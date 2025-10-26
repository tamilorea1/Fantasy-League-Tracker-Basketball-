'use client'

import { useState } from "react"

import { useRouter, useParams } from "next/navigation"

/**
 * This page is used to create a users Team name
 * We use the useParams feature since this is a client component
 * useParams allows us to get the id of the league
 * Once we submit our team name, we're redirected back to the league page with other users
 * @returns team Name
 */


export default function createTeamPage() {

    const [teamName, setTeamName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const router = useRouter()

    const params = useParams()

    //Gets the League that the user is in by using its id
    const associatedLeague = params.id

    async function handleTeamSubmit(e) {
        /**
         * checks if the input is empty
         * if so return the error
         */
        if (teamName === "") {
            setError("Please enter a team name")
            return
        }
        e.preventDefault()

        setIsLoading(true)

        setError('')

        /**
         * sends our information to the backend
         * The info sent is the entered Team name as well as the associatedLeague id
         */
        try {
            const response = await fetch('/api/leagues/createTeam', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({teamName, associatedLeague })
            })

            const result = await response.json()

            if (response.ok) {
                setMessage(result.message)
                setIsLoading(false)
                //redirects user back to the league page with other potential users
                router.push(`/leagues/${associatedLeague}`)
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
        <form onSubmit={handleTeamSubmit}>
            <input
                type="text"
                name="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}            
            />

            <button type="submit" disabled={isLoading}>{isLoading ? 'Creating Team...' : 'Create Your Team'}</button>
        </form>
        {message && <p>{message}</p>}
    </div>
  )
}
