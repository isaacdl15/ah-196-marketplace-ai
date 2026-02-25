import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>404 — Page Not Found</h2>
      <p style={{ color: "#666", marginBottom: "1rem" }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" style={{ color: "#0070f3", textDecoration: "underline" }}>
        Go home
      </Link>
    </div>
  );
}
