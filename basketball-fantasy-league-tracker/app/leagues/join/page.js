'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

/**
 * Allows users to join a league by entering a 6 character code
 * 
 * Flow:
 * 1. User enters a join code
 * 2. Form submites to the api route -> /api/leagues/join
 * 3. Backend validates and adds the user to the league
 * 4. User is redirected to the joined league page
 */


export default function JoinLeaguePage() {

  //Stores the join code entered by the user
  const [leagueJoinCode, setLeagueJoinCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  //stores the message from the api
  const [message, setMessage]= useState('')

  const router = useRouter()

  /**
   * handles the form submission for joining a league
   * @param {Event} e 
   * 
   * Process:
   * 1. Prevent default form submission
   * 2. Set loading state and clear previous errors
   * 3. Make POST request to /api/leagues/join with the join code passed in the reqest body
   * 4. On success: display the message and redirect to the joined league page
   * 5. On error: display the error message
   */
  async function handleSubmit(e) {
    e.preventDefault()

    setIsLoading(true)

    setError('')

    

    try {
      const response = await fetch('/api/leagues/join', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({leagueJoinCode})
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(result.message)
        setIsLoading(false)

        //Redirects to the joined league page
        //result.joinedLeague.id contains the ID of the league the user just joined
        router.push(`/leagues/${result.joinedLeague.id}`)
      }
      else{
        setError(result.error)
        setIsLoading(false)
      }
    } catch (error) {
      setError("Couldn't join league. Try again")
      setIsLoading(false)
    }
  }

  return (
    <div className="page-container">
            <div className="content-wrapper">
                <h1 className="page-title">Join a League</h1>
                <p className="page-subtitle">Enter your leagues join code to get started</p>

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

                <form onSubmit={handleSubmit} style={{ maxWidth: '400px', width: '100%' }}>
                    <div className="form-group">
                        <label className="form-label">Join Code</label>
                        <input
                            className="form-input"
                            type="text"
                            name="leagueId"
                            value={leagueJoinCode}
                            onChange={(e) => setLeagueJoinCode(e.target.value)}
                            placeholder="Enter 6-character join code"
                            maxLength="6"
                            style={{ 
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                fontSize: '1.125rem',
                                textAlign: 'center'
                            }}
                            required
                        />
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '8px' }}>
                            Ask your league admin for the join code
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '8px' }}
                    >
                        {isLoading ? 'Joining League...' : 'Join League'}
                    </button>
                </form>

                <p className="text-light" style={{ marginTop: '24px' }}>
                    Want to create your own league?{' '}
                    <Link href="/leagues/create" style={{ color: '#fff', textDecoration: 'underline' }}>
                        Create League
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
