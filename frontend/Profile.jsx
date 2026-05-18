import { useState, useEffect } from "react";
import { getAvatarStyle, AVATARS } from "./avatars";

const STORAGE_KEY = "garame_profile";

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveProfile(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function initProfile() {
  const existing = loadProfile();
  if (existing) return existing;
  const now = new Date().toISOString();
  const fresh = {
    // identité
    civilite: "",
    nom: "",
    prenoms: "",
    dateNaissance: "",
    lieuNaissance: "",
    // contact
    email: "",
    telephone: "",
    // adresse
    adresse: "",
    commune: "",
    // compte
    pseudo: "Joueur",
    avatarId: 0,
    dateCreation: now,
    dateCGU: now,
  };
  saveProfile(fresh);
  return fresh;
}

function Field({ label, value, onChange, type = "text", placeholder = "", readOnly = false, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{
        fontSize: "9px", fontWeight: "700", color: "rgba(0,217,255,0.6)",
        letterSpacing: "1.5px", textTransform: "uppercase",
      }}>
        {label}
      </label>
      {readOnly ? (
        <div style={{
          padding: "9px 12px",
          borderRadius: "8px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          fontSize: "12px", color: "rgba(255,255,255,0.45)",
          fontFamily: "monospace",
        }}>
          {value || "—"}
        </div>
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          style={{
            padding: "9px 12px",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(0,217,255,0.15)",
            fontSize: "12px", color: "#fff",
            outline: "none",
            transition: "border-color 0.2s",
            fontFamily: "inherit",
          }}
          onFocus={e => { e.target.style.borderColor = "rgba(0,217,255,0.5)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(0,217,255,0.15)"; }}
        />
      )}
      {hint && (
        <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.5px" }}>
          {hint}
        </span>
      )}
    </div>
  );
}

function Section({ title, color = "#00D9FF", children, action }) {
  return (
    <div style={{
      background: "rgba(30,41,59,0.6)",
      border: `1px solid ${color}22`,
      borderRadius: "12px",
      overflow: "hidden",
    }}>
      <div style={{
        padding: "12px 18px",
        borderBottom: `1px solid ${color}18`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{
          fontSize: "10px", fontWeight: "800", color,
          letterSpacing: "2px", textTransform: "uppercase",
        }}>
          {title}
        </span>
        {action}
      </div>
      <div style={{ padding: "18px" }}>
        {children}
      </div>
    </div>
  );
}

function SaveBtn({ onClick, saved }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 14px",
        borderRadius: "20px",
        border: "1px solid rgba(0,217,255,0.4)",
        background: saved ? "rgba(0,217,255,0.15)" : "transparent",
        color: saved ? "#00D9FF" : "rgba(0,217,255,0.6)",
        fontSize: "9px", fontWeight: "700", letterSpacing: "1.5px",
        textTransform: "uppercase", cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {saved ? "✓ SAUVEGARDÉ" : "SAUVEGARDER"}
    </button>
  );
}

