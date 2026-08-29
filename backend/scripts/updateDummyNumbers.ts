import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const uri =
  process.env.MONGODB_URI ||
  'mongodb://xtrixeditzz_db_user:LsSg6aRF8j7N1hyy@ac-n7liqds-shard-00-00.ejgy2yb.mongodb.net:27017,ac-n7liqds-shard-00-01.ejgy2yb.mongodb.net:27017,ac-n7liqds-shard-00-02.ejgy2yb.mongodb.net:27017/dermat_crm?ssl=true&replicaSet=atlas-v7zvnr-shard-0&authSource=admin&appName=Cluster0'

async function updateToDummy() {
  await mongoose.connect(uri)
  console.log('[MongoDB] Connected successfully')
  const db = mongoose.connection.db
  if (!db) {
    console.error('Database connection not established')
    return
  }

  const patients = await db.collection('patients').find().toArray()
  console.log(`[Update] Found ${patients.length} patients in MongoDB Atlas`)

  for (let i = 0; i < patients.length; i++) {
    const p = patients[i]
    const dummyPhone = '+91 90000 ' + String(10001 + i).slice(1)

    await db.collection('patients').updateOne({ _id: p._id }, { $set: { phone: dummyPhone } })
    await db
      .collection('prescriptions')
      .updateMany({ patientId: p.patientId }, { $set: { phone: dummyPhone } })
    await db
      .collection('followups')
      .updateMany({ patientId: p.patientId }, { $set: { phone: dummyPhone } })
    await db
      .collection('automationlogs')
      .updateMany({ 'recipient.patientId': p.patientId }, { $set: { 'recipient.phone': dummyPhone } })
  }

  console.log(
    `✅ [Update Complete] Successfully updated all ${patients.length} patients to non-existent safe demo numbers (+91 90000 00001 to +91 90000 ${String(
      10000 + patients.length
    ).slice(1)})`
  )
  await mongoose.disconnect()
}

updateToDummy()
