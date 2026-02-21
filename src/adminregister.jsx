import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { BASE_URL } from './baseurl';

const TOAST_ID = "adminRegister";

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

// ── All sub-components defined OUTSIDE parent to prevent remounting ──────

const EyeOpen = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOff = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const Spinner = () => (
  <svg style={{ width: 16, height: 16, animation: "spin 1s linear infinite", verticalAlign: "middle" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
  </svg>
);

const FieldIcon = ({ children }) => (
  <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: C.muted, display: "flex", pointerEvents: "none" }}>
    {children}
  </span>
);

const Field = ({ label, name, type = "text", placeholder, showToggle, showState, onToggle, formData, handleChange, handleSubmit, errors, focusedInput, setFocusedInput, inputStyle }) => (
  <div>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 6 }}>{label}</label>
    <div style={{ position: "relative" }}>
      <FieldIcon>
        {name === "name" && (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        )}
        {name === "email" && (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
        )}
        {(name === "password" || name === "confirmPassword") && (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        )}
      </FieldIcon>
      <input
        name={name}
        type={showToggle ? (showState ? "text" : "password") : type}
        value={formData[name]}
        onChange={handleChange}
        onKeyDown={e => e.key === "Enter" && handleSubmit()}
        placeholder={placeholder}
        style={inputStyle(name, { padding: showToggle ? "11px 42px 11px 40px" : "11px 14px 11px 40px" })}
        onFocus={() => setFocusedInput(name)}
        onBlur={() => setFocusedInput(null)}
      />
      {showToggle && (
        <button
          onClick={onToggle} type="button"
          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, display: "flex" }}>
          {showState ? <EyeOff /> : <EyeOpen />}
        </button>
      )}
    </div>
    {errors[name] && <p style={{ margin: "5px 0 0", fontSize: 12, color: C.danger }}>{errors[name]}</p>}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────
export default function SuperAdminRegister() {
  const [formData, setFormData]                       = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors]                           = useState({});
  const [isLoading, setIsLoading]                     = useState(false);
  const [focusedInput, setFocusedInput]               = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/adminRegister`, formData);
      localStorage.setItem('adminToken', response.data.token);
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      toast.success("Registration was successful", { containerId: TOAST_ID });
      navigate('/admindashboard');
    } catch (err) {
      const msg = err?.response?.data?.error || "Error occurred while trying to register";
      toast.error(msg, { containerId: TOAST_ID });
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = (name, extraStyle = {}) => ({
    width: "100%", boxSizing: "border-box",
    background: C.inputBg,
    border: `1px solid ${errors[name] ? C.danger : focusedInput === name ? C.teal : C.border}`,
    boxShadow: focusedInput === name ? `0 0 0 3px rgba(19,193,204,.12)` : "none",
    color: C.navy, borderRadius: 6, fontSize: 14,
    fontFamily: "inherit", outline: "none",
    transition: "border-color .2s, box-shadow .2s",
    ...extraStyle,
  });

  const tealBtn = {
    background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`,
    color: "#ffffff", border: "none", borderRadius: 6,
    fontWeight: 700, fontSize: 15, cursor: "pointer",
    letterSpacing: ".3px", boxShadow: `0 4px 14px rgba(19,193,204,.3)`,
    transition: "box-shadow .2s, opacity .2s",
  };

  // Shared props passed to every Field
  const fieldProps = { formData, handleChange, handleSubmit, errors, focusedInput, setFocusedInput, inputStyle };

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", background: C.pageBg, display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: ${C.muted}; }`}</style>

      <ToastContainer containerId={TOAST_ID} position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnHover draggable theme="light" />

      {/* ── Header ── */}
      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 32px", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 6px rgba(0,0,0,.06)" }}>
        <img src="./logo.jpeg" alt="Enrichify Data" style={{ height: 40, objectFit: "contain" }} />
        <Link to="/adminlogin" style={{ ...tealBtn, padding: "9px 22px", fontSize: 13, textDecoration: "none", display: "inline-block" }}>
          ← Back to Login
        </Link>
      </header>

      {/* ── Hero strip ── */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #1e3a5f 60%, #15505a 100%)`, padding: "40px 24px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(19,193,204,.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(19,193,204,.06)", pointerEvents: "none" }} />
        <p style={{ color: C.teal, fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 10px" }}>Admin Registration</p>
        <h1 style={{ color: "#ffffff", fontSize: 30, fontWeight: 700, margin: "0 0 10px", letterSpacing: "-.5px" }}>Create Admin Account</h1>
        <p style={{ color: "rgba(255,255,255,.65)", fontSize: 15, margin: 0 }}>Register to access the Enrichify admin control panel</p>
      </div>

      {/* ── Card ── */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "32px 16px 48px" }}>
        <div style={{ width: "100%", maxWidth: 460 }}>

          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: "0 8px 32px rgba(26,46,74,.10)", overflow: "hidden" }}>

            {/* Card header strip */}
            <div style={{ background: C.tealXlt, borderBottom: `1px solid rgba(19,193,204,.2)`, padding: "18px 28px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 12px rgba(19,193,204,.3)` }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
              </div>
              <div>
                <h2 style={{ color: C.navy, fontSize: 17, fontWeight: 700, margin: 0 }}>New Admin Account</h2>
                <p style={{ color: C.bodyText, fontSize: 13, margin: 0 }}>Fill in your details to get started</p>
              </div>
            </div>

            {/* Card body */}
            <div style={{ padding: "28px 28px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                <Field label="Full Name"        name="name"            type="text"  placeholder="John Doe"               {...fieldProps} />
                <Field label="Email Address"    name="email"           type="email" placeholder="admin@example.com"      {...fieldProps} />
                <Field label="Password"         name="password"                     placeholder="Minimum 8 characters"
                  showToggle showState={showPassword}        onToggle={() => setShowPassword(v => !v)}        {...fieldProps} />
                <Field label="Confirm Password" name="confirmPassword"              placeholder="Re-enter your password"
                  showToggle showState={showConfirmPassword} onToggle={() => setShowConfirmPassword(v => !v)} {...fieldProps} />

                <button
                  onClick={handleSubmit} disabled={isLoading}
                  style={{ ...tealBtn, width: "100%", padding: "13px 0", marginTop: 4, opacity: isLoading ? .7 : 1 }}
                  onMouseEnter={e => !isLoading && (e.currentTarget.style.boxShadow = `0 6px 22px rgba(19,193,204,.45)`)}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 4px 14px rgba(19,193,204,.3)`)}>
                  {isLoading
                    ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}><Spinner /> Creating Account...</span>
                    : "Create Account →"}
                </button>
              </div>

              <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
                <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                  🔒 By registering, you agree to our terms and conditions.
                </p>
              </div>
            </div>
          </div>

          {/* Already have account */}
          <p style={{ textAlign: "center", fontSize: 14, color: C.bodyText, marginTop: 20 }}>
            Already have an account?{" "}
            <Link
              to="/adminlogin"
              style={{ color: C.teal, fontWeight: 700, textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
            >
              Sign In
            </Link>
          </p>

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