import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BASE_URL } from './baseurl';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ADMIN_TOAST_ID = "adminLogin";

// ── Enrichify Data brand palette (matches LoginPage exactly) ─────────────
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
};

export default function SuperAdminLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/adminLogin`, formData);
      localStorage.setItem("adminToken", response.data.token);
      setFormData({ email: '', password: '' });
      navigate('/admindashboard');
    } catch (err) {
      const msg = err?.response?.data?.error || "Error occurred while trying to login";
      toast.error(msg, { containerId: ADMIN_TOAST_ID });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Shared styles (mirrors LoginPage exactly) ─────────────────────────
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

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", background: C.pageBg, display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: ${C.muted}; }`}</style>

      <ToastContainer containerId={ADMIN_TOAST_ID} position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnHover draggable theme="light" />

      {/* ── Header ── */}
      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 32px", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 6px rgba(0,0,0,.06)" }}>
        <img src="./logo.jpeg" alt="Enrichify Data" style={{ height: 40, objectFit: "contain" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.teal, letterSpacing: "1px", textTransform: "uppercase" }}>Secure Admin Area</span>
        </div>
      </header>

      {/* ── Hero strip ── */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #1e3a5f 60%, #15505a 100%)`, padding: "40px 24px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(19,193,204,.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(19,193,204,.06)", pointerEvents: "none" }} />
        <p style={{ color: C.teal, fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 10px" }}>
          Admin Access
        </p>
        <h1 style={{ color: "#ffffff", fontSize: 30, fontWeight: 700, margin: "0 0 10px", letterSpacing: "-.5px" }}>
          Super Admin Login
        </h1>
        <p style={{ color: "rgba(255,255,255,.65)", fontSize: 15, margin: 0 }}>
          Access the Enrichify admin control panel
        </p>
      </div>

      {/* ── Card ── */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "32px 16px 48px" }}>
        <div style={{ width: "100%", maxWidth: 460 }}>

          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: "0 8px 32px rgba(26,46,74,.10)", overflow: "hidden" }}>

            {/* Card header strip */}
            <div style={{ background: C.tealXlt, borderBottom: `1px solid rgba(19,193,204,.2)`, padding: "18px 28px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 12px rgba(19,193,204,.3)` }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <h2 style={{ color: C.navy, fontSize: 17, fontWeight: 700, margin: 0 }}>Admin Authentication</h2>
                <p style={{ color: C.bodyText, fontSize: 13, margin: 0 }}>All activities are logged and monitored</p>
              </div>
            </div>

            {/* Card body */}
            <div style={{ padding: "28px 28px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                {/* Email */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 6 }}>Email Address</label>
                  <div style={{ position: "relative" }}>
                    <FieldIcon>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </FieldIcon>
                    <input
                      type="email" name="email" value={formData.email}
                      onChange={handleChange}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()}
                      placeholder="admin@example.com"
                      style={{ ...inputBase, padding: "11px 14px 11px 40px", borderColor: errors.email ? C.danger : C.border }}
                      onFocus={onFocus} onBlur={onBlur}
                    />
                  </div>
                  {errors.email && <p style={{ margin: "5px 0 0", fontSize: 12, color: C.danger }}>{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Password</label>
                    <a href="/adminreset" style={{ fontSize: 12, color: C.teal, textDecoration: "none", fontWeight: 600 }}
                      onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}>
                      Forgot password?
                    </a>
                  </div>
                  <div style={{ position: "relative" }}>
                    <FieldIcon>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </FieldIcon>
                    <input
                      type={showPassword ? "text" : "password"} name="password" value={formData.password}
                      onChange={handleChange}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()}
                      placeholder="••••••••"
                      style={{ ...inputBase, padding: "11px 42px 11px 40px", borderColor: errors.password ? C.danger : C.border }}
                      onFocus={onFocus} onBlur={onBlur}
                    />
                    <button onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, display: "flex" }}>
                      {showPassword ? <EyeOff /> : <EyeOpen />}
                    </button>
                  </div>
                  {errors.password && <p style={{ margin: "5px 0 0", fontSize: 12, color: C.danger }}>{errors.password}</p>}
                </div>

                {/* Remember me */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" id="remember" style={{ accentColor: C.teal, width: 15, height: 15, cursor: "pointer" }} />
                  <label htmlFor="remember" style={{ fontSize: 13, color: C.bodyText, cursor: "pointer" }}>Remember me</label>
                </div>

                {/* Sign In button */}
                <button
                  onClick={handleSubmit} disabled={isLoading}
                  style={{ ...tealBtn, width: "100%", padding: "13px 0", marginTop: 4, opacity: isLoading ? .7 : 1 }}
                  onMouseEnter={e => !isLoading && (e.currentTarget.style.boxShadow = `0 6px 22px rgba(19,193,204,.45)`)}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 4px 14px rgba(19,193,204,.3)`)}>
                  {isLoading
                    ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}><Spinner /> Signing in...</span>
                    : "Sign In →"}
                </button>
              </div>

              {/* Register link */}
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
                <span style={{ fontSize: 13, color: C.bodyText }}>Don't have an account? </span>
                <a href="/adminregister" style={{ color: C.teal, fontWeight: 700, textDecoration: "none", fontSize: 13 }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}>
                  Register here
                </a>
              </div>
            </div>
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
}