import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "./baseurl";

const TOAST_ID = "admin-toast";

// ── Enrichify Data brand palette ─────────────────────────────────────────
const C = {
  pageBg:    "#f5f7fa",
  white:     "#ffffff",
  navy:      "#1a2e4a",
  navyLight: "#2d4a6e",
  teal:      "#13c1cc",
  tealDk:    "#0fa8b2",
  tealXlt:   "#e8f9fa",
  border:    "#e2e8f0",
  inputBg:   "#f9fbfc",
  bodyText:  "#4a5568",
  muted:     "#8fa3b8",
  danger:    "#e53e3e",
  footerBg:  "#192a3e",
  success:   "#38a169",
  cardBg:    "#ffffff",
  rowHover:  "#f7fbfc",
};

// ── Inline SVG Icons ──────────────────────────────────────────────────────
const Icon = {
  Upload:   () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  File:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
  X:        () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:    ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Users:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Send:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Logout:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Inbox:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  Download: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Refresh:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Search:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
};

function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const Spinner = ({ size = 18, color = C.teal }) => (
  <svg style={{ width: size, height: size, animation: "spin 1s linear infinite" }} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3">
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
  </svg>
);

export default function AdminPanel() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab]           = useState("send");
  const [selectedFiles, setSelectedFiles]   = useState([]);
  const [isDragging, setIsDragging]         = useState(false);
  const [isUploading, setIsUploading]       = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [users, setUsers]                   = useState([]);
  const [selectedUsers, setSelectedUsers]   = useState([]);
  const [searchQuery, setSearchQuery]       = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userFiles, setUserFiles]           = useState([]);
  const [isLoadingUserFiles, setIsLoadingUserFiles] = useState(false);
  const [downloadingId, setDownloadingId]   = useState(null);
  const [userFilesSearch, setUserFilesSearch] = useState("");

  const token = localStorage.getItem("adminToken");
  const admin = JSON.parse(localStorage.getItem("adminUser") || "{}");

  useEffect(() => {
    if (!token) { navigate("/adminlogin"); return; }
    fetchUsers();
    fetchUserFiles();
  }, []);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch(`${BASE_URL}/getUsers`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401 || res.status === 403) { handleLogout(); return; }
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
      else toast.error(data.error || "Failed to fetch users", { containerId: TOAST_ID });
    } catch { toast.error("Network error while fetching users", { containerId: TOAST_ID }); }
    finally { setIsLoadingUsers(false); }
  };

  const fetchUserFiles = async () => {
    setIsLoadingUserFiles(true);
    try {
      const res = await fetch(`${BASE_URL}/getFiles`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401 || res.status === 403) { handleLogout(); return; }
      const data = await res.json();
      if (res.ok) setUserFiles((data.files || []).filter(f => !f.reciever));
      else toast.error(data.error || "Failed to fetch files", { containerId: TOAST_ID });
    } catch { toast.error("Network error while fetching files", { containerId: TOAST_ID }); }
    finally { setIsLoadingUserFiles(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    toast.success("Logged out successfully", { containerId: TOAST_ID });
    setTimeout(() => navigate("/adminlogin"), 1000);
  };

  const handleDownload = async (file) => {
    setDownloadingId(file._id);
    toast.info(`Downloading ${file.name}...`, { containerId: TOAST_ID });
    try {
      const res = await fetch(file.url);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl; a.download = file.name;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(blobUrl);
      toast.success(`${file.name} downloaded`, { containerId: TOAST_ID });
    } catch { toast.error(`Failed to download ${file.name}`, { containerId: TOAST_ID }); }
    finally { setDownloadingId(null); }
  };

  const validateAndSetFiles = (files) => {
    const maxSize = 10 * 1024 * 1024;
    const valid = [];
    for (const file of files) {
      if (file.size > maxSize) toast.error(`${file.name} exceeds 10MB limit`, { containerId: TOAST_ID });
      else valid.push(file);
    }
    if (valid.length) { setSelectedFiles(prev => [...prev, ...valid]); toast.success(`${valid.length} file(s) selected`, { containerId: TOAST_ID }); }
  };

  const handleFileSelect  = (e) => { const files = Array.from(e.target.files || []); if (files.length) validateAndSetFiles(files); e.target.value = ""; };
  const handleDragOver    = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave   = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop        = (e) => { e.preventDefault(); setIsDragging(false); validateAndSetFiles(Array.from(e.dataTransfer.files || [])); };
  const handleRemoveFile  = (i) => { setSelectedFiles(prev => prev.filter((_, j) => j !== i)); setUploadProgress(prev => { const u = {...prev}; delete u[i]; return u; }); };
  const toggleUser        = (id) => setSelectedUsers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAllUsers    = () => setSelectedUsers(selectedUsers.length === filteredUsers.length ? [] : filteredUsers.map(u => u._id));

  const handleSendFiles = async () => {
    if (!selectedFiles.length) { toast.error("Please select at least one file", { containerId: TOAST_ID }); return; }
    if (!selectedUsers.length) { toast.error("Please select at least one recipient", { containerId: TOAST_ID }); return; }
    setIsUploading(true);
    const progress = {};
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        progress[i] = 0; setUploadProgress({...progress});
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userIds", JSON.stringify(selectedUsers));
        const interval = setInterval(() => { progress[i] = Math.min((progress[i] || 0) + 15, 85); setUploadProgress({...progress}); }, 200);
        const res = await fetch(`${BASE_URL}/admin/send-files`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
        clearInterval(interval);
        if (res.status === 401 || res.status === 403) { handleLogout(); return; }
        const data = await res.json();
        if (res.ok) { progress[i] = 100; setUploadProgress({...progress}); toast.success(`${file.name} sent to ${selectedUsers.length} user(s)`, { containerId: TOAST_ID }); }
        else { progress[i] = 0; setUploadProgress({...progress}); toast.error(data.error || `Failed to send ${file.name}`, { containerId: TOAST_ID }); }
      }
      setTimeout(() => { setSelectedFiles([]); setSelectedUsers([]); setUploadProgress({}); setIsUploading(false); }, 1500);
    } catch { toast.error("Network error during upload", { containerId: TOAST_ID }); setIsUploading(false); setUploadProgress({}); }
  };

  const filteredUsers     = users.filter(u => u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || u.userName?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredUserFiles = userFiles.filter(f => f.name?.toLowerCase().includes(userFilesSearch.toLowerCase()) || f.uploadedBy?.email?.toLowerCase().includes(userFilesSearch.toLowerCase()) || f.uploadedBy?.userName?.toLowerCase().includes(userFilesSearch.toLowerCase()));

  // ── Shared input style ─────────────────────────────────────────────────
  const searchInput = {
    width: "100%", boxSizing: "border-box", padding: "9px 12px 9px 36px",
    background: C.inputBg, border: `1px solid ${C.border}`,
    borderRadius: 8, fontSize: 13, color: C.navy,
    fontFamily: "inherit", outline: "none",
  };
  const tealBtn = {
    background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`,
    color: C.white, border: "none", borderRadius: 8,
    fontWeight: 700, fontSize: 13, cursor: "pointer",
    boxShadow: `0 4px 14px rgba(19,193,204,.25)`,
    transition: "box-shadow .2s, opacity .2s",
    display: "inline-flex", alignItems: "center", gap: 6,
  };
  const ghostBtn = {
    background: C.white, border: `1px solid ${C.border}`,
    borderRadius: 8, fontSize: 13, fontWeight: 600,
    color: C.navy, cursor: "pointer", padding: "8px 16px",
    display: "inline-flex", alignItems: "center", gap: 6,
    transition: "background .15s",
  };
  const card = {
    background: C.white, borderRadius: 12,
    border: `1px solid ${C.border}`,
    boxShadow: "0 4px 24px rgba(26,46,74,.08)",
  };

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", background: C.pageBg, display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: ${C.muted}; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
      `}</style>

      <ToastContainer containerId={TOAST_ID} position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnHover draggable theme="light" />

      {/* ── Header ── */}
      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 32px", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 6px rgba(0,0,0,.06)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src="./logo.jpeg" alt="Enrichify Data" style={{ height: 40, objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, letterSpacing: "-.3px" }}>Admin Panel</div>
            <div style={{ fontSize: 11, color: C.teal, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>File Distribution System</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Admin badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", background: C.tealXlt, border: `1px solid rgba(19,193,204,.2)`, borderRadius: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontWeight: 700, fontSize: 14 }}>
              {admin.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{admin.email || "Admin"}</div>
              <div style={{ fontSize: 11, color: C.teal, fontWeight: 600 }}>Administrator</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ ...ghostBtn }}
            onMouseEnter={e => e.currentTarget.style.background = C.pageBg}
            onMouseLeave={e => e.currentTarget.style.background = C.white}>
            <Icon.Logout /> Logout
          </button>
        </div>
      </header>

      {/* ── Hero strip ── */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #1e3a5f 60%, #15505a 100%)`, padding: "28px 32px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(19,193,204,.08)", pointerEvents: "none" }} />
        <p style={{ color: C.teal, fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 6px" }}>Enrichify Data</p>
        <h1 style={{ color: C.white, fontSize: 24, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-.4px" }}>Admin Dashboard</h1>
        <p style={{ color: "rgba(255,255,255,.6)", fontSize: 13, margin: 0 }}>Manage files and distribute them to users</p>
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, padding: "28px 32px 48px", maxWidth: 1200, width: "100%", boxSizing: "border-box", margin: "0 auto" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[
            { key: "send",      label: "Send Files",       icon: <Icon.Send /> },
            { key: "userFiles", label: "Files from Users", icon: <Icon.Inbox />, badge: userFiles.length },
          ].map(tab => {
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", transition: "all .2s",
                  background: active ? `linear-gradient(135deg, ${C.teal}, ${C.tealDk})` : C.white,
                  color: active ? C.white : C.bodyText,
                  boxShadow: active ? `0 4px 14px rgba(19,193,204,.3)` : `0 1px 4px rgba(0,0,0,.06)`,
                }}>
                {tab.icon} {tab.label}
                {tab.badge > 0 && (
                  <span style={{ background: active ? "rgba(255,255,255,.25)" : C.tealXlt, color: active ? C.white : C.teal, borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ══ TAB 1: SEND FILES ══ */}
        {activeTab === "send" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

            {/* Upload panel */}
            <div style={{ ...card, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, boxShadow: `0 4px 12px rgba(19,193,204,.3)` }}>
                  <Icon.Upload />
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.navy }}>Upload Files</div>
                  <div style={{ fontSize: 12, color: C.bodyText }}>Select files to send to recipients</div>
                </div>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragging ? C.teal : C.border}`,
                  borderRadius: 10, cursor: isUploading ? "default" : "pointer",
                  background: isDragging ? C.tealXlt : C.inputBg,
                  transition: "all .2s", minHeight: 180,
                  display: "flex", flexDirection: "column",
                }}
              >
                <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} style={{ display: "none" }} disabled={isUploading} />

                {selectedFiles.length === 0 ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, gap: 12 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: C.tealXlt, display: "flex", alignItems: "center", justifyContent: "center", color: C.teal }}>
                      <Icon.Upload />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.navy, marginBottom: 4 }}>Drop files here or click to browse</div>
                      <div style={{ fontSize: 12, color: C.muted }}>Supports multiple files · Max 10MB per file</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                    {selectedFiles.map((file, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 8, background: C.tealXlt, display: "flex", alignItems: "center", justifyContent: "center", color: C.teal, flexShrink: 0 }}>
                          <Icon.File />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                          <div style={{ fontSize: 11, color: C.muted }}>{formatBytes(file.size)}</div>
                          {uploadProgress[i] !== undefined && (
                            <div style={{ marginTop: 6 }}>
                              <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                                <div style={{ height: "100%", borderRadius: 2, width: `${uploadProgress[i]}%`, background: uploadProgress[i] === 100 ? C.success : `linear-gradient(90deg, ${C.teal}, ${C.tealDk})`, transition: "width .3s" }} />
                              </div>
                              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{uploadProgress[i]}%</div>
                            </div>
                          )}
                        </div>
                        {!isUploading && (
                          <button onClick={e => { e.stopPropagation(); handleRemoveFile(i); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4, display: "flex" }}
                            onMouseEnter={e => e.currentTarget.style.color = C.danger}
                            onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                            <Icon.X />
                          </button>
                        )}
                        {uploadProgress[i] === 100 && (
                          <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.success, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, flexShrink: 0 }}>
                            <Icon.Check size={12} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedFiles.length > 0 && (
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button onClick={() => { setSelectedFiles([]); setUploadProgress({}); }} disabled={isUploading}
                    style={{ ...ghostBtn, flex: 1, justifyContent: "center", opacity: isUploading ? .5 : 1 }}
                    onMouseEnter={e => e.currentTarget.style.background = C.pageBg}
                    onMouseLeave={e => e.currentTarget.style.background = C.white}>
                    Clear All
                  </button>
                  <button onClick={handleSendFiles} disabled={isUploading || selectedUsers.length === 0}
                    style={{ ...tealBtn, flex: 2, justifyContent: "center", padding: "10px 0", opacity: (isUploading || selectedUsers.length === 0) ? .65 : 1 }}
                    onMouseEnter={e => (!isUploading && selectedUsers.length > 0) && (e.currentTarget.style.boxShadow = `0 6px 20px rgba(19,193,204,.4)`)}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = `0 4px 14px rgba(19,193,204,.25)`}>
                    {isUploading ? <><Spinner size={14} color={C.white} /> Sending...</>
                      : selectedUsers.length === 0 ? "Select recipients first"
                      : <><Icon.Send /> Send to {selectedUsers.length} User{selectedUsers.length > 1 ? "s" : ""}</>}
                  </button>
                </div>
              )}
            </div>

            {/* Recipients panel */}
            <div style={{ ...card, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: C.tealXlt, display: "flex", alignItems: "center", justifyContent: "center", color: C.teal }}>
                    <Icon.Users />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>Recipients</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{users.length} total users</div>
                  </div>
                </div>
                {selectedUsers.length > 0 && (
                  <span style={{ background: C.tealXlt, color: C.teal, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                    {selectedUsers.length} selected
                  </span>
                )}
              </div>

              {/* Search */}
              <div style={{ position: "relative", marginBottom: 10 }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.muted, display: "flex" }}><Icon.Search /></span>
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search users..." style={searchInput} />
              </div>

              {filteredUsers.length > 0 && (
                <button onClick={toggleAllUsers}
                  style={{ ...ghostBtn, width: "100%", justifyContent: "center", marginBottom: 8, fontSize: 12 }}
                  onMouseEnter={e => e.currentTarget.style.background = C.pageBg}
                  onMouseLeave={e => e.currentTarget.style.background = C.white}>
                  {selectedUsers.length === filteredUsers.length ? "Deselect All" : "Select All"}
                </button>
              )}

              <div style={{ maxHeight: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                {isLoadingUsers ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner /></div>
                ) : filteredUsers.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 13 }}>No users found</div>
                ) : filteredUsers.map(user => {
                  const isSelected = selectedUsers.includes(user._id);
                  return (
                    <button key={user._id} onClick={() => toggleUser(user._id)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", width: "100%", textAlign: "left", transition: "all .15s",
                        background: isSelected ? C.tealXlt : C.white,
                        border: `1px solid ${isSelected ? "rgba(19,193,204,.3)" : C.border}`,
                      }}>
                      {/* Checkbox */}
                      <div style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s",
                        background: isSelected ? `linear-gradient(135deg, ${C.teal}, ${C.tealDk})` : C.white,
                        border: isSelected ? "none" : `1.5px solid ${C.border}`,
                        color: C.white,
                      }}>
                        {isSelected && <Icon.Check size={11} />}
                      </div>
                      {/* Avatar */}
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.userName || user.email}</div>
                        <div style={{ fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 2: FILES FROM USERS ══ */}
        {activeTab === "userFiles" && (
          <div style={{ ...card }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Files from Users</div>
                <div style={{ fontSize: 12, color: C.bodyText, marginTop: 2 }}>Files uploaded by users — no recipient means sent to admin</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ background: C.tealXlt, color: C.teal, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>
                  {userFiles.length} file{userFiles.length !== 1 ? "s" : ""}
                </span>
                <button onClick={fetchUserFiles} style={{ ...ghostBtn }}
                  onMouseEnter={e => e.currentTarget.style.background = C.pageBg}
                  onMouseLeave={e => e.currentTarget.style.background = C.white}>
                  <Icon.Refresh /> Refresh
                </button>
              </div>
            </div>

            <div style={{ padding: "16px 24px" }}>
              {/* Search */}
              <div style={{ position: "relative", marginBottom: 16 }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.muted, display: "flex" }}><Icon.Search /></span>
                <input type="text" value={userFilesSearch} onChange={e => setUserFilesSearch(e.target.value)} placeholder="Search by file name or user..." style={{ ...searchInput, maxWidth: 380 }} />
              </div>

              {isLoadingUserFiles ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner /></div>
              ) : filteredUserFiles.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: C.tealXlt, display: "flex", alignItems: "center", justifyContent: "center", color: C.teal, margin: "0 auto 12px" }}>
                    <Icon.Inbox />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.navy, marginBottom: 4 }}>No files from users yet</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Files uploaded by users will appear here</div>
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 80px 100px 110px", gap: 12, padding: "8px 12px", marginBottom: 4 }}>
                    {["File", "Uploaded By", "Size", "Date", ""].map((h, i) => (
                      <div key={i} style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", textAlign: i === 4 ? "right" : "left" }}>{h}</div>
                    ))}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {filteredUserFiles.map(file => (
                      <div key={file._id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 80px 100px 110px", gap: 12, alignItems: "center", padding: "12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, transition: "background .15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = C.rowHover}
                        onMouseLeave={e => e.currentTarget.style.background = C.white}>

                        {/* File */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 8, background: C.tealXlt, display: "flex", alignItems: "center", justifyContent: "center", color: C.teal, flexShrink: 0 }}>
                            <Icon.File />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                            <div style={{ fontSize: 11, color: C.muted }}>{file.fileType || "unknown"}</div>
                          </div>
                        </div>

                        {/* Uploader */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                            {(file.uploadedBy?.email || file.uploadedBy?.userName || "U").charAt(0).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.uploadedBy?.userName || file.uploadedBy?.email || "Unknown"}</div>
                            <div style={{ fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.uploadedBy?.email || "—"}</div>
                          </div>
                        </div>

                        {/* Size */}
                        <div style={{ fontSize: 12, color: C.bodyText }}>{formatBytes(file.size)}</div>

                        {/* Date */}
                        <div style={{ fontSize: 11, color: C.muted }}>
                          {file.createdAt ? new Date(file.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </div>

                        {/* Download */}
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <button onClick={() => handleDownload(file)} disabled={downloadingId === file._id}
                            style={{ ...tealBtn, padding: "7px 12px", opacity: downloadingId === file._id ? .6 : 1, cursor: downloadingId === file._id ? "not-allowed" : "pointer" }}>
                            {downloadingId === file._id ? <Spinner size={13} color={C.white} /> : <Icon.Download />}
                            {downloadingId === file._id ? "..." : "Download"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: C.footerBg, padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>© 2026 Enrichify Data. All rights reserved.</span>
        <a href="/privacy-policy/" style={{ fontSize: 12, color: C.teal, textDecoration: "none", fontWeight: 600 }}>Privacy Policy</a>
      </div>
    </div>
  );
}