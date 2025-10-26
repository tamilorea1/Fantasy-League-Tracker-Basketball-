import {prisma} from "@/lib/prisma"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"


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

        team: true,
        
      }
    })



    //if league doesn't exist with this id show the print statement
    if (!league) {
      return <p>League not found</p>
    }


    /**
     * This variable will be used to check if the user has a team
     * It checks id in our team records, if there's a teamOwener id that is the same as the current user's id
     */
    const myTeam = league.team.find(team => team.teamOwnerId === session.user.id)


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

        {/**
         * If a team name has been created we display the current user's name
         * else we route them to create their team name and be redirected back to this page
         */}
        {myTeam ? <p>Your team name: {myTeam.teamName}</p> : 
        <Link href={`/leagues/${leagueIdentification}/createTeam`}>
          <button>
            Create team name
          </button>
          </Link>}
        
    </div>
  )
}
