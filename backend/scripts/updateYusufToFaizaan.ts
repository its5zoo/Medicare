import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const uri =
  process.env.MONGODB_URI ||
  'mongodb://xtrixeditzz_db_user:LsSg6aRF8j7N1hyy@ac-n7liqds-shard-00-00.ejgy2yb.mongodb.net:27017,ac-n7liqds-shard-00-01.ejgy2yb.mongodb.net:27017,ac-n7liqds-shard-00-02.ejgy2yb.mongodb.net:27017/dermat_crm?ssl=true&replicaSet=atlas-v7zvnr-shard-0&authSource=admin&appName=Cluster0'

async function updateYusufToFaizaan() {
  await mongoose.connect(uri)
  console.log('[MongoDB] Connected successfully')
  const db = mongoose.connection.db
  if (!db) {
    console.error('Database connection not established')
    return
  }

  // Update Patients
  const patientRes = await db
    .collection('patients')
    .updateMany({ name: { $regex: /yusuf/i } }, { $set: { name: 'Md Faizaan Fatah' } })
  console.log(`[Update] Patients updated: ${patientRes.modifiedCount}`)

  // Update Prescriptions
  const rxRes = await db
    .collection('prescriptions')
    .updateMany({ patientName: { $regex: /yusuf/i } }, { $set: { patientName: 'Md Faizaan Fatah' } })
  console.log(`[Update] Prescriptions updated: ${rxRes.modifiedCount}`)

  // Update FollowUps
  const fuRes = await db
    .collection('followups')
    .updateMany({ patientName: { $regex: /yusuf/i } }, { $set: { patientName: 'Md Faizaan Fatah' } })
  console.log(`[Update] FollowUps updated: ${fuRes.modifiedCount}`)

  // Update Activities
  const actRes = await db
    .collection('activities')
    .updateMany(
      { description: { $regex: /yusuf/i } },
      { $set: { description: 'Md Faizaan Fatah registered with Dr. Priya Sharma' } }
    )
  console.log(`[Update] Activities updated: ${actRes.modifiedCount}`)

  // Update Automation Logs
  const logRes = await db
    .collection('automationlogs')
    .updateMany(
      { 'recipient.name': { $regex: /yusuf/i } },
      { $set: { 'recipient.name': 'Md Faizaan Fatah' } }
    )
  console.log(`[Update] Automation logs updated: ${logRes.modifiedCount}`)

  console.log('✅ All instances of Yusuf successfully replaced with Faizaan in MongoDB Atlas!')
  await mongoose.disconnect()
}

updateYusufToFaizaan()
