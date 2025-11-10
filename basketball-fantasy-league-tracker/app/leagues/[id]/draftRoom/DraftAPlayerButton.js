'use client'

import { useState } from "react"

import { useRouter } from "next/navigation"

import PlayerModal from "./PlayerModal"

export default function DraftAPlayerButton({availablePlayer, currentPick, currentUserId, leagueId, draftId}) {

     const [playerSearch, setPlayerSearch] = useState('')
     const [open, setOpen] = useState(false)
     const [selectedPlayer, setSelectedPlayer] = useState('')
     const [isLoading, setIsLoading] = useState(false)
     const [error, setError] = useState('')

     const router = useRouter()


    async function handleButton(playerChosen) {


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

    /**
     * checks if it the current logged in user's turn
     */
    const isMyTurn = currentPick.team.teamOwnerId === currentUserId


    /**
     * If its not display the text
     */
    if (!isMyTurn) {
        return <p>Waiting for {currentPick.team.teamName} to pick...</p>
    }

    const findPlayer = availablePlayer.filter((player) => 
        //if a user types "lebron", it will display "Lebron James"
        player.name.toLowerCase().includes(playerSearch.toLowerCase())
    )


    /**
     * If it is the users turn show this
     */
  return (
    <div>
        {error && <p>{error}</p>}
        <input
        value={playerSearch}
        onChange={(e) => setPlayerSearch(e.target.value)}
        placeholder="Enter a Player Name"
        />
        {findPlayer.map((player) => (
            <div key={player.id}>
              <p
              onClick={() => {
                setSelectedPlayer(player)
                setOpen(true)
                 }}
                 style={{cursor: 'pointer', textDecoration: 'underline'}}
              >Player: {player.name}</p>
              <button onClick={() => handleButton(player)} disabled={isLoading}>
                {isLoading ? 'Drafting Player...' : 'Pick Player'}
              </button>
            </div>
        ))}

        {open && 
        <PlayerModal
        player={selectedPlayer}
        onClose={() => {
            setOpen(false)
            setSelectedPlayer(null)
        }}
        />}
        
    </div>
  )
}
