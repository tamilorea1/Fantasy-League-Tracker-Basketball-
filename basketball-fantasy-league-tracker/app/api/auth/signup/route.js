import { NextResponse } from 'next/server'

import {prisma} from '@/lib/prisma'

import bcrypt from 'bcryptjs'

//users will SEND their data to this api route
//In summary this will POST (send) our data to our database
// and will input it in our User model
export async function POST(request) {

    try {
            //Information that user typed in the 'form' tag
    const {name, email, password} = await request.json()

    //if they didn't type an email or password, return a error
    if (!email || !password) {
        return NextResponse.json(
            { error: "Email and Password required" },
            { status: 400 }  // 400 = Bad Request
            );
    }

    //find an exisiting email 
    const existingUserEmail = await prisma.user.findUnique({
        where: {email}
    })

    //if the email already exists return the message
    if (existingUserEmail) {
        return NextResponse.json(
            { error: "This user already exists" },
            { status: 400 }  // 400 = Bad Request
            );
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // this will create a new row in our User model,
    //and will store the following information inside the table
    const newUser = await prisma.user.create({
        data: {
            name: name,
            email: email,
            password: hashedPassword
        }
    })

    //success message
    //we store the created user (newUser), get its id from the model
    //and store it in userId
    return NextResponse.json(
        { message: "User created successfully", userId: newUser.id },
        { status: 201 }  // 201 = Created
        );

        } catch (error) {
            console.log("SignUp error:", error)
            return  NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
            );
        }
}