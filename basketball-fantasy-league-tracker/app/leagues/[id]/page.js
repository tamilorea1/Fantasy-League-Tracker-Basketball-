import {prisma} from "@/lib/prisma"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import StartDraftButton from "@/app/leagues/[id]/StartDraftButton"

/**
 * League Display Page
 * 
 * This displays detailed information about a specific league, which includes:
 * 1. League name
 * 2. Join Code
 * 3. Creator name
 * 4. Number of members
 * 5. List of all League members
 * 
 * 
 * This is a dynamic route page
 * The [id] in the folder name becomes available with "params.id"
 * 
 * So if the URL was:
 * /leagues/clx123abc456
 * 
 * params.id -> clx123abc456
 * 
 */


export default async function newLeaguePage({params}) {

    //gets the current user id to tell us WHO is logged in
    const session = await getServerSession(authOptions)
  
    //if user isn't logged in, redirect them back to the login page
    if (!session) {
      redirect('/login')
    }
    
    //Gets the league ID from the URL
    //id is gotten from the name of my dynamic route folder
    const leagueIdentification =  params.id


    //stores the league id into the id field
    //Asks the database for a league with the specific id
    const league = await prisma.league.findUnique({
      where: {
        id: leagueIdentification
      },

      //we ensure that we get access to the fields
      //Includes all related data 
      include: {
        creator: true,

        //Include all league members
        //nested user model since we need access to the user name. 
        // LeagueMember only gives us the user id
        leagueMember: {
          include: {
            user: true
          }
        },

        team: {
          include: {
            draftPick: {
              include: {
                player: true
              }
            }
          }
        }
        
      }
    })



    //if league doesn't exist with this id show the print statement
if (!league) {
        return (
            <div className="page-container">
                <div className="content-wrapper">
                    <h1 className="page-title">League Not Found</h1>
                    <p className="text-light" style={{ marginBottom: '24px' }}>
                        This league doesn't exist or you don't have access to it.
                    </p>
                    <Link href="/dashboard" className="btn btn-primary">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        )
    }



    /**
     * This variable will be used to check if the user has a team
     * It checks id in our team records, if there's a teamOwner id that is the same as the current user's id
     */
    const myTeam = league.team.find(team => team.teamOwnerId === session.user.id)

    /**
     * If the number of members is equal to the number of teams in our league
     * Then all teams are ready
     */
    const allTeamsReady = league.leagueMember.length === league.team.length

      /**
       * Will help for when a user logout and want to reenter the draft
       * If draft is in progress, redirect to draft room
       */
      if (league.draftStatus === 'IN_PROGRESS') {
        redirect(`/leagues/${leagueIdentification}/draftRoom`)
      }

          // DRAFT COMPLETED STATE
    if (league.draftStatus === 'COMPLETED') {
        return (
            <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
                        {league.name}
                    </h1>
                    <div style={{
                        display: 'inline-block',
                        backgroundColor: '#002a00',
                        border: '1px solid #4ade80',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        color: '#4ade80',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                    }}>
                        ✓ Draft Complete
                    </div>
                </div>

                <h2 className="section-title" style={{ marginBottom: '24px' }}>Team Rosters</h2>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '24px',
                    marginBottom: '40px'
                }}>
                    {league.team.map((teams) => (
                        <div key={teams.id} className="card">
                            <h3 className="card-header">{teams.teamName}</h3>
                            <div className="card-body">
                                {teams.draftPick.filter((pick) => pick.playerId !== null).length > 0 ? (
                                    teams.draftPick
                                        .filter((pick) => pick.playerId !== null)
                                        .map((pick) => (
                                            <div 
                                                key={pick.id} 
                                                style={{
                                                    padding: '12px',
                                                    marginBottom: '8px',
                                                    backgroundColor: '#000',
                                                    borderRadius: '4px',
                                                    border: '1px solid #222'
                                                }}
                                            >
                                                <p style={{ 
                                                    fontWeight: '600', 
                                                    marginBottom: '4px',
                                                    color: '#fff'
                                                }}>
                                                    {pick.player.name}
                                                </p>
                                                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                                    {pick.player.team}
                                                </p>
                                                <p className="text-light" style={{ fontSize: '0.875rem', marginTop: '4px' }}>
                                                    PPG: {pick.player.points} | REB: {pick.player.rebounds} | AST: {pick.player.assists}
                                                </p>
                                            </div>
                                        ))
                                ) : (
                                    <p className="text-muted">No players drafted</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <Link href='/dashboard' className="btn btn-secondary">
                    ← Back to Dashboard
                </Link>
            </div>
        )
    }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
            {/* League Header */}
            <div style={{ marginBottom: '40px' }}>
                <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
                    {league.name}
                </h1>
                
                <div style={{ 
                    display: 'flex', 
                    gap: '24px', 
                    flexWrap: 'wrap',
                    marginBottom: '16px'
                }}>
                    <div>
                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>Join Code: </span>
                        <span style={{
                            fontWeight: '700',
                            fontSize: '1.25rem',
                            letterSpacing: '0.1em',
                            color: '#fff'
                        }}>
                            {league.joinCode}
                        </span>
                    </div>
                    <div>
                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>Creator: </span>
                        <span className="text-light">{league.creator.name}</span>
                    </div>
                    <div>
                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>Members: </span>
                        <span className="text-light">{league.leagueMember.length}</span>
                    </div>
                </div>
            </div>

            {/* Team Status Section */}
            {/**
               * If a team name has been created we display the current user's name
               * else we route them to create their team name and be redirected back to this page
               */}
            {myTeam ? (
                <div className="card" style={{ marginBottom: '32px', backgroundColor: '#0a2a0a', borderColor: '#2a5a2a' }}>
                    <div className="card-body">
                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>Your Team: </span>
                        <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#4ade80' }}>
                            {myTeam.teamName}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ marginBottom: '32px', backgroundColor: '#2a2a00', borderColor: '#5a5a2a' }}>
                    <div className="card-body" style={{ textAlign: 'center' }}>
                        <p className="text-light" style={{ marginBottom: '16px' }}>
                            You need to create a team name before the draft can begin
                        </p>
                        <Link href={`/leagues/${leagueIdentification}/createTeam`} className="btn btn-primary">
                            Create Team Name
                        </Link>
                    </div>
                </div>
            )}

            {/* League Members Section */}
            {/*Iterates through each league member and shows their name */}
            <div style={{ marginBottom: '32px' }}>
                <h2 className="section-title" style={{ marginBottom: '16px' }}>League Members</h2>
                <div className="card">
                    <div className="card-body">
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {league.leagueMember.map((member, index) => (
                                <li 
                                    key={member.id}
                                    style={{
                                        padding: '12px 0',
                                        borderBottom: index !== league.leagueMember.length - 1 ? '1px solid #333' : 'none',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <span className="text-light">{member.user.name}</span>
                                    {member.role === 'ADMIN' && (
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '4px 8px',
                                            backgroundColor: '#222',
                                            borderRadius: '4px',
                                            color: '#ccc'
                                        }}>
                                            ADMIN
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Start Draft Section - Only visible to admin when ready */}
            {/**
             * If these are all true we can begin the draft:
             * All teams are ready
             * The current user is the admin (They're the only one allowed to start the draft)
             * The draft status is READY to begin
             */}
            {allTeamsReady && session.user.id === league.creator.id && league.draftStatus === 'READY' && (
                <div className="card" style={{ backgroundColor: '#0a2a0a', borderColor: '#2a5a2a', textAlign: 'center' }}>
                    <div className="card-body">
                        <p style={{ fontSize: '1.125rem', marginBottom: '8px', color: '#4ade80', fontWeight: '600' }}>
                            All teams are ready!
                        </p>
                        <p className="text-light" style={{ marginBottom: '16px' }}>
                            You can now start the draft
                        </p>
                        
                      {/**
                       * This is a client component
                       * Did this for better readability and no need for changing entire structure
                       * passed league.id as a prop
                       */}
                        <StartDraftButton leagueId={league.id} />
                    </div>
                </div>
            )}

            {/* Not Ready Message */}
            {!allTeamsReady && (
                <div className="card" style={{ textAlign: 'center', backgroundColor: '#2a2a00', borderColor: '#5a5a2a' }}>
                    <div className="card-body">
                        <p className="text-light">
                            Waiting for all members to create their team names...
                        </p>
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '8px' }}>
                            {league.team.length}/{league.leagueMember.length} teams ready
                        </p>
                    </div>
                </div>
            )}

            {/* Back to Dashboard Link */}
            <div style={{ marginTop: '32px' }}>
                <Link href="/dashboard" className="btn btn-secondary">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
  )
}








