 NETHRA — Life RPG
> Turn your real life into a Japanese fantasy RPG. Complete quests, earn XP & Gold, level up.
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3FCF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Deployed on GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-181717?style=flat-square&logo=github)](https://nethra-life-rpg-application.vercel.app)
**Live Demo:** https://Nithin-Kumar-Y.github.io/NETHRA--Life-RPG-Application/
NETHRA is a gamified life-tracker with a Sakura / glass-morphism theme. You create a character and village, pick quests from a library or create custom ones, complete them daily, and watch your Intellect / Strength / Discipline attributes grow. Works offline with `localStorage` and syncs securely to Supabase when logged in.
---
### Features
**Core Gameplay**
- Create character & village (name, title, avatar, gender — no forced values)
- 40+ library quests (Read, Code, Run, Meditate, etc.) + custom quests
- Daily quests, XP & Gold rewards, level progression (`1000 XP = 1 Level`)
- Attributes: Intellect / Strength / Discipline derived from XP
- Cooldowns (30–60m), daily expiry (browser timezone), missed = expired history
**Progress & UI**
- Dashboard: today’s path, daily score (`completed/planned * 100`), streaks
- Calendar with fire dates & weekly XP chart
- Character panel with level, attributes, XP bar
- Inventory & Gold Shop, mini-games (Shogun Dice, Sakura Memory, Lantern Flash)
- Sakura petals, WorldBackground (morning/evening/night), glass theme
**Persistence**
- Offline-first: `nethra.game.v1` in `localStorage` as fallback/cache
- Supabase Auth (email/password), RLS-secured tables, `SECURITY DEFINER` RPCs for rewards
- No trust on client XP/Gold — server validates quest ownership, status, date & cooldown
### Tech Stack
- **Framework:** Next.js 16 (App Router, `output: export` for GitHub Pages)
- **Language:** TypeScript, React 19
- **Styling:** Tailwind CSS 4, `shadcn/ui`, `tw-animate-css`
- **Backend:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`) — Auth, Postgres, RLS, RPC
- **Other:** `lucide-react`, `@vercel/analytics`
- **Deploy:** GitHub Pages via GitHub Actions (static export)
### Project Structure
```
app/                  # Next.js App Router
  dashboard/          # Today's path, stats, calendar
  quests/             # Create & manage quests
  character/          # Profile & attributes
  calendar/           # Month / Week views
  inventory/          # Shop & games
  login/ signup/      # Auth
  blank/              # Diagnostic route (verifies Pages hydration)
components/
  game-provider.tsx   # Central state + Supabase sync
  time-of-day-provider.tsx
  WorldBackground.tsx / environment/  # Sakura theme
  quests/, dashboard/, ui/
lib/
  game-reducer.ts     # Pure reducer (no DB logic)
  game-state.ts       # localStorage fallback
  rpg.ts              # levelFromTotalXp, XP formulas
  quest-library.ts    # 40+ templates, cooldowns
  supabase/           # client, quests, profile helpers
  dates.ts / timeOfDay.ts
public/
  backgrounds/ character/  # Static assets
supabase/             # SQL migrations (tables, RLS, RPCs)
```
### Getting Started
**Requirements:** Node 20+, npm / pnpm
```bash
git clone https://github.com/Nithin-Kumar-Y/NETHRA--Life-RPG-Application.git
cd NETHRA--Life-RPG-Application
npm install        # or pnpm install
```
**Run locally:**
```bash
npm run dev        # http://localhost:3000
```
**Build (local preview):**
```bash
npm run build
npm start
```
**Build for GitHub Pages (static export):**
```bash
GITHUB_PAGES=true npm run build   # outputs to ./out
```
### Environment Variables
Create `.env.local` in root (not committed):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```
> No `service_role` key in the browser. The app works without Supabase (localStorage only) — Supabase just enables cloud sync.
For GitHub Pages cloud sync, add the same two keys as **Repository Secrets** (`Settings > Secrets and variables > Actions`).
### Supabase Setup
See `docs/SUPABASE.md` and `supabase/` migrations.
Tables: `profiles`, `quests`, `gold_transactions`, `quest_cooldowns`, `inventory_items`, `daily_settlements` (if used) — all with RLS `own-row` policies + `SECURITY DEFINER` RPCs for:
`create_quest`, `complete_quest` (validates ownership/active/date/cooldown, awards XP/Gold atomically), `purchase_item`, `play_game`, `edit_profile`, `expire_overdue_quests`.
### Available Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build (or static export with `GITHUB_PAGES=true`) |
| `npm start` | Start production server |
| `npx tsc --noEmit` | Type check |
### Deployment
**GitHub Pages (automatic):**
Push to `main` triggers `.github/workflows/deploy.yml`:
1. `npm ci` → `GITHUB_PAGES=true npm run build` (`basePath` + `assetPrefix` + `trailingSlash`)
2. `actions/upload-pages-artifact` (`./out`)
3. `actions/deploy-pages`
Enable once: `Settings > Pages > Source: GitHub Actions`.
**Manual:** `Actions > Deploy NETHRA to GitHub Pages > Run workflow`.
### How It Works
1. `lib/game-reducer.ts` is pure — no DB, handles `CREATE_PROFILE`, `CREATE_LIBRARY_QUEST`, `COMPLETE_QUEST`, etc.
2. `GameProvider` holds state: reducer → local state → persists to `localStorage` + (if logged in) Supabase via helpers in `lib/supabase/`.
3. `lib/rpg.ts` is single source for `XP_PER_LEVEL = 1000`, `levelFromTotalXp`, attributes.
### License
MIT — free to use and modify.
### Author
**Nithin Kumar Y** — [GitHub](https://github.com/Nithin-Kumar-Y)
> Inspired by turning daily discipline into a quiet RPG journey.
