import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import { UserForm } from "@/components/user-form";

export default async function NewUserPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/interviews");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
      <NavBar user={session.user} />
      <main style={{ flex: 1, maxWidth: "80rem", width: "100%", margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#111827", marginBottom: "0.5rem" }}>
            Add New User
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            Create a new user account. The initial password should be shared securely with the user.
          </p>
        </div>

        <div style={{ flex: 1, background: "white", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)", padding: "2rem", display: "flex", flexDirection: "column" }}>
          <UserForm mode="create" />
        </div>
      </main>
    </div>
  );
}
