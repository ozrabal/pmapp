import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Guard({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const headersList = headers();
  const currentPath = (await headersList).get("x-current-path");

  if (!user) {
    redirect(`/auth/login?source=${currentPath}`);
  }

  return <>{children}</>;
}
