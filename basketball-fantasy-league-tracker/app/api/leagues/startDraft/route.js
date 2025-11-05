import { NextResponse } from "next/server"
import {prisma} from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

/**
 * Backend for handling our beginning of our draft
 * @param {*} request 
 * @returns 
 */


export async function POST(request) {
    try {
        /**
         * Gets the current user's session
         * Used to verify the user is the admin/creator of the league
         */
        const session = await getServerSession(authOptions)

        
        if (!session) {
            return NextResponse.json(
                {error: 'Unauthorized'},
                {status: 401}
            )
        }

        //Gotten from our body in our StartDraftButton.js
        const {leagueId} = await request.json()

        
        /**
         * Checks if the current user is our admin
         * Uses the current league
         * Checks if the creatorId (admin) is the current user
         * We lastly set our draft status to ready since the user is the admin
         */
        const userIsAdmin = await prisma.league.findUnique({
            where: {
                id: leagueId,
                creatorId: session.user.id,
                draftStatus: 'READY'
            }
        })

        //If user isn't the admin, show an error
        if (!userIsAdmin) {
            return NextResponse.json(
                {error: "You're not the admin"},
                {status: 400}
            )
        }

        /**
         * Creating a draft model
         * Assigning the fields with values
         */

        const newDraft = await prisma.draft.create({
            data: {
                leagueId: leagueId,
                status: 'IN_PROGRESS',
                totalRounds: 5,
                currentRound: 1,
                currentPickNumber: 1,
                snakeDraft: false,  //using a linear draft
                startTime: new Date()

            }
        })


        /**
         * Gets all league members sorted by when they joined (earliest first)
         * This determines the draft order - first to join picks first
         */
        const teamsInLeague = await prisma.leagueMember.findMany({
            where:{
                leagueId: leagueId
            },
            include:{
                user : {
                    include : {
                        team : {
                            where : {
                                leagueId : leagueId
                            }
                        }
                    },
                }
            },
            orderBy: {
                joinedAt: 'asc'
            }
        })


        let pickNumber = 1

        /**
         * Iterate through each round, for now we have 5 rounds
         * iterate through each team in the league
         * create a draft pick for each league member
         */
        for (let round = 1; round <= 5; round++) {
            for (let i = 0;  i < teamsInLeague.length; i++) {
                const member = teamsInLeague[i]
                const team = member.user.team[0]
                
                await prisma.draftPick.create({
                    data:{
                        teamId: team.id ,
                        draftId: newDraft.id ,
                        pickOrder: i + 1,
                        pickNumber: pickNumber,
                        round: round,

                    }
                })
                pickNumber++
            }            
        }

        //updates the draft status to in progress
        const draftInProgress = await prisma.league.update({
            where:{
                id: leagueId
            },
            data: {
                draftStatus: 'IN_PROGRESS'
            }
        })


        /**
         * Success message
         */
        return NextResponse.json({
            message: "Successfully started the draft",
        },
        {
            status: 201
        }
    )

    } catch (error) {
        return NextResponse.json(
            {error: "Something went wrong with starting the draft"},
            {status: 500}
        )
    }
}