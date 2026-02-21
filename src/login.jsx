import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "./baseurl";

const LOGIN_CONTAINER_ID = "login-toast";

function parseUserAgent(ua) {
  let browser = "Unknown", browserVersion = "", os = "Unknown", deviceType = "Desktop";
  if (/iPhone/i.test(ua)) deviceType = "iPhone";
  else if (/iPad/i.test(ua)) deviceType = "iPad";
  else if (/Android/i.test(ua) && /Mobile/i.test(ua)) deviceType = "Android Phone";
  else if (/Android/i.test(ua)) deviceType = "Android Tablet";
  else if (/Windows/i.test(ua) || /Macintosh/i.test(ua) || /Linux/i.test(ua)) deviceType = "Desktop";
  if (/Edg\//i.test(ua)) { browser = "Edge"; browserVersion = (ua.match(/Edg\/([\d.]+)/) || [])[1] || ""; }
  else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) { browser = "Opera"; browserVersion = (ua.match(/OPR\/([\d.]+)/) || ua.match(/Opera\/([\d.]+)/) || [])[1] || ""; }
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) { browser = "Chrome"; browserVersion = (ua.match(/Chrome\/([\d.]+)/) || [])[1] || ""; }
  else if (/Firefox\//i.test(ua)) { browser = "Firefox"; browserVersion = (ua.match(/Firefox\/([\d.]+)/) || [])[1] || ""; }
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) { browser = "Safari"; browserVersion = (ua.match(/Version\/([\d.]+)/) || [])[1] || ""; }
  else if (/Chromium\//i.test(ua)) { browser = "Chromium"; browserVersion = (ua.match(/Chromium\/([\d.]+)/) || [])[1] || ""; }
  if (/Windows NT ([\d.]+)/i.test(ua)) {
    const ver = (ua.match(/Windows NT ([\d.]+)/) || [])[1];
    os = { "10.0": "Windows 10/11", "6.1": "Windows 7", "6.2": "Windows 8", "6.3": "Windows 8.1" }[ver] || `Windows NT ${ver}`;
  } else if (/Mac OS X ([\d._]+)/i.test(ua)) {
    os = `macOS ${((ua.match(/Mac OS X ([\d._]+)/) || [])[1] || "").replace(/_/g, ".")}`;
  } else if (/Android ([\d.]+)/i.test(ua)) {
    os = `Android ${(ua.match(/Android ([\d.]+)/) || [])[1]}`;
  } else if (/iPhone OS ([\d._]+)/i.test(ua)) {
    os = `iOS ${((ua.match(/iPhone OS ([\d._]+)/) || [])[1] || "").replace(/_/g, ".")}`;
  } else if (/iPad.*OS ([\d._]+)/i.test(ua)) {
    os = `iPadOS ${((ua.match(/iPad.*OS ([\d._]+)/) || [])[1] || "").replace(/_/g, ".")}`;
  } else if (/Linux/i.test(ua)) { os = "Linux"; }
  return { raw: ua, browser: browserVersion ? `${browser} ${browserVersion}` : browser, os, deviceType };
}

