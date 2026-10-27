# Pulsrix

**Turn meeting recordings into transcripts, structured summaries, and action items — automatically.**

Pulsrix is a web app for people who record meetings and would rather not rewatch them. Upload an audio or video file and Pulsrix transcribes it, uses AI to pull out the important parts, saves the result to your history, and emails you the summary.

## What it does

- **Accounts** — email and password sign-up/sign-in with Firebase Authentication.
- **Upload recordings** — MP3, MP4, WAV, and M4A files up to 100 MB.
- **Transcribe** — speech-to-text powered by AssemblyAI.
- **Summarize** — OpenAI turns the transcript into a structured summary:
  - Key discussion points
  - Decisions made
  - Action items (with assignees when mentioned)
  - Next steps
- **Keep a history** — every meeting is stored in Firestore and can be revisited from the dashboard.
- **Email delivery** — the finished summary is sent to the user's inbox through Resend.
- **Subscriptions** — Stripe Checkout for a Pro plan, with a webhook endpoint for subscription events.
- **Dashboard** — meeting count, recent activity, searchable history, subscription page, and dark mode.

## How it works

```
Browser
   │  upload audio/video + meeting name
   ▼
POST /api/meetings/upload
   │
   ├─► AssemblyAI      transcribe the recording
   ├─► OpenAI          summarize the transcript
   ├─► Firestore       save meeting, transcript, and summary
   └─► Resend          email the summary to the user
   ▼
/dashboard/history     view and expand past summaries
```

Uploads are written to a temporary file for processing, then deleted. The meeting record keeps the transcript and summary, not the original media.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn-style components on Base UI, Lucide icons |
| Animation | Framer Motion |
| Auth & database | Firebase Authentication, Firestore (`firebase`, `firebase-admin`) |
| Transcription | AssemblyAI |
| Summarization | OpenAI (`gpt-3.5-turbo`) |
| Email | Resend |
| Payments | Stripe Checkout + webhooks |
| Hosting | Vercel-ready |

## Project structure

```
app/
  page.tsx                      landing page
  login/ signup/                authentication pages
  dashboard/
    page.tsx                    overview and stats
    upload/page.tsx             upload a recording
    history/page.tsx            past meetings and summaries
    subscription/page.tsx       plan and billing view
  api/
    meetings/upload/route.ts    transcription + summary pipeline
    create-checkout-session/    Stripe Checkout session
    webhooks/stripe/route.ts    Stripe event handler
components/
  layout/ navigation/ ui/       dashboard shell and UI primitives
context/AuthContext.tsx         Firebase auth state
lib/
  firebase/client.ts            Firebase client SDK setup
  stripe/                       Stripe client and server helpers
```

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm
- A Firebase project
- API keys for AssemblyAI, OpenAI, Resend, and Stripe

### 1. Install dependencies

```bash
git clone https://github.com/wisdom-ctrl-tech/Pulsrix.git
cd Pulsrix
npm install
```

### 2. Configure environment variables

Create `.env.local` in the project root:

```env
# Firebase client (public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server only)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# AI services
ASSEMBLYAI_API_KEY=
OPENAI_API_KEY=

# Email
RESEND_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
```

`FIREBASE_PRIVATE_KEY` should be the full private key from the service account JSON, with newlines escaped as `\n`.

### 3. Set up Firebase

1. Enable the **Email/Password** sign-in provider.
2. Create a **Firestore** database.
3. Generate a service account key and copy the project ID, client email, and private key into the server-side variables above.

The app reads and writes a `meetings` collection with documents containing `userId`, `email`, `meetingName`, `transcript`, `summary`, `status`, `createdAt`, and `fileSize`.

### 4. Set up Stripe

1. Create a recurring price for the Pro plan and use its ID as `NEXT_PUBLIC_STRIPE_PRICE_ID`.
2. Forward webhook events locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

3. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build   # production build
npm start       # run the production build
npm run lint    # lint the project
```

## API routes

| Route | Purpose |
|---|---|
| `POST /api/meetings/upload` | Accepts a recording, transcribes it, summarizes it, saves it to Firestore, and emails the result. |
| `POST /api/create-checkout-session` | Creates a Stripe Checkout session for the Pro subscription. |
| `POST /api/webhooks/stripe` | Verifies Stripe webhook signatures and handles checkout/subscription events. |

## Current status

Pulsrix is an early-stage project, and the core flow works end to end: sign in, upload a recording, receive a transcript and summary, and find it in the history page.

Known gaps:

- The subscription page is currently a static preview. Stripe Checkout exists, but plan entitlements are not yet enforced in the app.
- Stripe webhook handling logs events; persisting subscription state still needs to be added.
- Firestore access is filtered by email on the client. Production deployment should include Firestore security rules.
- Transcription is configured for English only.
- There is no automated test suite yet.

## Next up

- [ ] Persist subscription status from Stripe webhooks and gate uploads by plan
- [ ] Add Firestore security rules
- [ ] Show per-step progress while a recording is transcribed and summarized
- [ ] Let users delete meetings and download summaries
- [ ] Support additional languages and longer recordings
- [ ] Add automated tests for the upload pipeline

## Author

Built by [Wisdom](https://github.com/wisdom-ctrl-tech).
