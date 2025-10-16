# PostgreSQL + Prisma Setup for ReCircle

## Quick Setup (Using Docker)

### Option 1: Docker (Recommended)
```bash
# Start PostgreSQL with Docker
docker run --name recircle-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=recircle -p 5432:5432 -d postgres:15

# Run database migrations
npx prisma migrate dev --name init

# Start the development server
npm run dev
```

### Option 2: Local PostgreSQL Installation

1. **Install PostgreSQL** on your system
2. **Create database**:
   ```sql
   CREATE DATABASE recircle;
   ```
3. **Update .env.local**:
   ```
   DATABASE_URL=postgresql://your_username:your_password@localhost:5432/recircle?schema=public
   ```
4. **Run migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

### Option 3: Cloud PostgreSQL (Supabase/Neon)

1. **Create account** at [Supabase](https://supabase.com) or [Neon](https://neon.tech)
2. **Get connection string** from your database dashboard
3. **Update .env.local** with the connection string
4. **Run migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

## Database Schema

The User table includes:
- `id` (Primary Key)
- `display_name` (User's full name)
- `email` (Unique)
- `password` (Hashed)
- `city` and `state` (Location)
- `eco_coins`, `community_rank`, `total_recycled`, `co2_saved`, `active_streak` (Metrics)
- `is_new_user` (Boolean flag)
- `created_at` and `updated_at` (Timestamps)

## Commands

```bash
# Generate Prisma client
npx prisma generate

# Create and run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```