// ── Enrichify Data brand palette (light theme) ────────────────────────────
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

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showOtp, setShowOtp]       = useState(false);
  const [otp, setOtp]               = useState(["","","","","",""]);
  const [isLoading, setLoading]     = useState(false);
  const [resendTimer, setTimer]     = useState(0);
  const [showPassword, setShowPw]   = useState(false);
  const [deviceInfo, setDevice]     = useState(null);
  const [userId, setUserId]         = useState(null);
  const otpRefs = useRef([]);

  useEffect(() => {
    (async () => {
      const userAgent = parseUserAgent(navigator.userAgent);
      let ip = "unknown";
      try { ip = (await (await fetch("https://api.ipify.org?format=json")).json()).ip; }
      catch { try { ip = (await (await fetch(`${BASE_URL}/get-ip`)).json()).ip; } catch {} }
      setDevice({ ip, userAgent: userAgent.raw, deviceType: userAgent.deviceType, browser: userAgent.browser, os: userAgent.os });
    })();
  }, []);

  useEffect(() => {
    let t; if (resendTimer > 0) t = setInterval(() => setTimer(n => n - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  useEffect(() => { if (showOtp) otpRefs.current[0]?.focus(); }, [showOtp]);

  const validateEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const notify = (type, msg) => toast[type](msg, { containerId: LOGIN_CONTAINER_ID });

  const handleLogin = async () => {
    if (!email || !password)       return notify("error", "Please fill in all fields");
    if (!validateEmail(email))     return notify("error", "Please enter a valid email");
    if (password.length < 6)       return notify("error", "Password must be at least 6 characters");
    if (!deviceInfo)               return notify("error", "Please wait, collecting device information...");
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, deviceType: deviceInfo.deviceType, ipAddress: deviceInfo.ip }) });
      const data = await res.json();
      if (!res.ok) { notify("error", data.error || "Login failed"); setLoading(false); return; }
      if (data.requireOTP) {
        setUserId(data.userId); setShowOtp(true); setTimer(30);
        notify("info", data.message || "OTP sent to your email");
      } else {
        notify("success", data.message || "Logged in successfully!");
        if (data.token) { localStorage.setItem("authToken", data.token); localStorage.setItem("user", JSON.stringify(data.user)); }
        setTimeout(() => navigate("/dashboard"), 1000);
      }
      setLoading(false);
    } catch { notify("error", "Network error. Please try again."); setLoading(false); }
  };

  const handleOtpChange = (i, v) => {
    if (v.length > 1) {
      const digits = v.slice(0, 6).split(""), next = [...otp];
      digits.forEach((d, j) => { if (j + i < 6) next[j + i] = d; });
      setOtp(next); otpRefs.current[Math.min(i + digits.length, 5)]?.focus(); return;
    }
    const next = [...otp]; next[i] = v; setOtp(next);
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
      const next = [...otp]; next[i - 1] = ""; setOtp(next);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) return notify("error", "Please enter the complete OTP");
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/verify-login-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp: code }) });
      const data = await res.json();
      if (!res.ok) { notify("error", data.error || "Invalid OTP"); setOtp(["","","","","",""]); otpRefs.current[0]?.focus(); setLoading(false); return; }
      notify("success", data.message || "Logged in successfully!");
      if (data.token) { localStorage.setItem("authToken", data.token); localStorage.setItem("user", JSON.stringify(data.user)); }
      setTimeout(() => navigate("/dashboard"), 1000);
      setLoading(false);
    } catch { notify("error", "Network error. Please try again."); setLoading(false); }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/resend-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) { notify("error", data.error || "Failed to resend OTP"); setLoading(false); return; }
      setOtp(["","","","","",""]); setTimer(30); otpRefs.current[0]?.focus();
      notify("info", data.message || "OTP resent successfully");
      setLoading(false);
    } catch { notify("error", "Network error. Please try again."); setLoading(false); }
  };

  // ── Shared styles ──────────────────────────────────────────────────────────
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

      <ToastContainer containerId={LOGIN_CONTAINER_ID} position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnHover draggable theme="light" />

      {/* ── Header — matches Enrichify nav ── */}
      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 32px", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 6px rgba(0,0,0,.06)" }}>
        <img src="./logo.jpeg" alt="Enrichify Data" style={{ height: 40, objectFit: "contain" }} />
        <Link to="/" style={{ textDecoration: "none" }}>
          <button style={{ ...tealBtn, padding: "9px 22px", fontSize: 13 }}>Sign Up</button>
        </Link>
      </header>

      {/* ── Hero strip ── */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #1e3a5f 60%, #15505a 100%)`, padding: "40px 24px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(19,193,204,.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(19,193,204,.06)", pointerEvents: "none" }} />
        <p style={{ color: C.teal, fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 10px" }}>
          {showOtp ? "Security Check" : "Welcome Back"}
        </p>
        <h1 style={{ color: "#ffffff", fontSize: 30, fontWeight: 700, margin: "0 0 10px", letterSpacing: "-.5px" }}>
          {showOtp ? "Verify Your Identity" : "Sign In to Enrichify"}
        </h1>
        <p style={{ color: "rgba(255,255,255,.65)", fontSize: 15, margin: 0 }}>
          {showOtp ? `A 6-digit code was sent to ${email}` : "Access your data enrichment dashboard"}
        </p>
      </div>

      {/* ── Card ── */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "32px 16px 48px" }}>
        <div style={{ width: "100%", maxWidth: 460 }}>

          {/* Main card */}
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: "0 8px 32px rgba(26,46,74,.10)", overflow: "hidden" }}>

            {/* Card header strip */}
            <div style={{ background: C.tealXlt, borderBottom: `1px solid rgba(19,193,204,.2)`, padding: "18px 28px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 12px rgba(19,193,204,.3)` }}>
                {!showOtp
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
              </div>
              <div>
                <h2 style={{ color: C.navy, fontSize: 17, fontWeight: 700, margin: 0 }}>
                  {showOtp ? "Email Verification" : "Account Login"}
                </h2>
                <p style={{ color: C.bodyText, fontSize: 13, margin: 0 }}>
                  {showOtp ? "New IP detected — please verify it's you" : "Enter your credentials to continue"}
                </p>
              </div>
            </div>

            {/* Card body */}
            <div style={{ padding: "28px 28px 24px" }}>
              {!showOtp ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                  {/* Email */}
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 6 }}>Email Address</label>
                    <div style={{ position: "relative" }}>
                      <FieldIcon>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      </FieldIcon>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="you@example.com"
                        style={{ ...inputBase, padding: "11px 14px 11px 40px" }}
                        onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Password</label>
                      <Link to="/forgot-password" style={{ fontSize: 12, color: C.teal, textDecoration: "none", fontWeight: 600 }}
                        onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}>
                        Forgot password?
                      </Link>
                    </div>
                    <div style={{ position: "relative" }}>
                      <FieldIcon>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </FieldIcon>
                      <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="••••••••"
                        style={{ ...inputBase, padding: "11px 42px 11px 40px" }}
                        onFocus={onFocus} onBlur={onBlur} />
                      <button onClick={() => setShowPw(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, display: "flex" }}>
                        {showPassword ? <EyeOff /> : <EyeOpen />}
                      </button>
                    </div>
                  </div>

                  {/* Sign In button */}
                  <button onClick={handleLogin} disabled={isLoading}
                    style={{ ...tealBtn, width: "100%", padding: "13px 0", marginTop: 4, opacity: isLoading ? .7 : 1 }}
                    onMouseEnter={e => !isLoading && (e.currentTarget.style.boxShadow = `0 6px 22px rgba(19,193,204,.45)`)}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 4px 14px rgba(19,193,204,.3)`)}>
                    {isLoading
                      ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}><Spinner /> Signing in...</span>
                      : "Sign In →"}
                  </button>
                </div>

              ) : (
                /* ── OTP Step ── */
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ background: C.tealXlt, border: `1px solid rgba(19,193,204,.25)`, borderRadius: 8, padding: "14px 16px", fontSize: 13, color: C.navyLight }}>
                    🔐 New IP detected. A 6-digit security code was sent to <strong>{email}</strong>
                  </div>

                  {/* OTP boxes */}
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Enter Verification Code</label>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                      {otp.map((digit, i) => (
                        <input key={i} ref={el => (otpRefs.current[i] = el)}
                          type="text" inputMode="numeric" maxLength={1} value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleKeyDown(i, e)}
                          onFocus={e => { e.target.select(); e.target.style.borderColor = C.teal; e.target.style.boxShadow = `0 0 0 3px rgba(19,193,204,.15)`; e.target.style.background = C.white; }}
                          onBlur={e => { e.target.style.borderColor = digit ? C.teal : C.border; e.target.style.boxShadow = "none"; }}
                          style={{
                            width: 46, height: 54, textAlign: "center",
                            fontSize: 22, fontWeight: 700, borderRadius: 8, outline: "none",
                            background: digit ? C.white : C.inputBg,
                            border: `2px solid ${digit ? C.teal : C.border}`,
                            color: C.navy, fontFamily: "inherit",
                            transition: "border-color .2s, box-shadow .2s, background .2s",
                          }} />
                      ))}
                    </div>
                  </div>

                  {/* Resend */}
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: 13, color: C.bodyText }}>Didn't receive it? </span>
                    <button onClick={handleResend} disabled={resendTimer > 0 || isLoading}
                      style={{ background: "none", border: "none", cursor: resendTimer > 0 ? "default" : "pointer", fontSize: 13, fontWeight: 700, color: resendTimer > 0 ? C.muted : C.teal, padding: 0 }}>
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                    </button>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => { setShowOtp(false); setOtp(["","","","","",""]); setTimer(0); }} disabled={isLoading}
                      style={{ flex: 1, padding: "12px 0", borderRadius: 6, background: C.white, border: `1.5px solid ${C.border}`, color: C.navy, fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: isLoading ? .6 : 1, transition: "background .2s" }}
                      onMouseEnter={e => !isLoading && (e.currentTarget.style.background = C.pageBg)}
                      onMouseLeave={e => (e.currentTarget.style.background = C.white)}>
                      ← Back
                    </button>
                    <button onClick={handleVerifyOtp} disabled={isLoading}
                      style={{ ...tealBtn, flex: 2, padding: "12px 0", fontSize: 14, opacity: isLoading ? .7 : 1 }}>
                      {isLoading
                        ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}><Spinner /> Verifying...</span>
                        : "Verify & Sign In"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sign up link */}
          <p style={{ textAlign: "center", fontSize: 14, color: C.bodyText, marginTop: 20 }}>
            Don't have an account?{" "}
            <Link to="/" style={{ color: C.teal, fontWeight: 700, textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}>
              Sign Up Free
            </Link>
          </p>

          {/* Footer strip — matches site footer */}
          <div style={{ marginTop: 28, background: C.footerBg, borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>© 2026 Enrichify Data. All rights reserved.</span>
            <a href="/privacy-policy/" style={{ fontSize: 12, color: C.teal, textDecoration: "none", fontWeight: 600 }}>Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}