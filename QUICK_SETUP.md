# 🚀 Quick Database Setup Guide

## **Step 1: Get a Free Cloud Database**

### **Option A: Neon (Recommended)**
1. Go to [neon.tech](https://neon.tech)
2. Click "Sign Up" and create an account
3. Click "Create Project"
4. Choose a name like "recircle"
5. Copy the connection string (looks like: `postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`)

### **Option B: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project
4. Go to Settings > Database
5. Copy the connection string

## **Step 2: Update Environment File**

Replace the connection string in `.env.local`:

```bash
# Replace this line in .env.local:
DATABASE_URL=postgresql://username:password@localhost:5432/recircle?schema=public

# With your cloud database connection string:
DATABASE_URL=postgresql://username:password@your-cloud-host/database?sslmode=require
```

## **Step 3: Create Database Tables**

```bash
npx prisma migrate dev --name init
```

## **Step 4: Start Your App**

```bash
npm run dev
```

## **Step 5: Test**

1. Go to `http://localhost:3000/login`
2. Create a new account
3. Check your cloud database to see the user data!

---

## **Alternative: Use SQLite (No Setup Required)**

If you want to test immediately without cloud setup, I can switch to SQLite which requires no external database.
