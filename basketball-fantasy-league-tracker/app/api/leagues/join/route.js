import { NextResponse } from "next/server"
import {prisma} from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

/**
 * Allows a user thats logged in to join a league
 * 
 * Request body: {leagueJoinCode}
 * 
 * Success response (201)
 * displays the message "Joined League successfully"
 * joinedLeague:{...} This is the league that the user joined
 * leagueMemberInfo: {...} The users LeagueMember record
 */

export async function POST(request) {
    
    try {
        //gets the current user's session to know WHO is trying to join
        //Needs await here, else it prompts a Promiss
        const session = await getServerSession(authOptions)

        //check if user is logged in
        if (!session) {
            return NextResponse.json(
                {error: "Unauthorized "},
                {status: 401}
            )
        }

        //gotten from what the user enters in the input field
        //Extract the join code from the request body
       const {leagueJoinCode} = await request.json()

       //checks if Join code was entered
       if (!leagueJoinCode) {
        return NextResponse.json(
            {error: "Please enter the Join Code"},
            {status: 400}
        )
       }

       /**
        * Find the league with the provided join code
        * It will search in the database for a league that matches that Join code
        */
       const findLeague = await prisma.league.findUnique({
            where:{
                joinCode: leagueJoinCode
            }
       })

       //If there's no join code associated with any of the leagues in the database
       //we return the error message 
       if (!findLeague) {
        return NextResponse.json(
            {error: "The League doesn't exist"},
            {status: 400}
        )
       }

       /**
        * Checks if the user is already a member of the league
        * Uses the compound unique constraint  (userId + leagueId)
        * leagueMemberId is the name given
        */
       const existingMember = await prisma.leagueMember.findUnique({
        where: {
            leagueMemberId: {
                userId: session.user.id ,
                leagueId: findLeague.id
            }
        }
       })


       //if the user already is in the league. We display the message
       //This prevents duplicate membership
       if (existingMember) {
        return NextResponse.json(
            {error: "You are already in the league"},
            {status: 400}
        )
       }

       /**
        * If all checks are passed, we can create a LeagueMember record
        * This adds the user to the league with the role as a member
        */
       const joinedLeagueMember = await prisma.leagueMember.create({
        data: {
            userId: session.user.id,    //the current user's id
            leagueId: findLeague.id,    //the league they're joining
            role: "member"
        }
       })

       return NextResponse.json({
        message: "Joined League Successfully",
        joinedLeague: findLeague,
        leagueMemberInfo: joinedLeagueMember
       },
       {status: 201}
    
    )

    } catch (error) {
        return NextResponse.json(
            {error: "Something went wrong with joining the league"},
            {status: 500}
        )
        
    }
}