// app/admin/orders/page.jsx
"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"

const STATUS_LABELS = {
  pending: "En attente",
  processing: "En traitement",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  refunded: "Remboursée",
}

const STATUS_COLORS = {
  pending: "var(--accent)",
  processing: "var(--accent2)",
  shipped: "#6b8c5c",
  delivered: "#8ba882",
  cancelled: "var(--danger)",
  refunded: "var(--muted)",
}

const STATUS_OPTIONS = [
  { value: "pending", label: "En attente" },
  { value: "processing", label: "En traitement" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
  { value: "refunded", label: "Remboursée" },
]

function formatPrice(price) {
  return `${price.toLocaleString("fr-MA")} MAD`
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("fr-MA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function SectionTitle({ children }) {
  return (
    <p style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", paddingBottom: ".5rem", borderBottom: "1px solid var(--border)" }}>
      {children}
    </p>
  )
}

function StatusBadge({ status }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 500,
      background: `${STATUS_COLORS[status]}20`,
      color: STATUS_COLORS[status],
      border: `1px solid ${STATUS_COLORS[status]}40`,
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [stats, setStats] = useState(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", page)
      params.set("perPage", "20")
      if (statusFilter) params.set("status", statusFilter)
      if (dateFrom) params.set("from", dateFrom)
      if (dateTo) params.set("to", dateTo)

      const res = await fetch(`/api/orders?${params}`)
      const data = await res.json()
      
      setOrders(data.data || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, dateFrom, dateTo])

  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      params.set("aggregate", "revenue")
      if (dateFrom) params.set("from", dateFrom)
      if (dateTo) params.set("to", dateTo)
      
      const res = await fetch(`/api/orders?${params}`)
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }, [dateFrom, dateTo])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleResetFilters = () => {
    setStatusFilter("")
    setDateFrom("")
    setDateTo("")
    setPage(1)
  }

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Commandes</h1>
          <p className="page-sub">Gestion des commandes clients et suivi des expéditions</p>
        </div>
      </header>

      {/* Statistiques */}
      {stats && (
        <div className="stats-row">
          <div className="stat-card">
            <p className="stat-label">Chiffre d'Affaires</p>
            <p className="stat-value" style={{ color: "var(--accent2)" }}>
              {formatPrice(stats.totalRevenue || 0)}
            </p>
            <p className="stat-sub">Volume total encaissé</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Commandes</p>
            <p className="stat-value">{stats.totalOrders || 0}</p>
            <p className="stat-sub">Total commandes</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Panier moyen</p>
            <p className="stat-value">
              {stats.totalOrders > 0 
                ? formatPrice((stats.totalRevenue || 0) / stats.totalOrders)
                : "— MAD"}
            </p>
            <p classname="stat-sub">Valeur moyenne par commande</p>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: "1rem",
        marginBottom: "1.5rem",
      }}>
        <SectionTitle>Filtres</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1rem" }}>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: 5,
              color: "var(--text)",
              padding: ".5rem .75rem",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
            }}
          >
            <option value="">Tous les statuts</option>
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: 5,
              color: "var(--text)",
              padding: ".5rem .75rem",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
            }}
          />
          <span style={{ color: "var(--muted)", alignSelf: "center" }}>→</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: 5,
              color: "var(--text)",
              padding: ".5rem .75rem",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
            }}
          />

          <button
            onClick={handleResetFilters}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 5,
              color: "var(--muted)",
              padding: ".5rem 1rem",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Tableau des commandes */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
          <p style={{ fontSize: "1.5rem", marginBottom: ".5rem" }}>📦</p>
          <p style={{ fontSize: 12 }}>Chargement des commandes...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 6,
          padding: "3rem",
          textAlign: "center",
          color: "var(--muted)",
        }}>
          <p style={{ fontSize: "2rem", marginBottom: ".5rem", opacity: 0.3 }}>📦</p>
          <p style={{ fontSize: 14 }}>Aucune commande trouvée</p>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="flower-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Montant</th>
                  <th>Articles</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                      {order.reference}
                    </td>
                    <td>
                      <div>{order.customer?.fullName || `${order.customer?.firstName} ${order.customer?.lastName}`}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>{order.customer?.phone}</div>
                    </td>
                    <td style={{ color: "var(--accent)" }}>
                      {formatPrice(order.total)}
                    </td>
                    <td>
                      {order.items?.length || 0} article{(order.items?.length || 0) !== 1 ? "s" : ""}
                    </td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td style={{ fontSize: 11, color: "var(--muted)" }}>
                      {formatDate(order.createdAt)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={`/admin/orders/${order.reference || order._id}/edit`}
                        style={{ color: "var(--accent2)", textDecoration: "none", fontSize: 12 }}
                      >
                        Détails ✎
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: ".5rem",
              marginTop: "1.5rem",
            }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 5,
                  color: "var(--text)",
                  padding: ".4rem .8rem",
                  fontSize: 11,
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  opacity: page === 1 ? 0.5 : 1,
                }}
              >
                ← Précédent
              </button>
              <span style={{ color: "var(--muted)", fontSize: 12, padding: ".4rem .8rem" }}>
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 5,
                  color: "var(--text)",
                  padding: ".4rem .8rem",
                  fontSize: 11,
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                  opacity: page === totalPages ? 0.5 : 1,
                }}
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}