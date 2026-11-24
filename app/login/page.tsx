import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(to bottom right, #d1fae5, #ffffff, #ccfbf1)", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: "28rem" }}>
        <div style={{ background: "white", borderRadius: "1rem", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)", border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ padding: "2rem 2rem 1.5rem" }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "3rem", height: "3rem", background: "#059669", borderRadius: "0.75rem", marginBottom: "0.75rem" }}>
                <svg
                  style={{ width: "1.5rem", height: "1.5rem", color: "white" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#111827", marginBottom: "0.25rem" }}>
                Welcome back
              </h1>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                Sign in to your account to continue
              </p>
            </div>
            <LoginForm />
          </div>
          <div style={{ padding: "1rem 2rem", background: "#f9fafb", borderTop: "1px solid #e5e7eb" }}>
            <p style={{ fontSize: "0.75rem", textAlign: "center", color: "#6b7280" }}>
              Interview Manager © 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
