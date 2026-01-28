🏀 Fantasy League Tracker
A modern, full-stack basketball management application built to help users draft players and track their fantasy league teams in real-time. This application features a live draft room, real-time player data, and a seamless integration between a Next.js 15 frontend and a Supabase database.

**🔗 [Live Demo](https://fantasy-league-tracker-basketball-u.vercel.app/)** ---

## ✨ Features
- **Real-time Draft Room:** Experience a live drafting environment where you can select players and build your roster instantly.

- **Team Management:** Create and manage fantasy teams with ease, tracking your lineup and roster changes.

- **Secure Authentication:** Robust user login and session management powered by NextAuth.js.

- **Cloud Database:** Powered by Supabase (PostgreSQL) with connection pooling for high-performance serverless execution.

- **Dockerized Workflow:** Fully containerized development environment using Docker Compose for a "one-command" setup.

## 🛠️ Tech Stack
- **Framework:** Next.js 15 (App Router)

- **Authentication:** NextAuth.js v4

- **Database:** PostgreSQL via Supabase

- **ORM:** Prisma

- **Infrastructure:** Docker & Vercel

- **Styling:** CSS

## 🚀 Getting Started
Prerequisites
- Node.js (Latest LTS)

- Docker Desktop

- A Supabase Project (for cloud database)

## Local Installation
- Clone the repository:

Bash

- git clone [https://github.com/tamilorea1/Fantasy-League-Tracker-Basketball-.git]
- cd Fantasy-League-Tracker-Basketball-/basketball-fantasy-league-tracker
## Set up Environment Variables:

Create a .env file in the root directory and add your Supabase connection strings and secrets:

Code snippet

DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-0-ca-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@aws-0-ca-central-1.pooler.supabase.com:5432/postgres"
NEXTAUTH_SECRET="your_random_secret_here"
NEXTAUTH_URL="http://localhost:3000"
Run with Docker Compose:

This command builds the image and starts the app with hot-reloading enabled:

Bash

docker compose up
Initialize the Database:

Run this in a separate terminal to sync your schema with Supabase:

Bash

npx prisma generate
npx prisma db push
Deployment

This project is optimized for deployment on Vercel.

Ensure you set the Root Directory to basketball-fantasy-league-tracker in your Vercel project settings if using a monorepo structure.

License Distributed under the MIT License. See LICENSE for more information.
