# ReCircle - MongoDB Integration Setup

This guide will help you set up MongoDB with your ReCircle application.

## Prerequisites

1. **MongoDB Atlas Account**: Sign up at [MongoDB Atlas](https://cloud.mongodb.com/)
2. **Node.js**: Make sure you have Node.js installed

## Setup Steps

### 1. Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign up or log in to your account
3. Click "Create" to create a new cluster
4. Choose the free tier (M0 Sandbox)
5. Select a region close to you
6. Give your cluster a name (e.g., "recircle-cluster")
7. Click "Create Cluster"

### 2. Create Database User

1. In your cluster dashboard, go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### 3. Get Connection String

1. In your cluster dashboard, go to "Connect"
2. Choose "Connect your application"
3. Select "Node.js" as driver
4. Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### 4. Configure Environment Variables

1. Copy the `env.example` file to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and replace the placeholder values:
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/recircle
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

3. Generate a secure JWT secret:
   ```bash
   openssl rand -base64 32
   ```

### 5. Install Dependencies

The MongoDB dependencies are already installed, but if you need to reinstall:

```bash
npm install mongoose bcryptjs jsonwebtoken --legacy-peer-deps
npm install --save-dev @types/bcryptjs @types/jsonwebtoken --legacy-peer-deps
```

### 6. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3000/login`
3. Try creating a new account
4. Check your MongoDB Atlas dashboard to see if the user was created

## API Endpoints

The following API endpoints are now available:

- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/profile` - Get current user profile (requires authentication)

## Database Schema

The User model includes the following fields:

```typescript
{
  displayName: string
  email: string (unique)
  password: string (hashed)
  city: string
  state: string
  ecoCoins: number (default: 0)
  communityRank: number (default: 0)
  totalRecycled: number (default: 0)
  co2Saved: number (default: 0)
  activeStreak: number (default: 0)
  isNewUser: boolean (default: true)
  createdAt: Date
  updatedAt: Date
}
```

## Security Features

- **Password Hashing**: Passwords are hashed using bcryptjs with 12 salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **Error Handling**: Proper error messages without exposing sensitive data

## Troubleshooting

### Common Issues

1. **Connection Error**: Check your MongoDB URI and network access settings
2. **Authentication Error**: Verify your database user credentials
3. **JWT Error**: Make sure your JWT_SECRET is set correctly

### Network Access

Make sure to configure network access in MongoDB Atlas:
1. Go to "Network Access" in your cluster dashboard
2. Add your IP address or use `0.0.0.0/0` for development (not recommended for production)

## Production Considerations

For production deployment:

1. Use a strong, unique JWT secret
2. Restrict network access to your application's IP addresses
3. Use environment variables for all sensitive data
4. Consider using a managed database service
5. Implement rate limiting for API endpoints
6. Add proper logging and monitoring

## Next Steps

Now that MongoDB is set up, you can:

1. Add more user data fields
2. Create additional API endpoints
3. Implement data updates (eco coins, recycling stats, etc.)
4. Add user profile management
5. Implement password reset functionality
6. Add email verification
