
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import {prisma} from '@/lib/prisma'
import Link from "next/link"

export default async function DashboardPage() {
    // getServerSession checks if someone is logged in by looking at their cookies/JWT
    // It returns NULL if not logged in, or a SESSION OBJECT if logged in
    const session = await getServerSession(authOptions)

    // GUARD CLAUSE: If session is null (user not logged in), redirect them to login page
    // This prevents unauthorized users from seeing the dashboard
    // redirect() stops execution here and sends them to /login
    if (!session) {
        redirect('/login')
    }

    //Checks all the leagues that a user is a member of
    //gets all the fields from our leagueMember model
    //as well as league (using include and setting it to true)
    const isMember = await prisma.leagueMember.findMany({
      where: {userId: session.user.id },
      include: {
        league: true
      }
    })

    // If we reach this point, the user IS logged in (session exists)
    // We can safely access session.user.name, session.user.email, etc.
  return (
    <div>
        <h1>Welcome,{session.user.name}</h1>

        
          <Link href='/leagues/create'>
            <button>Create League</button>
          </Link>


       <Link href='/leagues/join'>
            <button>Join League</button>
          </Link>
        
        {/*
        We iterate through isMember since its an array of objects.
        In order to get access to the League model (nested),
        we have access it by adding it after our parameter.
        */}
        {isMember.length > 0 ? 
        (
          <ul>
            {isMember.map((membership) => (
              <li key={membership.id}>
                League Name: {membership.league.name}
                Role: {membership.role}
              </li>
            ))}
          </ul>
        )
        :
        <p>NO leagues</p> 
        }
    </div>
  )
}
