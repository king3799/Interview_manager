import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import { Dashboard } from "@/components/dashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <NavBar user={session.user} />
      <main style={{ maxWidth: "80rem", margin: "0 auto", padding: "2rem" }}>
        <Dashboard user={session.user} />
      </main>
    </div>
  );
}
