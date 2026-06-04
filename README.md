# StudyMate

MVP Next.js 15 per trasformare lo studio in missioni RPG con XP, livelli, achievement, streak e leaderboard globale.

## Architettura

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, componenti in stile shadcn/ui.
- Backend: Server Actions per auth, missioni e completamento sessioni; API route per leaderboard.
- Database/Auth: Supabase Auth + tabelle `users`, `missions`, `study_sessions`, `achievements`, `user_achievements`, `streaks`.
- PWA: manifest, icona e service worker minimale.
- Deployment: pronto per Vercel con variabili Supabase.

## Albero Cartelle

```txt
.
├── README.md
├── package.json
├── components.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── public
│   ├── icon.svg
│   ├── manifest.webmanifest
│   └── sw.js
├── docs
│   └── FUTURE_TODOS.md
├── supabase
│   └── schema.sql
└── src
    ├── app
    │   ├── (auth)
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   ├── api/leaderboard/route.ts
    │   ├── dashboard/page.tsx
    │   ├── session/[sessionId]/page.tsx
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components
    │   ├── auth
    │   ├── dashboard
    │   ├── session
    │   └── ui
    ├── hooks
    │   └── use-countdown.ts
    ├── lib
    │   ├── actions
    │   ├── services
    │   ├── supabase
    │   ├── date.ts
    │   ├── future-todos.ts
    │   ├── gamification.ts
    │   └── utils.ts
    └── types
        └── database.ts
```

## Schema Database SQL

Lo schema completo e' in `supabase/schema.sql`. Include:

- tabelle richieste con `id`, `created_at`, `updated_at`;
- relazioni e indici;
- trigger `updated_at`;
- trigger di creazione profilo da Supabase Auth;
- seed achievement iniziali;
- RLS policies per accesso utente e leaderboard globale autenticata.

## Modelli TypeScript

I modelli sono in `src/types/database.ts`:

- `UserRow`
- `MissionRow`
- `StudySessionRow`
- `AchievementRow`
- `UserAchievementRow`
- `StreakRow`
- `Database`

La logica XP/livelli e' centralizzata in `src/lib/gamification.ts`.

## Piano Implementazione

1. Configurare Supabase e lanciare `supabase/schema.sql`.
2. Impostare `.env.local` partendo da `.env.example`.
3. Registrare un utente con nome, email e password.
4. Creare missioni con materia, titolo, descrizione e durata.
5. Avviare una sessione: la missione resta bloccata durante il countdown.
6. A fine timer confermare completamento.
7. Se completata, assegnare XP, aggiornare livello, streak, statistiche e achievement.
8. Mostrare dashboard e top 20 leaderboard globale.
9. Deploy su Vercel usando le stesse variabili ambiente.

## Avvio

```bash
npm install
cp .env.example .env.local
npm run dev
```

Poi apri `http://localhost:3000`.

## Supabase

1. Crea un progetto Supabase.
2. Incolla ed esegui `supabase/schema.sql` nel SQL editor.
3. Copia `Project URL` e `anon public key` in `.env.local`.
4. Per sviluppo rapido puoi disabilitare la conferma email in Supabase Auth.

## MVP Scope

Incluso in V1:

- registrazione, login, logout;
- dashboard con livello, XP, XP mancanti, streak e missioni completate oggi;
- creazione missione;
- sessione studio con countdown;
- completamento con ricompensa solo se confermata;
- XP `minuti x 2`;
- livelli 1-5;
- achievement iniziali;
- streak giornaliera;
- leaderboard globale top 20;
- PWA minimale.

Non incluso:

- PDF, AI, quiz, flashcard;
- amicizie, chat, multiplayer;
- tutor AI o RAG.
