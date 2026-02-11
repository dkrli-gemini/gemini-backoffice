"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

type UserNetworksResponse = {
  projects: Array<{
    projectId: string;
    projectName: string;
    networks: Array<{
      id: string;
      name: string;
      gateway: string;
      netmask: string;
      aclName: string;
      isL2: boolean;
    }>;
  }>;
};

const sectionStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 24,
  boxShadow: "0 8px 24px rgba(15, 25, 35, 0.06)",
  marginBottom: 24,
};

const buttonStyle: React.CSSProperties = {
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  background: "#0f3759",
  color: "#fff",
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d6dbe2",
  marginTop: 6,
};

export default function AdminPanel() {
  const { data: session } = useSession();
  const [projectId, setProjectId] = useState("");
  const [networkId, setNetworkId] = useState("");
  const [createStatus, setCreateStatus] = useState<string | null>(null);

  const [userId, setUserId] = useState("");
  const [userNetworks, setUserNetworks] = useState<UserNetworksResponse | null>(
    null
  );
  const [loadingNetworks, setLoadingNetworks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateL2 = async () => {
    setCreateStatus(null);
    setError(null);

    if (!projectId || !networkId) {
      setError("Informe projectId e networkId.");
      return;
    }

    const response = await fetch("/api/admin/l2-networks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, networkId }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data?.message ?? "Erro ao criar rede L2.");
      return;
    }

    setCreateStatus(`Rede L2 vinculada ao projeto ${data.projectId}.`);
  };

  const handleFetchUserNetworks = async () => {
    setLoadingNetworks(true);
    setError(null);
    setUserNetworks(null);

    if (!userId) {
      setError("Informe userId.");
      setLoadingNetworks(false);
      return;
    }

    const response = await fetch(`/api/admin/users/${userId}/networks`);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data?.message ?? "Erro ao buscar redes do usuário.");
      setLoadingNetworks(false);
      return;
    }

    setUserNetworks(data);
    setLoadingNetworks(false);
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Gemini Backoffice</h1>
          <p style={{ marginTop: 6, color: "#5c5c5c" }}>
            Logado como {session?.user?.email ?? session?.user?.id}
          </p>
        </div>
        <button style={buttonStyle} onClick={() => signOut()}>
          Sair
        </button>
      </div>

      <section style={sectionStyle}>
        <h2>Vincular rede L2 a um projeto</h2>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
          <label>
            Project ID
            <input
              style={inputStyle}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="UUID do projeto"
            />
          </label>
          <label>
            Network ID (CloudStack L2)
            <input
              style={inputStyle}
              value={networkId}
              onChange={(e) => setNetworkId(e.target.value)}
              placeholder="UUID da rede L2"
            />
          </label>
        </div>
        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <button style={buttonStyle} onClick={handleCreateL2}>
            Vincular L2
          </button>
          {createStatus && <span style={{ color: "#2b7a2b" }}>{createStatus}</span>}
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Redes por usuário</h2>
        <label>
          User ID
          <input
            style={inputStyle}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="UUID do usuário"
          />
        </label>
        <div style={{ marginTop: 16 }}>
          <button style={buttonStyle} onClick={handleFetchUserNetworks}>
            Buscar redes
          </button>
        </div>

        {loadingNetworks && <p style={{ marginTop: 12 }}>Carregando...</p>}

        {userNetworks?.projects?.length ? (
          <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
            {userNetworks.projects.map((project) => (
              <div key={project.projectId} style={{ border: "1px solid #e6e9ee", borderRadius: 10 }}>
                <div style={{ padding: 12, borderBottom: "1px solid #e6e9ee", fontWeight: 600 }}>
                  {project.projectName} ({project.projectId})
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "#fafafa" }}>
                    <tr>
                      <th style={{ textAlign: "left", padding: 10 }}>Nome</th>
                      <th style={{ textAlign: "left", padding: 10 }}>Gateway</th>
                      <th style={{ textAlign: "left", padding: 10 }}>Netmask</th>
                      <th style={{ textAlign: "left", padding: 10 }}>ACL</th>
                      <th style={{ textAlign: "left", padding: 10 }}>Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.networks.map((net) => (
                      <tr key={net.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                        <td style={{ padding: 10 }}>{net.name}</td>
                        <td style={{ padding: 10 }}>{net.gateway}</td>
                        <td style={{ padding: 10 }}>{net.netmask}</td>
                        <td style={{ padding: 10 }}>{net.aclName}</td>
                        <td style={{ padding: 10 }}>
                          {net.isL2 ? "L2" : "L3"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {error && (
        <div style={{ background: "#ffe8e8", color: "#b00020", padding: 12, borderRadius: 8 }}>
          {error}
        </div>
      )}
    </div>
  );
}
