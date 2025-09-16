import Link from "next/link";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <nav>
        <Link href={"/"}>Home</Link>
      </nav>
      {children}
    </main>
  );
}
