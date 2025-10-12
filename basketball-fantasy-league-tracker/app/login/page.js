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

  async function handleSubmit(e) {
    e.preventDefault();

    setIsLoading(true)

    setError('')

    const result = await signIn('credentials', {
      email: isEmail,
      password: isPassword,
      redirect: false
    })

    if (result?.error) {
      //The entered email/password is not existent in our database
      setError('Email or password does not exist')
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
