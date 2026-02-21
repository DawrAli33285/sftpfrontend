import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "./baseurl";

const PAGE_ID = "allfiles-toast";

// ── Enrichify Data brand palette (light theme) ────────────────────────────
const C = {
  pageBg:   "#f5f7fa",
  white:    "#ffffff",
  navy:     "#1a2e4a",
  teal:     "#13c1cc",
  tealDk:   "#0fa8b2",
  tealXlt:  "#e8f9fa",
  border:   "#e2e8f0",
  inputBg:  "#f9fbfc",
  bodyText: "#4a5568",
  muted:    "#8fa3b8",
  success:  "#38a169",
  successLt:"rgba(56,161,105,.1)",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  Back:     (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Search:   (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Grid:     (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  List:     (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><line x1="4" y1="6" x2="4.01" y2="6"/><line x1="4" y1="12" x2="4.01" y2="12"/><line x1="4" y1="18" x2="4.01" y2="18"/></svg>,
  Download: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  File:     (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
  Image:    (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  FileText: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  X:        (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Empty:    (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/><line x1="9" y1="15" x2="15" y2="15" strokeDasharray="2 2"/></svg>,
  Eye:      (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Inbox:    (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  Upload:   (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function getCategory(mimeType) {
  if (!mimeType) return "other";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("text/") || mimeType.includes("csv") || mimeType.includes("json")) return "document";
  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.includes("zip") || mimeType.includes("compressed")) return "archive";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("xlsx")) return "spreadsheet";
  return "other";
}
function getCategoryColor(cat) {
  const map = {
    image:       { icon: C.teal,    bg: C.tealXlt,              border: "rgba(19,193,204,.25)" },
    document:    { icon: "#805ad5", bg: "rgba(128,90,213,.08)", border: "rgba(128,90,213,.2)"  },
    pdf:         { icon: "#e53e3e", bg: "rgba(229,62,62,.08)",  border: "rgba(229,62,62,.2)"   },
    archive:     { icon: "#d69e2e", bg: "rgba(214,158,46,.08)", border: "rgba(214,158,46,.2)"  },
    spreadsheet: { icon: C.success, bg: C.successLt,            border: "rgba(56,161,105,.2)"  },
    other:       { icon: C.muted,   bg: "#f0f4f8",              border: C.border               },
  };
  return map[cat] || map.other;
}
function getCategoryIcon(cat) {
  if (cat === "image") return Icons.Image;
  if (cat === "document" || cat === "pdf" || cat === "spreadsheet") return Icons.FileText;
  return Icons.File;
}
function getExt(name) {
  const parts = (name || "").split(".");
  return parts.length > 1 ? parts.pop().toUpperCase() : "FILE";
}

const CATEGORIES = ["all", "image", "document", "pdf", "spreadsheet", "archive", "other"];

// ─── Preview Modal ────────────────────────────────────────────────────────────
function PreviewModal({ file, onClose, onDownload }) {
  const cat    = getCategory(file.fileType);
  const colors = getCategoryColor(cat);
  const Icon   = getCategoryIcon(cat);
  const isImage = cat === "image";

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px", background: "rgba(26,46,74,.5)", backdropFilter: "blur(6px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 640, borderRadius: 16, overflow: "hidden", background: C.white, border: `1px solid ${C.border}`, boxShadow: "0 24px 64px rgba(26,46,74,.2)", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon width="17" height="17" style={{ color: colors.icon }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.navy, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                {file.source === "received" && (
                  <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: C.tealXlt, color: C.teal }}>Received</span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 12, color: C.muted }}>{file.fileType || "unknown"} · {formatBytes(file.size)}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, display: "flex" }}
            onMouseEnter={e => e.currentTarget.style.color = C.navy}
            onMouseLeave={e => e.currentTarget.style.color = C.muted}>
            <Icons.X width="20" height="20" />
          </button>
        </div>

        {/* Preview */}
        <div style={{ flex: 1, padding: 24, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, background: C.pageBg, overflow: "auto" }}>
          {isImage ? (
            <img src={file.url} alt={file.name} style={{ maxWidth: "100%", maxHeight: 320, objectFit: "contain", borderRadius: 10, border: `1px solid ${C.border}` }} />
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: 18, background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Icon width="32" height="32" style={{ color: colors.icon }} />
              </div>
              <p style={{ margin: "0 0 4px", fontSize: 14, color: C.bodyText }}>Preview not available for this file type</p>
              <p style={{ margin: 0, fontSize: 12, color: C.muted }}>Download to open locally</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 12, color: C.muted }}>Uploaded: {formatDate(file.createdAt)}</span>
          <button onClick={() => onDownload(file)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 14px rgba(19,193,204,.28)` }}>
            <Icons.Download width="14" height="14" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AllFilesPage() {
  const navigate = useNavigate();
  const [files, setFiles]               = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [search, setSearch]             = useState("");
  const [activeCategory, setCategory]   = useState("all");
  const [activeSource, setSource]       = useState("all");
  const [viewMode, setViewMode]         = useState("grid");
  const [previewFile, setPreviewFile]   = useState(null);
  const [downloadingId, setDownloading] = useState(null);

  const token = localStorage.getItem("authToken");

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/files`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        const uploaded = (data.files || []).map(f => ({ ...f, source: "uploaded" }));
        const received = (data.recievedFiles || []).map(f => ({ ...f, source: "received" }));
        const all = [...uploaded, ...received].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFiles(all);
      } else toast.error(data.message || "Failed to fetch files", { containerId: PAGE_ID });
    } catch { toast.error("Network error", { containerId: PAGE_ID }); }
    finally { setIsLoading(false); }
  }, [token]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  useEffect(() => {
    let r = files;
    if (activeSource !== "all") r = r.filter(f => f.source === activeSource);
    if (activeCategory !== "all") r = r.filter(f => getCategory(f.fileType) === activeCategory);
    if (search.trim()) { const q = search.trim().toLowerCase(); r = r.filter(f => (f.name || "").toLowerCase().includes(q)); }
    setFiltered(r);
  }, [files, search, activeCategory, activeSource]);

  const handleDownload = async (file) => {
    setDownloading(file._id);
    toast.info(`Downloading ${file.name}...`, { containerId: PAGE_ID });
    try {
      const res = await fetch(file.url), blob = await res.blob(), url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = file.name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      toast.success(`${file.name} downloaded`, { containerId: PAGE_ID });
    } catch { toast.error(`Failed to download ${file.name}`, { containerId: PAGE_ID }); }
    finally { setDownloading(null); }
  };

  const counts        = CATEGORIES.reduce((acc, cat) => { acc[cat] = cat === "all" ? filtered.length : filtered.filter(f => getCategory(f.fileType) === cat).length; return acc; }, {});
  const uploadedCount = files.filter(f => f.source === "uploaded").length;
  const receivedCount = files.filter(f => f.source === "received").length;

  const tealBtn = { background: `linear-gradient(135deg, ${C.teal}, ${C.tealDk})`, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 14px rgba(19,193,204,.25)` };

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <ToastContainer containerId={PAGE_ID} position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnHover draggable theme="light" />

      {/* ── Header ── */}
      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, boxShadow: "0 1px 6px rgba(0,0,0,.06)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Left — back + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: C.pageBg, border: `1.5px solid ${C.border}`, cursor: "pointer", color: C.navy, flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.color = C.teal; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.navy; }}>
              <Icons.Back width="17" height="17" />
            </button>
            <img src="./logo.jpeg" alt="Enrichify Data" style={{ height: 38, objectFit: "contain" }} />
            <div style={{ width: 1, height: 28, background: C.border }} />
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.navy }}>All Files</p>
              <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{uploadedCount} uploaded · {receivedCount} received</p>
            </div>
          </div>

          {/* Right — view toggle */}
          <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 8, background: C.pageBg, border: `1.5px solid ${C.border}` }}>
            {[{ mode: "grid", Icon: Icons.Grid }, { mode: "list", Icon: Icons.List }].map(({ mode, Icon }) => (
              <button key={mode} onClick={() => setViewMode(mode)} style={{ width: 32, height: 32, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", transition: "all .2s", background: viewMode === mode ? C.white : "transparent", color: viewMode === mode ? C.teal : C.muted, boxShadow: viewMode === mode ? "0 1px 4px rgba(0,0,0,.08)" : "none" }}>
                <Icon width="15" height="15" />
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 48px" }}>

        {/* Search + Source filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted, display: "flex", pointerEvents: "none" }}>
              <Icons.Search width="15" height="15" />
            </span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..."
              style={{ width: "100%", boxSizing: "border-box", paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.white, color: C.navy, fontSize: 13, outline: "none", fontFamily: "inherit" }}
              onFocus={e => { e.target.style.borderColor = C.teal; e.target.style.boxShadow = `0 0 0 3px rgba(19,193,204,.12)`; }}
              onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }} />
          </div>

          {/* Source pills */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {[
              { source: "all",      label: "All",      count: files.length,  Icon: Icons.File   },
              { source: "uploaded", label: "Uploaded", count: uploadedCount, Icon: Icons.Upload },
              { source: "received", label: "Received", count: receivedCount, Icon: Icons.Inbox  },
            ].map(({ source, label, count, Icon }) => {
              const active = activeSource === source;
              return (
                <button key={source} onClick={() => setSource(source)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .2s", background: active ? C.tealXlt : C.white, border: `1.5px solid ${active ? "rgba(19,193,204,.3)" : C.border}`, color: active ? C.teal : C.muted }}>
                  <Icon width="13" height="13" />
                  {label}
                  <span style={{ padding: "1px 6px", borderRadius: 99, fontSize: 11, background: active ? "rgba(19,193,204,.15)" : C.pageBg, color: active ? C.teal : C.muted }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {CATEGORIES.map(cat => {
            if (counts[cat] === 0 && cat !== "all") return null;
            const active = activeCategory === cat;
            return (
              <button key={cat} onClick={() => setCategory(cat)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .2s", background: active ? "rgba(128,90,213,.08)" : C.white, border: `1.5px solid ${active ? "rgba(128,90,213,.3)" : C.border}`, color: active ? "#805ad5" : C.muted }}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                <span style={{ padding: "1px 6px", borderRadius: 99, fontSize: 11, background: active ? "rgba(128,90,213,.15)" : C.pageBg, color: active ? "#805ad5" : C.muted }}>{counts[cat]}</span>
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.teal, animation: "spin 1s linear infinite", marginBottom: 14 }} />
            <p style={{ fontSize: 13, color: C.muted }}>Loading files...</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, background: C.pageBg, border: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Icons.Empty width="32" height="32" style={{ color: C.muted }} />
            </div>
            <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: C.navy }}>No files found</p>
            <p style={{ margin: 0, fontSize: 13, color: C.muted }}>
              {search || activeCategory !== "all" || activeSource !== "all"
                ? "Try adjusting your search or filters"
                : "Upload files from the dashboard to see them here"}
            </p>
          </div>
        )}

        {/* ── GRID VIEW ── */}
        {!isLoading && filtered.length > 0 && viewMode === "grid" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {filtered.map(file => {
              const cat    = getCategory(file.fileType);
              const colors = getCategoryColor(cat);
              const Icon   = getCategoryIcon(cat);
              const isImg  = cat === "image";
              return (
                <div key={file._id} onClick={() => setPreviewFile(file)}
                  style={{ borderRadius: 12, overflow: "hidden", background: C.white, border: `1px solid ${C.border}`, cursor: "pointer", transition: "box-shadow .2s, transform .2s", boxShadow: "0 2px 8px rgba(26,46,74,.05)" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px rgba(19,193,204,.15)`; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "rgba(19,193,204,.35)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(26,46,74,.05)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = C.border; }}>

                  {/* Thumbnail */}
                  <div style={{ height: 130, background: C.pageBg, position: "relative", overflow: "hidden" }}>
                    {isImg ? (
                      <img src={file.url} alt={file.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 52, height: 52, borderRadius: 12, background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon width="24" height="24" style={{ color: colors.icon }} />
                        </div>
                      </div>
                    )}
                    {/* ext badge */}
                    <span style={{ position: "absolute", top: 8, left: 8, padding: "2px 7px", borderRadius: 5, fontSize: 10, fontWeight: 700, background: "rgba(255,255,255,.9)", color: colors.icon, border: `1px solid ${colors.border}` }}>
                      {getExt(file.name)}
                    </span>
                    {/* received badge */}
                    {file.source === "received" && (
                      <span style={{ position: "absolute", top: 8, right: 8, padding: "2px 7px", borderRadius: 5, fontSize: 10, fontWeight: 700, background: C.teal, color: "#fff", display: "flex", alignItems: "center", gap: 3 }}>
                        <Icons.Inbox width="10" height="10" />
                      </span>
                    )}
                    {/* hover download */}
                    <button onClick={e => { e.stopPropagation(); handleDownload(file); }} disabled={downloadingId === file._id}
                      style={{ position: "absolute", bottom: 8, right: 8, width: 30, height: 30, borderRadius: 7, background: C.teal, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", opacity: 0, transition: "opacity .2s" }}
                      onMouseEnter={e => e.currentTarget.parentElement.style.opacity = "1"}
                      className="file-dl-btn">
                      <Icons.Download width="14" height="14" />
                    </button>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "10px 12px" }}>
                    <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{formatBytes(file.size)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {!isLoading && filtered.length > 0 && viewMode === "list" && (
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: "0 2px 16px rgba(26,46,74,.07)", overflow: "hidden" }}>
            {/* thead */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 120px 120px", padding: "10px 20px", borderBottom: `1px solid ${C.border}`, background: C.pageBg }}>
              {["Name", "Type", "Size", "Source", "Actions"].map((h, i) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".5px", textAlign: i === 4 ? "right" : "left" }}>{h}</span>
              ))}
            </div>

            {/* rows */}
            {filtered.map((file, i) => {
              const cat    = getCategory(file.fileType);
              const colors = getCategoryColor(cat);
              const Icon   = getCategoryIcon(cat);
              return (
                <div key={file._id} onClick={() => setPreviewFile(file)}
                  style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 120px 120px", alignItems: "center", padding: "13px 20px", borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer", transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.pageBg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                  {/* Name */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon width="16" height="16" style={{ color: colors.icon }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{formatDate(file.createdAt)}</p>
                    </div>
                  </div>

                  {/* Type badge */}
                  <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: colors.bg, color: colors.icon, border: `1px solid ${colors.border}`, width: "fit-content" }}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </span>

                  {/* Size */}
                  <span style={{ fontSize: 13, color: C.bodyText }}>{formatBytes(file.size)}</span>

                  {/* Source */}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, width: "fit-content", background: file.source === "received" ? C.tealXlt : C.pageBg, color: file.source === "received" ? C.teal : C.muted, border: `1px solid ${file.source === "received" ? "rgba(19,193,204,.3)" : C.border}` }}>
                    {file.source === "received" ? <Icons.Inbox width="11" height="11" /> : <Icons.Upload width="11" height="11" />}
                    {file.source === "received" ? "Received" : "Uploaded"}
                  </span>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                    <button onClick={e => { e.stopPropagation(); setPreviewFile(file); }}
                      style={{ width: 32, height: 32, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: C.pageBg, border: `1px solid ${C.border}`, cursor: "pointer", color: C.muted, transition: "all .15s" }}
                      onMouseEnter={e => { e.currentTarget.style.color = C.teal; e.currentTarget.style.borderColor = "rgba(19,193,204,.3)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}>
                      <Icons.Eye width="14" height="14" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleDownload(file); }} disabled={downloadingId === file._id}
                      style={{ width: 32, height: 32, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: C.pageBg, border: `1px solid ${C.border}`, cursor: "pointer", color: C.muted, transition: "all .15s", opacity: downloadingId === file._id ? .5 : 1 }}
                      onMouseEnter={e => { e.currentTarget.style.color = C.teal; e.currentTarget.style.borderColor = "rgba(19,193,204,.3)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}>
                      <Icons.Download width="14" height="14" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview modal */}
      {previewFile && <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} onDownload={handleDownload} />}
    </div>
  );
}