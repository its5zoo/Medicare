import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import { connectDB } from "./config/db"
import { seedDatabase } from "./seed"

import authRoutes from "./routes/auth"
import dashboardRoutes from "./routes/dashboard"
import patientRoutes from "./routes/patients"
import consultationRoutes from "./routes/consultations"
import prescriptionRoutes from "./routes/prescriptions"
import followUpRoutes from "./routes/followups"
import feedbackRoutes from "./routes/feedback"
import automationRoutes from "./routes/automation"
import whatsappRoutes from "./routes/whatsapp"
import { initCronScheduler } from "./jobs/cronScheduler"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
  credentials: true,
}))
app.use(cookieParser())
app.use(express.json())

function mount(prefix = "") {
  app.use(`${prefix}/auth`, authRoutes)
  app.use(`${prefix}/dashboard`, dashboardRoutes)
  app.use(`${prefix}/search`, dashboardRoutes)
  app.use(`${prefix}/patients`, patientRoutes)
  app.use(`${prefix}/patient`, patientRoutes)
  app.use(`${prefix}/consultations`, consultationRoutes)
  app.use(`${prefix}/prescriptions`, prescriptionRoutes)
  app.use(`${prefix}/followups`, followUpRoutes)
  app.use(`${prefix}/feedback`, feedbackRoutes)
  app.use(`${prefix}/feedback-submit`, feedbackRoutes)
  app.use(`${prefix}/automations`, automationRoutes)
  app.use(`${prefix}/whatsapp`, whatsappRoutes)
}

mount("/api")
mount("")

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

async function start() {
  await connectDB()
  await seedDatabase()
  initCronScheduler()
  app.listen(PORT, () => console.log(`server running on port ${PORT}`))
}

start().catch(console.error)
