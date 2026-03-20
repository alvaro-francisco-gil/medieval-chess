# i18n Implementation Plan — English + Spanish

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full English/Spanish internationalization to Medieval Chess using next-intl, with auto-detection, manual switching, and SEO support.

**Architecture:** next-intl with App Router `[locale]` dynamic segment. English is the default (unprefixed), Spanish uses `/es/` prefix. Middleware handles locale detection from cookie → Accept-Language → fallback. All UI strings extracted to JSON translation files.

**Tech Stack:** next-intl, Next.js 15 App Router, React 19, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-20-i18n-design.md`

---

## File Map

### New files
| File | Responsibility |
|------|---------------|
| `apps/web/i18n/routing.ts` | Locale config (locales, default, prefix strategy) |
| `apps/web/i18n/request.ts` | Server-side message loading for next-intl |
| `apps/web/i18n/navigation.ts` | Locale-aware Link, useRouter, usePathname, redirect exports |
| `apps/web/middleware.ts` | Locale detection + routing middleware |
| `apps/web/messages/en.json` | English translations |
| `apps/web/messages/es.json` | Spanish translations |
| `apps/web/components/LanguageSwitcher.tsx` | EN/ES toggle for NavBar |
| `apps/web/app/[locale]/layout.tsx` | Locale layout with providers + NavBar |
| `apps/web/app/not-found.tsx` | Root 404 page (outside locale, no next-intl) |
| `apps/web/app/[locale]/not-found.tsx` | Translated 404 page |

### Modified files
| File | Changes |
|------|---------|
| `apps/web/next.config.ts` | Wrap with `createNextIntlPlugin` |
| `apps/web/app/layout.tsx` | Strip down to minimal root layout (CSS import + html/body shell) |
| `apps/web/app/providers.tsx` | No changes needed (used inside locale layout) |
| `apps/web/components/NavBar.tsx` | Locale-aware Link, translations, add LanguageSwitcher |
| `apps/web/components/StoryPanel.tsx` | Accept translated strings via props |
| `apps/web/components/MoveList.tsx` | Accept translated strings via props |
| `apps/web/app/[locale]/page.tsx` | Translations + locale-aware Link (moved from app/page.tsx) |
| `apps/web/app/[locale]/rules/page.tsx` | All rule text from translations (moved from app/rules/) |
| `apps/web/app/[locale]/play/page.tsx` | Translations for buttons/status (moved from app/play/) |
| `apps/web/app/[locale]/puzzles/page.tsx` | Translations (moved from app/puzzles/) |
| `apps/web/app/[locale]/puzzles/[id]/page.tsx` | Translations for gameplay feedback (moved) |
| `apps/web/app/[locale]/puzzles/new/page.tsx` | Translations for wizard steps (moved) |
| `apps/web/app/[locale]/community/page.tsx` | Translations + timeAgo (moved) |
| `apps/web/app/[locale]/community/[id]/page.tsx` | Translations + timeAgo (moved) |
| `apps/web/app/[locale]/community/new/page.tsx` | Translations for form (moved) |
| `apps/web/app/[locale]/profile/page.tsx` | Translations + locale-aware date formatting (moved) |

---

### Task 1: Install next-intl and create i18n config files

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/web/next.config.ts`
- Create: `apps/web/i18n/routing.ts`
- Create: `apps/web/i18n/request.ts`
- Create: `apps/web/i18n/navigation.ts`
- Create: `apps/web/middleware.ts`

- [ ] **Step 1: Install next-intl**

```bash
cd apps/web && pnpm add next-intl
```

- [ ] **Step 2: Create `i18n/routing.ts`**

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});
```

- [ ] **Step 3: Create `i18n/navigation.ts`**

```ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

- [ ] **Step 4: Create `i18n/request.ts`**

```ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "en" | "es")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 5: Create `middleware.ts`**

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/", "/(es)/:path*", "/((?!_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Step 6: Wrap `next.config.ts` with next-intl plugin**

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 7: Create placeholder translation files**

Create `apps/web/messages/en.json` and `apps/web/messages/es.json` with minimal content to verify the setup compiles:

```json
{
  "common": {
    "loading": "Loading..."
  }
}
```

(`es.json` uses `"loading": "Cargando..."`)

- [ ] **Step 8: Verify build still compiles**

```bash
cd /home/powervaro/githubs/medieval-chess && pnpm web:build
```

Expected: Build succeeds (pages still render from old paths until restructure).

- [ ] **Step 9: Commit**

```bash
git add apps/web/package.json apps/web/pnpm-lock.yaml apps/web/i18n/ apps/web/middleware.ts apps/web/next.config.ts apps/web/messages/
git commit -m "feat(i18n): install next-intl and add config infrastructure"
```

---

### Task 2: Create full English translation file

**Files:**
- Modify: `apps/web/messages/en.json`

Extract every hardcoded string from all pages and components into structured JSON. Reference each source file to ensure nothing is missed.

- [ ] **Step 1: Write `messages/en.json`**

```json
{
  "nav": {
    "brand": "Medieval Chess",
    "rules": "Rules",
    "play": "Play",
    "puzzles": "Puzzles",
    "community": "Community"
  },
  "auth": {
    "signIn": "Sign in with Google",
    "signOut": "Sign out",
    "signInToCreate": "Sign in to create the first {item}.",
    "signInRequired": "Please sign in to {action}."
  },
  "home": {
    "title": "Medieval Chess",
    "subtitle": "Explore the history of chess through medieval variants, puzzles, and community.",
    "rulesCard": {
      "title": "Rules",
      "description": "Learn how medieval chess pieces move with visual examples."
    },
    "puzzlesCard": {
      "title": "Puzzles",
      "description": "Solve historical chess problems from the Book of Alfonso X and more."
    },
    "playCard": {
      "title": "Play",
      "description": "Set up positions and play medieval chess variants locally."
    },
    "communityCard": {
      "title": "Community",
      "description": "Share puzzles, discuss strategies, and learn together."
    }
  },
  "metadata": {
    "home": {
      "title": "Medieval Chess",
      "description": "Explore the history of chess through medieval variants, puzzles, and community"
    },
    "rules": {
      "title": "Rules of Medieval Chess",
      "description": "Learn how medieval chess pieces move — the Queen (Alferza), Bishop (Elephant), and more"
    },
    "play": {
      "title": "Play Medieval Chess",
      "description": "Set up positions and play medieval chess variants locally"
    },
    "puzzles": {
      "title": "Medieval Chess Puzzles",
      "description": "Solve historical chess problems and community-created challenges"
    },
    "community": {
      "title": "Medieval Chess Community",
      "description": "Discuss strategies, share discoveries, and connect with other players"
    },
    "profile": {
      "title": "Your Profile — Medieval Chess",
      "description": "View your puzzle stats and created puzzles"
    }
  },
  "rules": {
    "backToHome": "Back to home",
    "title": "Rules of Medieval Chess",
    "intro": "Medieval chess differs from modern chess in several key ways. The queen and bishop move very differently, and pawn movement changes as the game progresses.",
    "legend": {
      "piecePosition": "Piece position",
      "canMove": "Can move here",
      "canCapture": "Can capture here"
    },
    "queen": {
      "title": "The Queen (Alferza) — Grace Jump",
      "description": "At the start of the game, queens are 'Grace Jump' pieces. On their very first move, they have special jumping abilities. After moving once, they become regular queens with limited movement.",
      "firstMoveLabel": "First move — Grace Jump options:",
      "firstMoveCaption": "Jumps 2 squares (no capture), or 1 diagonal (capture OK)",
      "afterMoveLabel": "After first move — Regular queen:",
      "afterMoveCaption": "Only moves 1 square diagonally"
    },
    "bishop": {
      "title": "The Bishop (Elephant)",
      "description": "Unlike modern chess where bishops slide along diagonals, the medieval bishop jumps exactly 2 squares diagonally. It leaps over any piece in between — nothing can block its path.",
      "movementLabel": "Bishop movement — 2-square diagonal jump:",
      "movementCaption": "Jumps over pieces — the pawn doesn't block the top-left move"
    },
    "rook": {
      "title": "The Rook",
      "description": "The rook moves exactly as in modern chess — it slides any number of squares along a rank or file, and cannot jump over pieces.",
      "movementLabel": "Rook movement — slides along ranks and files:",
      "movementCaption": "Slides until blocked — can capture the pawn"
    },
    "knight": {
      "title": "The Knight",
      "description": "The knight moves exactly as in modern chess — in an L-shape (2+1 squares), and can jump over other pieces.",
      "movementLabel": "Knight movement — L-shape jumps:"
    },
    "pawn": {
      "title": "The Pawn",
      "description": "Pawns move forward one square, or capture one square diagonally — just like modern chess. However, the double-move on the first turn is only available if no capture has occurred in the game yet.",
      "note": "Once any piece captures another (by either side), all pawns lose the ability to move two squares. Pawns promote to a Grace Jump Queen.",
      "beforeCaptureLabel": "Before any capture — can move 1 or 2 squares:",
      "afterCaptureLabel": "After a capture happened — only 1 square:"
    },
    "king": {
      "title": "The King",
      "description": "The king moves exactly as in modern chess — one square in any direction. Castling is available under the standard conditions.",
      "movementLabel": "King movement — 1 square in any direction:"
    },
    "summary": {
      "title": "Key Differences from Modern Chess",
      "queen": "Starts with special Grace Jump powers (2-square jumps). After first move, only moves 1 square diagonally. Much weaker than the modern queen.",
      "bishop": "Jumps exactly 2 squares diagonally (like a knight but diagonal). Can leap over pieces. Does not slide.",
      "pawns": "Double-move is only available before any capture occurs in the game. Promote to Grace Jump Queen.",
      "others": "Move exactly as in modern chess.",
      "tryItOut": "Try it out"
    }
  },
  "play": {
    "title": "Medieval Chess",
    "freePlay": "Free Play",
    "freePlayStory": "Set up positions and explore medieval chess variants. The queen starts as a Grace Jump piece — it can jump 2 squares diagonally or orthogonally, or capture 1 square diagonally. After its first move, it becomes a regular queen (1 square diagonal only). Bishops jump 2 squares diagonally. Pawns can only advance 2 squares if no capture has occurred.",
    "undo": "Undo",
    "reset": "Reset",
    "moves": "Moves",
    "noMoves": "No moves yet. Click a piece to start.",
    "status": {
      "whiteToMove": "White to move",
      "blackToMove": "Black to move",
      "checkmateWhiteWins": "Checkmate! White wins.",
      "checkmateBlackWins": "Checkmate! Black wins.",
      "draw": "Game over — draw."
    }
  },
  "puzzles": {
    "title": "Puzzles",
    "subtitle": "Solve historical chess problems and community-created challenges.",
    "createPuzzle": "Create Puzzle",
    "all": "All",
    "loading": "Loading puzzles...",
    "noPuzzles": "No puzzles yet.",
    "beFirst": "Be the first to create one!",
    "by": "by {author}",
    "difficulty": {
      "beginner": "Beginner",
      "easy": "Easy",
      "medium": "Medium",
      "hard": "Hard",
      "master": "Master"
    },
    "detail": {
      "loading": "Loading puzzle...",
      "notFound": "Puzzle not found.",
      "difficultyLabel": "Difficulty: {level}/5",
      "byAuthor": "By {author}",
      "progress": "Progress",
      "movesFound": "{current} of {total} moves found",
      "prompt": "Find the best move. {color} to play.",
      "solved": "Puzzle solved! Well done.",
      "correct": "Correct! Keep going...",
      "incorrect": "Not quite. Try again!",
      "playAgain": "Play again",
      "retry": "Retry"
    },
    "create": {
      "title": "Create Puzzle",
      "signInRequired": "Please sign in to create puzzles.",
      "stepPosition": "Set Position",
      "stepSolution": "Solution",
      "stepDetails": "Details",
      "step1Title": "Step 1: Set the starting position",
      "step1Description": "Enter a FEN string to set the puzzle's starting position.",
      "fenPlaceholder": "FEN string...",
      "nextSolution": "Next: Define Solution",
      "step2Title": "Step 2: Play the solution",
      "step2Description": "Make the moves that form the puzzle's solution on the board. Include both the player's moves and the opponent's responses.",
      "solutionMoves": "Solution moves:",
      "undo": "Undo",
      "back": "Back",
      "nextDetails": "Next: Add Details",
      "step3Title": "Step 3: Add details",
      "labelTitle": "Title *",
      "placeholderTitle": "e.g., Alfonso X — Problem 12",
      "labelDescription": "Description *",
      "placeholderDescription": "e.g., White to play and checkmate in 2",
      "labelStory": "Historical Story (optional)",
      "placeholderStory": "Historical context for this puzzle...",
      "labelDifficulty": "Difficulty",
      "labelCollection": "Collection (optional)",
      "placeholderCollection": "e.g., alfonso-x",
      "creating": "Creating...",
      "createButton": "Create Puzzle"
    }
  },
  "community": {
    "title": "Community",
    "subtitle": "Discuss strategies, share discoveries, and connect with other players.",
    "newPost": "New Post",
    "loading": "Loading posts...",
    "noPosts": "No posts yet.",
    "startDiscussion": "Start a discussion!",
    "commentCount": "{count, plural, one {# comment} other {# comments}}",
    "likeCount": "{count, plural, one {# like} other {# likes}}",
    "timeAgo": {
      "justNow": "just now",
      "minutesAgo": "{count}m ago",
      "hoursAgo": "{count}h ago",
      "daysAgo": "{count}d ago"
    },
    "detail": {
      "loading": "Loading...",
      "notFound": "Post not found.",
      "like": "Like",
      "liked": "Liked",
      "commentPlaceholder": "Write a comment...",
      "posting": "Posting...",
      "commentButton": "Comment",
      "signInToComment": "Sign in to comment."
    },
    "new": {
      "title": "New Post",
      "signInRequired": "Please sign in to create posts.",
      "labelTitle": "Title",
      "placeholderTitle": "What's on your mind?",
      "labelContent": "Content",
      "placeholderContent": "Share your thoughts, strategies, or questions...",
      "cancel": "Cancel",
      "posting": "Posting...",
      "postButton": "Post"
    }
  },
  "profile": {
    "loading": "Loading...",
    "signInRequired": "Please sign in to view your profile.",
    "memberSince": "Member since {date}",
    "puzzlesSolved": "Puzzles Solved",
    "puzzlesCreated": "Puzzles Created",
    "totalLikes": "Total Likes",
    "yourPuzzles": "Your Puzzles",
    "noPuzzles": "You haven't created any puzzles yet.",
    "createOne": "Create one",
    "likes": "{count} likes"
  },
  "notFound": {
    "title": "Page Not Found",
    "description": "The page you're looking for doesn't exist.",
    "goHome": "Go to homepage"
  }
}
```

- [ ] **Step 2: Verify JSON is valid**

```bash
cd /home/powervaro/githubs/medieval-chess && node -e "JSON.parse(require('fs').readFileSync('apps/web/messages/en.json','utf8')); console.log('Valid JSON')"
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/messages/en.json
git commit -m "feat(i18n): add complete English translation file"
```

---

### Task 3: Create Spanish translation file

**Files:**
- Create: `apps/web/messages/es.json`

- [ ] **Step 1: Write `messages/es.json`**

Full Spanish translation of all keys. Chess-specific terms keep Alferza in both.

```json
{
  "nav": {
    "brand": "Ajedrez Medieval",
    "rules": "Reglas",
    "play": "Jugar",
    "puzzles": "Problemas",
    "community": "Comunidad"
  },
  "auth": {
    "signIn": "Iniciar sesión con Google",
    "signOut": "Cerrar sesión",
    "signInToCreate": "Inicia sesión para crear el primer {item}.",
    "signInRequired": "Inicia sesión para {action}."
  },
  "home": {
    "title": "Ajedrez Medieval",
    "subtitle": "Explora la historia del ajedrez a través de variantes medievales, problemas y comunidad.",
    "rulesCard": {
      "title": "Reglas",
      "description": "Aprende cómo se mueven las piezas del ajedrez medieval con ejemplos visuales."
    },
    "puzzlesCard": {
      "title": "Problemas",
      "description": "Resuelve problemas históricos de ajedrez del Libro de Alfonso X y más."
    },
    "playCard": {
      "title": "Jugar",
      "description": "Configura posiciones y juega variantes de ajedrez medieval localmente."
    },
    "communityCard": {
      "title": "Comunidad",
      "description": "Comparte problemas, discute estrategias y aprende junto a otros."
    }
  },
  "metadata": {
    "home": {
      "title": "Ajedrez Medieval",
      "description": "Explora la historia del ajedrez a través de variantes medievales, problemas y comunidad"
    },
    "rules": {
      "title": "Reglas del Ajedrez Medieval",
      "description": "Aprende cómo se mueven las piezas — la Reina (Alferza), el Alfil (Elefante) y más"
    },
    "play": {
      "title": "Jugar Ajedrez Medieval",
      "description": "Configura posiciones y juega variantes de ajedrez medieval localmente"
    },
    "puzzles": {
      "title": "Problemas de Ajedrez Medieval",
      "description": "Resuelve problemas históricos de ajedrez y desafíos creados por la comunidad"
    },
    "community": {
      "title": "Comunidad de Ajedrez Medieval",
      "description": "Discute estrategias, comparte descubrimientos y conéctate con otros jugadores"
    },
    "profile": {
      "title": "Tu Perfil — Ajedrez Medieval",
      "description": "Consulta tus estadísticas de problemas y problemas creados"
    }
  },
  "rules": {
    "backToHome": "Volver al inicio",
    "title": "Reglas del Ajedrez Medieval",
    "intro": "El ajedrez medieval difiere del ajedrez moderno en varios aspectos clave. La reina y el alfil se mueven de forma muy diferente, y el movimiento de los peones cambia a medida que avanza la partida.",
    "legend": {
      "piecePosition": "Posición de la pieza",
      "canMove": "Puede moverse aquí",
      "canCapture": "Puede capturar aquí"
    },
    "queen": {
      "title": "La Reina (Alferza) — Salto de Gracia",
      "description": "Al inicio de la partida, las reinas son piezas de 'Salto de Gracia'. En su primer movimiento, tienen habilidades especiales de salto. Después de moverse una vez, se convierten en reinas regulares con movimiento limitado.",
      "firstMoveLabel": "Primer movimiento — Opciones del Salto de Gracia:",
      "firstMoveCaption": "Salta 2 casillas (sin captura), o 1 diagonal (captura permitida)",
      "afterMoveLabel": "Después del primer movimiento — Reina regular:",
      "afterMoveCaption": "Solo se mueve 1 casilla en diagonal"
    },
    "bishop": {
      "title": "El Alfil (Elefante)",
      "description": "A diferencia del ajedrez moderno donde los alfiles se deslizan por las diagonales, el alfil medieval salta exactamente 2 casillas en diagonal. Salta sobre cualquier pieza en el camino — nada puede bloquear su paso.",
      "movementLabel": "Movimiento del alfil — salto diagonal de 2 casillas:",
      "movementCaption": "Salta sobre las piezas — el peón no bloquea el movimiento superior izquierdo"
    },
    "rook": {
      "title": "La Torre",
      "description": "La torre se mueve exactamente como en el ajedrez moderno — se desliza cualquier número de casillas a lo largo de una fila o columna, y no puede saltar sobre piezas.",
      "movementLabel": "Movimiento de la torre — se desliza por filas y columnas:",
      "movementCaption": "Se desliza hasta ser bloqueada — puede capturar el peón"
    },
    "knight": {
      "title": "El Caballo",
      "description": "El caballo se mueve exactamente como en el ajedrez moderno — en forma de L (2+1 casillas), y puede saltar sobre otras piezas.",
      "movementLabel": "Movimiento del caballo — saltos en forma de L:"
    },
    "pawn": {
      "title": "El Peón",
      "description": "Los peones avanzan una casilla, o capturan una casilla en diagonal — igual que en el ajedrez moderno. Sin embargo, el movimiento doble en el primer turno solo está disponible si no ha ocurrido ninguna captura en la partida.",
      "note": "Una vez que cualquier pieza captura a otra (por cualquier bando), todos los peones pierden la capacidad de mover dos casillas. Los peones promocionan a una Reina con Salto de Gracia.",
      "beforeCaptureLabel": "Antes de cualquier captura — puede mover 1 o 2 casillas:",
      "afterCaptureLabel": "Después de una captura — solo 1 casilla:"
    },
    "king": {
      "title": "El Rey",
      "description": "El rey se mueve exactamente como en el ajedrez moderno — una casilla en cualquier dirección. El enroque está disponible bajo las condiciones estándar.",
      "movementLabel": "Movimiento del rey — 1 casilla en cualquier dirección:"
    },
    "summary": {
      "title": "Diferencias Clave con el Ajedrez Moderno",
      "queen": "Comienza con poderes especiales de Salto de Gracia (saltos de 2 casillas). Después del primer movimiento, solo se mueve 1 casilla en diagonal. Mucho más débil que la reina moderna.",
      "bishop": "Salta exactamente 2 casillas en diagonal (como un caballo pero en diagonal). Puede saltar sobre piezas. No se desliza.",
      "pawns": "El movimiento doble solo está disponible antes de que ocurra cualquier captura en la partida. Promocionan a Reina con Salto de Gracia.",
      "others": "Se mueven exactamente como en el ajedrez moderno.",
      "tryItOut": "Pruébalo"
    }
  },
  "play": {
    "title": "Ajedrez Medieval",
    "freePlay": "Juego Libre",
    "freePlayStory": "Configura posiciones y explora variantes de ajedrez medieval. La reina comienza como una pieza de Salto de Gracia — puede saltar 2 casillas en diagonal u ortogonalmente, o capturar 1 casilla en diagonal. Después de su primer movimiento, se convierte en una reina regular (solo 1 casilla en diagonal). Los alfiles saltan 2 casillas en diagonal. Los peones solo pueden avanzar 2 casillas si no ha ocurrido ninguna captura.",
    "undo": "Deshacer",
    "reset": "Reiniciar",
    "moves": "Movimientos",
    "noMoves": "Sin movimientos aún. Haz clic en una pieza para empezar.",
    "status": {
      "whiteToMove": "Mueven las blancas",
      "blackToMove": "Mueven las negras",
      "checkmateWhiteWins": "¡Jaque mate! Ganan las blancas.",
      "checkmateBlackWins": "¡Jaque mate! Ganan las negras.",
      "draw": "Fin de la partida — tablas."
    }
  },
  "puzzles": {
    "title": "Problemas",
    "subtitle": "Resuelve problemas históricos de ajedrez y desafíos creados por la comunidad.",
    "createPuzzle": "Crear Problema",
    "all": "Todos",
    "loading": "Cargando problemas...",
    "noPuzzles": "No hay problemas aún.",
    "beFirst": "¡Sé el primero en crear uno!",
    "by": "por {author}",
    "difficulty": {
      "beginner": "Principiante",
      "easy": "Fácil",
      "medium": "Medio",
      "hard": "Difícil",
      "master": "Maestro"
    },
    "detail": {
      "loading": "Cargando problema...",
      "notFound": "Problema no encontrado.",
      "difficultyLabel": "Dificultad: {level}/5",
      "byAuthor": "Por {author}",
      "progress": "Progreso",
      "movesFound": "{current} de {total} movimientos encontrados",
      "prompt": "Encuentra el mejor movimiento. Juegan las {color}.",
      "solved": "¡Problema resuelto! Bien hecho.",
      "correct": "¡Correcto! Sigue adelante...",
      "incorrect": "No del todo. ¡Inténtalo de nuevo!",
      "playAgain": "Jugar de nuevo",
      "retry": "Reintentar"
    },
    "create": {
      "title": "Crear Problema",
      "signInRequired": "Inicia sesión para crear problemas.",
      "stepPosition": "Posición",
      "stepSolution": "Solución",
      "stepDetails": "Detalles",
      "step1Title": "Paso 1: Establece la posición inicial",
      "step1Description": "Ingresa una cadena FEN para establecer la posición inicial del problema.",
      "fenPlaceholder": "Cadena FEN...",
      "nextSolution": "Siguiente: Definir Solución",
      "step2Title": "Paso 2: Juega la solución",
      "step2Description": "Realiza los movimientos que forman la solución del problema en el tablero. Incluye tanto los movimientos del jugador como las respuestas del oponente.",
      "solutionMoves": "Movimientos de la solución:",
      "undo": "Deshacer",
      "back": "Atrás",
      "nextDetails": "Siguiente: Agregar Detalles",
      "step3Title": "Paso 3: Agrega detalles",
      "labelTitle": "Título *",
      "placeholderTitle": "ej., Alfonso X — Problema 12",
      "labelDescription": "Descripción *",
      "placeholderDescription": "ej., Blancas juegan y dan mate en 2",
      "labelStory": "Historia Histórica (opcional)",
      "placeholderStory": "Contexto histórico de este problema...",
      "labelDifficulty": "Dificultad",
      "labelCollection": "Colección (opcional)",
      "placeholderCollection": "ej., alfonso-x",
      "creating": "Creando...",
      "createButton": "Crear Problema"
    }
  },
  "community": {
    "title": "Comunidad",
    "subtitle": "Discute estrategias, comparte descubrimientos y conéctate con otros jugadores.",
    "newPost": "Nueva Publicación",
    "loading": "Cargando publicaciones...",
    "noPosts": "No hay publicaciones aún.",
    "startDiscussion": "¡Inicia una discusión!",
    "commentCount": "{count, plural, one {# comentario} other {# comentarios}}",
    "likeCount": "{count, plural, one {# me gusta} other {# me gusta}}",
    "timeAgo": {
      "justNow": "ahora mismo",
      "minutesAgo": "hace {count}m",
      "hoursAgo": "hace {count}h",
      "daysAgo": "hace {count}d"
    },
    "detail": {
      "loading": "Cargando...",
      "notFound": "Publicación no encontrada.",
      "like": "Me gusta",
      "liked": "Te gusta",
      "commentPlaceholder": "Escribe un comentario...",
      "posting": "Publicando...",
      "commentButton": "Comentar",
      "signInToComment": "Inicia sesión para comentar."
    },
    "new": {
      "title": "Nueva Publicación",
      "signInRequired": "Inicia sesión para crear publicaciones.",
      "labelTitle": "Título",
      "placeholderTitle": "¿Qué tienes en mente?",
      "labelContent": "Contenido",
      "placeholderContent": "Comparte tus ideas, estrategias o preguntas...",
      "cancel": "Cancelar",
      "posting": "Publicando...",
      "postButton": "Publicar"
    }
  },
  "profile": {
    "loading": "Cargando...",
    "signInRequired": "Inicia sesión para ver tu perfil.",
    "memberSince": "Miembro desde {date}",
    "puzzlesSolved": "Problemas Resueltos",
    "puzzlesCreated": "Problemas Creados",
    "totalLikes": "Me Gusta Totales",
    "yourPuzzles": "Tus Problemas",
    "noPuzzles": "Aún no has creado ningún problema.",
    "createOne": "Crear uno",
    "likes": "{count} me gusta"
  },
  "notFound": {
    "title": "Página No Encontrada",
    "description": "La página que buscas no existe.",
    "goHome": "Ir al inicio"
  }
}
```

- [ ] **Step 2: Verify JSON is valid**

```bash
cd /home/powervaro/githubs/medieval-chess && node -e "JSON.parse(require('fs').readFileSync('apps/web/messages/es.json','utf8')); console.log('Valid JSON')"
```

- [ ] **Step 3: Verify both files have the same keys**

```bash
cd /home/powervaro/githubs/medieval-chess && node -e "
const en = JSON.parse(require('fs').readFileSync('apps/web/messages/en.json','utf8'));
const es = JSON.parse(require('fs').readFileSync('apps/web/messages/es.json','utf8'));
function getKeys(obj, prefix='') {
  return Object.entries(obj).flatMap(([k,v]) => typeof v === 'object' ? getKeys(v, prefix+k+'.') : [prefix+k]);
}
const enKeys = getKeys(en).sort();
const esKeys = getKeys(es).sort();
const missing = enKeys.filter(k => !esKeys.includes(k));
const extra = esKeys.filter(k => !enKeys.includes(k));
if (missing.length) console.log('Missing in es:', missing);
if (extra.length) console.log('Extra in es:', extra);
if (!missing.length && !extra.length) console.log('All keys match!');
"
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/messages/es.json
git commit -m "feat(i18n): add complete Spanish translation file"
```

---

### Task 4: Restructure app directory with [locale] segment

**Files:**
- Modify: `apps/web/app/layout.tsx` (strip to minimal root)
- Create: `apps/web/app/[locale]/layout.tsx` (locale layout with providers)
- Move all page files into `apps/web/app/[locale]/`
- Create: `apps/web/app/[locale]/not-found.tsx`

- [ ] **Step 1: Create the `[locale]` directory structure**

```bash
cd /home/powervaro/githubs/medieval-chess/apps/web/app && mkdir -p "[locale]" "[locale]/rules" "[locale]/play" "[locale]/puzzles" "[locale]/puzzles/[id]" "[locale]/puzzles/new" "[locale]/community" "[locale]/community/[id]" "[locale]/community/new" "[locale]/profile"
```

- [ ] **Step 2: Move all page files into `[locale]/`**

```bash
cd /home/powervaro/githubs/medieval-chess/apps/web/app
git mv page.tsx "[locale]/page.tsx"
git mv rules/page.tsx "[locale]/rules/page.tsx"
git mv play/page.tsx "[locale]/play/page.tsx"
git mv puzzles/page.tsx "[locale]/puzzles/page.tsx"
git mv puzzles/\[id\]/page.tsx "[locale]/puzzles/[id]/page.tsx"
git mv puzzles/new/page.tsx "[locale]/puzzles/new/page.tsx"
git mv community/page.tsx "[locale]/community/page.tsx"
git mv community/\[id\]/page.tsx "[locale]/community/[id]/page.tsx"
git mv community/new/page.tsx "[locale]/community/new/page.tsx"
git mv profile/page.tsx "[locale]/profile/page.tsx"
```

Then remove the now-empty old directories and verify they're gone:

```bash
cd /home/powervaro/githubs/medieval-chess/apps/web/app
rmdir rules play puzzles/\[id\] puzzles/new puzzles community/\[id\] community/new community profile
ls -d rules play puzzles community profile 2>/dev/null && echo "ERROR: some old dirs remain" || echo "Clean — all old dirs removed"
```

- [ ] **Step 3: Rewrite root `app/layout.tsx` to minimal shell**

```tsx
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

