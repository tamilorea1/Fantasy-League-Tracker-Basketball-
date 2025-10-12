'use client'
import { useState } from "react"

import { useRouter } from "next/navigation"

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
    <div>
        <h1>Welcome to the Sign Up page</h1>
        {error && <p>{error}</p>}
        <form onSubmit={handleSubmit}>
            <input 
            type="email"
             value={email} 
             name="email" 
             placeholder="Example@gmail.com" 
             onChange={(e) => setEmail(e.target.value)}
              />

            <input 
            type="password" 
            value={password} 
            name="password" 
            minLength="8" 
            onChange={(e) => setPassword(e.target.value)}
             />

            <input 
            type="text" 
            value={name} 
            name="name" 
            onChange={(e) => setName(e.target.value)}
            required />

            <button type="submit" disabled={isLoading} >
                {isLoading ? "Signing up..." : "Sign Up"}
            </button>

        </form>
    </div>
  )
}
