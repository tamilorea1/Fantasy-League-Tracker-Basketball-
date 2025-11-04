/**
 * NBA PLAYER SEEDING SCRIPT
 * =========================
 * Purpose: Populate the database with all NBA players, their teams, and 2024-25 season stats
 * 
 * Data Flow:
 * 1. Fetch all 30 NBA teams
 * 2. Build a teamId → team info lookup map
 * 3. For each team, fetch all players
 * 4. For each player, fetch their season stats
 * 5. Combine player + team + stats data
 * 6. Insert everything into PostgreSQL via Prisma
 * 
 * All player data will be stored into Player model
 * 
 * API: RapidAPI Basketball NBA (requires RAPIDAPI_KEY env variable)
 * Expected Runtime: 5-10 minutes (500+ API calls)
 * Expected Result: ~500-550 players in database
 * 
 * DONT RUN AGAIN UNLESS WE MAKE CLEARING DATA LOGIC
 */

import {PrismaClient} from '@prisma/client'
const prisma = new PrismaClient()


async function main() {
    console.log('seeding started...')

    /**
     * STEP 1: FETCH ALL NBA TEAMS
     * 
     * We need team data first so we can associate players with their teams
     * We will want to GET the teamIds of teams
     * This will allow us to get the players from each team
     */
    const url = 'https://api-basketball-nba.p.rapidapi.com/nbateamlist'

    const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': process.env.RAPIDAPI_KEY,
		'x-rapidapi-host': 'api-basketball-nba.p.rapidapi.com'
        }
    };

        
        /**
         * This will store all player data before database insertion
         * things such as:
         * Full Name, Team Name, player stats , etc.
         */
         const allPlayersData = []

        try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        /**
         * We're trying to access all the teams in our API
         */
        const teams = result.sports[0].leagues[0].teams

        /**
         * Tells me how many teams are in the array
         * It should be 30
         */
        console.log(`Found ${teams.length} teams `)

        

        /**
         * STEP 2: BUILD TEAM LOOKUP MAP
         * create a map -> 
         * teamMaps = "teamId" : {displayName, abbreviation}
         * This allows us to quickly look up team info when processing players
         */
        const teamMaps = {}

        //Empty array that will store the ids of all teams
        const allTeamsIds = []

        /**
         * We iterate over every team
         * Access the team field which give us access to a teams id
         * We then push that team id to our array
         */
        teams.map((team) => {
            const aTeamsId = team.team.id

            const aTeamsFullName = team.team.displayName

            const aTeamsAbbreviation = team.team.abbreviation

            teamMaps[aTeamsId] = {
                displayName : aTeamsFullName, 
                abbreviation: aTeamsAbbreviation}

            allTeamsIds.push(aTeamsId)
        })

        console.log('Total teams:', allTeamsIds.length)
        // console.log('Team ids gotten:', allTeamsIds.slice(0,30)) //prints the first 5 ids of the teams from the api


        // console.log('Fetching players id from all teams...')


        

         /**
          * STEP 3: FETCH PLAYERS FOR EACH TEAM
          * We iterate through all the teams ids from our now populated array
          * We then find the players ids of that team using the teams id
          * 
          * Loop through each team and get their roster
          */
        for(const teamsId of allTeamsIds){
            console.log(`Fetching players from team ${teamsId}...`)
            const aTeamsAPI =  `https://api-basketball-nba.p.rapidapi.com/players/id?teamId=${teamsId}`

            const teamsResponse = await fetch(aTeamsAPI, options);
            const teamsResult = await teamsResponse.json();

       
        /**
         * STEP 4: FETCH STATS FOR EACH PLAYER
         * 
         * For each player on this team, get their 2024-25 season stats
         */
        for(const playerObject of teamsResult.data){
            const aPlayersId = playerObject.playerId

            const aPlayersFN = playerObject.fullName

            const aPlayersSN = playerObject.shortName

            // Build stats API URL for this specific player
            const statsURL = `https://api-basketball-nba.p.rapidapi.com/player/splits?playerId=${aPlayersId}&year=2025&category=perGame`
            
            // Initialize stat variables
            let points, rebounds, assists, steals, blocks

            // ERROR HANDLING: Some players may not have stats
            // ============================================================================
            // Reasons: rookies with no games, injured players, recently traded, etc.
            // Strategy: Set stats to null if unavailable, still add player to database
            try {
            const statsResponse = await fetch(statsURL, options);
	        const statsResult = await statsResponse.json();

            // Navigate to the stats array
            const stats = statsResult.data.splitCategories[0].splits[0].stats

            // Extract specific stats by index (based on API documentation)
            // Index mapping: [16]=PTS, [10]=REB, [11]=AST, [13]=STL, [12]=BLK
            points = stats[16]
            rebounds = stats[10]
            assists = stats[11]
            steals = stats[13]
            blocks = stats[12]
            } catch (error) {
                // Player has no stats available - log and set to null
                console.log(`No stats for ${aPlayersFN}`)
                points = null
                rebounds = null
                assists = null
                steals = null
                blocks = null
            }

            /**
             * STEP 5: COMBINE ALL DATA
             * 
             * Merge player info + team info + stats into one complete object
             */

            allPlayersData.push({
                playerId : aPlayersId,
                fullName: aPlayersFN,
                shortName: aPlayersSN,
                ppg : points,
                reb : rebounds,
                ast : assists,
                stl : steals,
                blk : blocks,
                ...teamMaps[teamsId]    //spreads all the objects from the teamMaps -> displayName and abbreviation
            })
        }        
        
        }

        console.log(`\nTotal players collected: ${allPlayersData.length}`)

        // Test: Find a star player to verify stats
        // const testPlayer = allPlayersData.find(player => 
        //     player.fullName === "Trae Young"  // We know he's on Atlanta
        // )
        // console.log('\nTest player with stats:', testPlayer)

        // const atlantaPlayers = allPlayersData.filter(player => 
        //     player.displayName === "Atlanta Hawks")
        // console.log('\nAtlanta Hawks players sample:', atlantaPlayers.slice(0, 3))



    } catch (error) {
        console.error(error);
            }


    /**
     * Fetch data from API
     * Trasform data
     * Insert into database
     */


    console.log('Seeding Completed')

    // ============================================================================
    // STEP 6: INSERT INTO DATABASE
    // ============================================================================
    // Use Prisma to insert all players into PostgreSQL
    // Note: Using individual create() calls for better error visibility
    // Alternative: Could use createMany() for faster bulk insert

    console.log('\n📥 Inserting players into database...')

        for (const player of allPlayersData) {
            await prisma.player.create({
                data: {
                    name: player.fullName,
                    position: null,  
                    team: player.displayName,
                    points: parseFloat(player.ppg) || 0,
                    assists: parseFloat(player.ast) || 0,
                    rebounds: parseFloat(player.reb) || 0,
                    blocks: parseFloat(player.blk) || 0,
                    steals: parseFloat(player.stl) || 0,
                }
            })
        }

        console.log(`✅ Successfully inserted ${allPlayersData.length} players!`)
}

// ============================================================================
// EXECUTE SEED SCRIPT
// ============================================================================
// Prisma connection management and error handling
main()
    .then(async (params) => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })