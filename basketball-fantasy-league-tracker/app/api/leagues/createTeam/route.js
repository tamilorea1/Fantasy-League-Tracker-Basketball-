import { NextResponse } from "next/server"
import {prisma} from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

/**
 * Backend that handles the creation and checks of a team
 * @param {*} request 
 * @returns 
 */


export async function POST(request) {

    try {
        //gets the current user's session to know WHO the team owner is
        //we will use it as the teamOwners id
        const session = await getServerSession(authOptions)

        //if a non logged in user tried to access the page return the error
        if (!session) {
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 401}
            )
        }

        //information gotten from our body in our createTeamPage
        const {teamName, associatedLeague} = await request.json()

        /**
         * Checks if the user is a member of the league
         */
        const memberOfLeague = await prisma.leagueMember.findUnique({
            where:{
                leagueMemberId:{
                    userId:  session.user.id,
                    leagueId: associatedLeague
                }
            }
        })

        /**
         * if user isn't a member of the league, return the error
         */
        if (!memberOfLeague) {
            return NextResponse.json(
                {error: "Not a member of this League"},
                {status: 400}
            )
        }

        /**
         * Checks if the user already has a team in the League
         */
        const hasTeamInLeague = await prisma.team.findUnique({
            where:{
                teamOwnership:{
                    teamOwnerId: session.user.id,
                    leagueId: associatedLeague
                }
            }
        })

        /**
         * If the user already has a team in the league, show the prompt
         */
        if (hasTeamInLeague) {
            return NextResponse.json(
                {error: "Team is already present in the league"},
                {status: 400}
            )
        }

        /**
         * Create a new Team record to be added in our database
         */
        const newTeam = await prisma.team.create({
            data: {
                teamName,
                teamOwnerId: session.user.id,
                leagueId: associatedLeague
            }
        })

        /**
         * return Success if all checks are passed
         */
        return NextResponse.json({
            message: "Successfully created Team",
            teamInfo: newTeam
        },
        {
            status: 201
        }
    )

    } catch (error) {
        /**
         * return error message if anything goes wrong
         */
        return NextResponse.json(
            {error: "Something went wrong with creating the team"},
            {status: 500}
        )
    }
    
}