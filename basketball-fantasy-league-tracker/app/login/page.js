'use client'

import { useRouter } from "next/navigation"
import { useState } from "react"
import {signIn} from 'next-auth/react'

export default function LoginPage() {

  const [isEmail, setIsEmail]= useState('')
  const [isPassword, setIsPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  // This function runs when the user submits the login form
  async function handleSubmit(e) {
    e.preventDefault();

    setIsLoading(true)

    setError('')

    // signIn() is NextAuth's magic function that:
    // 1. Sends email/password to our authorize() function in [...nextauth]/route.js
    // 2. The authorize() function checks if credentials are valid
    // 3. If valid, NextAuth creates a session (stores in cookies/JWT)
    // 4. Returns a result object telling us if login succeeded or failed
    const result = await signIn('credentials', {
      email: isEmail,
      password: isPassword,
      redirect: false
    })

    // result.error will exist if login FAILED (wrong email/password)
    // The authorize() function returned null, so NextAuth sets result.error
    if (result?.error) {
      //The entered email/password is not existent in our database
      setError('Email or password does not exist')
      setIsLoading(false)
    }else{
      //Success there's an account with that email & password
      router.push('/dashboard')
    }
  }

  return (
    <div>
      <h1>The Login Page</h1>
      {error && <p>{error}</p>}
        <form onSubmit={handleSubmit}>
            <input
            type="text"
            name="email"
            value={isEmail}
            onChange={(e) => setIsEmail(e.target.value)}
            required
            />
            
            
            
            <input
            type="password"
            name="password"
            value={isPassword}
            onChange={(e) => setIsPassword(e.target.value)}
            required
            />

            <button type="submit" disabled={isLoading}> {isLoading ? 'Logging in...' : 'Ready to Login'} </button>

        </form>
    </div>
  )
}
