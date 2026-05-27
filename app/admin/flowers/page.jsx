"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"

const fmt = (n) => n != null ? `${Number(n).toLocaleString("fr-MA")} MAD` : "—"

const CATEGORY_LABELS = {
  "fleur-fraiche": "Fraîche",
  "fleur-eternelle": "Éternelle",
  "fleur-sechee": "Séchée",
  plante: "Plante",
}

export default function AdminFlowersPage() {
  const [flowers, setFlowers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [catFilter, setCat] = useState("")
  const [deleting, setDeleting] = useState(null)

  const fetchFlowers = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (search) qs.set("query", search)
      if (catFilter) qs.set("category", catFilter)
      const res = await fetch(`/api/flowers?${qs}`)
      const data = await res.json()
      setFlowers(Array.isArray(data) ? data : data.data ?? [])
    } catch (err) {
      console.error("Erreur de chargement fleurs:", err)
    } finally {
      setLoading(false)
    }
  }, [search, catFilter])

  useEffect(() => { fetchFlowers() }, [fetchFlowers])

  async function handleDelete(slug) {
    if (!confirm(`Supprimer "${slug}" ? Cette action est définitive.`)) return
    setDeleting(slug)
    try {
      const res = await fetch(`/api/flowers/${slug}`, { method: "DELETE" })
      if (res.ok) fetchFlowers()
    } catch (err) {
      alert("Erreur lors de la suppression")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Catalogue fleurs</h1>
          <p className="page-sub">Inventaire complet et statuts des fiches produits</p>
        </div>
        <Link href="/admin/flowers/create" className="btn-primary">＋ Nouvelle fleur</Link>
      </header>

      {/* Barre de Recherche épurée de la v2 */}
      <div style={{ display: "flex", gap: ".75rem", marginBottom: "1.5rem" }}>
        <input
          style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
            color: "var(--text)", padding: ".55rem .875rem", flex: 1, fontFamily: "var(--font-mono)", fontSize: "12px"
          }}
          placeholder="Rechercher une fleur…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
            color: "var(--text)", padding: ".55rem .875rem", fontFamily: "var(--font-mono)", fontSize: "12px", cursor: "pointer"
          }}
          value={catFilter}
          onChange={e => setCat(e.target.value)}
        >
          <option value="">Toutes catégories</option>
          <option value="fleur-fraiche">Fleur Fraîche</option>
          <option value="fleur-eternelle">Fleur Éternelle</option>
          <option value="fleur-sechee">Fleur Séchée</option>
          <option value="plante">Plante</option>
        </select>
      </div>

      {loading ? (
        <div style={{ color: "var(--muted)" }}>Mise à jour de la grille de stockage...</div>
      ) : (
        <div className="table-wrap">
          <table className="flower-table">
            <thead>
              <tr>
                <th>Fleur</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Flags</th>
                <th>Note</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {flowers.map(flower => {
                const img = flower.images?.[0]?.url ?? flower.images?.[0] ?? null
                const isLow = flower.stock <= 5
                const isOut = flower.stock === 0

                return (
                  <tr key={flower.slug} style={{ opacity: deleting === flower.slug ? 0.3 : 1 }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: ".875rem" }}>
                        <div style={{ width: "36px", height: "36px", background: "var(--surface2)", borderRadius: "4px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {img ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "❀"}
                        </div>
                        <div>
                          <p style={{ color: "var(--text)", fontSize: "13px" }}>{flower.name}</p>
                          <p style={{ color: "var(--muted)", fontSize: "10px" }}>{flower.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="inline-badge" style={{ background: "var(--surface2)", color: "var(--text)" }}>
                        {CATEGORY_LABELS[flower.category] || flower.category}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "var(--accent)" }}>{fmt(flower.price)}</span>
                    </td>
                    <td>
                      <span style={{ 
                        padding: "2px 6px", borderRadius: "4px", fontSize: "11px",
                        background: isOut ? "#2e1510" : isLow ? "#30260e" : "#16301a",
                        color: isOut ? "var(--danger)" : isLow ? "#c9a96e" : "var(--accent2)"
                      }}>
                        {isOut ? "Épuisé" : isLow ? `⚠ ${flower.stock}` : flower.stock}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {flower.featured && <span className="inline-badge" style={{ background: "#3a2a10", color: "#c9a96e" }}>Vedette</span>}
                        {flower.premium && <span className="inline-badge" style={{ background: "#3a151a", color: "var(--danger)" }}>Premium</span>}
                      </div>
                    </td>
                    <td style={{ color: "var(--muted)" }}>
                      {flower.rating ? `★ ${flower.rating.toFixed(1)}` : "—"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <Link href={`/admin/flowers/${flower.slug}/edit`} style={{ color: "var(--accent2)", textDecoration: "none" }}>✎</Link>
                        <button onClick={() => handleDelete(flower.slug)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}>✕</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}