import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth";
// import {prisma} from '@/lib/prisma'

// import bcrypt from 'bcryptjs'

// import CredentialsProvider from 'next-auth/providers/credentials'


// const authOptions = {
//     providers : [
//         CredentialsProvider({
            
//         name: "Credentials",
    
//         credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" }
//             },

//             //this is a bouncer that verifies that a user is who they claim they are
//             //if they pass it will return the user
//             //else it will not
//         async authorize(credentials) {
//             // checks if there's an existent email or password
//             if (!credentials.email || !credentials.password) {
//                 return null;
//                 }
            
//             //accesses the User model from 'schema prisma'
//             //this gives access to the table with its columns
//             //we access the 'email' column and checks & retrieves the entered email in our database
//             const user = await prisma.user.findUnique({
//                     where: {email: credentials.email}
//                 })

//             //if the user doesn't exist, return null 
//             if (!user) {
//                     return null;
//                 }

//             //Hashes the original password in our database 'user.password'
//             //compares the entered password with the hashed password
//             //we also hash the entered password
//             //if they're both the same then its a success
//             const isValid = await bcrypt.compare(credentials.password, user.password)

//             if (!isValid) {
//                     return null;
//                 }

//             //specifing which data what i want to return
//             //can't just return user since that would also return the password(including the hashed one)
//             return{
//                 id: user.id,
//                 email: user.email,
//                 name: user.name
//             }


//             }
//         })
//     ],

//     session: {
//         strategy: 'jwt'
//     },

//     pages: {
//         signIn: '/login'
//     },

//     callbacks: {
//         async jwt ({token, user}){
//             //adds an 'id' property to token since it already has other properties with it
//             if (user) {
//                 token.id = user.id
//             }
//             return token
//         },

//         async session ({session, token}){
//             if (token) {
//                 session.user.id = token.id
//             }
//             return session
//         }
//     }
// }

//API handler that processes login/logout requests
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST };