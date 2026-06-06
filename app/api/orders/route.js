// app/api/orders/route.js
import { NextResponse } from "next/server"
import { connectToDatabase } from "@/libs/mongoose"
import Order from "@/models/Order"
import { generateOrderReference } from "@/libs/checkout"

// ============================================================
// GET /api/orders
// Query params :
//   page, perPage, status, from, to
//   aggregate=revenue  → retourne le CA avec ventilation par statut
// ============================================================
export async function GET(request) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)

    // ── Mode agrégation (CA) ───────────────────────────────────
    if (searchParams.get("aggregate") === "revenue") {
      const from   = searchParams.get("from")
      const to     = searchParams.get("to")
      const status = searchParams.getAll("status") // peut être vide → tous

      const dateFilter = {}
      if (from) dateFilter.$gte = new Date(from)
      if (to)   dateFilter.$lte = new Date(to)

      const matchStage = {}
      if (Object.keys(dateFilter).length) matchStage.createdAt = dateFilter

      // Si status[] fourni, filtre ; sinon on exclut seulement "cancelled" et "refunded"
      if (status.length) {
        matchStage.status = { $in: status }
      }

      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id:            "$status",
            count:          { $sum: 1 },
            revenue:        { $sum: "$total" },
            avgOrderValue:  { $avg: "$total" },
          },
        },
        { $sort: { revenue: -1 } },
      ]

      const rows = await Order.aggregate(pipeline)

      const summary = {
        totalRevenue: rows.reduce((acc, r) => acc + r.revenue, 0),
        totalOrders:  rows.reduce((acc, r) => acc + r.count, 0),
        byStatus:     rows.map(r => ({
          status:         r._id,
          count:          r.count,
          revenue:        r.revenue,
          avgOrderValue:  Math.round(r.avgOrderValue * 100) / 100,
        })),
        period: {
          from: from || null,
          to:   to   || null,
        },
      }

      return NextResponse.json(summary)
    }

    // ── Mode liste paginée ─────────────────────────────────────
    const page    = parseInt(searchParams.get("page")    || "1")
    const perPage = parseInt(searchParams.get("perPage") || "20")
    const status  = searchParams.get("status") || ""
    const from    = searchParams.get("from")   || ""
    const to      = searchParams.get("to")     || ""

    const filter = {}
    if (status) filter.status = status

    if (from || to) {
      filter.createdAt = {}
      if (from) filter.createdAt.$gte = new Date(from)
      if (to)   filter.createdAt.$lte = new Date(to)
    }

    const total      = await Order.countDocuments(filter)
    const totalPages = Math.ceil(total / perPage)
    const safePage   = Math.max(1, Math.min(page, totalPages || 1))
    const skip       = (safePage - 1) * perPage

    const data = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean()

    return NextResponse.json({ data, total, page: safePage, perPage, totalPages })
  } catch (error) {
    console.error("GET /api/orders error:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders", details: error.message },
      { status: 500 }
    )
  }
}

// ============================================================
// POST /api/orders  — Créer une commande
// ============================================================
export async function POST(request) {
  try {
    await connectToDatabase()

    const body = await request.json()

    // Validation minimale
    if (!body.items || !Array.isArray(body.items) || !body.items.length) {
      return NextResponse.json(
        { error: "items is required and must be a non-empty array" },
        { status: 400 }
      )
    }
    if (!body.paymentMethod) {
      return NextResponse.json(
        { error: "paymentMethod is required" },
        { status: 400 }
      )
    }

    // Calculs côté serveur (ne pas faire confiance au client)
    const subtotal = body.items.reduce((acc, it) => acc + (it.price ?? 0) * (it.qty ?? 1), 0)
    const deliveryFee = body.deliveryFee ?? 0
    const total = subtotal + deliveryFee

    // Génération de la référence unique
    let reference = generateOrderReference()
    // Garantir l'unicité en cas de collision rare
    while (await Order.findOne({ reference })) {
      reference = generateOrderReference()
    }

    const orderData = {
      reference,
      customer: {
        firstName:  body.customer?.firstName  || "",
        lastName:   body.customer?.lastName   || "",
        fullName:   body.customer?.fullName   || `${body.customer?.firstName || ""} ${body.customer?.lastName || ""}`.trim(),
        email:      body.customer?.email      || "",
        phone:      body.customer?.phone      || "",
        address:    body.customer?.address    || "",
        city:       body.customer?.city       || "Casablanca",
        locale:     body.customer?.locale     || "fr",
      },
      items: body.items.map(it => ({
        flowerId:   it.flowerId   || it._id || it.id || "unknown",
        slug:       it.slug       || "",
        name:       it.name       || "",
        image:      it.image      || it.images?.[0] || "",
        price:      it.price      ?? 0,
        qty:        it.qty        ?? 1,
        size:       it.size       || it.selectedSize?.label || null,
        sizeHeight: it.sizeHeight || it.selectedSize?.height || null,
      })),
      subtotal,
      deliveryFee,
      total,
      currency:       body.currency       || "MAD",
      shippingMethod: body.shippingMethod || "casa_near",
      paymentMethod:  body.paymentMethod,
      paymentRef:     body.paymentRef     || "",
      status:         "pending",
      note:           body.note           || "",
      adminNote:      "",
    }

    const order = await Order.create(orderData)

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("POST /api/orders error:", error)
    return NextResponse.json(
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    )
  }
}