'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

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
    <div>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
        type="text"
        name="leagueId"
        value={leagueJoinCode}
        onChange={(e) => setLeagueJoinCode(e.target.value)}
        placeholder="Enter 6-character join code"
        />

        <button
        type="submit"
        disabled={isLoading}
        >{isLoading ? 'Joining League...' : 'Join League'}</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}
