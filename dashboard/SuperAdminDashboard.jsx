import { useState, useEffect } from "react";

// ─── SUPER ADMIN DASHBOARD ──────────────────────────────────────────────────
// Real-time platform monitoring and control center
// Matches design system from talkin-superadmin-menu.jsx
// ─────────────────────────────────────────────────────────────────────────────

const QUICK_STATS = [
  { id: "users", label: "Total Users", icon: "⊙", color: "#34d399", endpoint: "/api/stats/users" },
  { id: "online", label: "Online Now", icon: "◎", color: "#38bdf8", endpoint: "/api/stats/online" },
  { id: "calls", label: "Active Calls", icon: "◫", color: "#facc15", endpoint: "/api/stats/calls" },
  { id: "rooms", label: "Live Rooms", icon: "◑", color: "#fb923c", endpoint: "/api/stats/rooms" },
  { id: "reports", label: "Pending Reports", icon: "⊘", color: "#f87171", endpoint: "/api/stats/reports" },
  { id: "revenue", label: "Today Revenue", icon: "◇", color: "#f472b6", endpoint: "/api/stats/revenue" },
];

const QUICK_ACTIONS = [
  { id: "broadcast", label: "Send Broadcast", icon: "◯", color: "#fb923c", path: "/admin/notifications/broadcast" },
  { id: "ban-user", label: "Ban User", icon: "⊘", color: "#f87171", path: "/admin/users/ban" },
  { id: "close-room", label: "Close Room", icon: "◑", color: "#fb923c", path: "/admin/rooms/close" },
  { id: "add-gift", label: "Add Gift", icon: "◇", color: "#f472b6", path: "/admin/gifts/create" },
  { id: "maintenance", label: "Maintenance Mode", icon: "⊞", color: "#94a3b8", path: "/admin/settings/maintenance" },
  { id: "audit-log", label: "View Audit Log", icon: "⊠", color: "#64748b", path: "/admin/audit/actions" },
];

const RECENT_ACTIVITIES = [
  { type: "user", action: "New user registered", user: "user_12345", time: "2 min ago", color: "#34d399" },
  { type: "report", action: "Report submitted", user: "user_67890", time: "5 min ago", color: "#f87171" },
  { type: "call", action: "Video call started", user: "user_11111", time: "8 min ago", color: "#facc15" },
  { type: "room", action: "Voice room created", user: "user_22222", time: "12 min ago", color: "#fb923c" },
  { type: "gift", action: "Gift sent", user: "user_33333", time: "15 min ago", color: "#f472b6" },
];

