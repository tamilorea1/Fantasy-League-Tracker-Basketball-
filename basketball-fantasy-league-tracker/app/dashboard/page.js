
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
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '40px' }}>
                <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
                    Welcome, {session.user.name}
                </h1>
                <p className="text-light">Manage your fantasy basketball leagues</p>
            </div>

            {/* Action Buttons */}
            <div className="button-group" style={{ justifyContent: 'flex-start', marginBottom: '48px' }}>
                <Link href='/leagues/create' className="btn btn-primary">
                    Create League
                </Link>
                <Link href='/leagues/join' className="btn btn-secondary">
                    Join League
                </Link>
            </div>

            {/* Leagues Section */}
            <div>
                <h2 className="section-title" style={{ marginBottom: '24px' }}>
                    Your Leagues
                </h2>

                {isMember.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px'
                    }}>
                        {isMember.map((membership) => (
                            <Link 
                                href={`/leagues/${membership.league.id}`} 
                                key={membership.id}
                                style={{ textDecoration: 'none' }}
                            >
                                <div className="card" style={{
                                    cursor: 'pointer',
                                    height: '100%'
                                }}>
                                    <h3 className="card-header" style={{ fontSize: '1.25rem' }}>
                                        {membership.league.name}
                                    </h3>
                                    <div className="card-body">
                                        <div style={{ marginBottom: '12px' }}>
                                            <span className="text-muted" style={{ fontSize: '0.875rem' }}>Role: </span>
                                            <span 
                                            style={{ 
                                                color: membership.role === 'ADMIN' ? '#fff' : '#cccccc7b',
                                                fontWeight: membership.role === 'ADMIN' ? '600' : '400'
                                            }}>
                                                {membership.role}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-muted" style={{ fontSize: '0.875rem' }}>Draft Status: </span>
                                            <span style={{
                                                color: membership.league.draftStatus === 'COMPLETED' ? '#4ade80' : 
                                                       membership.league.draftStatus === 'IN_PROGRESS' ? '#fbbf24' : '#ccc',
                                                fontWeight: '500'
                                            }}>
                                                {membership.league.draftStatus.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                        <p className="text-light" style={{ fontSize: '1.125rem', marginBottom: '24px' }}>
                            You haven't joined any leagues yet
                        </p>
                        <div className="button-group">
                            <Link href='/leagues/create' className="btn btn-primary">
                                Create Your First League
                            </Link>
                            <Link href='/leagues/join' className="btn btn-outline">
                                Join a League
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
  )
}


{/*
            We iterate through isMember since its an array of objects.
            In order to get access to the League model (nested),
            we have access it by adding it after our parameter.
            We also can rejoin specific leagues even after logging out
*/}