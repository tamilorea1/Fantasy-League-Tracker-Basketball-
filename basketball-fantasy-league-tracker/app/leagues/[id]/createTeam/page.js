'use client'

import { useState } from "react"

import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

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
    <div className="page-container">
            <div className="content-wrapper">
                <h1 className="page-title">Create Your Team</h1>
                <p className="page-subtitle">Choose a name that will strike fear into your opponents</p>

                {error && (
                    <div style={{
                        backgroundColor: '#2a0000',
                        border: '1px solid #ff4444',
                        borderRadius: '6px',
                        padding: '12px 16px',
                        marginBottom: '24px',
                        color: '#ff6666'
                    }}>
                        {error}
                    </div>
                )}

                {message && (
                    <div style={{
                        backgroundColor: '#002a00',
                        border: '1px solid #44ff44',
                        borderRadius: '6px',
                        padding: '12px 16px',
                        marginBottom: '24px',
                        color: '#66ff66'
                    }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleTeamSubmit} style={{ maxWidth: '400px', width: '100%' }}>
                    <div className="form-group">
                        <label className="form-label">Team Name</label>
                        <input
                            className="form-input"
                            type="text"
                            name="teamName"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="Enter your team name"
                            maxLength="30"
                            required
                        />
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '8px' }}>
                            Make it memorable!
                        </p>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '8px' }}
                    >
                        {isLoading ? 'Creating Team...' : 'Create Team'}
                    </button>
                </form>

                <p className="text-light" style={{ marginTop: '24px' }}>
                    <Link href={`/leagues/${associatedLeague}`} style={{ color: '#ccc', textDecoration: 'underline' }}>
                        ← Back to League
                    </Link>
                </p>
            </div>
        </div>
  )
}
