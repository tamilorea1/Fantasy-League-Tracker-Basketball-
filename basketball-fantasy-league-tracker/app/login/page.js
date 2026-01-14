'use client'

import { useRouter } from "next/navigation"
import { useState } from "react"
import {signIn} from 'next-auth/react'
import Link from "next/link"


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
    <div className="page-container">
            <div className="content-wrapper">
                <h1 className="page-title">Welcome Back</h1>
                <p className="page-subtitle">Login to your fantasy basketball league</p>

                {error && (
                    <div style={{
                        backgroundColor: '#2a0000',
                        border: '1px solid #ff4444',
                        borderRadius: '6px',
                        padding: '12px 16px',
                        marginBottom: '24px',
                        color: '#ff6666'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ maxWidth: '400px', width: '100%' }}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            className="form-input"
                            type="email"
                            name="email"
                            placeholder="example@gmail.com"
                            value={isEmail}
                            onChange={(e) => setIsEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            className="form-input"
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={isPassword}
                            onChange={(e) => setIsPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '8px' }}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="text-light" style={{ marginTop: '24px' }}>
                    No created account?{' '}
                    <Link href="/signup" style={{ color: '#fff', textDecoration: 'underline' }}>
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
  )
}
