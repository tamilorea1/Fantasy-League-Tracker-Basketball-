
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/login')
    }

  return (
    <div>
        <h1>Welcome, Username: {session.user.name}</h1>
        <p>Email: {session.user.email}</p>
    </div>
  )
}
