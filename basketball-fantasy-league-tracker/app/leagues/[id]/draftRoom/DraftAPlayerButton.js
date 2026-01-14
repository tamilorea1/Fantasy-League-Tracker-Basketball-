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
        return (
            <div className="card" style={{ 
                textAlign: 'center', 
                padding: '32px',
                backgroundColor: '#111',
                borderColor: '#333'
            }}>
                <p style={{ fontSize: '1.125rem', color: '#ccc' }}>
                    Waiting for <span style={{ fontWeight: '600', color: '#fff' }}>{currentPick.team.teamName}</span> to pick...
                </p>
            </div>
        )
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
            {error && (
                <div style={{
                    backgroundColor: '#2a0000',
                    border: '1px solid #ff4444',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    color: '#ff6666'
                }}>
                    {error}
                </div>
            )}

            <div style={{ marginBottom: '20px' }}>
                <input
                    className="form-input"
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    placeholder="Search for a player..."
                    style={{ fontSize: '1rem' }}
                />
                <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '8px' }}>
                    {findPlayer.length} player{findPlayer.length !== 1 ? 's' : ''} found
                </p>
            </div>

            <div style={{
                display: 'grid',
                gap: '12px',
                maxHeight: '600px',
                overflowY: 'auto',
                padding: '4px'
            }}>
                {findPlayer.slice(0, 50).map((player) => (
                    <div 
                        key={player.id}
                        className="card"
                        style={{
                            padding: '16px',
                            marginBottom: '0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '16px'
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <p
                                onClick={() => {
                                    setSelectedPlayer(player)
                                    setOpen(true)
                                }}
                                style={{
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    color: '#fff',
                                    fontWeight: '600',
                                    fontSize: '1rem',
                                    marginBottom: '4px'
                                }}
                            >
                                {player.name}
                            </p>
                            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                {player.team} | PTS: {player.points} | REB: {player.rebounds} | AST: {player.assists}
                            </p>
                        </div>
                        <button 
                            onClick={() => handleButton(player)} 
                            disabled={isLoading}
                            className="btn btn-primary"
                            style={{ padding: '8px 20px', fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                        >
                            {isLoading ? 'Drafting...' : 'Draft'}
                        </button>
                    </div>
                ))}

                {findPlayer.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                        <p className="text-muted">No players found matching: {playerSearch}</p>
                    </div>
                )}
            </div>

            {open && 
                <PlayerModal
                    player={selectedPlayer}
                    onClose={() => {
                        setOpen(false)
                        setSelectedPlayer(null)
                    }}
                />
            }
        </div>
  )
}
