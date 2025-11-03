/**
 * This is where we put all 450 NBA Players
 * with their teams & stats
 * Initially our Player model is empty
 * but by seeding it, we are populating it with data.
 * 
 * Since our users needs to draft players to form a team
 * currently they can't do so with no players
 * but seeding allows us to populate the Player model
 * with all Players(initial data).
 */

import {PrismaClient} from '@prisma/client'
const prisma = new PrismaClient()


async function main() {
    console.log('seeding started...')

    /**
     * API key with the 'team list' enndpoint
     * This stores all 30 teams into our url
     * We will want to GET the teamIds
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

        try {
        const response = await fetch(url, options);
        const result = await response.json();

        /**
         * changing the number in teams[#], accesses a specific teams details
         * console.log(result.sports[0].leagues[0].teams[2].team.displayName);
         * Ex: team[2].team.displayName -> Brooklyn Nets
         */
        

        /**
         * We're trying to access all the teams in our API
         */
        const teams = result.sports[0].leagues[0].teams

        /**
         * Tells me how many teams are in the array
         * It should be 30
         */
        console.log(`Found ${teams.length} teams `)

        //Empty array that will store the ids of all teams
        const allTeamsIds = []

        /**
         * We iterate over every team
         * Access the team field which give us access to a teams id
         * We then push that team id to our array
         */
        teams.map((team) => {
            const aTeamsId = team.team.id

            allTeamsIds.push(aTeamsId)
        })

        console.log('Total teams:', allTeamsIds.length)
        console.log('Team ids gotten:', allTeamsIds.slice(0,30)) //prints the first 5 ids of the teams from the api


        console.log('Fetching players id from all teams...')


        //empty array that will store all players id
         const playerIds = []

         /**
          * We iterate through all the teams ids from our now populated array
          * We then find the players ids of that team using the teams id
          */
        for(const teamsId of allTeamsIds){
            console.log(`Fetching players from team ${teamsId}...`)
            const aTeamsAPI =  `https://api-basketball-nba.p.rapidapi.com/players/id?teamId=${teamsId}`

            const playerIdOptions = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': 'api-basketball-nba.p.rapidapi.com'
            }
        };


        const teamsResponse = await fetch(aTeamsAPI, playerIdOptions);
        const teamsResult = await teamsResponse.json();

       
        /**
         * This gets the players id and pushes it into our array
         */
        teamsResult.data.map((playerId) => {
            const aPlayersId = playerId.playerId

            playerIds.push(aPlayersId)
        })

        console.log( `-> Found ${teamsResult.data.length} players`)
        
        }

        console.log(`\nTotal players collected: ${playerIds.length}`)


        /**
         * const bostonId = allTeamsIds[1]

        const bostonAPI = `https://api-basketball-nba.p.rapidapi.com/players/id?teamId=${bostonId}`

        const playerIdOptions = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': 'api-basketball-nba.p.rapidapi.com'
            }
        };

        const bostonResponse = await fetch(bostonAPI, playerIdOptions);
        const bostonResult = await bostonResponse.json();
        console.log(bostonResult);


        const playerIds = []

        bostonResult.data.map((playerId) => {
            const aPlayersId = playerId.playerId

            playerIds.push(aPlayersId)
        })

        console.log('First 10 Players id:',playerIds.slice(0,10) )
         */
        


    } catch (error) {
        console.error(error);
            }


    /**
     * Fetch data from API
     * Trasform data
     * Insert into database
     */


    console.log('Seeding Completed')
}

main()
    .then(async (params) => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })