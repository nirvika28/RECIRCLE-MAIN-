import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://aarushie1204_db_user:dyzdax-cawguz-8sippI@cluster1.lmiddgl.mongodb.net/recircle?retryWrites=true&w=majority&appName=Cluster1'

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...')
    console.log('URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')) // Hide credentials
    
    await mongoose.connect(MONGODB_URI)
    console.log('✅ MongoDB connected successfully!')
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('📁 Collections:', collections.map(c => c.name))
    
    await mongoose.disconnect()
    console.log('✅ Connection test completed')
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    process.exit(1)
  }
}

testConnection()