export default function Profile({ onBack, avatarId = 0, bankroll = 100000 }) {
  const [profile, setProfile] = useState(initProfile);
  const [savedSection, setSavedSection] = useState(null);
  const [closeConfirm, setCloseConfirm] = useState(false);

  // sync avatarId from game if provided
  useEffect(() => {
    if (avatarId !== undefined && profile.avatarId !== avatarId) {
      setProfile(p => ({ ...p, avatarId }));
    }
  }, [avatarId]);

  const update = (key, val) => setProfile(p => ({ ...p, [key]: val }));

  const handleSave = (section) => {
    saveProfile(profile);
    setSavedSection(section);
    setTimeout(() => setSavedSection(null), 2000);
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      background: "#0F172A",
      display: "flex", flexDirection: "column",
      alignItems: "center",
      overflowY: "auto",
      position: "relative",
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

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        width: "100%",
        background: "rgba(15,23,42,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,217,255,0.08)",
        display: "flex", alignItems: "center",
        padding: "14px 20px",
        gap: "14px",
        boxSizing: "border-box",
      }}>
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "1px solid rgba(0,217,255,0.25)",
            borderRadius: "8px",
            color: "rgba(0,217,255,0.7)",
            fontSize: "16px",
            width: "34px", height: "34px",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          ←
        </button>

        {/* Avatar */}
        <div style={{
          ...getAvatarStyle(profile.avatarId, 36),
          border: "2px solid rgba(0,217,255,0.4)",
          boxShadow: "0 0 10px rgba(0,217,255,0.25)",
        }} />

        <div>
          <div style={{
            fontSize: "14px", fontWeight: "800", color: "#00D9FF",
            letterSpacing: "3px", textTransform: "uppercase",
          }}>
            MON COMPTE
          </div>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>
            {profile.pseudo || "Joueur"}
          </div>
        </div>

        {/* Dépôt / Retrait pill — placeholder */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          {["DÉPÔT", "RETRAIT"].map(label => (
            <button key={label} style={{
              padding: "6px 12px",
              borderRadius: "20px",
              border: "1px solid rgba(245,158,11,0.35)",
              background: "rgba(245,158,11,0.08)",
              color: "rgba(245,158,11,0.55)",
              fontSize: "9px", fontWeight: "700",
              letterSpacing: "1.5px", textTransform: "uppercase",
              cursor: "not-allowed",
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: "560px",
        padding: "24px 16px 48px",
        boxSizing: "border-box",
        display: "flex", flexDirection: "column", gap: "16px",
      }}>

        {/* ── MON PROFIL ── */}
        <Section
          title="Mon Profil"
          action={<SaveBtn onClick={() => handleSave("profil")} saved={savedSection === "profil"} />}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {/* Civilité — full width */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{
                fontSize: "9px", fontWeight: "700", color: "rgba(0,217,255,0.6)",
                letterSpacing: "1.5px", textTransform: "uppercase", display: "block", marginBottom: "6px",
              }}>
                Civilité
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {["M.", "Mme", "Autre"].map(c => (
                  <button
                    key={c}
                    onClick={() => update("civilite", profile.civilite === c ? "" : c)}
                    style={{
                      padding: "7px 16px",
                      borderRadius: "20px",
                      border: `1px solid ${profile.civilite === c ? "rgba(0,217,255,0.6)" : "rgba(0,217,255,0.15)"}`,
                      background: profile.civilite === c ? "rgba(0,217,255,0.15)" : "transparent",
                      color: profile.civilite === c ? "#00D9FF" : "rgba(255,255,255,0.35)",
                      fontSize: "11px", fontWeight: "600", cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <Field
              label="Nom"
              value={profile.nom}
              onChange={v => update("nom", v)}
              placeholder="Votre nom de famille"
            />
            <Field
              label="Prénoms"
              value={profile.prenoms}
              onChange={v => update("prenoms", v)}
              placeholder="Vos prénoms"
            />
            <Field
              label="Date de naissance"
              value={profile.dateNaissance}
              onChange={v => update("dateNaissance", v)}
              type="date"
            />
            <Field
              label="Lieu de naissance"
              value={profile.lieuNaissance}
              onChange={v => update("lieuNaissance", v)}
              placeholder="Ville, Pays"
            />
          </div>
        </Section>

        {/* ── MES INFORMATIONS DE CONTACT ── */}
        <Section
          title="Mes Informations de Contact"
          color="#A78BFA"
          action={<SaveBtn onClick={() => handleSave("contact")} saved={savedSection === "contact"} />}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field
              label="Email"
              value={profile.email}
              onChange={v => update("email", v)}
              type="email"
              placeholder="exemple@email.com"
            />
            <Field
              label="Téléphone"
              value={profile.telephone}
              onChange={v => update("telephone", v)}
              type="tel"
              placeholder="+225 00 00 00 00 00"
            />
          </div>
        </Section>

        {/* ── ADRESSE ── */}
        <Section
          title="Adresse"
          color="#F59E0B"
          action={<SaveBtn onClick={() => handleSave("adresse")} saved={savedSection === "adresse"} />}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Field
              label="Adresse"
              value={profile.adresse}
              onChange={v => update("adresse", v)}
              placeholder="Numéro et nom de rue"
            />
            <Field
              label="Commune"
              value={profile.commune}
              onChange={v => update("commune", v)}
              placeholder="Commune / Quartier"
            />
          </div>
        </Section>

        {/* ── MON COMPTE ── */}
        <Section
          title="Mon Compte"
          color="#4ADE80"
          action={<SaveBtn onClick={() => handleSave("compte")} saved={savedSection === "compte"} />}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field
                label="Pseudo"
                value={profile.pseudo}
                onChange={v => update("pseudo", v)}
                placeholder="Votre pseudo de jeu"
              />
            </div>
            {/* Bankroll */}
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: "9px", fontWeight: "700", color: "rgba(0,217,255,0.6)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "6px" }}>
                Bankroll
              </div>
              <div style={{
                padding: "12px 16px",
                borderRadius: "8px",
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.25)",
                display: "flex", alignItems: "baseline", gap: "6px",
              }}>
                <span style={{ fontSize: "22px", fontWeight: "900", color: "#F59E0B" }}>
                  {bankroll.toLocaleString("fr-FR")}
                </span>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "rgba(245,158,11,0.6)" }}>FCFA</span>
              </div>
            </div>
            <Field
              label="Date de création du compte"
              value={formatDate(profile.dateCreation)}
              readOnly
            />
            <Field
              label="Date de validation des CGU"
              value={formatDate(profile.dateCGU)}
              readOnly
              hint="Conditions Générales d'Utilisation"
            />
          </div>
        </Section>

        {/* ── CLÔTURER MON COMPTE ── */}
        <div style={{
          background: "rgba(239,68,68,0.05)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "12px",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "12px 18px",
            borderBottom: "1px solid rgba(239,68,68,0.1)",
          }}>
            <span style={{
              fontSize: "10px", fontWeight: "800", color: "rgba(239,68,68,0.7)",
              letterSpacing: "2px", textTransform: "uppercase",
            }}>
              Zone de Danger
            </span>
          </div>
          <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{
              margin: 0, fontSize: "11px",
              color: "rgba(255,255,255,0.4)", lineHeight: 1.6,
            }}>
              La clôture de votre compte est définitive. Toutes vos données seront supprimées et vos parties en cours annulées.
            </p>

            {!closeConfirm ? (
              <button
                onClick={() => setCloseConfirm(true)}
                style={{
                  alignSelf: "flex-start",
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "1px solid rgba(239,68,68,0.4)",
                  background: "transparent",
                  color: "rgba(239,68,68,0.7)",
                  fontSize: "10px", fontWeight: "700",
                  letterSpacing: "1.5px", textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                  e.currentTarget.style.color = "#EF4444";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(239,68,68,0.7)";
                }}
              >
                Clôturer mon compte
              </button>
            ) : (
              <div style={{
                padding: "14px",
                borderRadius: "8px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                display: "flex", flexDirection: "column", gap: "10px",
              }}>
                <p style={{
                  margin: 0, fontSize: "11px", fontWeight: "700",
                  color: "#EF4444",
                }}>
                  Êtes-vous certain de vouloir clôturer votre compte ?
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => {
                      localStorage.removeItem(STORAGE_KEY);
                      setProfile(initProfile());
                      setCloseConfirm(false);
                    }}
                    style={{
                      padding: "7px 16px", borderRadius: "6px",
                      border: "none", background: "#EF4444",
                      color: "#fff", fontSize: "10px", fontWeight: "800",
                      letterSpacing: "1px", cursor: "pointer",
                    }}
                  >
                    OUI, CLÔTURER
                  </button>
                  <button
                    onClick={() => setCloseConfirm(false)}
                    style={{
                      padding: "7px 16px", borderRadius: "6px",
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "transparent",
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "10px", fontWeight: "700",
                      letterSpacing: "1px", cursor: "pointer",
                    }}
                  >
                    ANNULER
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
