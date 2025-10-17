import { NextResponse } from "next/server"
import {prisma} from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export  async function POST(request) {
  
    try {
        //We access the current user's session
        //this is to know who created the League
        const session = await getServerSession(authOptions)

        //checks if the user is logged in
        if (!session) {
            return NextResponse.json(
                {error: "Unauthorized"  },
                {status: 401}
            )
        }

        //This is the state that store the entered League name by the user
        const {leagueName} = await request.json()

        //if the league name wasn't provided, display the error
        if (!leagueName) {
            return NextResponse.json(
                {error: "Please Provide a League Name"},
                {status: 400}
            )
        }

        //create a new league
        // store the id of the current user
        const newLeague = await prisma.league.create({
            data: {
                creatorId: session.user.id ,
                name: leagueName
            }
        })

        //creates a new league member
        //creator is given the role of admin
        //we store the creators id as the current user in the session
        //we store the league id using the newLeague object
        const newLeagueMember = await prisma.leagueMember.create({
            data: {
                role: 'admin',
                userId: session.user.id ,
                leagueId: newLeague.id
            }
        })

        //success
        //used the model names to store the new league and member
        return NextResponse.json(
            {message: 'League created successfully', 
            
                league: newLeague,
                leagueMember: newLeagueMember
            },
            {status: 201}

        )

    } catch (error) {
        return NextResponse.json(
            {error: "Something went wrong with creating the league"},
            {status: 500}
        )
    }

}
