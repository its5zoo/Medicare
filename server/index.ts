import app from "./app"
import { connectDB } from "./config/db"
import { seedDatabase } from "./seed"
import { initCronScheduler } from "./jobs/cronScheduler"

const PORT = process.env.PORT || 5000

async function start() {
  await connectDB()
  await seedDatabase()
  initCronScheduler()
  app.listen(PORT, () => console.log(`server running on port ${PORT}`))
}

start().catch(console.error)

