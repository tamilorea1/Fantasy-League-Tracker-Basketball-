'use client'
import { useState } from "react"

import { useRouter } from "next/navigation"
import Link from "next/link"


export default function SignUpPage() {
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault() //prevents page refresh

        setIsLoading(true)

        setError('')

        // Create an object with all the user's entered information
        // This is what we'll send to our API route
        // Shorthand syntax: {email, name, password} same as {email: email, name: name, password: password}
        //store all the users entered information
        const userInfo = {email, name, password}

        //Will then POST (send) the data to our route.js under the signup folder
        //where it will validate everything 
        //ensuring the entered information has no duplicates (email & password)
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST', //POST sends/creates data 
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(userInfo) //<- this part goes into the request paramter in /api/auth/signup
            })

        const result = await response.json()
         console.log("Created user:", result)

         if (response.ok) {
            //Successful sign up, navigate us to the login page
            //user was created wohooo
            router.push('/login')
         }
        else {
            // Error! Show the error message
            setError(result.error || 'Something went wrong');
            setIsLoading(false);
            }
        } catch (error) {
        console.error("Error creating user:", error)
        setError('Network error. Please try again.');  // Show error to user
        setIsLoading(false);
        }
    }


  return (
    <div className="page-container">
            <div className="content-wrapper">
                <h1 className="page-title">Create Account</h1>
                <p className="page-subtitle">Join your fantasy basketball league</p>

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
                        <label className="form-label">Name</label>
                        <input 
                            className="form-input"
                            type="text" 
                            value={name} 
                            name="name"
                            placeholder="Enter your name"
                            onChange={(e) => setName(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input 
                            className="form-input"
                            type="email"
                            value={email} 
                            name="email" 
                            placeholder="example@gmail.com" 
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input 
                            className="form-input"
                            type="password" 
                            value={password} 
                            name="password" 
                            placeholder="Minimum 8 characters"
                            minLength="8" 
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '8px' }}
                    >
                        {isLoading ? "Signing up..." : "Sign Up"}
                    </button>
                </form>

                <p className="text-light" style={{ marginTop: '24px' }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: '#fff', textDecoration: 'underline' }}>
                        Login
                    </Link>
                </p>
            </div>
        </div>
  )
}
