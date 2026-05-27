"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

const fmt = (n) => n != null ? `${Number(n).toLocaleString("fr-MA")} MAD` : "—"

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalFlowers: 0, lowStock: 0, pendingOrders: 0, revenue: 0 })
  const [recentFlowers, setRecentFlowers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        const [flowersRes, revenueRes, ordersRes] = await Promise.all([
          fetch("/api/flowers?perPage=5"),
          fetch("/api/orders?aggregate=revenue"),
          fetch("/api/orders?perPage=1&status=pending")
        ])

        const flowersData = await flowersRes.json()
        const revenueData = await revenueRes.json()
        const ordersData = await ordersRes.json()

        const flowers = flowersData.data || (Array.isArray(flowersData) ? flowersData : [])

        setStats({
          totalFlowers: flowersData.total || flowers.length,
          lowStock: flowers.filter(f => f.stock >= 0 && f.stock < 5).length,
          revenue: revenueData.totalRevenue || 0,
          pendingOrders: ordersData.total || 0,
        })
        setRecentFlowers(flowers.slice(0, 5))
      } catch (error) {
        console.error("Dashboard calculation error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) {
    return <div style={{ color: "var(--muted)", padding: "2rem" }}>Chargement du tableau de bord...</div>
  }

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-sub">Vue d'ensemble de l'activité Flora Studio</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/admin/flowers/create" className="btn-primary">＋ Ajouter un produit</Link>
        </div>
      </header>

      {/* Cartes de statistiques unifiées */}
      <div className="stats-row">
        <div className="stat-card">
          <p className="stat-label">Chiffre d'Affaires</p>
          <p className="stat-value" style={{ color: "var(--accent2)" }}>{fmt(stats.revenue)}</p>
          <p className="stat-sub">Volume total encaissé</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Commandes En Attente</p>
          <p className="stat-value" style={{ color: stats.pendingOrders > 0 ? "var(--danger)" : "var(--text)" }}>{stats.pendingOrders}</p>
          <p className="stat-sub">Flux à traiter en urgence</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Catalogue</p>
          <p className="stat-value">{stats.totalFlowers}</p>
          <p className="stat-sub">Articles référencés</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Alertes Stock</p>
          <p className="stat-value" style={{ color: stats.lowStock > 0 ? "var(--accent)" : "var(--text)" }}>{stats.lowStock}</p>
          <p className="stat-sub">Unités &lt; 5 exemplaires</p>
        </div>
      </div>

      {/* Derniers Produits */}
      <h2 style={{ fontFamily: "var(--font-disp)", fontSize: "1.5rem", marginTop: "2.5rem", marginBottom: "1rem" }}>
        Dernières créations ajoutées
      </h2>
      <div className="table-wrap">
        <table className="flower-table">
          <thead>
            <tr>
              <th>Fleur</th>
              <th>Catégorie</th>
              <th>Prix</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recentFlowers.map(flower => (
              <tr key={flower.slug}>
                <td style={{ fontWeight: "500" }}>{flower.name}</td>
                <td>
                  <span className="inline-badge" style={{ background: "var(--surface2)", color: "var(--accent)" }}>
                    {flower.category}
                  </span>
                </td>
                <td style={{ color: "var(--accent)" }}>{fmt(flower.price)}</td>
                <td>
                  <span style={{ color: flower.stock > 5 ? "var(--accent2)" : "var(--danger)" }}>
                    {flower.stock} unités
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <Link href={`/admin/flowers/${flower.slug}/edit`} style={{ color: "var(--muted)", textDecoration: "none", fontSize: "12px" }}>
                    Modifier ✎
                  </Link>
                </td>
              </tr>
            ))}
            {recentFlowers.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "var(--muted)", padding: "2rem" }}>
                  Aucun produit dans la base de données.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}