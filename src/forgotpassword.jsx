import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "./baseurl";

const TOAST_ID = "forgot-toast";

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

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail]                       = useState("");
  const [step, setStep]                         = useState(1);
  const [otp, setOtp]                           = useState(["","","","","",""]);
  const [newPassword, setNewPassword]           = useState("");
  const [confirmPassword, setConfirmPassword]   = useState("");
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPw] = useState(false);
  const [isLoading, setIsLoading]               = useState(false);
  const [resendTimer, setResendTimer]           = useState(0);
  const [resetToken, setResetToken]             = useState("");
  const otpRefs = useRef([]);

  useEffect(() => {
    let t; if (resendTimer > 0) t = setInterval(() => setResendTimer(n => n - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  useEffect(() => { if (step === 2) otpRefs.current[0]?.focus(); }, [step]);

  const validateEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const notify = (type, msg) => toast[type](msg, { containerId: TOAST_ID });

  const handleSubmitEmail = async () => {
    if (!email.trim()) return notify("error", "Please enter your email address");
    if (!validateEmail(email)) return notify("error", "Please enter a valid email address");
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/forgot-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) { notify("error", data.error || "Failed to send recovery code"); setIsLoading(false); return; }
      setStep(2); setResendTimer(30);
      notify("info", data.message || "Recovery code sent to your email");
    } catch { notify("error", "Network error. Please try again."); }
    finally { setIsLoading(false); }
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
    if (code.length < 6) return notify("error", "Please enter the complete 6-digit code");
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/verify-forgot-password-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp: code }) });
      const data = await res.json();
      if (!res.ok) { notify("error", data.error || "Invalid code"); setOtp(["","","","","",""]); otpRefs.current[0]?.focus(); setIsLoading(false); return; }
      notify("success", data.message || "Code verified!");
      setResetToken(data.resetToken);
      setTimeout(() => { setStep(3); setIsLoading(false); }, 1000);
    } catch { notify("error", "Network error. Please try again."); setIsLoading(false); }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) return notify("error", "Please fill in all fields");
    if (newPassword.length < 6) return notify("error", "Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return notify("error", "Passwords do not match");
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resetToken, newPassword }) });
      const data = await res.json();
      if (!res.ok) { notify("error", data.error || "Failed to reset password"); setIsLoading(false); return; }
      notify("success", data.message || "Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch { notify("error", "Network error. Please try again."); }
    finally { setIsLoading(false); }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/resend-forgot-password-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) { notify("error", data.error || "Failed to resend code"); setIsLoading(false); return; }
      setOtp(["","","","","",""]); setResendTimer(30); otpRefs.current[0]?.focus();
      notify("info", data.message || "Recovery code resent");
    } catch { notify("error", "Network error. Please try again."); }
    finally { setIsLoading(false); }
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
    color: C.white, border: "none", borderRadius: 6,
    fontWeight: 700, fontSize: 15, cursor: "pointer",
    letterSpacing: ".3px", boxShadow: `0 4px 14px rgba(19,193,204,.3)`,
    transition: "box-shadow .2s, opacity .2s",
  };
  const ghostBtn = {
    background: C.white, border: `1px solid ${C.border}`,
    borderRadius: 6, fontSize: 14, fontWeight: 600,
    color: C.navy, cursor: "pointer", padding: "11px 0",
    transition: "background .15s",
  };

  const EyeOpen = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
  const EyeOff  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
  const Spinner = () => <svg style={{ width: 16, height: 16, animation: "spin 1s linear infinite", verticalAlign: "middle" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>;
  const FieldIcon = ({ children }) => (
    <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: C.muted, display: "flex", pointerEvents: "none" }}>
      {children}
    </span>
  );
  const EmailIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
  const LockIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

  // Step meta
  const stepMeta = {
    1: { eyebrow: "Account Recovery",   title: "Forgot Password",  sub: "Enter your email to receive a recovery code" },
    2: { eyebrow: "Security Check",     title: "Verify Code",      sub: `Enter the 6-digit code sent to ${email}` },
    3: { eyebrow: "Almost There",       title: "Reset Password",   sub: "Create a new secure password for your account" },
  };
  const meta = stepMeta[step];

  // Progress indicator
  const StepDot = ({ n }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700,
        background: step >= n ? `linear-gradient(135deg, ${C.teal}, ${C.tealDk})` : C.border,
        color: step >= n ? C.white : C.muted,
        boxShadow: step === n ? `0 0 0 3px rgba(19,193,204,.2)` : "none",
      }}>
        {step > n ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : n}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", background: C.pageBg, display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: ${C.muted}; }`}</style>

      <ToastContainer containerId={TOAST_ID} position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnHover draggable theme="light" />

      {/* ── Header ── */}
      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 32px", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 6px rgba(0,0,0,.06)" }}>
        <img src="./logo.jpeg" alt="Enrichify Data" style={{ height: 40, objectFit: "contain" }} />
        <Link to="/login" style={{ textDecoration: "none" }}>
          <button style={{ ...tealBtn, padding: "9px 22px", fontSize: 13 }}>← Back to Login</button>
        </Link>
      </header>

      {/* ── Hero strip ── */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #1e3a5f 60%, #15505a 100%)`, padding: "40px 24px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(19,193,204,.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(19,193,204,.06)", pointerEvents: "none" }} />
        <p style={{ color: C.teal, fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 10px" }}>
          {meta.eyebrow}
        </p>
        <h1 style={{ color: C.white, fontSize: 30, fontWeight: 700, margin: "0 0 10px", letterSpacing: "-.5px" }}>{meta.title}</h1>
        <p style={{ color: "rgba(255,255,255,.65)", fontSize: 15, margin: "0 0 24px" }}>{meta.sub}</p>

        {/* Step progress */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
          <StepDot n={1} />
          <div style={{ width: 40, height: 2, background: step > 1 ? C.teal : "rgba(255,255,255,.2)", transition: "background .3s" }} />
          <StepDot n={2} />
          <div style={{ width: 40, height: 2, background: step > 2 ? C.teal : "rgba(255,255,255,.2)", transition: "background .3s" }} />
          <StepDot n={3} />
        </div>
      </div>

      {/* ── Card ── */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "32px 16px 48px" }}>
        <div style={{ width: "100%", maxWidth: 460 }}>

          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: "0 8px 32px rgba(26,46,74,.10)", overflow: "hidden" }}>

            {/* Card header strip */}
            <div style={{ background: C.tealXlt, borderBottom: `1px solid rgba(19,193,204,.2)`, padding: "18px 28px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 12px rgba(19,193,204,.3)`, color: C.white }}>
                {step === 3
                  ? <LockIcon />
                  : <EmailIcon />}
              </div>
              <div>
                <h2 style={{ color: C.navy, fontSize: 17, fontWeight: 700, margin: 0 }}>
                  {step === 1 && "Enter Your Email"}
                  {step === 2 && "Email Verification"}
                  {step === 3 && "New Password"}
                </h2>
                <p style={{ color: C.bodyText, fontSize: 13, margin: 0 }}>
                  {step === 1 && "Step 1 of 3 — We'll send a recovery code"}
                  {step === 2 && "Step 2 of 3 — Enter the 6-digit code"}
                  {step === 3 && "Step 3 of 3 — Set your new password"}
                </p>
              </div>
            </div>

            {/* Card body */}
            <div style={{ padding: "28px 28px 24px" }}>

              {/* ── STEP 1: Email ── */}
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {/* Info box */}
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: C.tealXlt, border: `1px solid rgba(19,193,204,.25)`, borderRadius: 8, padding: "12px 14px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    <p style={{ fontSize: 12, color: C.navyLight, margin: 0, lineHeight: 1.6 }}>We'll send a 6-digit verification code to your registered email. The code expires in 10 minutes.</p>
                  </div>

                  {/* Email field */}
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 6 }}>Email Address</label>
                    <div style={{ position: "relative" }}>
                      <FieldIcon><EmailIcon /></FieldIcon>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmitEmail()} placeholder="you@example.com"
                        style={{ ...inputBase, padding: "11px 14px 11px 40px" }} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </div>

                  <button onClick={handleSubmitEmail} disabled={isLoading}
                    style={{ ...tealBtn, width: "100%", padding: "13px 0", opacity: isLoading ? .7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    onMouseEnter={e => !isLoading && (e.currentTarget.style.boxShadow = `0 6px 22px rgba(19,193,204,.45)`)}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = `0 4px 14px rgba(19,193,204,.3)`}>
                    {isLoading ? <><Spinner /> Sending code...</> : "Send Recovery Code →"}
                  </button>

                 
                </div>
              )}

              {/* ── STEP 2: OTP ── */}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ background: C.tealXlt, border: `1px solid rgba(19,193,204,.25)`, borderRadius: 8, padding: "14px 16px", fontSize: 13, color: C.navyLight }}>
                    📧 A 6-digit code was sent to <strong>{email}</strong>
                  </div>

                  {/* OTP boxes */}
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Enter Verification Code</label>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                      {otp.map((digit, i) => (
                        <input key={i} ref={el => otpRefs.current[i] = el}
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
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                    </button>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => { setStep(1); setOtp(["","","","","",""]); setResendTimer(0); }} disabled={isLoading}
                      style={{ ...ghostBtn, flex: 1, opacity: isLoading ? .6 : 1 }}
                      onMouseEnter={e => !isLoading && (e.currentTarget.style.background = C.pageBg)}
                      onMouseLeave={e => e.currentTarget.style.background = C.white}>
                      ← Back
                    </button>
                    <button onClick={handleVerifyOtp} disabled={isLoading}
                      style={{ ...tealBtn, flex: 2, padding: "11px 0", opacity: isLoading ? .7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      {isLoading ? <><Spinner /> Verifying...</> : "Verify Code →"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: New Password ── */}
              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: C.tealXlt, border: `1px solid rgba(19,193,204,.25)`, borderRadius: 8, padding: "12px 14px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="20 6 9 17 4 12"/></svg>
                    <p style={{ fontSize: 12, color: C.navyLight, margin: 0, lineHeight: 1.6 }}>Identity verified successfully. Create a new secure password for your account.</p>
                  </div>

                  {/* New Password */}
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 6 }}>New Password</label>
                    <div style={{ position: "relative" }}>
                      <FieldIcon><LockIcon /></FieldIcon>
                      <input type={showPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password"
                        style={{ ...inputBase, padding: "11px 42px 11px 40px" }} onFocus={onFocus} onBlur={onBlur} />
                      <button onClick={() => setShowPassword(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, display: "flex" }}>
                        {showPassword ? <EyeOff /> : <EyeOpen />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 6 }}>Confirm Password</label>
                    <div style={{ position: "relative" }}>
                      <FieldIcon><LockIcon /></FieldIcon>
                      <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleResetPassword()} placeholder="Re-enter new password"
                        style={{ ...inputBase, padding: "11px 42px 11px 40px" }} onFocus={onFocus} onBlur={onBlur} />
                      <button onClick={() => setShowConfirmPw(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, display: "flex" }}>
                        {showConfirmPassword ? <EyeOff /> : <EyeOpen />}
                      </button>
                    </div>
                  </div>

                  <button onClick={handleResetPassword} disabled={isLoading}
                    style={{ ...tealBtn, width: "100%", padding: "13px 0", marginTop: 4, opacity: isLoading ? .7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    onMouseEnter={e => !isLoading && (e.currentTarget.style.boxShadow = `0 6px 22px rgba(19,193,204,.45)`)}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = `0 4px 14px rgba(19,193,204,.3)`}>
                    {isLoading ? <><Spinner /> Resetting password...</> : "Reset Password →"}
                  </button>

                  <p style={{ fontSize: 12, color: C.muted, textAlign: "center", margin: 0 }}>
                    🔒 Password must be at least 6 characters long.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sign in link */}
          <p style={{ textAlign: "center", fontSize: 14, color: C.bodyText, marginTop: 20 }}>
            Remembered your password?{" "}
            <Link to="/login" style={{ color: C.teal, fontWeight: 700, textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
              onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
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