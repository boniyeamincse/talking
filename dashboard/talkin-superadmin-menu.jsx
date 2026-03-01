import { useState } from "react";

// ─── COMPLETE MENU STRUCTURE ────────────────────────────────────────────────
// Derived from: API Dev Plan (186 tasks) + Dashboard Dev Plan + BaniTalk Status
// Roles: SA = Super Admin Only | A = Admin + Super Admin
// ─────────────────────────────────────────────────────────────────────────────
const MENU = [
  {
    id: "dashboard",
    icon: "⊞",
    label: "Dashboard",
    path: "/admin",
    role: "SA",
    badge: null,
    color: "#38bdf8",
    sub: [
      { label: "Overview & KPIs",        path: "/admin/overview",          role: "SA" },
      { label: "Live Online Users",       path: "/admin/live-users",        role: "SA" },
      { label: "Platform Health",         path: "/admin/health",            role: "SA" },
      { label: "API Status Monitor",      path: "/admin/api-status",        role: "SA" },
      { label: "Quick Actions",           path: "/admin/quick-actions",     role: "SA" },
    ],
  },
  {
    id: "auth",
    icon: "⊡",
    label: "Auth & Security",
    path: "/admin/auth",
    role: "SA",
    badge: null,
    color: "#a78bfa",
    sub: [
      { label: "Admin Accounts",          path: "/admin/admins",            role: "SA" },
      { label: "Create Admin",            path: "/admin/admins/create",     role: "SA" },
      { label: "Role & Permissions",      path: "/admin/roles",             role: "SA" },
      { label: "Active Sessions",         path: "/admin/sessions",          role: "SA" },
      { label: "Login Audit Log",         path: "/admin/audit/login",       role: "SA" },
      { label: "Security Events",         path: "/admin/audit/security",    role: "SA" },
      { label: "Banned IP Addresses",     path: "/admin/security/ips",      role: "SA" },
      { label: "Two-Factor Auth",         path: "/admin/security/2fa",      role: "SA" },
    ],
  },
  {
    id: "users",
    icon: "⊙",
    label: "User Management",
    path: "/admin/users",
    role: "A",
    badge: null,
    color: "#34d399",
    sub: [
      { label: "All Users",               path: "/admin/users",             role: "A"  },
      { label: "Search & Filter",         path: "/admin/users/search",      role: "A"  },
      { label: "User Profile View",       path: "/admin/users/:id",         role: "A"  },
      { label: "Edit User Profile",       path: "/admin/users/:id/edit",    role: "A"  },
      { label: "User Activity Timeline",  path: "/admin/users/:id/activity",role: "A"  },
      { label: "Verified Accounts",       path: "/admin/users/verified",    role: "A"  },
      { label: "Suspended Users",         path: "/admin/users/suspended",   role: "A"  },
      { label: "Banned Users",            path: "/admin/users/banned",      role: "SA" },
      { label: "Warn User",               path: "/admin/users/warn",        role: "A"  },
      { label: "Suspend User",            path: "/admin/users/suspend",     role: "A"  },
      { label: "Ban User",                path: "/admin/users/ban",         role: "SA" },
      { label: "Restore Account",         path: "/admin/users/restore",     role: "A"  },
      { label: "User Badges & Roles",     path: "/admin/users/badges",      role: "SA" },
      { label: "Online / Offline Status", path: "/admin/users/status",      role: "A"  },
    ],
  },
  {
    id: "moderation",
    icon: "⊘",
    label: "Content Moderation",
    path: "/admin/moderation",
    role: "A",
    badge: "38",
    badgeType: "alert",
    color: "#f87171",
    sub: [
      { label: "Report Queue",            path: "/admin/reports",           role: "A"  },
      { label: "Pending Reports",         path: "/admin/reports/pending",   role: "A"  },
      { label: "Resolved Reports",        path: "/admin/reports/resolved",  role: "A"  },
      { label: "Dismissed Reports",       path: "/admin/reports/dismissed", role: "A"  },
      { label: "Post Moderation",         path: "/admin/moderation/posts",  role: "A"  },
      { label: "Comment Moderation",      path: "/admin/moderation/comments",role: "A" },
      { label: "Message Moderation",      path: "/admin/moderation/messages",role: "A" },
      { label: "Spam Detection",          path: "/admin/moderation/spam",   role: "A"  },
      { label: "Harassment Flags",        path: "/admin/moderation/harassment",role: "A"},
      { label: "Moderation History",      path: "/admin/moderation/history",role: "A"  },
      { label: "AI Toxic Content Flags",  path: "/admin/moderation/ai",     role: "SA" },
    ],
  },
  {
    id: "chat",
    icon: "◫",
    label: "Chat & Messaging",
    path: "/admin/chat",
    role: "A",
    badge: null,
    color: "#38bdf8",
    sub: [
      { label: "Conversation Monitor",    path: "/admin/chat/monitor",      role: "A"  },
      { label: "Flagged Messages",        path: "/admin/chat/flagged",      role: "A"  },
      { label: "Group Chats",             path: "/admin/chat/groups",       role: "A"  },
      { label: "Media Uploads",           path: "/admin/chat/media",        role: "A"  },
      { label: "Message Statistics",      path: "/admin/chat/stats",        role: "SA" },
      { label: "Deleted Message Log",     path: "/admin/chat/deleted",      role: "SA" },
    ],
  },
  {
    id: "calls",
    icon: "◎",
    label: "Calls & Video",
    path: "/admin/calls",
    role: "A",
    badge: null,
    color: "#facc15",
    sub: [
      { label: "Active Calls (Live)",     path: "/admin/calls/active",      role: "A"  },
      { label: "Audio Call History",      path: "/admin/calls/audio",       role: "A"  },
      { label: "Video Call History",      path: "/admin/calls/video",       role: "A"  },
      { label: "Missed Calls",            path: "/admin/calls/missed",      role: "A"  },
      { label: "Call Duration Stats",     path: "/admin/calls/duration",    role: "SA" },
      { label: "Call Analytics",          path: "/admin/calls/analytics",   role: "SA" },
      { label: "TURN Server Status",      path: "/admin/calls/turn",        role: "SA" },
      { label: "WebRTC Signal Logs",      path: "/admin/calls/webrtc",      role: "SA" },
    ],
  },
  {
    id: "rooms",
    icon: "◑",
    label: "Voice Rooms",
    path: "/admin/rooms",
    role: "A",
    badge: "Live",
    badgeType: "live",
    color: "#fb923c",
    sub: [
      { label: "Active Rooms (Live)",     path: "/admin/rooms/active",      role: "A"  },
      { label: "All Rooms History",       path: "/admin/rooms/history",     role: "A"  },
      { label: "Monitor Room (Silent)",   path: "/admin/rooms/monitor",     role: "A"  },
      { label: "Force Close Room",        path: "/admin/rooms/close",       role: "A"  },
      { label: "Remove Host",             path: "/admin/rooms/remove-host", role: "A"  },
      { label: "Karaoke Sessions",        path: "/admin/rooms/karaoke",     role: "A"  },
      { label: "Room Reports",            path: "/admin/rooms/reports",     role: "A"  },
      { label: "Speaker Stats",           path: "/admin/rooms/speakers",    role: "SA" },
      { label: "Audience Analytics",      path: "/admin/rooms/analytics",   role: "SA" },
    ],
  },
  {
    id: "feed",
    icon: "◐",
    label: "Social Feed",
    path: "/admin/feed",
    role: "A",
    badge: null,
    color: "#4ade80",
    sub: [
      { label: "All Posts",               path: "/admin/feed/posts",        role: "A"  },
      { label: "Trending Posts",          path: "/admin/feed/trending",     role: "A"  },
      { label: "Country Topics",          path: "/admin/feed/country",      role: "A"  },
      { label: "Reported Posts",          path: "/admin/feed/reported",     role: "A"  },
      { label: "Removed Posts",           path: "/admin/feed/removed",      role: "A"  },
      { label: "Trending Hashtags",       path: "/admin/feed/hashtags",     role: "SA" },
      { label: "Feed Algorithm Config",   path: "/admin/feed/algorithm",    role: "SA" },
      { label: "Post Analytics",          path: "/admin/feed/analytics",    role: "SA" },
      { label: "Saved Posts Overview",    path: "/admin/feed/saved",        role: "SA" },
    ],
  },
  {
    id: "gifts",
    icon: "◇",
    label: "Gifts & Economy",
    path: "/admin/gifts",
    role: "SA",
    badge: null,
    color: "#f472b6",
    sub: [
      { label: "Gift Catalog",            path: "/admin/gifts",             role: "SA" },
      { label: "Add New Gift",            path: "/admin/gifts/create",      role: "SA" },
      { label: "Edit / Manage Gifts",     path: "/admin/gifts/manage",      role: "SA" },
      { label: "Gift Categories",         path: "/admin/gifts/categories",  role: "SA" },
      { label: "Gift Transactions (Live)",path: "/admin/gifts/transactions",role: "SA" },
      { label: "Gift Leaderboard",        path: "/admin/gifts/leaderboard", role: "SA" },
      { label: "Top Senders",             path: "/admin/gifts/top-senders", role: "SA" },
      { label: "Top Earners (Influencers)",path:"/admin/gifts/top-earners", role: "SA" },
      { label: "Coin Purchase History",   path: "/admin/coins/purchases",   role: "SA" },
      { label: "Coin Balances Overview",  path: "/admin/coins/balances",    role: "SA" },
      { label: "Revenue from Coins",      path: "/admin/coins/revenue",     role: "SA" },
      { label: "Transaction Ledger",      path: "/admin/economy/ledger",    role: "SA" },
      { label: "Economic Balance Ratio",  path: "/admin/economy/balance",   role: "SA" },
      { label: "Payment Gateway Logs",    path: "/admin/economy/payments",  role: "SA" },
      { label: "Refund Requests",         path: "/admin/economy/refunds",   role: "SA" },
    ],
  },
  {
    id: "translation",
    icon: "⊕",
    label: "Translation System",
    path: "/admin/translation",
    role: "SA",
    badge: "180+",
    badgeType: "info",
    color: "#38bdf8",
    sub: [
      { label: "Language Management",     path: "/admin/languages",         role: "SA" },
      { label: "Add Language",            path: "/admin/languages/create",  role: "SA" },
      { label: "Translation API Usage",   path: "/admin/translation/usage", role: "SA" },
      { label: "Translation Cache",       path: "/admin/translation/cache", role: "SA" },
      { label: "Error Rate Monitor",      path: "/admin/translation/errors",role: "SA" },
      { label: "Auto-Translate Config",   path: "/admin/translation/config",role: "SA" },
      { label: "Language Usage Stats",    path: "/admin/translation/stats", role: "SA" },
      { label: "Language Heatmap",        path: "/admin/translation/heatmap",role:"SA" },
    ],
  },
  {
    id: "matching",
    icon: "◌",
    label: "Partner Matching",
    path: "/admin/matching",
    role: "SA",
    badge: null,
    color: "#c084fc",
    sub: [
      { label: "Match Overview",          path: "/admin/matching/overview", role: "SA" },
      { label: "Match Success Rate",      path: "/admin/matching/success",  role: "SA" },
      { label: "Algorithm Config",        path: "/admin/matching/config",   role: "SA" },
      { label: "Scoring Weights",         path: "/admin/matching/weights",  role: "SA" },
      { label: "Match History",           path: "/admin/matching/history",  role: "SA" },
      { label: "Pending Matches",         path: "/admin/matching/pending",  role: "SA" },
      { label: "Run Matching Job",        path: "/admin/matching/run",      role: "SA" },
      { label: "Rejected Matches",        path: "/admin/matching/rejected", role: "SA" },
    ],
  },
  {
    id: "notifications",
    icon: "◯",
    label: "Notifications",
    path: "/admin/notifications",
    role: "SA",
    badge: null,
    color: "#fb923c",
    sub: [
      { label: "Send Announcement",       path: "/admin/notifications/broadcast",  role: "SA" },
      { label: "Push Log (FCM)",          path: "/admin/notifications/push-log",   role: "SA" },
      { label: "Delivery Reports",        path: "/admin/notifications/delivery",   role: "SA" },
      { label: "Failed Notifications",    path: "/admin/notifications/failed",     role: "SA" },
      { label: "Device Tokens (FCM)",     path: "/admin/notifications/devices",    role: "SA" },
      { label: "Notification Templates",  path: "/admin/notifications/templates",  role: "SA" },
      { label: "Quiet Hours Config",      path: "/admin/notifications/quiet",      role: "SA" },
    ],
  },
  {
    id: "analytics",
    icon: "⊟",
    label: "Analytics",
    path: "/admin/analytics",
    role: "SA",
    badge: null,
    color: "#34d399",
    sub: [
      { label: "Platform Overview",       path: "/admin/analytics/overview",    role: "SA" },
      { label: "User Growth (DAU/MAU)",   path: "/admin/analytics/users",       role: "SA" },
      { label: "Retention & Churn",       path: "/admin/analytics/retention",   role: "SA" },
      { label: "Country Distribution",    path: "/admin/analytics/countries",   role: "SA" },
      { label: "Language Heatmap",        path: "/admin/analytics/languages",   role: "SA" },
      { label: "Cultural Exchange Map",   path: "/admin/analytics/culture-map", role: "SA" },
      { label: "Trending Topics",         path: "/admin/analytics/trending",    role: "SA" },
      { label: "Call Analytics",          path: "/admin/analytics/calls",       role: "SA" },
      { label: "Feed Engagement",         path: "/admin/analytics/feed",        role: "SA" },
      { label: "Revenue Analytics",       path: "/admin/analytics/revenue",     role: "SA" },
      { label: "API Response Times",      path: "/admin/analytics/api",         role: "SA" },
      { label: "Error Rates (Sentry)",    path: "/admin/analytics/errors",      role: "SA" },
      { label: "Queue Performance",       path: "/admin/analytics/queues",      role: "SA" },
    ],
  },
  {
    id: "sl",
    icon: "⊗",
    label: "Speech Learning (SL)",
    path: "/admin/sl",
    role: "SA",
    badge: "R&D",
    badgeType: "rd",
    color: "#facc15",
    sub: [
      { label: "SL Overview",             path: "/admin/sl/overview",       role: "SA" },
      { label: "Grammar Lessons",         path: "/admin/sl/grammar",        role: "SA" },
      { label: "Vocabulary Lists",        path: "/admin/sl/vocabulary",     role: "SA" },
      { label: "Pronunciation Scoring",   path: "/admin/sl/pronunciation",  role: "SA" },
      { label: "Tongue Twister Module",   path: "/admin/sl/twisters",       role: "SA" },
      { label: "Daily Challenges",        path: "/admin/sl/challenges",     role: "SA" },
      { label: "User SL Progress",        path: "/admin/sl/progress",       role: "SA" },
      { label: "SL Analytics",            path: "/admin/sl/analytics",      role: "SA" },
      { label: "Flutter Integration",     path: "/admin/sl/flutter",        role: "SA" },
    ],
  },
  {
    id: "settings",
    icon: "⊞",
    label: "Platform Settings",
    path: "/admin/settings",
    role: "SA",
    badge: null,
    color: "#94a3b8",
    sub: [
      { label: "General Settings",        path: "/admin/settings/general",      role: "SA" },
      { label: "Feature Flags",           path: "/admin/settings/features",     role: "SA" },
      { label: "Maintenance Mode",        path: "/admin/settings/maintenance",  role: "SA" },
      { label: "Rate Limit Config",       path: "/admin/settings/rate-limits",  role: "SA" },
      { label: "TURN Server Config",      path: "/admin/settings/turn",         role: "SA" },
      { label: "Storage Config (S3)",     path: "/admin/settings/storage",      role: "SA" },
      { label: "Translation API Keys",    path: "/admin/settings/translation",  role: "SA" },
      { label: "Firebase / FCM Config",   path: "/admin/settings/firebase",     role: "SA" },
      { label: "Payment Gateway (Stripe)",path: "/admin/settings/payments",     role: "SA" },
      { label: "Email / SMTP Config",     path: "/admin/settings/email",        role: "SA" },
      { label: "WebSocket Config",        path: "/admin/settings/websocket",    role: "SA" },
      { label: "CDN / CloudFront",        path: "/admin/settings/cdn",          role: "SA" },
    ],
  },
  {
    id: "audit",
    icon: "⊠",
    label: "Audit Logs",
    path: "/admin/audit",
    role: "SA",
    badge: null,
    color: "#64748b",
    sub: [
      { label: "Admin Action Log",        path: "/admin/audit/actions",     role: "SA" },
      { label: "User Ban / Suspend Log",  path: "/admin/audit/moderation",  role: "SA" },
      { label: "API Request Log",         path: "/admin/audit/api",         role: "SA" },
      { label: "Error Log",               path: "/admin/audit/errors",      role: "SA" },
      { label: "Queue Monitor (Horizon)", path: "/admin/audit/horizon",     role: "SA" },
      { label: "System Event Log",        path: "/admin/audit/system",      role: "SA" },
    ],
  },
];