- [ ] **Step 4: Create `app/[locale]/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Providers } from "../providers";
import NavBar from "@/components/NavBar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.home" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: {
        en: "/",
        es: "/es",
        "x-default": "/",
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "es")) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <NavBar />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Create root `app/not-found.tsx`**

This catches routes outside the `[locale]` segment. It cannot use next-intl since it's outside the provider.

```tsx
import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <main
          className="min-h-screen p-8 flex flex-col items-center justify-center"
          style={{ backgroundColor: "#f5f0e8" }}
        >
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "#5c3a1e" }}
          >
            Page Not Found
          </h1>
          <p className="mb-4" style={{ color: "#6b5744" }}>
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="px-4 py-2 rounded text-sm font-medium"
            style={{ backgroundColor: "#5c3a1e", color: "#f5f0e8" }}
          >
            Go to homepage
          </Link>
        </main>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Create `app/[locale]/not-found.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <main
      className="min-h-screen p-8 flex flex-col items-center justify-center"
      style={{ backgroundColor: "var(--color-parchment)" }}
    >
      <h1
        className="text-3xl font-bold mb-2"
        style={{ color: "var(--color-wood-dark)" }}
      >
        {t("title")}
      </h1>
      <p className="mb-4" style={{ color: "var(--color-ink-light)" }}>
        {t("description")}
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded text-sm font-medium"
        style={{
          backgroundColor: "var(--color-wood-dark)",
          color: "var(--color-parchment)",
        }}
      >
        {t("goHome")}
      </Link>
    </main>
  );
}
```

