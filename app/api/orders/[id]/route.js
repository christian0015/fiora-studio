// app/api/orders/[id]/route.js
import { NextResponse } from "next/server"
import { connectToDatabase } from "@/libs/mongoose"
import Order from "@/models/Order"
import mongoose from "mongoose"

/**
 * Résoudre un identifiant : MongoDB ObjectId OU référence humaine (FS-...)
 */
function buildQuery(id) {
  if (mongoose.Types.ObjectId.isValid(id)) return { _id: id }
  return { reference: id }
}

// ============================================================
// GET /api/orders/[id]
// ============================================================
export async function GET(request, { params }) {
  try {
    await connectToDatabase()
    const { id } = await params

    const order = await Order.findOne(buildQuery(id)).lean()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch order", details: error.message },
      { status: 500 }
    )
  }
}

// ============================================================
// PUT /api/orders/[id]
// Mise à jour partielle : status, adminNote, paymentRef, customer, etc.
// ============================================================
export async function PUT(request, { params }) {
  try {
    await connectToDatabase()
    const { id }   = await params
    const body     = await request.json()

    const ALLOWED_STATUS = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]

    // Validation statut si fourni
    if (body.status && !ALLOWED_STATUS.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${ALLOWED_STATUS.join(", ")}` },
        { status: 400 }
      )
    }

    // Champs modifiables (whitelist)
    const update = {}
    if (body.status)      update.status      = body.status
    if (body.adminNote !== undefined) update.adminNote = body.adminNote
    if (body.paymentRef)  update.paymentRef  = body.paymentRef
    if (body.note !== undefined)      update.note      = body.note
    if (body.customer)    update.customer    = body.customer
    if (body.shippingMethod) update.shippingMethod = body.shippingMethod

    const updated = await Order.findOneAndUpdate(
      buildQuery(id),
      { $set: update },
      { new: true, runValidators: true }
    ).lean()

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT /api/orders/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update order", details: error.message },
      { status: 500 }
    )
  }
}

// ============================================================
// DELETE /api/orders/[id]
// Suppression définitive — à restreindre côté auth en production
// ============================================================
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase()
    const { id } = await params

    const deleted = await Order.findOneAndDelete(buildQuery(id))

    if (!deleted) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Order deleted", reference: deleted.reference })
  } catch (error) {
    console.error("DELETE /api/orders/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete order", details: error.message },
      { status: 500 }
    )
  }
}