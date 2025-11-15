'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
    <div className="page-container">
            <div className="content-wrapper">
                <h1 className="page-title">Create Your League</h1>
                <p className="page-subtitle">Start a new fantasy basketball league</p>

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

                <form onSubmit={handleLeagueSubmit} style={{ maxWidth: '400px', width: '100%' }}>
                    <div className="form-group">
                        <label className="form-label">League Name</label>
                        <input 
                            className="form-input"
                            type="text"
                            value={leagueName}
                            onChange={(e) => setLeagueName(e.target.value)}
                            name="league name"
                            placeholder="Enter league name"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '8px' }}
                    >
                        {isLoading ? 'Creating League...' : 'Create League'}
                    </button>
                </form>

                <p className="text-light" style={{ marginTop: '24px' }}>
                    Want to join an existing league?{' '}
                    <Link href="/leagues/join" style={{ color: '#fff', textDecoration: 'underline' }}>
                        Join League
                    </Link>
                </p>

                <p className="text-light" style={{ marginTop: '12px' }}>
                    <Link href="/dashboard" style={{ color: '#ccc', textDecoration: 'underline' }}>
                        ← Back to Dashboard
                    </Link>
                </p>
            </div>
        </div>
  )
}