- [ ] **Step 7: Verify build compiles**

```bash
cd /home/powervaro/githubs/medieval-chess && pnpm web:build
```

Expected: Build succeeds. Pages may still have hardcoded strings — that's fine, we're verifying the structural change.

- [ ] **Step 8: Commit**

```bash
git add -A apps/web/app/
git commit -m "feat(i18n): restructure app into [locale] dynamic segment"
```

---

### Task 5: Update NavBar with translations and LanguageSwitcher

**Files:**
- Modify: `apps/web/components/NavBar.tsx`
- Create: `apps/web/components/LanguageSwitcher.tsx`

- [ ] **Step 1: Create `LanguageSwitcher.tsx`**

```tsx
"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: "en" | "es") => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => switchLocale("en")}
        className="px-1.5 py-0.5 rounded cursor-pointer transition-colors"
        style={{
          fontWeight: locale === "en" ? 700 : 400,
          color: locale === "en" ? "var(--color-wood-dark)" : "var(--color-ink-light)",
          textDecoration: locale === "en" ? "underline" : "none",
        }}
      >
        EN
      </button>
      <span style={{ color: "var(--color-ink-light)" }}>|</span>
      <button
        onClick={() => switchLocale("es")}
        className="px-1.5 py-0.5 rounded cursor-pointer transition-colors"
        style={{
          fontWeight: locale === "es" ? 700 : 400,
          color: locale === "es" ? "var(--color-wood-dark)" : "var(--color-ink-light)",
          textDecoration: locale === "es" ? "underline" : "none",
        }}
      >
        ES
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Update `NavBar.tsx`**

Replace `import Link from "next/link"` with `import { Link } from "@/i18n/navigation"`. Add `useTranslations` for all text. Add `LanguageSwitcher` component next to auth buttons.

```tsx
"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import LanguageSwitcher from "./LanguageSwitcher";

