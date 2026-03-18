"use client";

interface MoveIndicatorProps {
  isCapture: boolean;
  squareSize: number;
}

export default function MoveIndicator({
  isCapture,
  squareSize,
}: MoveIndicatorProps) {
  const size = squareSize;

  if (isCapture) {
    // Ring around the square for captures
    const ringThickness = size * 0.08;
    return (
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: `${ringThickness}px solid rgba(201, 168, 76, 0.6)`,
          margin: ringThickness,
        }}
      />
    );
  }

  // Dot in the center for empty square moves
  const dotSize = size * 0.28;
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <div
        className="rounded-full"
        style={{
          width: dotSize,
          height: dotSize,
          backgroundColor: "rgba(201, 168, 76, 0.6)",
        }}
      />
    </div>
  );
}
