import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "./baseurl";

const DASHBOARD_CONTAINER_ID = "dashboard-toast";

// ── Enrichify Data brand palette (light theme) ────────────────────────────
const C = {
  pageBg:    "#f5f7fa",
  white:     "#ffffff",
  navy:      "#1a2e4a",
  navyLight: "#2d4a6e",
  teal:      "#13c1cc",
  tealDk:    "#0fa8b2",
  tealXlt:   "#e8f9fa",
  tealMid:   "rgba(19,193,204,.1)",
  border:    "#e2e8f0",
  bodyText:  "#4a5568",
  muted:     "#8fa3b8",
  danger:    "#e53e3e",
  success:   "#38a169",
  successLt: "rgba(56,161,105,.1)",
  footerBg:  "#192a3e",
};

// ── Icons ─────────────────────────────────────────────────────────────────
const Icons = {
  File:     (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
  Upload:   (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Download: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  X:        (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:    (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Logout:   (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Activity: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Inbox:    (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  Send:     (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  FileText: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
};

// ── Light Card ────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: "0 2px 16px rgba(26,46,74,.07)", ...style }}>
    {children}
  </div>
);

// ── Tab Button ────────────────────────────────────────────────────────────
const TabButton = ({ active, onClick, children, icon: Icon, accent = "teal" }) => {
  const accentColor  = accent === "teal"  ? C.teal    : C.success;
  const accentBorder = accent === "teal"  ? "rgba(19,193,204,.3)" : "rgba(56,161,105,.3)";
  const accentBg     = accent === "teal"  ? C.tealXlt : "rgba(56,161,105,.08)";
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
      cursor: "pointer", transition: "all .2s", fontFamily: "inherit",
      background: active ? accentBg : C.white,
      border: `1.5px solid ${active ? accentBorder : C.border}`,
      color: active ? accentColor : C.muted,
      boxShadow: active ? `0 2px 10px rgba(19,193,204,.12)` : "none",
    }}>
      <Icon width="15" height="15" style={{ color: active ? accentColor : C.muted }} />
      {children}
    </button>
  );
};

// ── Status Badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    completed: { bg: "rgba(56,161,105,.1)",  color: C.success },
    pending:   { bg: "rgba(214,158,46,.1)",  color: "#d69e2e" },
    failed:    { bg: "rgba(229,62,62,.1)",   color: C.danger  },
    delivered: { bg: "rgba(56,161,105,.1)",  color: C.success },
  };
  const s = map[status] || map.completed;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const formatFileSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile]   = useState(null);
  const [isDragging, setIsDragging]       = useState(false);
  const [isUploading, setIsUploading]     = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [activeTab, setActiveTab]         = useState("send");
  const [downloadingId, setDownloadingId] = useState(null);
  const [isLoading, setIsLoading]         = useState(true);

  const user  = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${BASE_URL}/files`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) { setUploadHistory(data.files || []); setReceivedFiles(data.recievedFiles || []); }
        else toast.error(data.message || "Failed to fetch files", { containerId: DASHBOARD_CONTAINER_ID });
      } catch (err) {
        toast.error("Network error while fetching files", { containerId: DASHBOARD_CONTAINER_ID });
      } finally { setIsLoading(false); }
    })();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("authToken"); localStorage.removeItem("user");
    toast.success("Logged out successfully", { containerId: DASHBOARD_CONTAINER_ID });
    setTimeout(() => navigate("/login"), 1000);
  };

  const validateAndSetFile = (file) => {
    if (file.size > 10 * 1024 * 1024) { toast.error("File size must be less than 10MB", { containerId: DASHBOARD_CONTAINER_ID }); return; }
    setSelectedFile(file);
    toast.success(`File selected: ${file.name}`, { containerId: DASHBOARD_CONTAINER_ID });
  };

  const handleFileSelect = (e) => { const f = e.target.files?.[0]; if (f) validateAndSetFile(f); e.target.value = ""; };
  const handleDragOver   = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave  = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop       = (e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) validateAndSetFile(f); };

  const handleUpload = async () => {
    if (!selectedFile) { toast.error("Please select a file first", { containerId: DASHBOARD_CONTAINER_ID }); return; }
    setIsUploading(true); setUploadProgress(0);
    const interval = setInterval(() => setUploadProgress(p => { if (p >= 85) { clearInterval(interval); return 85; } return p + 10; }), 300);
    try {
      const formData = new FormData(); formData.append("file", selectedFile);
      const res  = await fetch(`${BASE_URL}/upload`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json(); clearInterval(interval);
      if (res.ok) {
        setUploadProgress(100); setUploadHistory(prev => [data.file, ...prev]);
        toast.success("File uploaded successfully!", { containerId: DASHBOARD_CONTAINER_ID });
        setTimeout(() => { setSelectedFile(null); setIsUploading(false); setUploadProgress(0); }, 1000);
      } else { setUploadProgress(0); setIsUploading(false); toast.error(data.message || "Upload failed", { containerId: DASHBOARD_CONTAINER_ID }); }
    } catch { clearInterval(interval); setUploadProgress(0); setIsUploading(false); toast.error("Network error during upload", { containerId: DASHBOARD_CONTAINER_ID }); }
  };

  const handleRemoveFile = () => { setSelectedFile(null); setUploadProgress(0); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const handleDownload = async (file) => {
    setDownloadingId(file._id);
    toast.info(`Downloading ${file.name}...`, { containerId: DASHBOARD_CONTAINER_ID });
    try {
      const res = await fetch(file.url); if (!res.ok) throw new Error();
      const blob = await res.blob(), url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = file.name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      toast.success(`${file.name} downloaded`, { containerId: DASHBOARD_CONTAINER_ID });
    } catch { toast.error(`Failed to download ${file.name}`, { containerId: DASHBOARD_CONTAINER_ID }); }
    finally { setDownloadingId(null); }
  };

  const handleDownloadAll = async () => {
    if (!receivedFiles.length) return;
    toast.info("Downloading all files...", { containerId: DASHBOARD_CONTAINER_ID });
    for (const file of receivedFiles) await handleDownload(file);
  };

  const totalSent         = uploadHistory.length;
  const totalReceived     = receivedFiles.length;
  const totalReceivedSize = receivedFiles.reduce((a, f) => a + (f.size || 0), 0);
  const lastReceived      = receivedFiles[0]?.createdAt
    ? new Date(receivedFiles[0].createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  const tealBtn = {
    background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`,
    color: "#fff", border: "none", borderRadius: 8, fontWeight: 700,
    fontSize: 14, cursor: "pointer", fontFamily: "inherit",
    boxShadow: `0 4px 14px rgba(19,193,204,.28)`,
    transition: "box-shadow .2s, opacity .2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <ToastContainer containerId={DASHBOARD_CONTAINER_ID} position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnHover draggable theme="light" />

      {/* ── Header — matches Enrichify nav ── */}
      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, boxShadow: "0 1px 6px rgba(0,0,0,.06)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Left — logo + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="./logo.jpeg" alt="Enrichify Data" style={{ height: 40, objectFit: "contain" }} />
            <div style={{ width: 1, height: 32, background: C.border }} />
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.navy }}>SFTP Manager</p>
              <p style={{ margin: 0, fontSize: 11, color: C.muted }}>Secure File Transfer Protocol</p>
            </div>
          </div>

          {/* Right — user + logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 8, background: C.tealXlt, border: `1px solid rgba(19,193,204,.2)` }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>
                {user.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.navy }}>{user.email || "User"}</p>
                <p style={{ margin: 0, fontSize: 11, color: C.muted }}>Member</p>
              </div>
            </div>
            <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: C.white, border: `1.5px solid ${C.border}`, color: C.navy, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.pageBg}
              onMouseLeave={e => e.currentTarget.style.background = C.white}>
              <Icons.Logout width="15" height="15" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Page body ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 48px" }}>

        {/* ── Stats Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Sent",     value: totalSent,              color: C.teal,     bg: C.tealXlt,           border: "rgba(19,193,204,.25)", Icon: Icons.Send     },
            { label: "Total Received", value: totalReceived,          color: C.success,  bg: "rgba(56,161,105,.08)", border: "rgba(56,161,105,.2)", Icon: Icons.Inbox    },
            { label: "This Month",     value: totalSent+totalReceived, color: "#805ad5",  bg: "rgba(128,90,213,.07)", border: "rgba(128,90,213,.2)", Icon: Icons.Activity },
            { label: "Success Rate",   value: "100%",                 color: C.tealDk,   bg: "rgba(15,168,178,.07)", border: "rgba(15,168,178,.2)", Icon: Icons.Check    },
          ].map(s => (
            <Card key={s.label} style={{ padding: 18, background: s.bg, border: `1px solid ${s.border}`, boxShadow: "none" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.label}</span>
                <s.Icon width="16" height="16" style={{ color: s.color }} />
              </div>
              <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: C.navy }}>{s.value}</p>
            </Card>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <TabButton active={activeTab === "send"} onClick={() => setActiveTab("send")} icon={Icons.Send} accent="teal">
            Send Files
          </TabButton>
          <TabButton active={activeTab === "received"} onClick={() => setActiveTab("received")} icon={Icons.Inbox} accent="green">
            Received from Admin
            {totalReceived > 0 && (
              <span style={{ marginLeft: 4, background: C.successLt, color: C.success, fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 99 }}>
                {totalReceived}
              </span>
            )}
          </TabButton>
        </div>

        {/* ── SEND FILES TAB ── */}
        {activeTab === "send" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

            {/* Upload area */}
            <Card>
              <div style={{ padding: 28 }}>
                <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: C.navy }}>Send File</h2>
                <p style={{ margin: "0 0 24px", fontSize: 13, color: C.muted }}>Drag and drop your file or click to browse</p>

                <div
                  onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                  onClick={() => !selectedFile && fileInputRef.current?.click()}
                  style={{
                    minHeight: 220, borderRadius: 10, border: `2px dashed ${isDragging ? C.teal : C.border}`,
                    background: isDragging ? C.tealXlt : C.pageBg,
                    cursor: selectedFile ? "default" : "pointer", transition: "all .2s", overflow: "hidden",
                  }}>
                  <input ref={fileInputRef} type="file" onChange={handleFileSelect} style={{ display: "none" }} />

                  {!selectedFile ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, gap: 8 }}>
                      <div style={{ width: 60, height: 60, borderRadius: 14, background: C.tealXlt, border: `1.5px solid rgba(19,193,204,.3)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                        <Icons.Upload width="28" height="28" style={{ color: C.teal }} />
                      </div>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.navy }}>Drop your file here</p>
                      <p style={{ margin: 0, fontSize: 13, color: C.muted }}>or click to browse from your computer</p>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: C.border.replace("e2", "b0") }}>Supports any file type · Max 10MB</p>
                    </div>
                  ) : (
                    <div style={{ padding: 24 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 10, background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icons.File width="22" height="22" style={{ color: "#fff" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedFile.name}</p>
                          <p style={{ margin: 0, fontSize: 12, color: C.muted }}>{formatFileSize(selectedFile.size)}</p>
                        </div>
                        {!isUploading && (
                          <button onClick={e => { e.stopPropagation(); handleRemoveFile(); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, display: "flex" }}
                            onMouseEnter={e => e.currentTarget.style.color = C.danger}
                            onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                            <Icons.X width="18" height="18" />
                          </button>
                        )}
                      </div>

                      {isUploading && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 12, color: C.muted }}>Uploading...</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: C.teal }}>{uploadProgress}%</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: C.border, overflow: "hidden" }}>
                            <div style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${C.teal}, ${C.tealDk})`, width: `${uploadProgress}%`, transition: "width .3s" }} />
                          </div>
                        </div>
                      )}

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
                        <button onClick={e => { e.stopPropagation(); handleRemoveFile(); }} disabled={isUploading}
                          style={{ padding: "10px 0", borderRadius: 8, background: C.white, border: `1.5px solid ${C.border}`, color: C.navy, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: isUploading ? .5 : 1 }}>
                          Cancel
                        </button>
                        <button onClick={e => { e.stopPropagation(); handleUpload(); }} disabled={isUploading}
                          style={{ ...tealBtn, padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: isUploading ? .7 : 1 }}>
                          <Icons.Send width="13" height="13" />
                          {isUploading ? "Uploading..." : "Send File"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Right sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Sent History */}
              <Card>
                <div style={{ padding: 24 }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: C.navy }}>Sent History</h3>
                  {isLoading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "28px 0" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.teal, animation: "spin 1s linear infinite" }} />
                    </div>
                  ) : uploadHistory.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "28px 0" }}>
                      <Icons.File width="40" height="40" style={{ color: C.border, marginBottom: 8 }} />
                      <p style={{ margin: 0, fontSize: 13, color: C.muted }}>No files sent yet</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {uploadHistory.map(upload => (
                        <div key={upload._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: C.pageBg, border: `1px solid ${C.border}` }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.tealXlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icons.File width="16" height="16" style={{ color: C.teal }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{upload.name}</p>
                            <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{formatFileSize(upload.size)} · {upload.createdAt ? new Date(upload.createdAt).toLocaleDateString() : "—"}</p>
                          </div>
                          <StatusBadge status="completed" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card>
                <div style={{ padding: 24 }}>
                  <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: C.navy }}>Quick Actions</h3>
                  <Link to="/files" style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 8, background: C.pageBg, border: `1px solid ${C.border}`, cursor: "pointer", transition: "border-color .2s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = C.teal}
                      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: C.tealXlt, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icons.FileText width="15" height="15" style={{ color: C.teal }} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.navy }}>View All Files</p>
                        <p style={{ margin: 0, fontSize: 11, color: C.muted }}>Browse all files</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── RECEIVED FILES TAB ── */}
        {activeTab === "received" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>

            {/* Files list */}
            <Card>
              <div style={{ padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                  <div>
                    <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: C.navy }}>Files from Admin</h2>
                    <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Files sent to you by administrators</p>
                  </div>
                  <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, background: C.successLt, color: C.success }}>
                    {totalReceived} file{totalReceived !== 1 ? "s" : ""}
                  </span>
                </div>

                {isLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "56px 0" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.success, animation: "spin 1s linear infinite" }} />
                  </div>
                ) : receivedFiles.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "56px 0" }}>
                    <div style={{ width: 60, height: 60, borderRadius: 14, background: C.successLt, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      <Icons.Inbox width="28" height="28" style={{ color: C.success, opacity: .5 }} />
                    </div>
                    <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: C.navy }}>No files received yet</p>
                    <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Files sent by admin will appear here</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {receivedFiles.map(file => (
                      <div key={file._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 10, background: C.pageBg, border: `1px solid ${C.border}`, transition: "border-color .2s" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = C.teal}
                        onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: C.successLt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icons.File width="20" height="20" style={{ color: C.success }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                            <StatusBadge status="delivered" />
                          </div>
                          <p style={{ margin: 0, fontSize: 12, color: C.muted }}>
                            {formatFileSize(file.size)} · {file.createdAt ? new Date(file.createdAt).toLocaleString() : "—"}
                          </p>
                        </div>
                        <button onClick={() => handleDownload(file)} disabled={downloadingId === file._id}
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, transition: "all .2s", opacity: downloadingId === file._id ? .6 : 1, background: C.successLt, border: `1.5px solid rgba(56,161,105,.3)`, color: C.success }}>
                          <Icons.Download width="13" height="13" />
                          {downloadingId === file._id ? "Downloading..." : "Download"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Summary sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <Card>
                <div style={{ padding: 24 }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: C.navy }}>Summary</h3>

                  <div style={{ padding: "12px 14px", borderRadius: 10, background: C.successLt, border: `1px solid rgba(56,161,105,.2)`, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${C.success}, #276749)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>A</div>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.navy }}>Admin</p>
                        <p style={{ margin: 0, fontSize: 11, color: C.muted }}>File Sender</p>
                      </div>
                    </div>
                  </div>

                  {[
                    { label: "Total Received", value: totalReceived,              color: C.success  },
                    { label: "Total Size",     value: formatFileSize(totalReceivedSize), color: C.teal   },
                    { label: "Last Received",  value: lastReceived,               color: "#805ad5" },
                  ].map((s, idx, arr) => (
                    <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: idx < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <span style={{ fontSize: 13, color: C.muted }}>{s.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div style={{ padding: 24 }}>
                  <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: C.navy }}>Bulk Actions</h3>
                  <button onClick={handleDownloadAll} disabled={receivedFiles.length === 0 || downloadingId !== null}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", borderRadius: 8, background: `linear-gradient(135deg, ${C.success}, #276749)`, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", opacity: receivedFiles.length === 0 || downloadingId !== null ? .5 : 1, boxShadow: "0 4px 14px rgba(56,161,105,.25)", transition: "opacity .2s" }}>
                    <Icons.Download width="15" height="15" />
                    Download All Files
                  </button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}