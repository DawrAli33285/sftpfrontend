import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { BASE_URL } from './baseurl';

const TOAST_ID = "adminResetPage";

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
};

export default function SuperAdminReset() {
  const [email, setEmail]                     = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [errors, setErrors]                   = useState({});
  const [isLoading, setIsLoading]             = useState(false);
  const [isSuccess, setIsSuccess]             = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!newPassword) newErrors.newPassword = 'New password is required';
    else if (newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/resetPassword`, { email, password: newPassword });
      setEmail(''); setNewPassword(''); setConfirmPassword('');
      setIsSuccess(true);
      toast.success(response.data.message, { containerId: TOAST_ID });
      navigate('/adminlogin');
    } catch (err) {
      const msg = err?.response?.data?.error || "Error occurred while trying to reset password";
      toast.error(msg, { containerId: TOAST_ID });
    } finally {
      setIsLoading(false);
    }
  };

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
    color: "#ffffff", border: "none", borderRadius: 6,
    fontWeight: 700, fontSize: 15, cursor: "pointer",
    letterSpacing: ".3px", boxShadow: `0 4px 14px rgba(19,193,204,.3)`,
    transition: "box-shadow .2s, opacity .2s",
  };

  const EyeOpen = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
  const EyeOff  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
  const Spinner = () => <svg style={{ width: 16, height: 16, animation: "spin 1s linear infinite", verticalAlign: "middle" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>;
  const FieldIcon = ({ children }) => (
    <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: C.muted, display: "flex", pointerEvents: "none" }}>
      {children}
    </span>
  );
  const LockIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

  const Shell = ({ children, heroTitle, heroSub, cardTitle, cardSub, cardIcon }) => (
    <div style={{ minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", background: C.pageBg, display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: ${C.muted}; }`}</style>
      <ToastContainer containerId={TOAST_ID} position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnHover draggable theme="light" />

      {/* Header */}
      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 32px", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 6px rgba(0,0,0,.06)" }}>
        <img src="./logo.jpeg" alt="Enrichify Data" style={{ height: 40, objectFit: "contain" }} />
        <Link to="/adminlogin" style={{ textDecoration: "none" }}>
          <button style={{ ...tealBtn, padding: "9px 22px", fontSize: 13 }}>← Back to Login</button>
        </Link>
      </header>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #1e3a5f 60%, #15505a 100%)`, padding: "40px 24px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(19,193,204,.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(19,193,204,.06)", pointerEvents: "none" }} />
        <p style={{ color: C.teal, fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 10px" }}>Admin Access</p>
        <h1 style={{ color: "#ffffff", fontSize: 30, fontWeight: 700, margin: "0 0 10px", letterSpacing: "-.5px" }}>{heroTitle}</h1>
        <p style={{ color: "rgba(255,255,255,.65)", fontSize: 15, margin: 0 }}>{heroSub}</p>
      </div>

      {/* Card */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "32px 16px 48px" }}>
        <div style={{ width: "100%", maxWidth: 460 }}>
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: "0 8px 32px rgba(26,46,74,.10)", overflow: "hidden" }}>

            {/* Card header strip */}
            <div style={{ background: C.tealXlt, borderBottom: `1px solid rgba(19,193,204,.2)`, padding: "18px 28px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 12px rgba(19,193,204,.3)` }}>
                {cardIcon}
              </div>
              <div>
                <h2 style={{ color: C.navy, fontSize: 17, fontWeight: 700, margin: 0 }}>{cardTitle}</h2>
                <p style={{ color: C.bodyText, fontSize: 13, margin: 0 }}>{cardSub}</p>
              </div>
            </div>

            {/* Card body */}
            <div style={{ padding: "28px 28px 24px" }}>
              {children}
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 28, background: C.footerBg, borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>© 2026 Enrichify Data. All rights reserved.</span>
            <a href="/privacy-policy/" style={{ fontSize: 12, color: C.teal, textDecoration: "none", fontWeight: 600 }}>Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Success state ────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <Shell
        heroTitle="Password Reset"
        heroSub="Your admin password has been updated"
        cardTitle="Reset Successful"
        cardSub="You can now sign in with your new password"
        cardIcon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
      >
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.tealXlt, border: `2px solid rgba(19,193,204,.3)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p style={{ fontSize: 14, color: C.bodyText, margin: 0, lineHeight: 1.6 }}>
            Your password has been successfully reset. You can now sign in with your new credentials.
          </p>
          <Link to="/adminlogin" style={{ textDecoration: "none", width: "100%" }}>
            <button style={{ ...tealBtn, width: "100%", padding: "13px 0" }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 6px 22px rgba(19,193,204,.45)`)}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 4px 14px rgba(19,193,204,.3)`)}>
              Go to Login →
            </button>
          </Link>
          <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>🔒 Keep your password secure and don't share it with anyone.</p>
        </div>
      </Shell>
    );
  }

  // ── Reset form ───────────────────────────────────────────────────────────
  return (
    <Shell
      heroTitle="Reset Password"
      heroSub="Enter your details to set a new password"
      cardTitle="Password Reset"
      cardSub="Enter your email and choose a new password"
      cardIcon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Email */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 6 }}>Email Address</label>
          <div style={{ position: "relative" }}>
            <FieldIcon>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </FieldIcon>
            <input type="email" value={email}
              onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({...p, email: ''})); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="admin@example.com"
              style={{ ...inputBase, padding: "11px 14px 11px 40px", borderColor: errors.email ? C.danger : C.border }}
              onFocus={onFocus} onBlur={onBlur} />
          </div>
          {errors.email && <p style={{ margin: "5px 0 0", fontSize: 12, color: C.danger }}>{errors.email}</p>}
        </div>

        {/* New Password */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 6 }}>New Password</label>
          <div style={{ position: "relative" }}>
            <FieldIcon><LockIcon /></FieldIcon>
            <input type={showPassword ? "text" : "password"} value={newPassword}
              onChange={e => { setNewPassword(e.target.value); if (errors.newPassword) setErrors(p => ({...p, newPassword: ''})); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="Minimum 8 characters"
              style={{ ...inputBase, padding: "11px 42px 11px 40px", borderColor: errors.newPassword ? C.danger : C.border }}
              onFocus={onFocus} onBlur={onBlur} />
            <button onClick={() => setShowPassword(v => !v)} type="button" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, display: "flex" }}>
              {showPassword ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
          {errors.newPassword && <p style={{ margin: "5px 0 0", fontSize: 12, color: C.danger }}>{errors.newPassword}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 6 }}>Confirm Password</label>
          <div style={{ position: "relative" }}>
            <FieldIcon><LockIcon /></FieldIcon>
            <input type={showConfirm ? "text" : "password"} value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors(p => ({...p, confirmPassword: ''})); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="Re-enter new password"
              style={{ ...inputBase, padding: "11px 42px 11px 40px", borderColor: errors.confirmPassword ? C.danger : C.border }}
              onFocus={onFocus} onBlur={onBlur} />
            <button onClick={() => setShowConfirm(v => !v)} type="button" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, display: "flex" }}>
              {showConfirm ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
          {errors.confirmPassword && <p style={{ margin: "5px 0 0", fontSize: 12, color: C.danger }}>{errors.confirmPassword}</p>}
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={isLoading}
          style={{ ...tealBtn, width: "100%", padding: "13px 0", marginTop: 4, opacity: isLoading ? .7 : 1 }}
          onMouseEnter={e => !isLoading && (e.currentTarget.style.boxShadow = `0 6px 22px rgba(19,193,204,.45)`)}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 4px 14px rgba(19,193,204,.3)`)}>
          {isLoading
            ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}><Spinner /> Resetting...</span>
            : "Reset Password →"}
        </button>

        {/* Footer note */}
        <div style={{ paddingTop: 16, borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>🔒 Password must be at least 8 characters long.</p>
        </div>
      </div>
    </Shell>
  );
}