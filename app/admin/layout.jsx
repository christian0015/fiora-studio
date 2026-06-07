"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navItems = [
  { href: "/admin", label: "📊 Dashboard" },
  { href: "/admin/flowers", label: "🌸 Fleurs" },
  { href: "/admin/flowers/create", label: "➕ Nouvelle fleur" },
  { href: "/admin/orders", label: "📦 Commandes" },
  { href: "/admin/categories", label: "📁 Catégories" },
  { href: "/admin/occasions", label: "🎉 Occasions" },
]

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <style>{globalAdminStyles}</style>
      <div className="admin-shell">

        {/* ── Overlay (clic dehors = ferme) ─────────────────── */}
        {menuOpen && (
          <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />
        )}

        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside className={`sidebar${menuOpen ? " sidebar-open" : ""}`}>
          <div className="sidebar-logo">
            <span className="logo-mark">✦</span>
            <span className="logo-text">Fiora<em>Studio</em></span>
            {/* Croix fermeture mobile */}
            <button
              className="sidebar-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Fermer le menu"
            >✕</button>
          </div>

          <nav className="sidebar-nav">
            <span className="nav-section">Navigation</span>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${pathname === item.href ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <Link href="/" target="_blank" className="nav-item" onClick={() => setMenuOpen(false)}>
              ↗ Voir le site
            </Link>
          </div>
        </aside>

        {/* ── Contenu Dynamique ────────────────────────────── */}
        <main className="main-content">
          {/* Burger mobile — à l'intérieur du main pour éviter les conflits de z-index */}
          <button
            className="burger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Ouvrir le menu"
          >
            <span /><span />
          </button>
          {children}
        </main>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STYLES SPECIFIQUES A L'ALIMENTATION DU LAYOUT ET DES PAGES
   ═══════════════════════════════════════════════════════════════ */
const globalAdminStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Mono:wght@300;400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #0e0d0b;
    --surface:   #161512;
    --surface2:  #1e1c18;
    --border:    #2a2720;
    --text:      #e8e0d4;
    --muted:     #7a7060;
    --accent:    #c9a96e;
    --accent2:   #8ba882;
    --danger:    #c4857a;
    --font-disp: 'Cormorant Garamond', Georgia, serif;
    --font-mono: 'DM Mono', monospace;
    --radius:    6px;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-mono); }

  .admin-shell {
    display: grid;
    grid-template-columns: 240px 1fr;
    min-height: 100vh;
  }

  .sidebar {
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 2rem 1.25rem;
    position: sticky;
    top: 0;
    height: 100vh;
  }
  .sidebar-logo { display: flex; align-items: center; gap: .5rem; margin-bottom: 2.5rem; }
  .logo-mark { font-size: 1.1rem; color: var(--accent); }
  .logo-text { font-family: var(--font-disp); font-size: 1.25rem; font-weight: 500; color: var(--text); }
  .logo-text em { font-style: italic; color: var(--accent); }

  .sidebar-nav { display: flex; flex-direction: column; gap: .15rem; flex: 1; }
  .sidebar-footer { border-top: 1px solid var(--border); padding-top: 1rem; }
  .nav-section { font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); padding: .5rem .5rem .25rem; }
  
  .nav-item {
    display: block;
    padding: .6rem .75rem;
    border-radius: var(--radius);
    font-size: 12px;
    color: var(--muted);
    text-decoration: none;
    transition: background .15s, color .15s;
  }
  .nav-item:hover { background: var(--surface2); color: var(--text); }
  .nav-item.active { background: var(--surface2); color: var(--accent); font-weight: 500; }

  .main-content { padding: 2.5rem 2.75rem; overflow-x: hidden; }
  .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
  .page-title { font-family: var(--font-disp); font-size: 2rem; font-weight: 400; color: var(--text); }
  .page-sub { font-size: 12px; color: var(--muted); margin-top: .25rem; }

  .btn-primary {
    background: var(--accent); color: #0e0d0b; border: none; border-radius: var(--radius);
    padding: .6rem 1.25rem; font-family: var(--font-mono); font-size: 12px;
    cursor: pointer; text-decoration: none; display: inline-block; transition: opacity .15s;
  }
  .btn-primary:hover { opacity: .85; }

  .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem 1.5rem; }
  .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); }
  .stat-value { font-family: var(--font-disp); font-size: 1.75rem; color: var(--text); margin: .25rem 0 .15rem; }
  .stat-sub { font-size: 11px; color: var(--muted); }

  .table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow-x: auto; margin-top: 1.5rem; }
  .flower-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .flower-table th { padding: .875rem 1rem; text-align: left; font-size: 10px; text-transform: uppercase; color: var(--muted); border-bottom: 1px solid var(--border); font-weight: 400; }
  .flower-table td { padding: .875rem 1rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
  .flower-table tr:last-child td { border-bottom: none; }
  .flower-table tbody tr:hover { background: var(--surface2); }

  .inline-badge { inline-block; px-2; py-0.5; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 500; }

  @media (max-width: 900px) {
    .admin-shell { grid-template-columns: 1fr; }
    .main-content { padding: 1.5rem; padding-top: 4rem; }

    /* Burger — 2 lignes */
    .burger {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      position: fixed;
      top: 25.9rem;
      left: 1rem;
      z-index: 2000;
      background: var(--surface);
      background: var(--text);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 0.5rem 0.6rem;
      cursor: pointer;
      width: 38px;
      height: 38px;
    }
    .burger span {
      display: block;
      width: 100%;
      height: 1.5px;
      background: var(--accent);
      border-radius: 2px;
      transition: opacity 0.2s;
    }

    /* Overlay */
    .sidebar-overlay {
      position: fixed;
      inset: 0;
      z-index: 149;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(3px);
    }

    /* Sidebar — drawer horizontal */
    .sidebar {
      display: flex;
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: min(280px, 85vw);
      z-index: 150;
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      padding: 1.5rem 1.25rem;
      box-shadow: none;
    }
    .sidebar-open {
      transform: translateX(0);
      box-shadow: 8px 0 40px rgba(0,0,0,0.4);
    }

    /* Croix fermeture */
    .sidebar-close {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-inline-start: auto;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--muted);
      font-size: 0.85rem;
      width: 28px;
      height: 28px;
      cursor: pointer;
      transition: color 0.15s;
      flex-shrink: 0;
    }
    .sidebar-close:hover { color: var(--text); }
  }

  @media (min-width: 901px) {
    .burger { display: none; }
    .sidebar-close { display: none; }
    .sidebar-overlay { display: none; }
  }
`