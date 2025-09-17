import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const headersList = headers();
  const currentPath = (await headersList).get("x-current-path") || "/";

  if (!user) {
    redirect(`/sign-in?source=${currentPath}`);
  }

  return (
    <main>
      <nav>
        <Link href={"/"}>Home</Link>
      </nav>
      {children}
    </main>
  );
}
