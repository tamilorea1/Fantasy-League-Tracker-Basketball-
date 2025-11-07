import { NextResponse } from "next/server"
import {prisma} from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"


export async function POST(request) {

    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                {error: 'Unauthorized'},
                {status: 401}
            )
        }

        const {leagueId, draftId, playerId} = await request.json()

        const currentDraft = await prisma.draft.findUnique({
            where: {
                id: draftId,
                leagueId: leagueId,
            },
            include:{
                draftPick : {
                    include: {
                        team : true     //need team info to verify ownership
                    }
                }
            }
        })

        if (!currentDraft) {
            return NextResponse.json(
                {error: 'Draft not found'},
                {status: 404}
            )
        }

        //find the current pick using the draft's currentPickNumber
        const currentPick = currentDraft.draftPick.find((pick) => (
            pick.pickNumber === currentDraft.currentPickNumber
        ))

        
        if (!currentPick) {
            return NextResponse.json(
               {error: 'Could not determine current pick'},
               {status: 500}
            )
        }

        //Is it this user's turn?

        if (currentPick.team.teamOwnerId !== session.user.id) {
            return NextResponse.json(
                {error: 'Not your turn'},
                {status: 403}
            )
        }

        // Check if player is still available (hasn't been drafted)
        const playerAlreadyDrafted = currentDraft.draftPick.some(
            pick => pick.playerId === playerId
        )

        if (playerAlreadyDrafted) {
            return NextResponse.json(
                {error: 'Player has already been drafted'},
                {status: 400}
            )
        }

        //Update the draftPick with a player
        const updatedPick = await prisma.draftPick.update({
            where: {
                id: currentPick.id  //current picks id
            },
            data:{
                playerId: playerId  //assigns the player
            }
        })

        //calculates next pick number
        const nextPickNumber = currentDraft.currentPickNumber + 1

        const totalPicks = currentDraft.draftPick.length

        const numberOfTeams = totalPicks /currentDraft.totalRounds

        if (nextPickNumber > totalPicks) {
            await prisma.draft.update({
                where:{
                    id: draftId
                },
                data:{
                    status: 'COMPLETED',
                    completedTime: new Date()
                }
            })

                        // Also update the League status
            await prisma.league.update({
                where: { id: leagueId },
                data: {
                    draftStatus: 'COMPLETED'
                }
            })
        }else{
                    // Calculate next round
            const nextRound = Math.ceil(nextPickNumber / numberOfTeams)
            
            // Update draft to next pick
            await prisma.draft.update({
                where: { id: draftId },
                data: {
                    currentPickNumber: nextPickNumber,
                    currentRound: nextRound
                }
            })
        }


                /**
         * Success message
         */
        return NextResponse.json({
            message: "Successfully Chosen players for draft",
        },
        {
            status: 201
        }
    )


    } catch (error) {
        console.error('Draft pick error:', error)
        return NextResponse.json(
            { error: "Something went wrong making the pick" },
            { status: 500 }
        )
    }
    
}