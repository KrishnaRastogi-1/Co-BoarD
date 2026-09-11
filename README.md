**An AI-powered collaborative whiteboard, built on the modern web.**

Draw, sketch, and brainstorm together in real time — with an AI assistant sitting right on the canvas with you.

## 📖 Overview

**Co-BoarD** is a collaborative whiteboard application built with Next.js. It combines a full-featured drawing canvas with:

- 🔐 **Authentication** via [Clerk](https://clerk.com/)
- 🗄️ **Persistence** via [Neon](https://neon.tech/) serverless Postgres + [Drizzle ORM](https://orm.drizzle.team/)
- 🤖 **AI features** powered by [Google's Gemini API](https://ai.google.dev/) (`@google/genai`)
- 🎨 A modern UI built with [Tailwind CSS v4](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/)

The name suggests its purpose: a **Co**llaborative **Board** — a shared canvas where teams can sketch, plan, and let AI help fill in the gaps.

## ✨ Features

Based on the stack in use, Co-BoarD is set up to support:

- **Infinite collaborative canvas** — freeform drawing, shapes, and diagramming powered by Excalidraw
- **User accounts & sessions** — sign-up/sign-in flows handled by Clerk
- **Persistent boards** — board and user data stored in Postgres (Neon) and queried through Drizzle's type-safe ORM
- **AI-assisted boarding** — Gemini-backed AI features (e.g. generating, summarizing, or extending board content)
- **Polished, accessible UI** — shadcn/ui components on top of Tailwind CSS.

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI Library | [React 19](https://react.dev/) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), `tw-animate-css` |
| Canvas / Drawing | [Excalidraw](https://github.com/excalidraw/excalidraw) |
| Auth | [Clerk](https://clerk.com/) (`@clerk/nextjs`) |
| Database | [Neon](https://neon.tech/) (serverless Postgres) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) + Drizzle Kit |
| AI | [Google Gen AI SDK](https://ai.google.dev/) (`@google/genai`) |
| HTTP Client | [Axios](https://axios-http.com/) |
| Icons | [Lucide](https://lucide.dev/) |
| Linting | ESLint 9 (`eslint-config-next`) |

## 📂 Project Structure

```
Co-BoarD/
├── context/              # Project/AI context files
├── public/               # Static assets
├── src/
│   └── db/
│       └── schema.ts     # Drizzle ORM schema (referenced by drizzle.config.ts)
│   └── ...               # App Router pages, components, API routes, etc.
├── drizzle.config.ts     # Drizzle Kit config (Postgres dialect, uses DATABASE_URL)
├── components.json       # shadcn/ui configuration
├── next.config.ts        # Next.js configuration
├── eslint.config.mjs      # ESLint flat config
├── tsconfig.json
└── package.json
```
## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (per `@types/node: ^20`)
- A [Neon](https://neon.tech/) Postgres database (or any Postgres instance)
- A [Clerk](https://clerk.com/) application (publishable + secret keys)
- A [Google AI Studio](https://aistudio.google.com/) API key for Gemini

### 1. Clone the repo

```bash
git clone https://github.com/KrishnaRastogi-1/Co-BoarD.git
cd Co-BoarD
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```bash
# Database (Neon Postgres)
DATABASE_URL=

# Clerk authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Google Gen AI (Gemini)
GOOGLE_GENAI_API_KEY=
```
### 4. Set up the database

```bash
npx drizzle-kit generate   # generate migrations from src/db/schema.ts
npx drizzle-kit migrate    # apply migrations to your database
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.
