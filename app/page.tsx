import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  return (
    <main>
      <nav>
        <Link href={"/"}>Start</Link>
        <Link href={"/protected"}>Dashboard</Link>

        <AuthButton />
      </nav>

      <footer>
        <ThemeSwitcher />
      </footer>
    </main>
  );
}
