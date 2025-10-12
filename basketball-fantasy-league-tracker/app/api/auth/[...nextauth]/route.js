import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth";


//API handler that processes login/logout requests
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST };