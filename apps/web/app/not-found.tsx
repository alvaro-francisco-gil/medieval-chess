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
