import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-[var(--color-wood-dark)] mb-4">
          Medieval Chess
        </h1>
        <p className="text-xl text-[var(--color-ink-light)] mb-8">
          Explore the history of chess through medieval variants, puzzles, and community.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/rules" className="bg-white/60 border border-[var(--color-wood)]/20 rounded-lg p-6 hover:bg-white/80 transition-colors">
            <h2 className="text-lg font-semibold text-[var(--color-wood-dark)] mb-2">
              Rules
            </h2>
            <p className="text-sm text-[var(--color-ink-light)]">
              Learn how medieval chess pieces move with visual examples.
            </p>
          </Link>
          <div className="bg-white/60 border border-[var(--color-wood)]/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[var(--color-wood-dark)] mb-2">
              Puzzles
            </h2>
            <p className="text-sm text-[var(--color-ink-light)]">
              Solve historical chess problems from the Book of Alfonso X and more.
            </p>
          </div>
          <Link href="/play" className="bg-white/60 border border-[var(--color-wood)]/20 rounded-lg p-6 hover:bg-white/80 transition-colors">
            <h2 className="text-lg font-semibold text-[var(--color-wood-dark)] mb-2">
              Play
            </h2>
            <p className="text-sm text-[var(--color-ink-light)]">
              Set up positions and play medieval chess variants locally.
            </p>
          </Link>
          <div className="bg-white/60 border border-[var(--color-wood)]/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[var(--color-wood-dark)] mb-2">
              Community
            </h2>
            <p className="text-sm text-[var(--color-ink-light)]">
              Share puzzles, discuss strategies, and learn together.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
