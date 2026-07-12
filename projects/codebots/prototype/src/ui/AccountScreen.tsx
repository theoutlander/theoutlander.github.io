import React, { useState } from "react";
import { Panel } from "./components/Panel";
import { Button } from "./components/Button";
import { cloudEnabled, signUp, logIn, logOut, type Account } from "../state/account";
import { syncNow } from "../state/cloudSync";

const inputStyle: React.CSSProperties = {
  all: "unset", boxSizing: "border-box", width: "100%", padding: "10px 12px",
  border: "1.5px solid var(--line-strong)", borderRadius: 8, background: "rgba(0,0,0,.2)",
  color: "var(--ink)", fontSize: "var(--text-md)", fontFamily: "var(--font-mono, monospace)",
};

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "1px", color: "var(--text-dim)" }}>{label}</span>
      <input style={inputStyle} {...rest} />
    </label>
  );
}

/**
 * Account screen: log in / sign up / log out. Username is the identity (optional email only for
 * password recovery). When cloud save isn't configured yet, shows a friendly guest-mode note so
 * the game is never gated behind an account.
 */
export function AccountScreen({
  account,
  onAccount,
  onDone,
}: {
  account: Account | null;
  onAccount: (a: Account | null) => void;
  onDone: () => void;
}) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrap: React.CSSProperties = { maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 };

  if (!cloudEnabled) {
    return (
      <div style={{ padding: "40px 24px" }}>
        <div style={wrap}>
          <Panel label="ACCOUNTS">
            <div style={{ fontSize: "var(--text-md)", color: "var(--text-body)", lineHeight: "var(--leading-body)" }}>
              Cloud save isn't switched on yet, so you're playing as a <b>guest</b>. Your progress is
              saved right here on this device — it just won't follow you to other devices until
              accounts are turned on.
            </div>
          </Panel>
          <Button onClick={onDone}>‹ BACK</Button>
        </div>
      </div>
    );
  }

  if (account) {
    return (
      <div style={{ padding: "40px 24px" }}>
        <div style={wrap}>
          <Panel label="YOUR ACCOUNT">
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-2xl)", color: "var(--cyan)" }}>
              {account.username}
            </div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-dim)", marginTop: 6 }}>
              Your progress saves to your account automatically and follows you to any device you log
              into.
            </div>
          </Panel>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="ghost" onClick={async () => { await logOut(); onAccount(null); }}>LOG OUT</Button>
            <Button onClick={onDone} style={{ flex: 1 }}>‹ BACK</Button>
          </div>
        </div>
      </div>
    );
  }

  async function submit() {
    setError(null);
    if (!username.trim() || password.length < 6) {
      setError("Pick a username and a password of at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      const acct = tab === "signup"
        ? await signUp(username, password, email.trim() || undefined)
        : await logIn(username, password);
      // signUp may not return a session in every config; ensure we're logged in.
      const final = tab === "signup" ? await logIn(username, password).catch(() => acct) : acct;
      await syncNow(); // merge guest progress up / pull cloud down
      onAccount(final);
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: "40px 24px" }}>
      <div style={wrap}>
        <div style={{ display: "flex", gap: 8 }}>
          {(["login", "signup"] as const).map((t) => (
            <Button key={t} variant={tab === t ? "primary" : "ghost"} size="sm" onClick={() => { setTab(t); setError(null); }}>
              {t === "login" ? "LOG IN" : "CREATE ACCOUNT"}
            </Button>
          ))}
        </div>
        <Panel label={tab === "login" ? "LOG IN" : "CREATE ACCOUNT"}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="USERNAME" value={username} autoCapitalize="none" autoCorrect="off"
              onChange={(e) => setUsername(e.target.value)} placeholder="pick a name" />
            <Field label="PASSWORD" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="at least 6 characters" />
            {tab === "signup" ? (
              <Field label="GROWN-UP'S EMAIL — OPTIONAL (for password help)" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="optional" />
            ) : null}
            {error ? <div style={{ color: "var(--red)", fontSize: "var(--text-sm)", fontWeight: 700 }}>{error}</div> : null}
            <Button onClick={submit} disabled={busy}>
              {busy ? "…" : tab === "login" ? "LOG IN →" : "CREATE ACCOUNT →"}
            </Button>
          </div>
        </Panel>
        <Button variant="quiet" size="sm" onClick={onDone}>keep playing as guest ›</Button>
      </div>
    </div>
  );
}
