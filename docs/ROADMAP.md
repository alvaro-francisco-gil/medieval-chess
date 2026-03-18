# Medieval Chess — Roadmap

## Completed

### Phase 1: Monorepo Scaffold
- pnpm workspaces with Next.js web app, chess engine package, shared types
- Tailwind CSS with medieval parchment/wood theme

### Phase 2: Chess Engine Port
- Custom TypeScript engine with medieval rules (Queen Grace Jump, 2-square diagonal bishop, pawn capture restriction)
- No external chess library dependency

### Phase 3: Interactive Board
- Click-to-move and drag-and-drop with legal move highlighting
- Custom medieval piece PNGs (alferza for queen, elephant for bishop)
- 3-column layout (story/board/moves) with responsive stacking
- Rules page with mini board diagrams for each piece

### Phase 4: Puzzle System
- Firebase Auth (Google sign-in) + Firestore
- Puzzle CRUD: create, list, filter by difficulty, play
- Puzzle player with solution validation and progress tracking
- 3-step puzzle creation wizard (set position, play solution, add details)

### Phase 5: Social / Forums
- Community forum with posts, comments, and likes
- User profiles with stats (puzzles solved/created, total likes)
- Firestore security rules

---

## Next Steps

### Deploy & Infrastructure
- [ ] Deploy web app to Vercel (connect GitHub repo)
- [ ] Enable Firestore in Firebase Console (create database)
- [ ] Enable Google Auth provider in Firebase Console
- [ ] Set up Firestore indexes for query performance
- [ ] Deploy Firestore security rules (`firebase deploy --only firestore:rules`)
- [ ] Add custom domain to Vercel

### Alfonso X Puzzle Collection
- [ ] Digitalize problems from the Book of Alfonso X into PGN/FEN format
- [ ] Create a seed script to bulk-upload puzzles to Firestore
- [ ] Add historical stories for each puzzle (time period, context, significance)
- [ ] Add a collection filter on the puzzles page for "alfonso-x"

### Chess Engine Improvements
- [ ] Add proper elephant (bishop) piece type with distinct 'e' identifier
- [ ] Add proper alferza (queen) piece type with distinct 'a' identifier
- [ ] Add more medieval variants (different historical periods/regions)
- [ ] Implement proper SAN disambiguation (e.g., Rae1 vs Rfe1)
- [ ] Add PGN import/export with medieval piece notation
- [ ] Add engine tests with known positions and expected legal moves
- [ ] Validate against python-medieval-chess for correctness

### UI / UX Polish
- [ ] Add medieval-style fonts (e.g., MedievalSharp from Google Fonts)
- [ ] Improve drag-and-drop with ghost piece following cursor
- [ ] Add move animation (piece slides from origin to destination)
- [ ] Add sound effects (move, capture, check)
- [ ] Board flip option (play as black)
- [ ] Dark mode support
- [ ] Mobile-optimized touch interactions
- [ ] Add loading skeletons for Firestore data
- [ ] Error boundaries and toast notifications

### Puzzle System Enhancements
- [ ] Puzzle rating system (Elo-style based on solve rate)
- [ ] Timed puzzles (solve within X seconds)
- [ ] Puzzle streaks (consecutive solves)
- [ ] Hints system (reveal first move, highlight target square)
- [ ] Puzzle editor with drag-and-drop piece placement (not just FEN input)
- [ ] PGN import for puzzle creation
- [ ] Daily puzzle feature

### User & Social Features
- [ ] Email/password authentication
- [ ] Anonymous play with account upgrade prompt
- [ ] User avatars upload (Firebase Storage)
- [ ] Leaderboard (most puzzles solved, most liked puzzles)
- [ ] Follow other users
- [ ] Activity feed (new puzzles by followed users)
- [ ] Puzzle collections (users curate their own sets)
- [ ] Forum post categories/tags

### Mobile App (Future)
- [ ] Add `apps/mobile` with Expo/React Native
- [ ] Share `packages/chess-engine` and `packages/shared` with mobile
- [ ] Offline puzzle support (cache puzzles locally)
- [ ] Push notifications (daily puzzle, comment replies)

### Advanced Features (Future)
- [ ] AI opponent using the medieval chess engine
- [ ] Multiplayer (real-time games via Firebase Realtime DB or WebSockets)
- [ ] Opening explorer for medieval chess
- [ ] Historical timeline mode (play through chess history era by era)
- [ ] Localization (Spanish, given Alfonso X context)
