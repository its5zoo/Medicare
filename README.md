# Medicure

A clinic management system I built for a dermatology practice. Handles patient records, consultations, prescriptions, and WhatsApp reminders automatically.

## What it does

- Register patients and track their full visit history
- Record diagnoses and manage medicine prescriptions
- Schedule and track follow-up appointments
- Send automated WhatsApp messages (appointment reminders, dosage alerts, review requests) via Evolution API
- Feedback collection - good ratings go to Google, complaints stay internal

## Tech used

MongoDB, Express, React 19, Node.js, TypeScript. WhatsApp automation via Evolution API. Background cron jobs handle scheduled message dispatch.

## Running locally

```bash
git clone https://github.com/its5zoo/Medicare.git
cd Medicare
npm install
```

Create a `.env` file:
```
PORT=5000
MONGODB_URI=your_mongo_connection
JWT_SECRET=your_secret
EVOLUTION_API_URL=https://your-evolution-api.com
EVOLUTION_API_KEY=your_key
EVOLUTION_INSTANCE_NAME=dermat_clinic
VITE_API_URL=/api
```

Then run:
```bash
npm run server    # backend on :5000
npm run dev       # frontend on :5173
```

Login with `admin / password123`

## Automation schedule

Jobs run at 8am, 1:30pm, and 8:30pm daily for medicine reminders. Missed appointment detection runs at midnight. Welcome messages fire on patient registration.

## Notes

Demo patients use fake numbers so Evolution API doesnt actually send messages during testing.
