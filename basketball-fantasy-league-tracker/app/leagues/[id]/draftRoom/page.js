/**
 * DRAFT ROOM PAGE 
 * 
 * Purpose: Displays the live draft interface where users can see:
 * - Current draft status (round, pick number, whose turn it is)
 * - Available players that haven't been drafted yet
 * - Complete draft board showing all picks (completed and upcoming)
 * 
 * Route: /leagues/[id]/draft
 * This is a dynamic route where [id] is the league ID
 * 
 * Authentication: Requires user to be logged in (redirects to /login if not)
 * 
 * Key Concepts:
 * - This is a Server Component (async function, no 'use client' directive)
 * 
 * ============================================================
 * HOW THIS PAGE USES THE SCHEMA
 * ============================================================
 * 
 * 1. Fetch Draft with includes:
 *    Draft → League (get league info)
 *    Draft → DraftPick → Team (get team for each pick)
 *    Draft → DraftPick → Player (get player if picked)
 * 
 * 2. Determine available players:
 *    - Get all playerId values from DraftPick where playerId is not null
 *    - Query Player table excluding those IDs
 * 
 * 3. Find current pick:
 *    - Match Draft.currentPickNumber with DraftPick.pickNumber
 * 
 * ============================================================
 * DRAFT FLOW (High-Level Overview)
 * ============================================================
 * 
 * 1. League Creation (not this page)
 *    - User creates league (League.draftStatus = "NOT_READY")
 *    - Users join and create teams
 * 
 * 2. Draft Initialization (not this page)
 *    - When enough teams exist, admin can create Draft
 *    - System creates all DraftPick records (with null playerId)
 *    - Determines pick order  linear based 
 *    - Draft.currentPickNumber = 1, Draft.currentRound = 1
 *    - Draft.status = "IN_PROGRESS"
 * 
 * 3. Draft Room (THIS PAGE)
 *    - Shows current draft state
 *    - Displays available players
 *    - Shows draft board (completed + upcoming picks)
 */


import {prisma} from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import DraftAPlayerButton from "./DraftAPlayerButton"
import RefreshDraftButton from "./RefreshDraftButton"
import Link from "next/link"
import { redirect } from "next/navigation"
/**
 * Main Draft Room Page Component
 * 
 * @param {Object} params - Dynamic route parameters from Next.js
 * @param {string} params.id - The league ID from the URL (/leagues/[id]/draft)
 * 
 * This is an async Server Component, which means:
 * - It runs on the server only (not in the browser)
 * - Can directly access the database
 * - Automatically handles loading states
 * - Data is fetched fresh on each page load
 */
