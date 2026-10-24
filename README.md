<div align="center">

# 🏋️ DayByFit

**A mobile-first workout tracker with an AI coach that knows your training history.**

[**Live demo →**](https://day-by-fit.vercel.app) · [Українська версія](README.uk.md)

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)

> 🤖 **AI-assisted project.** Built as a portfolio piece by a frontend developer working _together with_ an AI assistant (Claude). See [How this was built](#-how-this-was-built-ai-assisted) for what that means in practice.

</div>

---

<p align="center">
  <img src="docs/hero.png" alt="DayByFit — progress, calendar, summary and AI coach" width="100%">
</p>

## 📸 Screenshots

<table>
  <tr>
    <td align="center" width="25%"><img src="docs/screenshots/calendar.png" alt="Calendar"><br><sub><b>Calendar</b><br>Workouts by day, colored by type</sub></td>
    <td align="center" width="25%"><img src="docs/screenshots/workout.png" alt="Workout details"><br><sub><b>Workout details</b><br>Exercises, sets, edit and delete</sub></td>
    <td align="center" width="25%"><img src="docs/screenshots/add-workout.png" alt="Add workout"><br><sub><b>Add workout</b><br>Autosaved draft, works offline</sub></td>
    <td align="center" width="25%"><img src="docs/screenshots/progress.png" alt="Progress"><br><sub><b>Progress</b><br>Weight and sets over time</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/summary.png" alt="Summary"><br><sub><b>Summary</b><br>Stats and a table to send</sub></td>
    <td align="center"><img src="docs/screenshots/exercises.png" alt="Exercises"><br><sub><b>Exercises</b><br>Rename or delete everywhere</sub></td>
    <td align="center"><img src="docs/screenshots/coach.png" alt="AI coach"><br><sub><b>AI coach</b><br>Streaming chat with memory</sub></td>
    <td></td>
  </tr>
</table>

---

---

## ✨ Features

**Training log**

- Calendar view with all workouts for the selected day
- Workout types: gym, boxing, running, and **custom types** (own name and colour; optionally with exercises)
- Gym workouts with exercises and sets (weight × reps), exercise-name suggestions from your history
- Time of day, duration and a free-text note on every workout
- An unsaved form is kept as a **draft**: if you leave the page by accident, it is restored when you come back
- **Edit and delete** workouts, **rename and delete** exercises, manage workout types

**Insights**

- Per-exercise progress over time
- Searchable list of all exercises with the latest top set
- Summary table with CSV export

**AI coach** 🤖

- Chat with a coach that sees your last 12 weeks of workouts, notes and progress per exercise
- **Streaming answers** (the reply appears gradually, like a real chat)
- **"About me" profile:** write your goals, injuries and equipment once, and the coach takes it into account in every answer
- **Long-term memory:** the coach keeps short notes about you (goals, injuries, preferences), updated in the background every few messages, and you can wipe them
- Remembers the conversation, with a "clear chat" action
- Per-user daily message limit to protect the shared free API quota
- Draggable chat button that snaps to the left or right edge of the screen

**Product details**

- Accounts with email and password; the app requires a login
- Data is stored in the cloud and private per user
- Ukrainian and English interface
- Installable as a **PWA** (home-screen icon, standalone mode, in-app "Install" button with an iOS hint)
- **Works offline:** the app opens without a connection and shows the last synced data; changes made offline are queued on the device and synced automatically when the connection returns
- Mobile-first layout, keyboard-aware chat for iOS and Android, code-split pages

---

## 🧱 Tech stack

| Area                 | Tools                                                                      |
| -------------------- | -------------------------------------------------------------------------- |
| Frontend             | React, TypeScript, Vite, React Router, CSS Modules                         |
| i18n                 | i18next, react-i18next (uk / en, plural forms)                             |
| Backend              | Supabase: Auth, Postgres with Row Level Security, Edge Functions (Deno)    |
| AI                   | Groq API (OpenAI-compatible), `openai/gpt-oss-120b`, server-sent streaming |
| Rendering AI replies | react-markdown, remark-gfm                                                 |
| Hosting              | Vercel (frontend), Supabase (backend)                                      |

---

## 🏗️ Architecture highlights

- **`useSyncedList`**: one generic hook that powers workouts and workout types: optimistic add / update / remove, a persistent **offline queue** (changes made without a connection wait on the device and are retried automatically, with idempotent retries and merging of repeated edits), a per-user data cache for offline start, and **rollback only when the server actually rejects** a change. The cache cannot leak between accounts.
- **Row Level Security** on every table: each user can only read and write their own rows.
- **The LLM key never reaches the browser.** The AI coach is a Supabase Edge Function: it verifies the user's JWT, applies the rate limit, builds the context from the user's data (through RLS), streams the model's answer back and saves the conversation.
- **Abuse protection:** the daily limit is counted from messages that only the server can write, so a client cannot reset it. Notes and workout text are passed to the model as data, with an explicit instruction to ignore instructions found inside them.
- **Memory** is a separate table that the function updates in the background (`waitUntil`), so replies are never slowed down by summarising.
- **Performance:** route-level code splitting with `React.lazy`; the heavy markdown renderer is only loaded with the chat.
- **Offline support:** a small hand-written service worker (network-first for the page with a fast fallback to the cache, cache-first for hashed assets); API requests are never cached.

---

## 🚀 Getting started

**Requirements:** Node.js 22+, a free [Supabase](https://supabase.com) project, a [Groq](https://console.groq.com) API key.

```bash
git clone https://github.com/RVasyliuk-2003/DayByFit.git
cd DayByFit
npm install
```

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_KEY=YOUR_PUBLISHABLE_KEY
```

Run the app:

```bash
npm run dev
```

### Database

The app uses these tables, each with RLS enabled and a `user_id` column that defaults to `auth.uid()`:

| Table            | Purpose                                                            |
| ---------------- | ------------------------------------------------------------------ |
| `workouts`       | workouts with exercises (JSON), note, time of day, duration        |
| `workout_types`  | custom workout types                                               |
| `coach_messages` | AI chat history (written by the Edge Function only)                |
| `coach_memory`   | long-term notes about the user (written by the Edge Function only) |
| `coach_profile`  | the "About me" text, written by the user                           |

Full schema with Row Level Security policies: [`supabase/schema.sql`](supabase/schema.sql).

### AI coach (Edge Function)

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase secrets set LLM_API_KEY=YOUR_GROQ_KEY
npx supabase functions deploy coach
```

Optional secrets: `LLM_BASE_URL` and `LLM_MODEL` to switch to another OpenAI-compatible provider or model.

---

## 🤖 How this was built (AI-assisted)

This project was created with the help of an AI assistant (**Claude**), and I want to be open about it, because _working effectively with AI is part of what this repository shows._

**What I did**

- Defined the product: features, user flows, what to build next and what to leave out
- Chose and directed the architecture (accounts, cloud sync, RLS, Edge Function for the coach)
- Used the app in real conditions (in the gym with a weak signal), found that a failed save lost the workout, and specified the offline-first fix
- Reviewed every change, ran it on real devices and reported precise bugs back (iOS keyboard covering the input, white screen from a hooks-order error, content hidden under the navigation bar, and more)
- Set up and operated the real infrastructure myself: Supabase project, SQL and policies, secrets, Vercel deployment, git workflow
- Made the trade-off decisions (e.g. hide-vs-delete for chat history, forbidding deletion of workout types that are in use)

**What the AI did**

- Proposed approaches and trade-offs, wrote and refactored code under my direction, explained errors and security implications

> I treat AI as a fast, knowledgeable pair-programmer: it speeds me up, but I own the decisions, the review, the testing and the deployment.

---

## 👤 Author

**RVasyliuk-2003**: frontend developer, Wrocław, Poland
[GitHub](https://github.com/RVasyliuk-2003) · [Live demo](https://day-by-fit.vercel.app)
