import app from "./app.js"
import { connectDB } from "./config/db.js"
import { seedDatabase } from "./seed.js"
import { initCronScheduler } from "./jobs/cronScheduler.js"

const PORT = process.env.PORT || 5000

async function start() {
  await connectDB()
  await seedDatabase()
  initCronScheduler()
  app.listen(PORT, () => console.log(`server running on port ${PORT}`))
}

start().catch(console.error)

