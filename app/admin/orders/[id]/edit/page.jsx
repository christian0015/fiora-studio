// app/admin/orders/[id]/edit/page.jsx
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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

const PAYMENT_METHOD_LABELS = {
  cash_on_delivery: "Paiement à la livraison",
  bank_transfer: "Virement bancaire",
  western_union: "Western Union",
  whatsapp: "WhatsApp",
  online: "Paiement en ligne",
}

const SHIPPING_METHOD_LABELS = {
  casablanca_free: "Casablanca (gratuit)",
  casablanca_paid: "Casablanca (payant)",
  marrakech: "Marrakech",
  other: "Autre ville",
}

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
      padding: "4px 12px",
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 500,
      background: `${STATUS_COLORS[status]}20`,
      color: STATUS_COLORS[status],
      border: `1px solid ${STATUS_COLORS[status]}40`,
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
      <label style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".04em" }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export default function EditOrderPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState("")
  const [adminNote, setAdminNote] = useState("")
  const [paymentRef, setPaymentRef] = useState("")

  useEffect(() => {
    if (id) {
      fetchOrder()
    }
  }, [id])

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/${id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
        setStatus(data.status)
        setAdminNote(data.adminNote || "")
        setPaymentRef(data.paymentRef || "")
      } else {
        router.push("/admin/orders")
      }
    } catch (error) {
      console.error("Failed to fetch order:", error)
      router.push("/admin/orders")
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(newStatus) {
    setStatus(newStatus)
    setSaving(true)
    try {
      const res = await fetch(`/api/orders/${order.reference || order._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      // Mettre à jour l'ordre local
      setOrder(prev => ({ ...prev, status: newStatus }))
    } catch (error) {
      console.error("Failed to update status:", error)
      alert("Erreur lors de la mise à jour du statut")
      setStatus(order.status)
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveNote() {
    setSaving(true)
    try {
      const res = await fetch(`/api/orders/${order.reference || order._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote, paymentRef }),
      })
      if (!res.ok) throw new Error()
      setOrder(prev => ({ ...prev, adminNote, paymentRef }))
      alert("Note enregistrée")
    } catch (error) {
      console.error("Failed to save note:", error)
      alert("Erreur lors de l'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
        <p style={{ fontSize: "1.5rem", marginBottom: ".5rem" }}>📦</p>
        <p style={{ fontSize: 12 }}>Chargement de la commande...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
        <p style={{ fontSize: "2rem", marginBottom: ".75rem", opacity: 0.3 }}>📦</p>
        <p style={{ fontSize: 14, color: "var(--text)", marginBottom: ".5rem" }}>Commande non trouvée</p>
        <Link href="/admin/orders" style={{ color: "var(--accent)", fontSize: 12 }}>← Retour aux commandes</Link>
      </div>
    )
  }

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">
            Commande {order.reference}
          </h1>
          <p className="page-sub">
            Créée le {formatDate(order.createdAt)}
          </p>
        </div>
        <Link href="/admin/orders" className="btn-primary" style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text)" }}>
          ← Retour
        </Link>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.25rem", alignItems: "start" }}>

        {/* COLONNE PRINCIPALE */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Statut actuel */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <SectionTitle>Statut actuel</SectionTitle>
              <div style={{ marginTop: ".5rem" }}>
                <StatusBadge status={order.status} />
              </div>
            </div>
            <div>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={saving}
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: 5,
                  color: "var(--text)",
                  padding: ".5rem .75rem",
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  cursor: "pointer",
                }}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Articles commandés */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "1.25rem" }}>
            <SectionTitle>Articles commandés</SectionTitle>
            <div style={{ marginTop: "1rem" }}>
              {order.items?.map((item, idx) => (
                <div key={idx} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: ".75rem 0",
                  borderBottom: idx !== order.items.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4, background: "var(--surface2)" }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: "var(--text)" }}>{item.name}</p>
                    <p style={{ fontSize: 11, color: "var(--muted)" }}>
                      {item.qty} × {formatPrice(item.price)}
                      {item.size && ` · Taille: ${item.size}`}
                    </p>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--accent)" }}>
                    {formatPrice(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totaux */}
            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: ".5rem" }}>
                <span style={{ color: "var(--muted)" }}>Sous-total</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: ".5rem" }}>
                <span style={{ color: "var(--muted)" }}>Livraison</span>
                <span>{formatPrice(order.deliveryFee || 0)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, marginTop: ".5rem", paddingTop: ".5rem", borderTop: "1px solid var(--border)" }}>
                <span style={{ color: "var(--text)", fontWeight: 500 }}>Total</span>
                <span style={{ color: "var(--accent)", fontWeight: 500 }}>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes admin */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "1.25rem" }}>
            <SectionTitle>Notes internes</SectionTitle>
            <div style={{ marginTop: "1rem" }}>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={4}
                placeholder="Notes internes pour cette commande (non visibles par le client)..."
                style={{
                  width: "100%",
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: 5,
                  color: "var(--text)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  padding: ".75rem",
                  resize: "vertical",
                }}
              />
              <button
                onClick={handleSaveNote}
                disabled={saving}
                style={{
                  marginTop: "1rem",
                  background: "var(--accent)",
                  color: "#0e0d0b",
                  border: "none",
                  borderRadius: 5,
                  padding: ".5rem 1rem",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  cursor: "pointer",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Enregistrement..." : "Enregistrer la note"}
              </button>
            </div>
          </div>
        </div>

        {/* COLONNE LATÉRALE */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Informations client */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "1.25rem" }}>
            <SectionTitle>Client</SectionTitle>
            <div style={{ marginTop: "1rem" }}>
              <p style={{ fontSize: 14, color: "var(--text)", marginBottom: ".25rem" }}>
                {order.customer?.fullName || `${order.customer?.firstName} ${order.customer?.lastName}`}
              </p>
              <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: ".25rem" }}>
                {order.customer?.email}
              </p>
              <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: ".25rem" }}>
                {order.customer?.phone}
              </p>
              <p style={{ fontSize: 11, color: "var(--muted)" }}>
                {order.customer?.address}, {order.customer?.city}
              </p>
            </div>
          </div>

          {/* Paiement */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "1.25rem" }}>
            <SectionTitle>Paiement</SectionTitle>
            <div style={{ marginTop: "1rem" }}>
              <p style={{ fontSize: 12, color: "var(--text)", marginBottom: ".25rem" }}>
                {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
              </p>
              {order.paymentRef && (
                <p style={{ fontSize: 11, color: "var(--accent)", marginTop: ".5rem" }}>
                  Réf: {order.paymentRef}
                </p>
              )}
              <div style={{ marginTop: ".75rem" }}>
                <Field label="Référence de paiement (MTCN, virement, etc.)">
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="ex: MTCN 1234567890"
                    style={{
                      width: "100%",
                      background: "var(--surface2)",
                      border: "1px solid var(--border)",
                      borderRadius: 5,
                      color: "var(--text)",
                      padding: ".5rem .75rem",
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Livraison */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "1.25rem" }}>
            <SectionTitle>Livraison</SectionTitle>
            <div style={{ marginTop: "1rem" }}>
              <p style={{ fontSize: 12, color: "var(--text)" }}>
                {SHIPPING_METHOD_LABELS[order.shippingMethod] || order.shippingMethod}
              </p>
              <p style={{ fontSize: 11, color: "var(--muted)", marginTop: ".5rem" }}>
                Frais de livraison: {formatPrice(order.deliveryFee || 0)}
              </p>
            </div>
          </div>

          {/* Note client */}
          {order.note && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "1.25rem" }}>
              <SectionTitle>Note du client</SectionTitle>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: ".5rem", fontStyle: "italic" }}>
                "{order.note}"
              </p>
            </div>
          )}

          {/* Métadonnées */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "1.25rem" }}>
            <SectionTitle>Métadonnées</SectionTitle>
            <div style={{ marginTop: "1rem", fontSize: 11, color: "var(--muted)" }}>
              <p>Créée le: {formatDate(order.createdAt)}</p>
              <p>Dernière modification: {formatDate(order.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}