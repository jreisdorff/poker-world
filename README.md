# Poker World

Real-time, browser-based Texas Hold'em for three players, built with Remix and Socket.IO.

## What it is

Poker World is a multiplayer Texas Hold'em table that runs entirely in the browser: no accounts, no downloads. Three players open the site, type a name, and click Join; the moment the third player joins, the server posts blinds, deals hole cards, and the first hand begins. Anyone who arrives after the table is full can watch the hand live as a spectator. The interesting engineering is keeping three clients in lock-step over websockets: every bet, call, and fold is computed on the acting client, broadcast through a Socket.IO server that also owns the deck, street advancement, and showdown evaluation, and then applied identically on every other client. A single designated client (the current active player) is responsible for triggering each state transition, so the hand state machine never double-fires.

Live demo: coming back soon (previously on Heroku)
<!-- TODO: replace with Fly.io URL or a GIF of gameplay -->

<!-- TODO screenshot/GIF: three browser windows mid-hand showing hole cards, the flop, chip stacks in the pot, and the bet slider -->

## Features

- Full Hold'em hand flow: blinds, preflop, flop, turn, river, showdown, with the dealer, small blind, and big blind buttons rotating each hand
- Bet and raise with a slider, check, call, and fold; all-in detection with an automatic run-out of the remaining streets when nobody can act
- Winner detection with pokersolver, including split pots on ties and highlighting of the winning cards on the table
- Pre-actions: queue a fold, check/call, or bet while waiting, and it fires automatically when the action reaches you
- 60-second turn timer that auto-folds the active player
- Spectator mode, in-game chat (read aloud with the browser's SpeechSynthesis API), and a running action log
- Between hands: Next Hand, Next Hand with doubled blinds, and New Game once one player holds all the chips

## Tech stack

- Remix 1.x on React 18 and TypeScript (strict), Tailwind CSS
- Express with Socket.IO 4 attached to the same HTTP server
- pokersolver for hand ranking
- Prisma 4 with SQLite (user, password, and note models inherited from the Remix Indie Stack; live table state is in memory)
- Testing: Vitest with Testing Library and happy-dom, Cypress e2e, ESLint, Prettier
- Infra: multi-stage Dockerfile, Fly.io config (`fly.toml`, `start.sh`), GitHub Actions for lint, typecheck, Vitest, Cypress, and deploy

## Getting started

Requires Node 16 or 18. Remix 1.6's fetch polyfill breaks on Node 20 and newer (page requests return 500); the Dockerfile and CI both pin Node 16.

```sh
npm install
cp .env.example .env     # DATABASE_URL (SQLite file path) and SESSION_SECRET
npm run setup            # prisma generate, migrate deploy, seed
npm run build            # Tailwind CSS + Remix server/client bundles
npm run start            # http://localhost:3000
```

Open three browser windows, enter a different name in each, and click Join Game to start a hand.

Development loop: `npm run dev` starts Remix's built-in dev server, which does not include the Socket.IO server, so the table will not work there. Instead rebuild and run the custom server, which purges the require cache on each request:

```sh
npm run build && npm run start:dev
```

Tests and checks:

```sh
npm test -- --run        # Vitest, one shot (omit --run for watch mode)
npm run typecheck        # tsc for app and cypress
npm run lint
npm run test:e2e:run     # Cypress; builds first and needs the Cypress binary installed
```

## Architecture

- `server/index.js` is the single entry point. It creates an Express app, serves the Remix build through `@remix-run/express`, and attaches a Socket.IO server to the same `http.Server`, so pages and websocket traffic share one port and one process.
- `app/root.tsx` opens a Socket.IO client on mount and exposes it through React context (`app/context.tsx`). `app/routes/index.tsx` is the table UI and registers every socket listener.
- Client-side hand state lives in one `useGameState` hook (`app/hooks/useGameState.ts`). When it is your turn, `app/functions/prepareForBet.ts`, `prepareForCheckCall.ts`, and `prepareForFold.ts` compute the next snapshot (players, pots, next active player, who still owes a response) and emit it. The server rebroadcasts it and every client applies the same snapshot.
- The server owns what a client should not be trusted with: a singleton deck that hands out unique cards, dealing hole and community cards, blind rotation, advancing streets, and showdown evaluation with pokersolver (`advanceHoldEmGame`, `advanceToEnd`, `endHoldEmRound`, `determineWinner`). Only the active player's client sends the advance event, which prevents duplicate transitions when all three clients observe the same betting round close.
- Table state is in memory only: player names and socket ids on the server, hand state on the clients. A server restart resets the table. Prisma/SQLite persists only the template's user, password, and note models and backs the `/healthcheck` route that Fly.io polls.

## Status

Playable end to end with three players. Known gaps: side pots for uneven all-ins are not implemented (all chips go into one pot that is split evenly among the winners), the Muck button is a no-op, the table is fixed at exactly three seats, and the poker logic itself has no unit tests yet (the existing Vitest and Cypress suites cover the auth and notes routes inherited from the template).
