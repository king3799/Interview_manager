import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import { InterviewList } from "@/components/interview-list";

export const dynamic = "force-dynamic";

export default async function InterviewsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <NavBar user={session.user} />
      <main style={{ maxWidth: "80rem", margin: "0 auto", padding: "2rem" }}>
        <InterviewList user={session.user} />
      </main>
    </div>
  );
}
