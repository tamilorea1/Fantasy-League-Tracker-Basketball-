import {prisma} from "@/lib/prisma"

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

        team: true,
        
      }
    })


    //if league doesn't exist with this id show the print statement
    if (!league) {
      return <p>League not found</p>
    }
  return (
    <div>
        <p>League Name: {league.name}</p>
        <p>Number of members: {league.leagueMember.length}</p>
        <p>Creator: {league.creator.name}</p>
        <p>Join Code: {league.joinCode}</p>
        
        {/*Iterates through each league member and shows their name */}
        {league.leagueMember.map((member) =>(
          <div key={member.id}>
              <li>{member.user.name}</li>
          </div>
        ))}
        
    </div>
  )
}