export default async function draftRoomPage({params}) {

  /**
   * Get the current user's session
   * Returns null if user is not logged in
   * Returns session object with user info if logged in
   */
  const session = await getServerSession(authOptions)

  /**
   * Extract the league ID from the URL parameters
   * Example: If URL is /leagues/abc123/draft, then currentLeague = "abc123"
   */
  const currentLeague = params.id


   if (!session) {
        redirect('/login')
    }

  // ============================================================
  // FETCH DRAFT DATA
  // ============================================================

  /**
   * Retrieve the complete draft information for this league
   * Database Query Breakdown:
   * - findUnique: Gets ONE draft record (leagueId is @unique in schema)
   * - where: Filters by leagueId to get THIS league's draft
   * - include: Fetches related data (follows the relations defined in schema)
   * 
   * What we're getting:
   * 1. Draft record itself (from Draft model)
   *    - status: "IN_PROGRESS" or "COMPLETED"
   *    - currentRound: Which round we're in (1 to totalRounds)
   *    - currentPickNumber: Overall pick number (1 to totalRounds * numTeams)
   *    - snakeDraft: Boolean (true = snake order, false = linear order)
   *    - totalRounds: Total rounds in this draft (usually 8-12)
   * 
   * 2. League info (from League model)
   *    - name, joinCode, draftStatus, creator info
   * 
   * 3. All DraftPick records (from DraftPick model) with nested relations
   *    - Each pick has: pickNumber, round, pickOrder
   *    - Each pick has associated Team (teamName, teamOwnerId)
   *    - Each pick may have Player (name, stats) if already picked
   * 
   * Data Structure After Query:
   * draftForThisLeague = {
   *   id: "draft123",
   *   leagueId: "league123",
   *   status: "IN_PROGRESS",           // From Draft.status
   *   currentRound: 1,                 // From Draft.currentRound
   *   currentPickNumber: 5,            // From Draft.currentPickNumber
   *   totalRounds: 10,                 // From Draft.totalRounds
   *   snakeDraft: true,                // From Draft.snakeDraft
   *   league: { 
   *     name: "My League",             // From League.name
   *     draftStatus: "IN_PROGRESS",    // From League.draftStatus
   *     ... 
   *   },
   *   draftPick: [                     // Array of DraftPick records
   *     { 
   *       id: "pick1", 
   *       pickNumber: 1,               // From DraftPick.pickNumber
   *       round: 1,                    // From DraftPick.round
   *       pickOrder: 1,                // From DraftPick.pickOrder
   *       team: {                      // From Team model (nested include)
   *         teamName: "Lakers",
   *         teamOwnerId: "user123"
   *       },
   *       player: {                    // From Player model (nested include)
   *         name: "LeBron James",
   *         position: "SF",
   *         team: "LAL",
   *         points: 25.7,
   *         ...
   *       }
   *     },
   *     { 
   *       id: "pick2", 
   *       pickNumber: 2, 
   *       round: 1,
   *       pickOrder: 2,
   *       team: { teamName: "Warriors" },
   *       player: null                 // Not picked yet (DraftPick.playerId is nullable)
   *     },
   *     ...
   *   ]
   * }
   */

      const draftForThisLeague = await prisma.draft.findUnique({
        where: {
          leagueId: currentLeague
        },
        /**
         * Including all related data to draft
         * Which are:
         * League, DraftPick, Team, Player
         * 
         */
        include: {
          league : true,

          draftPick: {
            include: {
              team: true,
              player: true
            },
            orderBy: {
            pickNumber: 'asc'   //shows picks in order
            }
          },
          
        }
      })

      if (draftForThisLeague.status === 'COMPLETED') {
        return (
            <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
                        Draft Complete!
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
                        ✓ All Picks Made
                    </div>
                </div>

                <h2 className="section-title" style={{ marginBottom: '24px' }}>Final Draft Board</h2>
                
                <div style={{ marginBottom: '32px' }}>
                    {draftForThisLeague.draftPick.map((pick) => (
                        <div 
                            key={pick.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 16px',
                                backgroundColor: pick.round % 2 === 0 ? '#000' : '#111',
                                borderBottom: '1px solid #222'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <span style={{
                                    fontSize: '0.875rem',
                                    color: '#666',
                                    minWidth: '80px'
                                }}>
                                    Pick #{pick.pickNumber}
                                </span>
                                <span style={{
                                    fontSize: '0.875rem',
                                    color: '#888',
                                    minWidth: '70px'
                                }}>
                                    Round {pick.round}
                                </span>
                                <span className="text-light" style={{ minWidth: '150px' }}>
                                    {pick.team.teamName}
                                </span>
                            </div>
                            <span style={{ fontWeight: '600', color: '#fff' }}>
                                {pick.player.name}
                            </span>
                        </div>
                    ))}
                </div>

                <Link href={`/leagues/${currentLeague}`} className="btn btn-primary">
                    Back to League
                </Link>
            </div>
        )
    }

      const myTeam = draftForThisLeague.draftPick.filter((pick) => (
          //checks if the pick belongs to the logged in user AND if the pick has a player(NOT EMPTY)
          pick.team.teamOwnerId  === session.user.id && pick.playerId !== null
        )
      )

  // ============================================================
  // DETERMINE AVAILABLE PLAYERS
  // ============================================================

  /**
   * Get list of player IDs that have already been drafted
   * 
   * WHY THIS IS NECESSARY:
   * In the Player model, there's no "isDrafted" flag. Instead, we determine
   * if a player is drafted by checking if they're linked to any DraftPick.
   * 
   * The DraftPick model has:
   * - playerId: String? (nullable - null means pick hasn't been made yet)
   * 
   * Process:
   * 1. Filter: Remove picks where playerId is null (upcoming picks with no player yet)
   * 2. Map: Extract just the playerId from each completed pick
   * 
   * Example:
   * draftForThisLeague.draftPick = [
   *   { id: "pick1", playerId: "p1", ... },  // Drafted
   *   { id: "pick2", playerId: "p2", ... },  // Drafted
   *   { id: "pick3", playerId: null, ... },  // Not drafted yet
   *   { id: "pick4", playerId: null, ... },  // Not drafted yet
   * ]
   * 
   * After filter: [
   *   { id: "pick1", playerId: "p1", ... },
   *   { id: "pick2", playerId: "p2", ... }
   * ]
   * 
   * After map: ["p1", "p2"]
   * 
   * Result: Array of player IDs, e.g., ["player1", "player2", "player3"]
   * 
   * Why we need this: To exclude already-drafted players from the available players list
   */
      const draftedPlayerIds = draftForThisLeague.draftPick.filter((pick) => pick.playerId !== null ).map((pick) => pick.playerId)


   /**
   * Get all players who haven't been drafted yet
   * 
   * Query Logic:
   * - findMany: Get multiple player records
   * - where.id.notIn: Exclude players whose IDs are in draftedPlayerIds array
   * 
   * This gives us the "player pool" - players available to be drafted
   * 
   * IMPORTANT: Players can be drafted in MULTIPLE leagues
   * The Player model doesn't have a leagueId field - players are global.
   * A player (e.g., LeBron James) exists once in the database but can be
   * drafted by different teams across different leagues through DraftPick records.
   * 
   * We only filter by THIS draft's picked players, not all drafts globally.
   * 
   * Result: Array of player objects with all their stats
   * [
   *   { id: "p1", name: "Stephen Curry", team: "GSW", points: 30, ... },
   *   { id: "p2", name: "Giannis Antetokounmpo", team: "MIL", points: 28, ... },
   *   ...
   * ]
   */
      const playersNotDraftedYet = await prisma.player.findMany({
        where: {
            id: {
                notIn: draftedPlayerIds  // Exclude these player IDs
            }
        }
    })


    /**
   * Find which pick is currently active (whose turn it is to draft)
   * 
   * Logic:
   * - Search through all draft picks
   * - Find the one where pickNumber matches the draft's currentPickNumber
   * 
   * Example: If currentPickNumber is 5, this finds the 5th pick
   * 
   * Why we need this: To display whose turn it is in the UI
   */
    const currentPick = draftForThisLeague.draftPick.find((pick) => pick.pickNumber === draftForThisLeague.currentPickNumber)

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
            {/* Header Section */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '32px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <h1 className="page-title" style={{ fontSize: '2.5rem', margin: 0 }}>
                    Draft Room
                </h1>
                <RefreshDraftButton />
            </div>

            {/* Draft Status Card */}
            <div className="card" style={{ marginBottom: '32px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '24px'
                }}>
                    <div>
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '4px' }}>
                            Round
                        </p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>
                            {draftForThisLeague.currentRound}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '4px' }}>
                            Pick
                        </p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>
                            {draftForThisLeague.currentPickNumber}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '4px' }}>
                            On the Clock
                        </p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#4ade80' }}>
                            {currentPick.team.teamName}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '4px' }}>
                            Status
                        </p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fbbf24' }}>
                            {draftForThisLeague.status}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr',
                gap: '24px',
                marginBottom: '32px'
            }}>
                {/* My Team Section */}
                <div>
                    <h2 className="section-title" style={{ marginBottom: '16px' }}>
                        My Team
                    </h2>
                    <div className="card">
                        <div className="card-body">
                            {myTeam.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {myTeam.map((pick) => (
                                        <div 
                                            key={pick.id}
                                            style={{
                                                padding: '12px',
                                                backgroundColor: '#000',
                                                borderRadius: '4px',
                                                border: '1px solid #222'
                                            }}
                                        >
                                            <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '4px' }}>
                                                Round {pick.round}
                                            </p>
                                            <p style={{ fontWeight: '600', color: '#fff' }}>
                                                {pick.player.name}
                                            </p>
                                            <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '4px' }}>
                                                {pick.player.team} | {pick.player.points} PPG
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>
                                    No players drafted yet
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Available Players Section */}
                <div>
                    <h2 className="section-title" style={{ marginBottom: '16px' }}>
                        Available Players
                    </h2>
                    <DraftAPlayerButton 
                        availablePlayer={playersNotDraftedYet}
                        currentPick={currentPick}
                        currentUserId={session.user.id}
                        leagueId={currentLeague}
                        draftId={draftForThisLeague.id}
                    />
                </div>
            </div>

            {/* Draft Board Section */}
            <div>
                <h2 className="section-title" style={{ marginBottom: '16px' }}>
                    Draft Board
                </h2>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {draftForThisLeague.draftPick.map((pick) => (
                            <div 
                                key={pick.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    backgroundColor: pick.pickNumber === draftForThisLeague.currentPickNumber 
                                        ? '#0a2a0a' 
                                        : pick.round % 2 === 0 ? '#000' : '#111',
                                    borderBottom: '1px solid #222',
                                    borderLeft: pick.pickNumber === draftForThisLeague.currentPickNumber 
                                        ? '4px solid #4ade80' 
                                        : '4px solid transparent'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
                                    <span style={{
                                        fontSize: '0.875rem',
                                        color: '#666',
                                        minWidth: '60px',
                                        fontWeight: pick.pickNumber === draftForThisLeague.currentPickNumber ? '600' : '400'
                                    }}>
                                        #{pick.pickNumber}
                                    </span>
                                    <span style={{
                                        fontSize: '0.875rem',
                                        color: '#888',
                                        minWidth: '70px'
                                    }}>
                                        Round {pick.round}
                                    </span>
                                    <span 
                                        className="text-light" 
                                        style={{ 
                                            minWidth: '150px',
                                            fontWeight: pick.pickNumber === draftForThisLeague.currentPickNumber ? '600' : '400'
                                        }}
                                    >
                                        {pick.team.teamName}
                                    </span>
                                </div>
                                <span style={{ 
                                    fontWeight: '600', 
                                    color: pick.player ? '#fff' : '#666',
                                    fontStyle: pick.player ? 'normal' : 'italic'
                                }}>
                                    {pick.player ? pick.player.name : 'Upcoming Pick'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
  )
}
