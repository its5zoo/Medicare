import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://xtrixeditzz_db_user:LsSg6aRF8j7N1hyy@ac-n7liqds-shard-00-00.ejgy2yb.mongodb.net:27017,ac-n7liqds-shard-00-01.ejgy2yb.mongodb.net:27017,ac-n7liqds-shard-00-02.ejgy2yb.mongodb.net:27017/dermat_crm?ssl=true&replicaSet=atlas-v7zvnr-shard-0&authSource=admin&appName=Cluster0'

export async function connectDB() {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    })
    console.log(`[MongoDB] Connected to MongoDB Atlas host: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error('[MongoDB] Connection error:', error)
    process.exit(1)
  }
}