const SYSTEM_HEALTH = [
  { service: "API Server", status: "healthy", uptime: "99.98%", color: "#34d399" },
  { service: "WebSocket", status: "healthy", uptime: "99.95%", color: "#34d399" },
  { service: "Database", status: "healthy", uptime: "99.99%", color: "#34d399" },
  { service: "Redis Cache", status: "healthy", uptime: "99.97%", color: "#34d399" },
  { service: "TURN Server", status: "degraded", uptime: "98.50%", color: "#facc15" },
  { service: "Storage (S3)", status: "healthy", uptime: "99.99%", color: "#34d399" },
];

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    users: "Loading...",
    online: "Loading...",
    calls: "Loading...",
    rooms: "Loading...",
    reports: "Loading...",
    revenue: "Loading...",
  });

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        users: "45,892",
        online: "3,247",
        calls: "127",
        rooms: "43",
        reports: "38",
        revenue: "$12,450",
      });
    }, 800);

    // Update time every second
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      fontFamily: "'Outfit', 'DM Sans', sans-serif",
      background: "#080b12",
      minHeight: "100vh",
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
        .mono{font-family:'JetBrains Mono',monospace;}
        .fade{animation:fd 0.25s ease both;}
        @keyframes fd{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
        .slide-up{animation:su 0.3s cubic-bezier(.4,0,.2,1) both;}
        @keyframes su{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .stat-card{transition:all 0.2s;}
        .stat-card:hover{transform:translateY(-2px);border-color:currentColor!important;}
        .action-btn{transition:all 0.15s;cursor:pointer;}
        .action-btn:hover{transform:scale(1.02);filter:brightness(1.15);}
        .pulse-dot{
          width:6px;height:6px;border-radius:50%;background:#34d399;
          animation:pd 2s ease infinite;flex-shrink:0;
        }
        @keyframes pd{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
        .bg-grid{
          position:fixed;inset:0;pointer-events:none;z-index:0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px);
          background-size:40px 40px;
        }
        .topbar-glow{
          position:absolute;top:0;left:0;right:0;height:1px;
          background:linear-gradient(90deg,transparent 0%,rgba(56,189,248,0.4) 30%,rgba(167,139,250,0.5) 60%,transparent 100%);
        }
      `}</style>

      <div className="bg-grid" />

      {/* ══ MAIN CONTAINER ══════════════════════════════════════════════════ */}
      <div style={{
        maxWidth: 1600,
        margin: "0 auto",
        padding: "28px 32px",
        position: "relative",
        zIndex: 1,
      }}>

        {/* ── HEADER ────────────────────────────────────────────────────────── */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 32,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div className="pulse-dot" />
              <span className="mono" style={{
                fontSize: 10,
                color: "#334155",
                letterSpacing: "0.08em",
              }}>
                SUPER ADMIN · TALKIN PLATFORM · v3.0
              </span>
            </div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#f1f5f9",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              marginBottom: 6,
            }}>
              Dashboard <span style={{
                background: "linear-gradient(90deg, #38bdf8, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>Overview</span>
            </h1>
            <p style={{
              fontSize: 13,
              color: "#64748b",
              letterSpacing: "-0.01em",
            }}>
              Real-time platform monitoring and control center
            </p>
          </div>

          {/* Time & Date */}
          <div style={{
            textAlign: "right",
          }}>
            <div className="mono" style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#f1f5f9",
              letterSpacing: "-0.02em",
            }}>
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="mono" style={{
              fontSize: 11,
              color: "#334155",
              marginTop: 2,
            }}>
              {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* ── QUICK STATS ────────────────────────────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
          marginBottom: 28,
        }}>
          {QUICK_STATS.map((stat, i) => (
            <div
              key={stat.id}
              className="stat-card slide-up"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid rgba(255,255,255,0.06)`,
                borderRadius: 12,
                padding: "18px 20px",
                position: "relative",
                overflow: "hidden",
                animationDelay: `${i * 0.05}s`,
              }}
            >
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, ${stat.color}80, transparent)`,
              }} />

              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}>
                <span style={{
                  fontSize: 18,
                  color: stat.color,
                }}>{stat.icon}</span>
                <span className="mono" style={{
                  fontSize: 9,
                  color: "#334155",
                  letterSpacing: "0.06em",
                }}>LIVE</span>
              </div>

              <div style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#f1f5f9",
                letterSpacing: "-0.04em",
                marginBottom: 4,
              }}>
                {stats[stat.id]}
              </div>

              <div style={{
                fontSize: 11,
                color: "#64748b",
                letterSpacing: "-0.01em",
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN GRID ──────────────────────────────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 28,
        }}>

          {/* Quick Actions */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 13,
            padding: "20px 24px",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}>
              <h2 style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#f1f5f9",
                letterSpacing: "-0.02em",
              }}>
                Quick Actions
              </h2>
              <span className="mono" style={{
                fontSize: 9,
                color: "#334155",
                letterSpacing: "0.06em",
              }}>
                {QUICK_ACTIONS.length} ACTIONS
              </span>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 10,
            }}>
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  className="action-btn"
                  style={{
                    background: `${action.color}12`,
                    border: `1px solid ${action.color}30`,
                    borderRadius: 10,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    textAlign: "left",
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `${action.color}18`,
                    border: `1px solid ${action.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: action.color,
                    flexShrink: 0,
                  }}>
                    {action.icon}
                  </div>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#e2e8f0",
                    letterSpacing: "-0.01em",
                  }}>
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 13,
            padding: "20px 24px",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}>
              <h2 style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#f1f5f9",
                letterSpacing: "-0.02em",
              }}>
                Recent Activities
              </h2>
              <button style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 10,
                color: "#64748b",
                cursor: "pointer",
              }}>
                View All
              </button>
            </div>

            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}>
              {RECENT_ACTIVITIES.map((activity, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    borderRadius: 8,
                  }}
                >
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: activity.color,
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 12,
                      color: "#e2e8f0",
                      marginBottom: 2,
                    }}>
                      {activity.action}
                    </div>
                    <div className="mono" style={{
                      fontSize: 9,
                      color: "#334155",
                    }}>
                      {activity.user}
                    </div>
                  </div>
                  <span className="mono" style={{
                    fontSize: 9,
                    color: "#334155",
                  }}>
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SYSTEM HEALTH ──────────────────────────────────────────────────── */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 13,
          padding: "20px 24px",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}>
            <h2 style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#f1f5f9",
              letterSpacing: "-0.02em",
            }}>
              System Health
            </h2>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <div className="pulse-dot" />
              <span className="mono" style={{
                fontSize: 9,
                color: "#34d399",
                letterSpacing: "0.06em",
              }}>
                ALL SYSTEMS OPERATIONAL
              </span>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}>
            {SYSTEM_HEALTH.map((service, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${service.color}30`,
                  borderRadius: 10,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#e2e8f0",
                    marginBottom: 4,
                  }}>
                    {service.service}
                  </div>
                  <div className="mono" style={{
                    fontSize: 9,
                    color: "#334155",
                  }}>
                    Uptime: {service.uptime}
                  </div>
                </div>
                <div style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: `${service.color}15`,
                  border: `1px solid ${service.color}30`,
                }}>
                  <span className="mono" style={{
                    fontSize: 9,
                    color: service.color,
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}>
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
        <div style={{
          marginTop: 28,
          padding: "16px 0",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span className="mono" style={{
            fontSize: 9,
            color: "#1e293b",
            letterSpacing: "0.06em",
          }}>
            TALKIN SUPER ADMIN DASHBOARD · v3.0 · 2026
          </span>
          <span className="mono" style={{
            fontSize: 9,
            color: "#1e293b",
          }}>
            Last updated: {time.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}