export default function NavBar() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");

  return (
    <nav
      className="border-b px-4 md:px-8 py-3 flex items-center justify-between"
      style={{
        borderColor: "rgba(139, 94, 60, 0.2)",
        backgroundColor: "rgba(255,255,255,0.3)",
      }}
    >
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="text-lg font-bold"
          style={{ color: "var(--color-wood-dark)" }}
        >
          {t("brand")}
        </Link>
        <div className="hidden sm:flex items-center gap-4 text-sm">
          <Link
            href="/rules"
            className="hover:underline"
            style={{ color: "var(--color-ink-light)" }}
          >
            {t("rules")}
          </Link>
          <Link
            href="/play"
            className="hover:underline"
            style={{ color: "var(--color-ink-light)" }}
          >
            {t("play")}
          </Link>
          <Link
            href="/puzzles"
            className="hover:underline"
            style={{ color: "var(--color-ink-light)" }}
          >
            {t("puzzles")}
          </Link>
          <Link
            href="/community"
            className="hover:underline"
            style={{ color: "var(--color-ink-light)" }}
          >
            {t("community")}
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <LanguageSwitcher />
        {loading ? null : user ? (
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="hover:underline"
              style={{ color: "var(--color-ink-light)" }}
            >
              {user.displayName || user.email}
            </Link>
            <button
              onClick={signOut}
              className="px-3 py-1 rounded cursor-pointer transition-colors"
              style={{
                backgroundColor: "rgba(139, 94, 60, 0.15)",
                color: "var(--color-wood-dark)",
                border: "1px solid rgba(139, 94, 60, 0.3)",
              }}
            >
              {tAuth("signOut")}
            </button>
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="px-3 py-1 rounded cursor-pointer transition-colors"
            style={{
              backgroundColor: "var(--color-wood-dark)",
              color: "var(--color-parchment)",
            }}
          >
            {tAuth("signIn")}
          </button>
        )}
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Verify build compiles**

```bash
cd /home/powervaro/githubs/medieval-chess && pnpm web:build
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/NavBar.tsx apps/web/components/LanguageSwitcher.tsx
git commit -m "feat(i18n): add LanguageSwitcher and translate NavBar"
```

---

### Task 6: Translate home page

**Files:**
- Modify: `apps/web/app/[locale]/page.tsx`

- [ ] **Step 1: Rewrite home page with translations**

Convert from client component to server component (it doesn't need interactivity). Use `getTranslations` and locale-aware `Link`.

```tsx
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const cards = [
    { href: "/rules" as const, key: "rulesCard" as const },
    { href: "/puzzles" as const, key: "puzzlesCard" as const },
    { href: "/play" as const, key: "playCard" as const },
    { href: "/community" as const, key: "communityCard" as const },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-[var(--color-wood-dark)] mb-4">
          {t("title")}
        </h1>
        <p className="text-xl text-[var(--color-ink-light)] mb-8">
          {t("subtitle")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ href, key }) => (
            <Link
              key={key}
              href={href}
              className="bg-white/60 border border-[var(--color-wood)]/20 rounded-lg p-6 hover:bg-white/80 transition-colors"
            >
              <h2 className="text-lg font-semibold text-[var(--color-wood-dark)] mb-2">
                {t(`${key}.title`)}
              </h2>
              <p className="text-sm text-[var(--color-ink-light)]">
                {t(`${key}.description`)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd /home/powervaro/githubs/medieval-chess && pnpm web:build
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\\[locale\\]/page.tsx
git commit -m "feat(i18n): translate home page"
```

---

### Task 7: Translate rules page

**Files:**
- Modify: `apps/web/app/[locale]/rules/page.tsx`

- [ ] **Step 1: Update rules page with translations**

The rules page is `"use client"` because it uses `MiniBoard` (a client component). Use `useTranslations` throughout. Replace `import Link from "next/link"` with `import { Link } from "@/i18n/navigation"`. Replace every hardcoded string with `t('key')`.

All the MiniBoard configurations (pieces, highlights) remain unchanged — only the text labels, descriptions, and captions get translated.

Key replacements:
- `"Rules of Medieval Chess"` → `t("title")`
- `"The Queen (Alferza) — Grace Jump"` → `t("queen.title")`
- All description paragraphs → `t("queen.description")`, `t("bishop.description")`, etc.
- Legend text → `t("legend.piecePosition")`, `t("legend.canMove")`, `t("legend.canCapture")`
- Summary items → `t("summary.queen")`, `t("summary.bishop")`, etc.
- Back link → `t("backToHome")`
- "Try it out" button → `t("summary.tryItOut")`

- [ ] **Step 2: Verify build**

```bash
cd /home/powervaro/githubs/medieval-chess && pnpm web:build
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\\[locale\\]/rules/page.tsx
git commit -m "feat(i18n): translate rules page"
```

---

### Task 8: Translate play page, StoryPanel, and MoveList

**Files:**
- Modify: `apps/web/app/[locale]/play/page.tsx`
- Modify: `apps/web/components/StoryPanel.tsx`
- Modify: `apps/web/components/MoveList.tsx`

- [ ] **Step 1: Update StoryPanel to accept translated status strings**

StoryPanel currently computes status text internally from `turn`, `isGameOver`, `isCheckmate`. Change it to accept a `statusText` prop instead, so the parent (which has access to translations) can pass the correct translated string.

```tsx
"use client";

interface StoryPanelProps {
  title: string;
  story?: string;
  statusText: string;
  isGameOver: boolean;
}

export default function StoryPanel({
  title,
  story,
  statusText,
  isGameOver,
}: StoryPanelProps) {
  return (
    <div
      className="rounded-lg p-4 overflow-y-auto"
      style={{
        backgroundColor: "rgba(255,255,255,0.5)",
        border: "1px solid rgba(139, 94, 60, 0.2)",
        maxHeight: "100%",
      }}
    >
      <h3
        className="text-sm font-semibold mb-3 uppercase tracking-wide"
        style={{ color: "var(--color-wood-dark)" }}
      >
        {title}
      </h3>

      {story && (
        <p
          className="text-sm mb-4 leading-relaxed italic"
          style={{ color: "var(--color-ink-light)" }}
        >
          {story}
        </p>
      )}

      <div
        className="text-sm font-medium px-3 py-2 rounded"
        style={{
          backgroundColor: isGameOver
            ? "rgba(201, 168, 76, 0.2)"
            : "rgba(139, 94, 60, 0.1)",
          color: "var(--color-wood-dark)",
        }}
      >
        {statusText}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update MoveList to accept translated strings via props**

```tsx
"use client";

interface MoveListProps {
  moves: string[];
  title?: string;
  emptyMessage?: string;
}

export default function MoveList({ moves, title = "Moves", emptyMessage = "No moves yet. Click a piece to start." }: MoveListProps) {
  const pairs: { number: number; white: string; black?: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  return (
    <div
      className="rounded-lg p-4 overflow-y-auto"
      style={{
        backgroundColor: "rgba(255,255,255,0.5)",
        border: "1px solid rgba(139, 94, 60, 0.2)",
        maxHeight: "100%",
      }}
    >
      <h3
        className="text-sm font-semibold mb-3 uppercase tracking-wide"
        style={{ color: "var(--color-wood-dark)" }}
      >
        {title}
      </h3>
      {pairs.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-ink-light)" }}>
          {emptyMessage}
        </p>
      ) : (
        <div className="space-y-1">
          {pairs.map((pair) => (
            <div key={pair.number} className="flex text-sm font-mono">
              <span
                className="w-8 text-right mr-2 shrink-0"
                style={{ color: "var(--color-ink-light)" }}
              >
                {pair.number}.
              </span>
              <span
                className="w-16"
                style={{ color: "var(--color-ink)" }}
              >
                {pair.white}
              </span>
              <span style={{ color: "var(--color-ink)" }}>
                {pair.black ?? ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Update play page with translations**

The play page remains `"use client"`. Use `useTranslations("play")`. Pass translated strings to StoryPanel and MoveList. Compute `statusText` from game state + translations.

Key changes:
- `import { useTranslations } from "next-intl"`
- `const t = useTranslations("play")`
- Compute status: `const statusText = game.isCheckmate() ? (game.turn() === "w" ? t("status.checkmateBlackWins") : t("status.checkmateWhiteWins")) : game.isGameOver() ? t("status.draw") : game.turn() === "w" ? t("status.whiteToMove") : t("status.blackToMove")`
- Pass `statusText` and `isGameOver` to StoryPanel
- Pass `title={t("moves")}` and `emptyMessage={t("noMoves")}` to MoveList
- Buttons: `t("undo")`, `t("reset")`
- StoryPanel title: `t("freePlay")`, story: `t("freePlayStory")`

- [ ] **Step 4: Verify build**

```bash
cd /home/powervaro/githubs/medieval-chess && pnpm web:build
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/\\[locale\\]/play/page.tsx apps/web/components/StoryPanel.tsx apps/web/components/MoveList.tsx
git commit -m "feat(i18n): translate play page, StoryPanel, and MoveList"
```

---

### Task 9: Translate puzzles pages (list, detail, new)

**Files:**
- Modify: `apps/web/app/[locale]/puzzles/page.tsx`
- Modify: `apps/web/app/[locale]/puzzles/[id]/page.tsx`
- Modify: `apps/web/app/[locale]/puzzles/new/page.tsx`

- [ ] **Step 1: Update puzzles list page**

Replace `import Link from "next/link"` → `import { Link } from "@/i18n/navigation"`. Add `useTranslations("puzzles")`. Replace all hardcoded strings. Replace `DIFFICULTY_LABELS` array with translated keys.

Key changes:
- `const DIFFICULTY_KEYS = ["", "beginner", "easy", "medium", "hard", "master"]` → use `t(\`difficulty.${DIFFICULTY_KEYS[d]}\`)`
- `"Create Puzzle"` → `t("createPuzzle")`
- `"All"` → `t("all")`
- `"Loading puzzles..."` → `t("loading")`
- `"No puzzles yet."` → `t("noPuzzles")`
- `"Be the first to create one!"` → `t("beFirst")`
- `"Sign in to create the first puzzle."` → `tAuth("signInToCreate", { item: t("title").toLowerCase() })`

- [ ] **Step 2: Update puzzle detail page**

Add `useTranslations("puzzles.detail")`. Replace all gameplay feedback strings.

For the color-dependent prompt, use two separate keys (avoids nested translation calls):
- `en.json`: `"promptWhite": "Find the best move. White to play."`, `"promptBlack": "Find the best move. Black to play."`
- `es.json`: `"promptWhite": "Encuentra el mejor movimiento. Juegan las blancas."`, `"promptBlack": "Encuentra el mejor movimiento. Juegan las negras."`

Usage: `t(game.turn() === "w" ? "promptWhite" : "promptBlack")`

**Important:** Add these two keys to both `en.json` and `es.json` in the `puzzles.detail` namespace, and remove the old `"prompt"` key. The JSON diffs are:

In `en.json` under `puzzles.detail`, replace:
```json
"prompt": "Find the best move. {color} to play.",
```
with:
```json
"promptWhite": "Find the best move. White to play.",
"promptBlack": "Find the best move. Black to play.",
```

In `es.json` under `puzzles.detail`, replace:
```json
"prompt": "Encuentra el mejor movimiento. Juegan las {color}.",
```
with:
```json
"promptWhite": "Encuentra el mejor movimiento. Juegan las blancas.",
"promptBlack": "Encuentra el mejor movimiento. Juegan las negras.",
```

- [ ] **Step 3: Update new puzzle page**

Replace `import { useRouter } from "next/navigation"` → `import { useRouter } from "@/i18n/navigation"`. Add `useTranslations("puzzles.create")`. Replace all wizard step labels, instructions, form labels, and button text.

- [ ] **Step 4: Verify build**

```bash
cd /home/powervaro/githubs/medieval-chess && pnpm web:build
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/\\[locale\\]/puzzles/ apps/web/messages/
git commit -m "feat(i18n): translate all puzzle pages"
```

---

### Task 10: Translate community pages (list, detail, new)

**Files:**
- Modify: `apps/web/app/[locale]/community/page.tsx`
- Modify: `apps/web/app/[locale]/community/[id]/page.tsx`
- Modify: `apps/web/app/[locale]/community/new/page.tsx`

- [ ] **Step 1: Update community list page**

Replace Link import. Add `useTranslations("community")`. Replace the `timeAgo` function to use translated strings:

```tsx
function useTimeAgo() {
  const t = useTranslations("community.timeAgo");
  return (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return t("justNow");
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t("minutesAgo", { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t("hoursAgo", { count: hours });
    const days = Math.floor(hours / 24);
    return t("daysAgo", { count: days });
  };
}
```

Replace pluralized strings with ICU format:
- `{post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}` → `t("commentCount", { count: post.commentCount })`
- Same for likes.

- [ ] **Step 2: Update community detail page**

Same pattern: translated timeAgo, translated Like/Liked, comment form strings. Replace `useRouter` import.

- [ ] **Step 3: Update new post page**

Replace `import { useRouter } from "next/navigation"` → `import { useRouter } from "@/i18n/navigation"`. Add translations for form labels, placeholders, buttons.

- [ ] **Step 4: Verify build**

```bash
cd /home/powervaro/githubs/medieval-chess && pnpm web:build
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/\\[locale\\]/community/
git commit -m "feat(i18n): translate all community pages"
```

---

### Task 11: Translate profile page

**Files:**
- Modify: `apps/web/app/[locale]/profile/page.tsx`

- [ ] **Step 1: Update profile page with translations**

Replace Link import. Add `useTranslations("profile")`. Replace `toLocaleDateString("en-US", ...)` with locale-aware formatting using `useFormatter` from next-intl:

```tsx
import { useTranslations, useFormatter, useLocale } from "next-intl";

// Inside component:
const format = useFormatter();
const memberDate = format.dateTime(new Date(profile.createdAt), {
  year: "numeric",
  month: "long",
});
// Then use: t("memberSince", { date: memberDate })
```

Replace all stat labels: "Puzzles Solved" → `t("puzzlesSolved")`, etc.

- [ ] **Step 2: Verify build**

```bash
cd /home/powervaro/githubs/medieval-chess && pnpm web:build
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\\[locale\\]/profile/page.tsx
git commit -m "feat(i18n): translate profile page with locale-aware dates"
```

---

### Task 12: Add SEO metadata to all pages

**Files:**
- Modify: all page files under `apps/web/app/[locale]/`

Each page needs a `generateMetadata` function that returns locale-specific title, description, and hreflang alternates. Since most pages are `"use client"`, we need to add metadata via a separate `generateMetadata` export from a wrapper or use the layout. However, Next.js allows `generateMetadata` even in files with `"use client"` pages — it just needs to be a separate server-side export.

**Approach:** For client component pages, add a separate `layout.tsx` in each route directory that exports `generateMetadata`, OR convert the metadata logic to the parent layout. The simplest approach: since `[locale]/layout.tsx` already has metadata, add page-specific metadata by creating small `metadata.ts` or overriding in each page.

Actually, the simplest: For client pages, we can't export `generateMetadata` from the same file. But we CAN create a thin server wrapper. However, the lightest approach is: just use the `[locale]/layout.tsx` metadata as the default, and for pages that CAN be server components (home page is already), export page-specific metadata.

For the client-component pages, the layout metadata will serve as the fallback. This is acceptable for now — the hreflang and base title/description from the layout cover the SEO essentials.

- [ ] **Step 1: Add `generateMetadata` to home page**

The home page (Task 6) is already a server component. Add:

```tsx
import type { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.home" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: { en: "/", es: "/es", "x-default": "/" },
    },
  };
}
```

- [ ] **Step 2: Add metadata layouts for key route groups**

Create `apps/web/app/[locale]/rules/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.rules" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: { en: "/rules", es: "/es/rules", "x-default": "/rules" },
    },
  };
}

export default function Layout({ children }: Props) {
  return children;
}
```

Repeat this pattern for `/play`, `/puzzles`, `/community`, `/profile` routes.

- [ ] **Step 3: Verify build**

```bash
cd /home/powervaro/githubs/medieval-chess && pnpm web:build
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/\\[locale\\]/
git commit -m "feat(i18n): add localized SEO metadata and hreflang to all routes"
```

---

### Task 13: Final verification and cleanup

- [ ] **Step 1: Full build check**

```bash
cd /home/powervaro/githubs/medieval-chess && pnpm web:build
```

Must complete with 0 errors.

- [ ] **Step 2: Dev server smoke test**

```bash
cd /home/powervaro/githubs/medieval-chess && pnpm web:dev
```

Manually verify:
- `localhost:3000/` loads in English
- `localhost:3000/es/` loads in Spanish
- Language switcher works on all pages
- All text is translated (no raw translation keys visible)
- Links navigate correctly in both locales
- Puzzle and community pages load

- [ ] **Step 3: Lint check**

```bash
cd /home/powervaro/githubs/medieval-chess && pnpm web:lint
```

Fix any lint errors.

- [ ] **Step 4: Clean up empty old directories if any remain**

```bash
cd /home/powervaro/githubs/medieval-chess/apps/web/app && ls
```

Verify only `[locale]/`, `layout.tsx`, `globals.css`, `providers.tsx` remain at the root level.

- [ ] **Step 5: Final commit if any cleanup was needed**

```bash
git add -A && git commit -m "chore(i18n): final cleanup and lint fixes"
```
