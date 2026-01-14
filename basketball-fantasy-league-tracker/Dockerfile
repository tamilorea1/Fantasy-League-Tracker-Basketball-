# Step 1: Use Node 20 Alpine
FROM node:20-alpine

# Install libc6-compat for Next.js compiler compatibility
RUN apk add --no-cache libc6-compat

# Step 2: Create a folder inside the virtual container
WORKDIR /app

# Step 3: Copy the package files first
COPY package*.json ./
# Also copy your prisma folder so the schema is available during install
COPY prisma ./prisma/ 

# Step 4: Install the dependencies
RUN npm install

# Step 5: Copy the rest of your project files
COPY . .

# NEW STEP: Set Build Arguments
# Prisma needs the DATABASE_URL *during* the build step to validate the schema
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Step 6: Build the app
RUN npx prisma generate
RUN npm run build

# Step 7: Start the app
EXPOSE 3000
CMD ["npm", "start"]