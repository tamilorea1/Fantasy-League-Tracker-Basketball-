
export default function PlayerModal({onClose, player}) {

  return (
    <div 
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
            }}
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: '#111',
                    border: '2px solid #fff',
                    borderRadius: '8px',
                    padding: '32px',
                    maxWidth: '500px',
                    width: '100%',
                    position: 'relative'
                }}
            >
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    marginBottom: '24px',
                    color: '#fff'
                }}>
                    {player.name}
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        backgroundColor: '#000',
                        padding: '16px',
                        borderRadius: '6px',
                        border: '1px solid #333'
                    }}>
                        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '4px' }}>Team</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#fff' }}>{player.team}</p>
                    </div>

                    <div style={{
                        backgroundColor: '#000',
                        padding: '16px',
                        borderRadius: '6px',
                        border: '1px solid #333'
                    }}>
                        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '4px' }}>PTS</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#fff' }}>{player.points}</p>
                    </div>

                    <div style={{
                        backgroundColor: '#000',
                        padding: '16px',
                        borderRadius: '6px',
                        border: '1px solid #333'
                    }}>
                        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '4px' }}>AST</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#fff' }}>{player.assists}</p>
                    </div>

                    <div style={{
                        backgroundColor: '#000',
                        padding: '16px',
                        borderRadius: '6px',
                        border: '1px solid #333'
                    }}>
                        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '4px' }}>REB</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#fff' }}>{player.rebounds}</p>
                    </div>

                    <div style={{
                        backgroundColor: '#000',
                        padding: '16px',
                        borderRadius: '6px',
                        border: '1px solid #333'
                    }}>
                        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '4px' }}>BLK</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#fff' }}>{player.blocks}</p>
                    </div>

                    <div style={{
                        backgroundColor: '#000',
                        padding: '16px',
                        borderRadius: '6px',
                        border: '1px solid #333'
                    }}>
                        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '4px' }}>STL</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#fff' }}>{player.steals}</p>
                    </div>
                </div>

                <button 
                    onClick={onClose}
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                >
                    Close
                </button>
            </div>
        </div>
  )
}
