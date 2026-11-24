import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import { UserList } from "@/components/user-list";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/interviews");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <NavBar user={session.user} />
      <main style={{ maxWidth: "80rem", margin: "0 auto", padding: "2rem" }}>
        <UserList />
      </main>
    </div>
  );
}
