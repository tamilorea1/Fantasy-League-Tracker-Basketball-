
export default function PlayerModal({onClose, player}) {

  return (
    <div>
        <div onClick = {onClose}>
            <div onClick={(e) => e.stopPropagation()}>
                <h2>{player.name}</h2>
                {/**
                 * stats
                 */}
                 <p>Team: {player.team}</p>
                 <p>PTS: {player.points}</p>
                 <p>AST: {player.assists}</p>
                 <p>REB: {player.rebounds}</p>
                 <p>BLK: {player.blocks}</p>
                 <p>STL: {player.steals}</p>

                 <button onClick={onClose}>
                    Close
                 </button>
            </div>
        </div>  
    </div>
  )
}
