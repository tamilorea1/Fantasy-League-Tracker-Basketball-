'use client'

import { useState } from "react"

import { useRouter } from "next/navigation"

export default function DraftAPlayerButton({availablePlayer, currentPick, currentUserId, leagueId, draftId}) {

     const [isLoading, setIsLoading] = useState(false)
     const [error, setError] = useState('')

     const router = useRouter()

    async function handleButton(playerChosen) {
        /**
         * Check if its the current users turn
         */
        if(currentPick.team.teamOwnerId !== currentUserId){
            setError('Not your turn')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const response = await fetch('/api/leagues/startDraft/makePick', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({leagueId: leagueId,
                                      draftId: draftId, 
                                      playerId: playerChosen.id  })
            })

            const result = await response.json()

            if(response.ok){
                setIsLoading(false)
                //refresh page to show new pick
                router.refresh()
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
        {availablePlayer.slice(0,5).map((player) => (
            <div key={player.id}>
              <p>Player: {player.name}</p>
              <button onClick={() => handleButton(player)} disabled={isLoading}>
                {isLoading ? 'Drafting Player...' : 'Pick Player'}
            </button>
            </div>
        ))}
        
    </div>
  )
}
