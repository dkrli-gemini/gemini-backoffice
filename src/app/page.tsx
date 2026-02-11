"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import AdminPanel from "@/components/AdminPanel";

const cardStyle: React.CSSProperties = {
  maxWidth: 520,
  margin: "120px auto",
  padding: "28px",
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(20, 20, 20, 0.08)",
};

const buttonStyle: React.CSSProperties = {
  border: "none",
  padding: "12px 18px",
  borderRadius: 10,
  background: "#0f3759",
  color: "#fff",
  fontWeight: 600,
};

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main>
        <div style={cardStyle}>
          <h2>Carregando...</h2>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main>
        <div style={cardStyle}>
          <h1>Gemini Backoffice</h1>
          <p style={{ marginTop: 8 }}>
            Faça login com um usuário administrador para continuar.
          </p>
          <button style={{ ...buttonStyle, marginTop: 18 }} onClick={() => signIn("keycloak")}>
            Entrar com Keycloak
          </button>
        </div>
      </main>
    );
  }

  const isAdmin = session.user?.roles?.includes("admin");

  if (!isAdmin) {
    return (
      <main>
        <div style={cardStyle}>
          <h2>Acesso negado</h2>
          <p style={{ marginTop: 8 }}>
            Seu usuário não possui a role <strong>admin</strong>.
          </p>
          <button style={{ ...buttonStyle, marginTop: 18 }} onClick={() => signOut()}>
            Sair
          </button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <AdminPanel />
    </main>
  );
}
