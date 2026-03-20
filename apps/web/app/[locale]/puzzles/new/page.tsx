"use client";

import { useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { MedievalChess } from "@medieval-chess/engine";
import type { MedievalMove } from "@medieval-chess/engine";
import { ChessBoard } from "@/components/chess-board";
import { useAuth } from "@/lib/auth-context";
import { createPuzzle } from "@/lib/puzzles";

type Step = "setup" | "solution" | "details";

const DIFFICULTY_KEYS = ["", "beginner", "easy", "medium", "hard", "master"];

export default function NewPuzzlePage() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations("puzzles.create");

  const [step, setStep] = useState<Step>("setup");
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [setupGame] = useState(() => new MedievalChess());
  const [solutionGame, setSolutionGame] = useState<MedievalChess | null>(null);
  const [solutionMoves, setSolutionMoves] = useState<string[]>([]);
  const [, setMoveCount] = useState(0);

  // Details form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");
  const [difficulty, setDifficulty] = useState(1);
  const [puzzleCollection, setPuzzleCollection] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFenChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newFen = e.target.value;
      setFen(newFen);
      try {
        setupGame.loadFen(newFen);
        setMoveCount((c) => c + 1);
      } catch {
        // Invalid FEN, ignore
      }
    },
    [setupGame]
  );

  const handleStartSolution = useCallback(() => {
    const g = new MedievalChess({ fen });
    setSolutionGame(g);
    setSolutionMoves([]);
    setStep("solution");
  }, [fen]);

  const handleSolutionMove = useCallback(
    (move: MedievalMove) => {
      setSolutionMoves((prev) => [...prev, move.san]);
      setMoveCount((c) => c + 1);
    },
    []
  );

  const handleUndoSolution = useCallback(() => {
    if (!solutionGame) return;
    const undone = solutionGame.undo();
    if (undone) {
      setSolutionMoves((prev) => prev.slice(0, -1));
      setMoveCount((c) => c + 1);
    }
  }, [solutionGame]);

  const handleSubmit = useCallback(async () => {
    if (!user || !title || solutionMoves.length === 0) return;

    setSubmitting(true);
    try {
      const id = await createPuzzle({
        title,
        description,
        story: story || undefined,
        fen,
        solution: solutionMoves,
        difficulty,
        collection: puzzleCollection || undefined,
        authorId: user.uid,
        authorName: user.displayName || "Anonymous",
      });
      router.push(`/puzzles/${id}`);
    } catch (err) {
      console.error("Failed to create puzzle:", err);
      setSubmitting(false);
    }
  }, [user, title, description, story, fen, solutionMoves, difficulty, puzzleCollection, router]);

  if (!user) {
    return (
      <main
        className="min-h-screen p-8 flex items-center justify-center"
        style={{ backgroundColor: "var(--color-parchment)" }}
      >
        <p style={{ color: "var(--color-ink-light)" }}>
          {t("signInRequired")}
        </p>
      </main>
    );
  }

  const inputStyle = {
    backgroundColor: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(139, 94, 60, 0.3)",
    color: "var(--color-ink)",
  };

  return (
    <main
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--color-parchment)" }}
    >
      <div className="max-w-6xl mx-auto">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--color-wood-dark)" }}
        >
          {t("title")}
        </h1>

        {/* Step indicator */}
        <div className="flex gap-4 mb-6 text-sm">
          {(["setup", "solution", "details"] as Step[]).map((s, i) => (
            <div
              key={s}
              className="flex items-center gap-2"
              style={{
                color: step === s ? "var(--color-wood-dark)" : "var(--color-ink-light)",
                fontWeight: step === s ? 600 : 400,
              }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                style={{
                  backgroundColor: step === s ? "var(--color-wood-dark)" : "rgba(139, 94, 60, 0.15)",
                  color: step === s ? "var(--color-parchment)" : "var(--color-ink-light)",
                }}
              >
                {i + 1}
              </span>
              <span className="hidden sm:inline capitalize">
                {s === "setup" ? t("stepPosition") : s === "solution" ? t("stepSolution") : t("stepDetails")}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
          {/* Left panel */}
          <div>
            {step === "setup" && (
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(139, 94, 60, 0.2)",
                }}
              >
                <h2
                  className="text-lg font-semibold mb-3"
                  style={{ color: "var(--color-wood-dark)" }}
                >
                  {t("step1Title")}
                </h2>
                <p className="text-sm mb-3" style={{ color: "var(--color-ink-light)" }}>
                  {t("step1Description")}
                </p>
                <input
                  type="text"
                  value={fen}
                  onChange={handleFenChange}
                  className="w-full px-3 py-2 rounded text-sm font-mono mb-4"
                  style={inputStyle}
                  placeholder={t("fenPlaceholder")}
                />
                <button
                  onClick={handleStartSolution}
                  className="px-4 py-2 rounded text-sm font-medium cursor-pointer"
                  style={{
                    backgroundColor: "var(--color-wood-dark)",
                    color: "var(--color-parchment)",
                  }}
                >
                  {t("nextSolution")}
                </button>
              </div>
            )}

            {step === "solution" && (
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(139, 94, 60, 0.2)",
                }}
              >
                <h2
                  className="text-lg font-semibold mb-3"
                  style={{ color: "var(--color-wood-dark)" }}
                >
                  {t("step2Title")}
                </h2>
                <p className="text-sm mb-3" style={{ color: "var(--color-ink-light)" }}>
                  {t("step2Description")}
                </p>

                {solutionMoves.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-1" style={{ color: "var(--color-wood-dark)" }}>
                      {t("solutionMoves")}
                    </p>
                    <div className="flex gap-1 flex-wrap font-mono text-sm">
                      {solutionMoves.map((m, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: "rgba(201, 168, 76, 0.2)",
                            color: "var(--color-wood-dark)",
                          }}
                        >
                          {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ""}
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleUndoSolution}
                    disabled={solutionMoves.length === 0}
                    className="px-4 py-2 rounded text-sm font-medium cursor-pointer disabled:opacity-50"
                    style={{
                      backgroundColor: "rgba(139, 94, 60, 0.15)",
                      color: "var(--color-wood-dark)",
                      border: "1px solid rgba(139, 94, 60, 0.3)",
                    }}
                  >
                    {t("undo")}
                  </button>
                  <button
                    onClick={() => setStep("setup")}
                    className="px-4 py-2 rounded text-sm font-medium cursor-pointer"
                    style={{
                      backgroundColor: "rgba(139, 94, 60, 0.15)",
                      color: "var(--color-wood-dark)",
                      border: "1px solid rgba(139, 94, 60, 0.3)",
                    }}
                  >
                    {t("back")}
                  </button>
                  <button
                    onClick={() => setStep("details")}
                    disabled={solutionMoves.length === 0}
                    className="px-4 py-2 rounded text-sm font-medium cursor-pointer disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--color-wood-dark)",
                      color: "var(--color-parchment)",
                    }}
                  >
                    {t("nextDetails")}
                  </button>
                </div>
              </div>
            )}

            {step === "details" && (
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(139, 94, 60, 0.2)",
                }}
              >
                <h2
                  className="text-lg font-semibold mb-3"
                  style={{ color: "var(--color-wood-dark)" }}
                >
                  {t("step3Title")}
                </h2>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "var(--color-wood-dark)" }}>
                      {t("labelTitle")}
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded text-sm"
                      style={inputStyle}
                      placeholder={t("placeholderTitle")}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "var(--color-wood-dark)" }}>
                      {t("labelDescription")}
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded text-sm"
                      style={inputStyle}
                      placeholder={t("placeholderDescription")}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "var(--color-wood-dark)" }}>
                      {t("labelStory")}
                    </label>
                    <textarea
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      className="w-full px-3 py-2 rounded text-sm"
                      style={inputStyle}
                      rows={3}
                      placeholder={t("placeholderStory")}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "var(--color-wood-dark)" }}>
                      {t("labelDifficulty")}
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(parseInt(e.target.value))}
                      className="px-3 py-2 rounded text-sm"
                      style={inputStyle}
                    >
                      {[1, 2, 3, 4, 5].map((d) => (
                        <option key={d} value={d}>
                          {d} — {t(`difficultyOption.${DIFFICULTY_KEYS[d]}`)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "var(--color-wood-dark)" }}>
                      {t("labelCollection")}
                    </label>
                    <input
                      type="text"
                      value={puzzleCollection}
                      onChange={(e) => setPuzzleCollection(e.target.value)}
                      className="w-full px-3 py-2 rounded text-sm"
                      style={inputStyle}
                      placeholder={t("placeholderCollection")}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setStep("solution")}
                    className="px-4 py-2 rounded text-sm font-medium cursor-pointer"
                    style={{
                      backgroundColor: "rgba(139, 94, 60, 0.15)",
                      color: "var(--color-wood-dark)",
                      border: "1px solid rgba(139, 94, 60, 0.3)",
                    }}
                  >
                    {t("back")}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!title || !description || submitting}
                    className="px-4 py-2 rounded text-sm font-medium cursor-pointer disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--color-wood-dark)",
                      color: "var(--color-parchment)",
                    }}
                  >
                    {submitting ? t("creating") : t("createButton")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Board */}
          <div className="flex justify-center">
            {step === "setup" && (
              <ChessBoard game={setupGame} interactive={false} />
            )}
            {step === "solution" && solutionGame && (
              <ChessBoard game={solutionGame} onMove={handleSolutionMove} />
            )}
            {step === "details" && solutionGame && (
              <ChessBoard game={solutionGame} interactive={false} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
