import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import { InterviewDetail } from "@/components/interview-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InterviewDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
      <NavBar user={session.user} />
      <main style={{ flex: 1, maxWidth: "80rem", width: "100%", margin: "0 auto", padding: "2rem" }}>
        <InterviewDetail interviewId={id} user={session.user} />
      </main>
    </div>
  );
}
