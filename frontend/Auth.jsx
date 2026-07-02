import { useState } from "react";

export default function Auth({ onAuthSuccess }) {
  const [tab, setTab] = useState("login");
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!pseudo.trim() || !password) { setError("Remplissez tous les champs"); return; }
    setLoading(true);
    const endpoint = tab === "login" ? "/api/login" : "/api/register";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pseudo: pseudo.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Une erreur est survenue"); return; }
      localStorage.setItem("garame_auth", JSON.stringify({ pseudo: data.pseudo, bankroll: data.bankroll }));
      const raw = localStorage.getItem("garame_profile");
      const profile = raw ? JSON.parse(raw) : {};
      profile.pseudo = data.pseudo;
      localStorage.setItem("garame_profile", JSON.stringify(profile));
      onAuthSuccess({ pseudo: data.pseudo, bankroll: data.bankroll });
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(0,217,255,0.2)",
    fontSize: "14px",
    color: "#fff",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      background: "#0F172A",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      boxSizing: "border-box",
    }}>
      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          linear-gradient(rgba(0,217,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,217,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: "380px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "28px",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "clamp(44px, 14vw, 72px)",
            fontWeight: "900",
            letterSpacing: "clamp(4px, 2vw, 10px)",
            color: "#00D9FF",
            textShadow: "0 0 40px rgba(0,217,255,0.5), 0 0 80px rgba(0,217,255,0.2)",
            lineHeight: 1,
          }}>
            GARAME
          </div>
          <div style={{
            fontSize: "10px", color: "#334155",
            fontWeight: "700", letterSpacing: "3px",
            textTransform: "uppercase", marginTop: "6px",
          }}>
            Jeu de Cartes Traditionnel Africain
          </div>
        </div>

        {/* Card */}
        <div style={{
          width: "100%",
          background: "rgba(30,41,59,0.7)",
          border: "1px solid rgba(0,217,255,0.12)",
          borderRadius: "16px",
          overflow: "hidden",
          backdropFilter: "blur(12px)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(0,217,255,0.08)" }}>
            {[["login", "SE CONNECTER"], ["register", "CRÉER UN COMPTE"]].map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setTab(key); setError(""); }}
                style={{
                  flex: 1,
                  padding: "14px 8px",
                  background: "transparent",
                  border: "none",
                  borderBottom: tab === key ? "2px solid #00D9FF" : "2px solid transparent",
                  color: tab === key ? "#00D9FF" : "rgba(255,255,255,0.3)",
                  fontSize: "10px", fontWeight: "800",
                  letterSpacing: "1.5px", textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{
                fontSize: "9px", fontWeight: "700", color: "rgba(0,217,255,0.6)",
                letterSpacing: "1.5px", textTransform: "uppercase",
              }}>
                Pseudo
              </label>
              <input
                type="text"
                value={pseudo}
                onChange={e => setPseudo(e.target.value)}
                placeholder="Votre pseudo"
                autoComplete="username"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "rgba(0,217,255,0.5)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(0,217,255,0.2)"; }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{
                fontSize: "9px", fontWeight: "700", color: "rgba(0,217,255,0.6)",
                letterSpacing: "1.5px", textTransform: "uppercase",
              }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "rgba(0,217,255,0.5)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(0,217,255,0.2)"; }}
              />
            </div>

            {error && (
              <div style={{
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#FCA5A5",
                fontSize: "12px",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "4px",
                padding: "13px",
                borderRadius: "10px",
                background: loading
                  ? "rgba(0,217,255,0.15)"
                  : "linear-gradient(135deg, rgba(0,217,255,0.25), rgba(0,217,255,0.15))",
                color: loading ? "rgba(0,217,255,0.4)" : "#00D9FF",
                fontSize: "11px", fontWeight: "800",
                letterSpacing: "2px", textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                border: "1px solid rgba(0,217,255,0.3)",
                boxShadow: loading ? "none" : "0 0 20px rgba(0,217,255,0.15)",
                transition: "all 0.2s",
              }}
            >
              {loading ? "..." : (tab === "login" ? "SE CONNECTER" : "CRÉER MON COMPTE")}
            </button>

            {tab === "register" && (
              <p style={{
                margin: 0, fontSize: "10px",
                color: "rgba(255,255,255,0.2)",
                textAlign: "center", lineHeight: 1.5,
              }}>
                Votre compte commence avec <span style={{ color: "rgba(245,158,11,0.7)" }}>100 000 FCFA</span>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