// ─── BADGE CONFIG ──────────────────────────────────────────────────────────
const BADGE_STYLES = {
  alert: { bg: "rgba(248,113,113,0.15)", color: "#f87171", border: "rgba(248,113,113,0.3)" },
  live:  { bg: "rgba(52,211,153,0.15)",  color: "#34d399", border: "rgba(52,211,153,0.3)"  },
  info:  { bg: "rgba(56,189,248,0.15)",  color: "#38bdf8", border: "rgba(56,189,248,0.3)"  },
  rd:    { bg: "rgba(250,204,21,0.15)",  color: "#facc15", border: "rgba(250,204,21,0.3)"  },
};

const ROLE_STYLE = {
  SA: { bg: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "rgba(167,139,250,0.25)" },
  A:  { bg: "rgba(52,211,153,0.10)",  color: "#34d399", border: "rgba(52,211,153,0.22)"  },
};

export default function TalkinSuperAdminMenu() {
  const [open, setOpen]         = useState({});
  const [active, setActive]     = useState("dashboard");
  const [activeSub, setActiveSub] = useState(null);
  const [search, setSearch]     = useState("");
  const [view, setView]         = useState("menu"); // "menu" | "table"
  const [collapsed, setCollapsed] = useState(false);

  const toggle = (id) => {
    setOpen(p => ({ ...p, [id]: !p[id] }));
    setActive(id);
  };

  const filtered = MENU.filter(m => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.label.toLowerCase().includes(q) ||
      (m.sub || []).some(s => s.label.toLowerCase().includes(q))
    );
  });

  const totalMenus   = MENU.length;
  const totalSubs    = MENU.reduce((a, m) => a + m.sub.length, 0);
  const saOnly       = MENU.filter(m => m.role === "SA").length;
  const shared       = MENU.filter(m => m.role === "A").length;
  const saSubCount   = MENU.reduce((a, m) => a + m.sub.filter(s => s.role === "SA").length, 0);
  const aSubCount    = MENU.reduce((a, m) => a + m.sub.filter(s => s.role === "A").length, 0);

  return (
    <div style={{
      fontFamily: "'Outfit', 'DM Sans', sans-serif",
      background: "#080b12",
      minHeight: "100vh",
      display: "flex",
      color: "#e2e8f0",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:3px;}
        button{font-family:'Outfit',sans-serif;}
        input{font-family:'Outfit',sans-serif;}
        .m-row{transition:background 0.15s,border-color 0.15s;}
        .m-row:hover{background:rgba(255,255,255,0.04)!important;}
        .s-row{transition:background 0.15s,color 0.15s;}
        .s-row:hover{background:rgba(255,255,255,0.05)!important;}
        .s-row:hover .s-label{color:#e2e8f0!important;}
        .fade{animation:fd 0.25s ease both;}
        @keyframes fd{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
        .slide{animation:sl 0.22s cubic-bezier(.4,0,.2,1) both;}
        @keyframes sl{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
        .pill-btn{transition:all 0.15s;cursor:pointer;border:none;}
        .pill-btn:hover{filter:brightness(1.15);}
        .count-badge{font-family:'JetBrains Mono',monospace;}
        .mono{font-family:'JetBrains Mono',monospace;}
        .icon-box{transition:transform 0.2s;}
        .m-row:hover .icon-box{transform:scale(1.1);}
        .chev{transition:transform 0.22s cubic-bezier(.4,0,.2,1);display:inline-block;}
        .topbar-glow{
          position:absolute;top:0;left:0;right:0;height:1px;
          background:linear-gradient(90deg,transparent 0%,rgba(56,189,248,0.4) 30%,rgba(167,139,250,0.5) 60%,transparent 100%);
        }
        .bg-grid{
          position:fixed;inset:0;pointer-events:none;z-index:0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px);
          background-size:40px 40px;
        }
        .pulse-dot{
          width:6px;height:6px;border-radius:50%;background:#34d399;
          animation:pd 2s ease infinite;flex-shrink:0;
        }
        @keyframes pd{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
      `}</style>

      <div className="bg-grid" />

      {/* ══ SIDEBAR ═════════════════════════════════════════════════════════ */}
      <aside style={{
        width: collapsed ? 64 : 272,
        minWidth: collapsed ? 64 : 272,
        background: "rgba(8,11,18,0.95)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 10,
        transition: "width 0.3s cubic-bezier(.4,0,.2,1),min-width 0.3s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden",
      }}>
        <div className="topbar-glow" />

        {/* Logo */}
        <div style={{
          padding: collapsed ? "20px 14px" : "22px 18px 16px",
          display: "flex", alignItems: "center",
          gap: 12, borderBottom: "1px solid rgba(255,255,255,0.05)",
          justifyContent: collapsed ? "center" : "flex-start",
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
            background: "linear-gradient(135deg, #38bdf8 0%, #a78bfa 60%, #f472b6 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 17, color: "#fff",
            boxShadow: "0 0 24px rgba(56,189,248,0.35)",
          }}>T</div>
          {!collapsed && (
            <div className="fade">
              <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
                Talkin
              </div>
              <div className="mono" style={{ fontSize: 9, color: "#334155", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                super admin
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="fade" style={{ padding: "12px 14px 6px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 9, padding: "7px 11px",
            }}>
              <span style={{ color: "#334155", fontSize: 13 }}>⌕</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search menus..."
                style={{
                  background: "none", border: "none", outline: "none",
                  color: "#cbd5e1", fontSize: 12, width: "100%",
                }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#334155", fontSize: 11, padding: 0,
                }}>✕</button>
              )}
            </div>
          </div>
        )}

        {/* Role legend */}
        {!collapsed && (
          <div style={{ padding: "6px 14px 10px", display: "flex", gap: 6 }}>
            {[["SA", "Super Admin"], ["A", "Admin+SA"]].map(([k, v]) => (
              <div key={k} style={{
                flex: 1, padding: "4px 8px", borderRadius: 6, textAlign: "center",
                background: ROLE_STYLE[k].bg, border: `1px solid ${ROLE_STYLE[k].border}`,
                color: ROLE_STYLE[k].color, fontSize: 9, fontWeight: 600,
                letterSpacing: "0.04em", textTransform: "uppercase",
              }} className="mono">
                {k} · {v}
              </div>
            ))}
          </div>
        )}

        {/* Nav label */}
        {!collapsed && (
          <div className="mono" style={{
            padding: "2px 18px 7px", fontSize: 9, letterSpacing: "0.12em",
            color: "#1e293b", textTransform: "uppercase",
          }}>
            {filtered.length} / {MENU.length} menus
          </div>
        )}

        {/* Menu list */}
        <nav style={{
          flex: 1, overflowY: "auto",
          padding: collapsed ? "6px 0" : "0 0 16px",
        }}>
          {filtered.map((menu) => {
            const isOpen   = !!open[menu.id];
            const isActive = active === menu.id;
            const badge    = menu.badge ? BADGE_STYLES[menu.badgeType] : null;

            // Filter subs if searching
            const visibleSubs = search
              ? menu.sub.filter(s => s.label.toLowerCase().includes(search.toLowerCase()))
              : menu.sub;

            return (
              <div key={menu.id}>
                {/* Top-level row */}
                <button
                  title={collapsed ? menu.label : ""}
                  onClick={() => {
                    if (!collapsed) toggle(menu.id);
                    else setActive(menu.id);
                  }}
                  style={{
                    width: "100%", background: "none", border: "none",
                    cursor: "pointer", padding: 0, display: "block",
                  }}
                >
                  <div className="m-row" style={{
                    display: "flex", alignItems: "center",
                    gap: 10,
                    padding: collapsed ? "10px 13px" : "8px 12px",
                    margin: collapsed ? "2px 4px" : "1px 6px",
                    borderRadius: 9,
                    justifyContent: collapsed ? "center" : "flex-start",
                    background: isActive
                      ? `linear-gradient(90deg, rgba(56,189,248,0.1), rgba(167,139,250,0.06))`
                      : "transparent",
                    borderLeft: isActive
                      ? `2px solid ${menu.color}`
                      : "2px solid transparent",
                    position: "relative",
                  }}>
                    {/* Color dot */}
                    {isActive && !collapsed && (
                      <div style={{
                        position: "absolute", left: -1, top: "50%",
                        transform: "translateY(-50%)",
                        width: 3, height: 20, borderRadius: 2,
                        background: menu.color,
                        boxShadow: `0 0 8px ${menu.color}80`,
                      }} />
                    )}

                    {/* Icon */}
                    <span className="icon-box" style={{
                      fontSize: 15, width: 18, textAlign: "center",
                      color: isActive ? menu.color : "#334155",
                      flexShrink: 0, transition: "color 0.15s",
                    }}>{menu.icon}</span>

                    {!collapsed && (
                      <>
                        <span style={{
                          flex: 1, fontSize: 13, textAlign: "left",
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? "#f1f5f9" : "#94a3b8",
                          letterSpacing: "-0.01em",
                          transition: "color 0.15s",
                        }}>{menu.label}</span>

                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          {/* Role tag */}
                          <span className="mono" style={{
                            fontSize: 8, padding: "2px 5px", borderRadius: 4,
                            background: ROLE_STYLE[menu.role].bg,
                            color: ROLE_STYLE[menu.role].color,
                            border: `1px solid ${ROLE_STYLE[menu.role].border}`,
                            fontWeight: 600, letterSpacing: "0.05em",
                          }}>{menu.role}</span>

                          {/* Badge */}
                          {menu.badge && (
                            <span className="mono" style={{
                              fontSize: 8, padding: "2px 5px", borderRadius: 4,
                              background: badge.bg, color: badge.color,
                              border: `1px solid ${badge.border}`,
                              fontWeight: 700,
                            }}>{menu.badge}</span>
                          )}

                          {/* Sub count */}
                          <span className="mono" style={{
                            fontSize: 8, padding: "2px 5px", borderRadius: 4,
                            background: "rgba(255,255,255,0.04)",
                            color: "#334155",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}>{menu.sub.length}</span>

                          {/* Chevron */}
                          <span className="chev" style={{
                            fontSize: 9, color: "#334155",
                            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          }}>▾</span>
                        </div>
                      </>
                    )}
                  </div>
                </button>

                {/* Submenu */}
                {isOpen && !collapsed && (visibleSubs.length > 0) && (
                  <div className="slide">
                    {visibleSubs.map((sub, si) => {
                      const key = `${menu.id}::${si}`;
                      const isSA = sub.role === "SA";
                      return (
                        <button
                          key={key}
                          onClick={() => { setActiveSub(key); setActive(menu.id); }}
                          style={{
                            width: "100%", background: "none", border: "none",
                            cursor: "pointer", padding: 0, display: "block",
                          }}
                        >
                          <div className="s-row" style={{
                            display: "flex", alignItems: "center",
                            gap: 9, padding: "6px 12px 6px 40px",
                            margin: "0 6px", borderRadius: 7,
                            background: activeSub === key
                              ? "rgba(56,189,248,0.08)"
                              : si % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                          }}>
                            {/* Connector line */}
                            <div style={{
                              width: 10, flexShrink: 0,
                              display: "flex", alignItems: "center",
                              position: "relative",
                            }}>
                              <div style={{
                                width: activeSub === key ? 6 : 4,
                                height: activeSub === key ? 6 : 4,
                                borderRadius: "50%",
                                background: activeSub === key ? menu.color : "#1e293b",
                                boxShadow: activeSub === key ? `0 0 6px ${menu.color}` : "none",
                                transition: "all 0.15s",
                                flexShrink: 0,
                              }} />
                            </div>

                            <span className="s-label" style={{
                              flex: 1, fontSize: 12, textAlign: "left",
                              color: activeSub === key ? "#e2e8f0" : "#475569",
                              fontWeight: activeSub === key ? 500 : 400,
                              transition: "color 0.15s",
                              letterSpacing: "-0.005em",
                            }}>{sub.label}</span>

                            {/* SA marker for super-only subs */}
                            {isSA && (
                              <span className="mono" style={{
                                fontSize: 7, padding: "1px 4px", borderRadius: 3,
                                background: "rgba(167,139,250,0.1)",
                                color: "#7c3aed",
                                border: "1px solid rgba(167,139,250,0.15)",
                              }}>SA</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom collapse */}
        <div style={{
          padding: "10px 8px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
          <button
            onClick={() => setCollapsed(p => !p)}
            style={{
              width: "100%", background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 8, padding: "8px 10px",
              cursor: "pointer", color: "#334155",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 6,
              transition: "background 0.15s",
            }}
          >
            <span style={{
              display: "inline-block", fontSize: 12,
              transition: "transform 0.3s",
              transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
            }}>◁</span>
            {!collapsed && (
              <span className="mono" style={{ fontSize: 10, color: "#334155" }}>Collapse</span>
            )}
          </button>
        </div>
      </aside>

      {/* ══ MAIN PANEL ══════════════════════════════════════════════════════ */}
      <main style={{
        flex: 1, overflowY: "auto",
        padding: "28px 32px",
        position: "relative", zIndex: 1,
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", marginBottom: 28,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div className="pulse-dot" />
              <span className="mono" style={{ fontSize: 10, color: "#334155", letterSpacing: "0.08em" }}>
                SUPER ADMIN · TALKIN PLATFORM · v3.0
              </span>
            </div>
            <h1 style={{
              fontSize: 26, fontWeight: 800, color: "#f1f5f9",
              letterSpacing: "-0.04em", lineHeight: 1.1,
            }}>
              Dashboard Menu<br />
              <span style={{
                background: "linear-gradient(90deg, #38bdf8, #a78bfa)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>Structure</span>
            </h1>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {["menu", "table"].map(v => (
              <button
                key={v}
                className="pill-btn"
                onClick={() => setView(v)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 8,
                  background: view === v ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${view === v ? "rgba(56,189,248,0.35)" : "rgba(255,255,255,0.07)"}`,
                  color: view === v ? "#38bdf8" : "#475569",
                  fontSize: 12, fontWeight: 600,
                  letterSpacing: "0.02em", textTransform: "capitalize",
                }}
              >{v === "menu" ? "⊞ Menu View" : "⊟ Table View"}</button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 12, marginBottom: 28,
        }}>
          {[
            { label: "Menu Groups",    val: totalMenus,  color: "#38bdf8" },
            { label: "Sub-items",      val: totalSubs,   color: "#a78bfa" },
            { label: "SA-Only Menus",  val: saOnly,      color: "#f472b6" },
            { label: "Shared Menus",   val: shared,      color: "#34d399" },
            { label: "SA Sub-items",   val: saSubCount,  color: "#c084fc" },
            { label: "Admin Sub-items",val: aSubCount,   color: "#4ade80" },
          ].map(s => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 10, padding: "14px 16px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${s.color}80, transparent)`,
              }} />
              <div style={{
                fontSize: 24, fontWeight: 800, color: "#f1f5f9",
                letterSpacing: "-0.04em",
              }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "#334155", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── VIEW: MENU CARDS ─────────────────────────────────────────────── */}
        {view === "menu" && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 14,
          }}>
            {MENU.map((menu) => (
              <div key={menu.id} style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 13,
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${menu.color}40`}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
              >
                {/* Card header */}
                <div style={{
                  padding: "14px 16px",
                  background: `linear-gradient(90deg, ${menu.color}12, transparent)`,
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    background: `${menu.color}18`,
                    border: `1px solid ${menu.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, color: menu.color,
                  }}>{menu.icon}</div>

                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: "#f1f5f9",
                      letterSpacing: "-0.02em",
                    }}>{menu.label}</div>
                    <div className="mono" style={{
                      fontSize: 9, color: "#334155", marginTop: 1,
                    }}>{menu.path}</div>
                  </div>

                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    {menu.badge && (
                      <span className="mono" style={{
                        fontSize: 8, padding: "2px 6px", borderRadius: 5,
                        background: BADGE_STYLES[menu.badgeType].bg,
                        color: BADGE_STYLES[menu.badgeType].color,
                        border: `1px solid ${BADGE_STYLES[menu.badgeType].border}`,
                        fontWeight: 700,
                      }}>{menu.badge}</span>
                    )}
                    <span className="mono" style={{
                      fontSize: 8, padding: "2px 6px", borderRadius: 5,
                      background: ROLE_STYLE[menu.role].bg,
                      color: ROLE_STYLE[menu.role].color,
                      border: `1px solid ${ROLE_STYLE[menu.role].border}`,
                      fontWeight: 700,
                    }}>{menu.role}</span>
                    <span style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: `${menu.color}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, color: menu.color,
                    }}>{menu.sub.length}</span>
                  </div>
                </div>

                {/* Sub-items */}
                <div style={{ padding: "8px 0 10px" }}>
                  {menu.sub.map((sub, si) => (
                    <div key={si} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "5px 16px",
                      borderRadius: 6,
                      margin: "0 6px",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <div style={{
                        width: 4, height: 4, borderRadius: "50%", flexShrink: 0,
                        background: si % 3 === 0 ? menu.color : "#1e293b",
                      }} />
                      <span style={{
                        flex: 1, fontSize: 11.5, color: "#64748b",
                        letterSpacing: "-0.005em",
                      }}>{sub.label}</span>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        {sub.role === "SA" && (
                          <span className="mono" style={{
                            fontSize: 7, padding: "1px 4px", borderRadius: 3,
                            background: "rgba(167,139,250,0.1)",
                            color: "#7c3aed",
                            border: "1px solid rgba(167,139,250,0.15)",
                          }}>SA</span>
                        )}
                        <span className="mono" style={{
                          fontSize: 8, color: "#1e293b",
                          overflow: "hidden", textOverflow: "ellipsis",
                          whiteSpace: "nowrap", maxWidth: 100,
                        }}>{sub.path.split("/").slice(-1)[0]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── VIEW: TABLE ──────────────────────────────────────────────────── */}
        {view === "table" && (
          <div style={{
            background: "rgba(255,255,255,0.015)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 13, overflow: "hidden",
          }}>
            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "32px 200px 1fr 52px 52px 110px",
              gap: 0,
              padding: "12px 20px",
              background: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              {["#", "Menu / Sub-item", "Route Path", "Role", "Type", "Subs"].map((h, i) => (
                <div key={h} className="mono" style={{
                  fontSize: 9, color: "#334155", fontWeight: 600,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  textAlign: i === 3 || i === 4 || i === 5 ? "center" : "left",
                }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            {MENU.map((menu, mi) => (
              <div key={menu.id} style={{
                borderBottom: mi < MENU.length - 1
                  ? "1px solid rgba(255,255,255,0.04)"
                  : "none",
              }}>
                {/* Parent row */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "32px 200px 1fr 52px 52px 110px",
                  gap: 0,
                  padding: "11px 20px",
                  background: `linear-gradient(90deg, ${menu.color}06, transparent)`,
                  alignItems: "center",
                }}>
                  <span style={{ fontSize: 14, color: menu.color }}>{menu.icon}</span>
                  <span style={{
                    fontSize: 12.5, fontWeight: 700, color: "#e2e8f0",
                    letterSpacing: "-0.01em",
                  }}>
                    {menu.label}
                    {menu.badge && (
                      <span className="mono" style={{
                        marginLeft: 6, fontSize: 8, padding: "1px 5px",
                        borderRadius: 4,
                        background: BADGE_STYLES[menu.badgeType].bg,
                        color: BADGE_STYLES[menu.badgeType].color,
                        border: `1px solid ${BADGE_STYLES[menu.badgeType].border}`,
                      }}>{menu.badge}</span>
                    )}
                  </span>
                  <span className="mono" style={{ fontSize: 10, color: "#334155" }}>{menu.path}</span>
                  <span style={{ textAlign: "center" }}>
                    <span className="mono" style={{
                      fontSize: 9, padding: "2px 6px", borderRadius: 4, fontWeight: 700,
                      background: ROLE_STYLE[menu.role].bg,
                      color: ROLE_STYLE[menu.role].color,
                      border: `1px solid ${ROLE_STYLE[menu.role].border}`,
                    }}>{menu.role}</span>
                  </span>
                  <span style={{ textAlign: "center" }}>
                    <span className="mono" style={{
                      fontSize: 9, padding: "2px 6px", borderRadius: 4,
                      background: "rgba(56,189,248,0.1)", color: "#38bdf8",
                      border: "1px solid rgba(56,189,248,0.2)",
                    }}>group</span>
                  </span>
                  <span style={{ textAlign: "center" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: menu.color,
                    }}>{menu.sub.length}</span>
                  </span>
                </div>

                {/* Sub rows */}
                {menu.sub.map((sub, si) => (
                  <div key={si} style={{
                    display: "grid",
                    gridTemplateColumns: "32px 200px 1fr 52px 52px 110px",
                    gap: 0,
                    padding: "7px 20px 7px 44px",
                    alignItems: "center",
                    background: si % 2 === 0
                      ? "transparent"
                      : "rgba(255,255,255,0.01)",
                    borderTop: "1px solid rgba(255,255,255,0.025)",
                  }}>
                    <span style={{ color: "#1e293b", fontSize: 10 }}>└</span>
                    <span style={{
                      fontSize: 12, color: "#64748b",
                      letterSpacing: "-0.005em",
                    }}>{sub.label}</span>
                    <span className="mono" style={{ fontSize: 9, color: "#1e293b" }}>{sub.path}</span>
                    <span style={{ textAlign: "center" }}>
                      <span className="mono" style={{
                        fontSize: 8, padding: "1px 5px", borderRadius: 3, fontWeight: 600,
                        background: ROLE_STYLE[sub.role].bg,
                        color: ROLE_STYLE[sub.role].color,
                        border: `1px solid ${ROLE_STYLE[sub.role].border}`,
                      }}>{sub.role}</span>
                    </span>
                    <span style={{ textAlign: "center" }}>
                      <span className="mono" style={{
                        fontSize: 8, padding: "1px 5px", borderRadius: 3,
                        background: "rgba(255,255,255,0.04)", color: "#334155",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}>page</span>
                    </span>
                    <span style={{
                      textAlign: "center", fontSize: 9, color: "#1e293b",
                    }}>—</span>
                  </div>
                ))}
              </div>
            ))}

            {/* Table footer */}
            <div style={{
              padding: "12px 20px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex", justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span className="mono" style={{ fontSize: 9, color: "#1e293b" }}>
                TALKIN ADMIN PANEL · v3.0 · 2026
              </span>
              <span className="mono" style={{ fontSize: 9, color: "#1e293b" }}>
                {totalMenus} groups · {totalSubs} sub-items · SA={saSubCount} A={aSubCount}
              </span>
            </div>
          </div>
        )}

        {/* ── PLAIN TEXT REFERENCE ─────────────────────────────────────────── */}
        <div style={{
          marginTop: 24,
          background: "rgba(255,255,255,0.015)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 13, padding: "20px 24px",
        }}>
          <h2 style={{
            fontSize: 13, fontWeight: 700, color: "#f1f5f9",
            marginBottom: 16, letterSpacing: "-0.02em",
          }}>
            Complete Menu & Submenu Reference
            <span className="mono" style={{
              marginLeft: 10, fontSize: 9, color: "#334155",
              fontWeight: 400, letterSpacing: "0.06em",
            }}>
              {totalMenus} MENUS · {totalSubs} SUB-ITEMS TOTAL
            </span>
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}>
            {MENU.map(menu => (
              <div key={menu.id}>
                {/* Menu name */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 7,
                  paddingBottom: 8, marginBottom: 6,
                  borderBottom: `1px solid ${menu.color}25`,
                }}>
                  <span style={{ color: menu.color, fontSize: 13 }}>{menu.icon}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: "#e2e8f0",
                    letterSpacing: "-0.02em",
                  }}>{menu.label}</span>
                  <span className="mono" style={{
                    marginLeft: "auto", fontSize: 8, padding: "2px 6px",
                    borderRadius: 4,
                    background: ROLE_STYLE[menu.role].bg,
                    color: ROLE_STYLE[menu.role].color,
                    border: `1px solid ${ROLE_STYLE[menu.role].border}`,
                    fontWeight: 700,
                  }}>{menu.role}</span>
                </div>

                {/* Sub items as plain list */}
                {menu.sub.map((sub, si) => (
                  <div key={si} style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "3px 0",
                  }}>
                    <span style={{
                      fontSize: 8, color: menu.color, opacity: 0.5, flexShrink: 0,
                    }}>▸</span>
                    <span style={{
                      fontSize: 11, color: "#475569",
                      letterSpacing: "-0.01em", flex: 1,
                    }}>{sub.label}</span>
                    {sub.role === "SA" && (
                      <span className="mono" style={{
                        fontSize: 7, color: "#4c1d95",
                        background: "rgba(124,58,237,0.1)",
                        padding: "1px 3px", borderRadius: 2,
                        border: "1px solid rgba(124,58,237,0.15)",
                      }}>SA</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
