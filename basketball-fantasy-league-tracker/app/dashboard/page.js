
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

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

    // If we reach this point, the user IS logged in (session exists)
    // We can safely access session.user.name, session.user.email, etc.
  return (
    <div>
        <h1>Welcome, Username: {session.user.name}</h1>
        <p>Email: {session.user.email}</p>
    </div>
  )
}
