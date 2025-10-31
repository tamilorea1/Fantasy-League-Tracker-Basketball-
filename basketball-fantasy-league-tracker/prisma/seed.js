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
        console.log(result.sports[0].leagues[0].teams);
        
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