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
    <div>

        {/* Draft Status Section */}
        <h1>Draft Room</h1>
        <p>Round: {draftForThisLeague.currentRound}</p>
        <p>Pick: {draftForThisLeague.currentPickNumber}</p>
        <p>Current Turn: {currentPick.team.teamName}</p>
        <p>Status: {draftForThisLeague.status}</p>

        {/* Available Players Section */}
        {/* 
          Display only first 20 available players
          Why limit to 20? 
          - Prevents overwhelming UI
          - Better performance (less DOM elements)
          - In production, you'd add search/filter functionality
          
          For each player, show their name, NBA team, and key stats
        */}
        <div>
          <h2>Available Players (First 20)</h2>
            <DraftAPlayerButton 
              availablePlayer = {playersNotDraftedYet}  //Players to display
              currentPick = {currentPick}               //Who's turn is it
              currentUserId = {session.user.id}         //Who's logged in
              leagueId = {currentLeague}                //The league's id
              draftId = {draftForThisLeague.id}         //The draft's id
              
              />
        </div>
        
          {/* Draft Board Section */}

          {/* Shows all picks in order (completed and upcoming)
          This is like the big board you'd see on ESPN during NFL Draft*/}

           {/* Map over ALL draft picks (already sorted by pickNumber from our query)
          Shows complete draft history and upcoming picks
          For completed picks: Shows which team picked which player
          For upcoming picks: Shows which team is up next
            */}
        <div>
          <h2>Draft Board</h2>
          {draftForThisLeague.draftPick.map((pick) => (
          <div key={pick.id}>
            <p>Pick # {pick.pickNumber} - Round {pick.round}</p>
            <p>Team: {pick.team.teamName}</p>

            {/* 
              Conditional rendering:
              - If pick.player exists: Show the player's name (pick has been made)
              - If pick.player is null: Show "Upcoming Pick" (pick hasn't been made yet)
              
              This allows the draft board to show both past picks and future picks
            */}
            {pick.player ? pick.player.name : 'Upcoming Pick'}
          </div>
        ))}
        </div>
        
    </div>
  )
}
