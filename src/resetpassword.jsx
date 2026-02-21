import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TOAST_ID = "reset-toast";

// ── Enrichify Data brand palette ─────────────────────────────────────────
const C = {
  pageBg:   "#f5f7fa",
  white:    "#ffffff",
  navy:     "#1a2e4a",
  navyLight:"#2d4a6e",
  teal:     "#13c1cc",
  tealDk:   "#0fa8b2",
  tealXlt:  "#e8f9fa",
  border:   "#e2e8f0",
  inputBg:  "#f9fbfc",
  bodyText: "#4a5568",
  muted:    "#8fa3b8",
  danger:   "#e53e3e",
  footerBg: "#192a3e",
  success:  "#38a169",
  warn:     "#d69e2e",
};

export default function ResetPasswordPage() {
  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [success, setSuccess]             = useState(false);
  const [tokenValid, setTokenValid]       = useState(null);

  useEffect(() => { setTimeout(() => setTokenValid(true), 800); }, []);

  const getStrength = () => {
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    if (s <= 2) return { label: "Weak",   color: C.danger,  width: "25%" };
    if (s <= 3) return { label: "Fair",   color: C.warn,    width: "50%" };
    if (s <= 4) return { label: "Good",   color: C.success, width: "75%" };
    return           { label: "Strong", color: "#22c55e",  width: "100%" };
  };

  const handleReset = () => {
    if (!password)                        return toast.error("Please enter a new password", { containerId: TOAST_ID });
    if (password.length < 6)             return toast.error("Password must be at least 6 characters", { containerId: TOAST_ID });
    if (!confirmPassword)                return toast.error("Please confirm your password", { containerId: TOAST_ID });
    if (password !== confirmPassword)    return toast.error("Passwords do not match", { containerId: TOAST_ID });
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setSuccess(true); toast.success("Password reset successfully!", { containerId: TOAST_ID }); }, 1400);
  };

  const strength = getStrength();

  // ── Shared styles ─────────────────────────────────────────────────────
  const inputBase = {
    width: "100%", boxSizing: "border-box",
    background: C.inputBg, border: `1px solid ${C.border}`,
    color: C.navy, borderRadius: 6, fontSize: 14,
    fontFamily: "inherit", outline: "none",
    transition: "border-color .2s, box-shadow .2s",
  };
  const onFocus = e => { e.target.style.borderColor = C.teal; e.target.style.boxShadow = `0 0 0 3px rgba(19,193,204,.12)`; };
  const onBlur  = e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; };
  const tealBtn = {
    background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`,
    color: C.white, border: "none", borderRadius: 6,
    fontWeight: 700, fontSize: 15, cursor: "pointer",
    letterSpacing: ".3px", boxShadow: `0 4px 14px rgba(19,193,204,.3)`,
    transition: "box-shadow .2s, opacity .2s",
  };

  const EyeOpen = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
  const EyeOff  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
  const Spinner = () => <svg style={{ width: 16, height: 16, animation: "spin 1s linear infinite", verticalAlign: "middle" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>;
  const LockIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
  const FieldIcon = ({ children }) => (
    <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: C.muted, display: "flex", pointerEvents: "none" }}>{children}</span>
  );

  // ── Page shell (shared across all states) ────────────────────────────
  const Shell = ({ heroTitle, heroSub, cardTitle, cardSub, children }) => (
    <div style={{ minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", background: C.pageBg, display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fillCircle { from { stroke-dashoffset: 251.2; } to { stroke-dashoffset: 0; } }
        @keyframes checkPop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
        input::placeholder { color: ${C.muted}; }
      `}</style>

      <ToastContainer containerId={TOAST_ID} position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnHover draggable theme="light" />

      {/* Header */}
      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 32px", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 6px rgba(0,0,0,.06)" }}>
        <img src="./logo.jpeg" alt="Enrichify Data" style={{ height: 40, objectFit: "contain" }} />
        <Link to="/login" style={{ textDecoration: "none" }}>
          <button style={{ ...tealBtn, padding: "9px 22px", fontSize: 13 }}>← Back to Login</button>
        </Link>
      </header>

      {/* Hero strip */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #1e3a5f 60%, #15505a 100%)`, padding: "40px 24px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(19,193,204,.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(19,193,204,.06)", pointerEvents: "none" }} />
        <p style={{ color: C.teal, fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 10px" }}>Account Security</p>
        <h1 style={{ color: C.white, fontSize: 30, fontWeight: 700, margin: "0 0 10px", letterSpacing: "-.5px" }}>{heroTitle}</h1>
        <p style={{ color: "rgba(255,255,255,.65)", fontSize: 15, margin: 0 }}>{heroSub}</p>
      </div>

      {/* Card */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "32px 16px 48px" }}>
        <div style={{ width: "100%", maxWidth: 460 }}>
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: "0 8px 32px rgba(26,46,74,.10)", overflow: "hidden" }}>
            {/* Card header strip */}
            <div style={{ background: C.tealXlt, borderBottom: `1px solid rgba(19,193,204,.2)`, padding: "18px 28px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 12px rgba(19,193,204,.3)`, color: C.white }}>
                <LockIcon />
              </div>
              <div>
                <h2 style={{ color: C.navy, fontSize: 17, fontWeight: 700, margin: 0 }}>{cardTitle}</h2>
                <p style={{ color: C.bodyText, fontSize: 13, margin: 0 }}>{cardSub}</p>
              </div>
            </div>
            {/* Card body */}
            <div style={{ padding: "28px 28px 24px" }}>{children}</div>
          </div>

          {/* Footer strip */}
          <div style={{ marginTop: 28, background: C.footerBg, borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>© 2026 Enrichify Data. All rights reserved.</span>
            <a href="/privacy-policy/" style={{ fontSize: 12, color: C.teal, textDecoration: "none", fontWeight: 600 }}>Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Loading state ────────────────────────────────────────────────────
  if (tokenValid === null) {
    return (
      <Shell heroTitle="Reset Password" heroSub="Please wait while we validate your reset link" cardTitle="Validating Link" cardSub="Checking your reset token...">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "32px 0" }}>
          <Spinner />
          <p style={{ fontSize: 13, color: C.muted }}>Validating reset link...</p>
        </div>
      </Shell>
    );
  }

  // ── Success state ────────────────────────────────────────────────────
  if (success) {
    return (
      <Shell heroTitle="All Done!" heroSub="Your password has been successfully updated" cardTitle="Password Reset" cardSub="You can now sign in with your new password">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "8px 0" }}>
          {/* Animated circle check */}
          <div style={{ position: "relative", width: 88, height: 88 }}>
            <svg viewBox="0 0 100 100" style={{ width: 88, height: 88 }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke={C.border} strokeWidth="5" />
              <circle cx="50" cy="50" r="40" fill="none" stroke={C.teal} strokeWidth="5"
                strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset="251.2"
                style={{ transform: "rotate(-90deg)", transformOrigin: "center", animation: "fillCircle .8s ease-out forwards" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"
                style={{ animation: "checkPop .4s .6s ease-out both" }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>

          <p style={{ fontSize: 14, color: C.bodyText, textAlign: "center", lineHeight: 1.6, margin: 0 }}>
            Your password has been successfully updated. You can now sign in with your new credentials.
          </p>

          <Link to="/login" style={{ textDecoration: "none", width: "100%" }}>
            <button style={{ ...tealBtn, width: "100%", padding: "13px 0", display: "flex", alignItems: "center", justifyContent: "center" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 6px 22px rgba(19,193,204,.45)`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = `0 4px 14px rgba(19,193,204,.3)`}>
              Go to Sign In →
            </button>
          </Link>

          <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>🔒 Keep your password secure and never share it.</p>
        </div>
      </Shell>
    );
  }

  // ── Reset form ───────────────────────────────────────────────────────
  return (
    <Shell heroTitle="Reset Password" heroSub="Choose a new secure password for your account" cardTitle="New Password" cardSub="Enter and confirm your new password below">
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Verified badge */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", background: C.tealXlt, border: `1px solid rgba(19,193,204,.25)`, borderRadius: 8, padding: "12px 14px" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
          <p style={{ fontSize: 12, color: C.navyLight, margin: 0 }}>Reset link verified successfully. Create your new password below.</p>
        </div>

        {/* New Password */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 6 }}>New Password</label>
          <div style={{ position: "relative" }}>
            <FieldIcon><LockIcon /></FieldIcon>
            <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              style={{ ...inputBase, padding: "11px 42px 11px 40px" }} onFocus={onFocus} onBlur={onBlur} />
            <button onClick={() => setShowPassword(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, display: "flex" }}>
              {showPassword ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>

          {/* Strength meter */}
          {password && (
            <div style={{ marginTop: 8 }}>
              <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: strength.width, background: strength.color, borderRadius: 2, transition: "width .4s, background .3s" }} />
              </div>
              <p style={{ fontSize: 11, marginTop: 4, color: strength.color, fontWeight: 600 }}>{strength.label}</p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 6 }}>Confirm New Password</label>
          <div style={{ position: "relative" }}>
            <FieldIcon><LockIcon /></FieldIcon>
            <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleReset()} placeholder="••••••••"
              style={{ ...inputBase, padding: "11px 42px 11px 40px" }} onFocus={onFocus} onBlur={onBlur} />
            <button onClick={() => setShowConfirm(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, display: "flex" }}>
              {showConfirm ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p style={{ fontSize: 12, marginTop: 5, color: C.danger }}>Passwords don't match</p>
          )}
          {confirmPassword && password === confirmPassword && (
            <p style={{ fontSize: 12, marginTop: 5, color: C.success, fontWeight: 600 }}>✓ Passwords match</p>
          )}
        </div>

        {/* Requirements checklist */}
        <div style={{ background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.muted, margin: "0 0 8px" }}>Password requirements</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { check: password.length >= 6,                                    text: "At least 6 characters" },
              { check: /[A-Z]/.test(password) && /[a-z]/.test(password),        text: "Upper and lowercase letters" },
              { check: /[0-9]/.test(password),                                  text: "At least one number" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={item.check ? C.success : C.border} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {item.check ? <polyline points="20 6 9 17 4 12"/> : <circle cx="12" cy="12" r="8"/>}
                </svg>
                <span style={{ fontSize: 12, color: item.check ? C.success : C.muted, transition: "color .2s" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button onClick={handleReset} disabled={isLoading}
          style={{ ...tealBtn, width: "100%", padding: "13px 0", opacity: isLoading ? .7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          onMouseEnter={e => !isLoading && (e.currentTarget.style.boxShadow = `0 6px 22px rgba(19,193,204,.45)`)}
          onMouseLeave={e => e.currentTarget.style.boxShadow = `0 4px 14px rgba(19,193,204,.3)`}>
          {isLoading ? <><Spinner /> Resetting password...</> : "Reset Password →"}
        </button>

        <p style={{ textAlign: "center", fontSize: 13, color: C.bodyText, margin: 0 }}>
          Changed your mind?{" "}
          <Link to="/login" style={{ color: C.teal, fontWeight: 700, textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
            onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
            Back to Login
          </Link>
        </p>
      </div>
    </Shell>
  );
}