// app/admin/flowers/[id]/edit/page.jsx
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

// Constantes (depuis data.js)
const OCCASIONS_LIST = [
  "romantique", "anniversaire", "mariage", "excuses", "elegance", "entreprise"
]

const EMOTIONS_LIST = [
  "amour", "élégance", "tendresse", "calme", "joie", "passion",
  "désir", "sincérité", "reconnaissance", "prestige", "pureté",
  "espoir", "raffinement", "célébration", "solennité", "admiration", "sobriété"
]

const CATEGORIES = [
  { slug: "fleur-fraiche", label: "Fleur Fraîche", subs: ["bouquet", "composition", "vrac"] },
  { slug: "fleur-eternelle", label: "Fleur Éternelle", subs: ["bouquet", "coffret", "cadre"] },
  { slug: "fleur-sechee", label: "Fleur Séchée", subs: ["bouquet", "composition"] },
  { slug: "plante", label: "Plante", subs: [] },
]

const SUBCATEGORY_LABELS = {
  bouquet: "Bouquets",
  composition: "Compositions",
  vrac: "À la tige",
  coffret: "Coffrets",
  cadre: "Cadres fleuris",
}

const SIZE_LABELS = ["Petit", "Moyen", "Grand", "Xxl"]

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// ─────────────────────────────────────────────────────────────
// Composants UI (design V2)
// ─────────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <p style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", paddingBottom: ".5rem", borderBottom: "1px solid var(--border)" }}>
      {children}
    </p>
  )
}

function Field({ label, required, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
      <label style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".04em" }}>
        {label} {required && <span style={{ color: "var(--danger)" }}>*</span>}
      </label>
      {children}
    </div>
  )
}

function Input({ style, ...props }) {
  return (
    <input
      style={{
        background: "var(--surface2)",
        border: "1px solid var(--border)",
        borderRadius: 5,
        color: "var(--text)",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        padding: ".5rem .75rem",
        outline: "none",
        width: "100%",
        transition: "border-color .15s",
        ...style,
      }}
      {...props}
    />
  )
}

function Textarea({ rows = 4, style, ...props }) {
  return (
    <textarea
      rows={rows}
      style={{
        background: "var(--surface2)",
        border: "1px solid var(--border)",
        borderRadius: 5,
        color: "var(--text)",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        padding: ".5rem .75rem",
        outline: "none",
        width: "100%",
        resize: "vertical",
        lineHeight: 1.6,
        ...style,
      }}
      {...props}
    />
  )
}

function Select({ children, style, ...props }) {
  return (
    <select
      style={{
        background: "var(--surface2)",
        border: "1px solid var(--border)",
        borderRadius: 5,
        color: "var(--text)",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        padding: ".5rem .75rem",
        outline: "none",
        width: "100%",
        cursor: "pointer",
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
  )
}

function TagInput({ value, onChange, placeholder }) {
  const [input, setInput] = useState("")

  const add = () => {
    const v = input.trim()
    if (v && !value.includes(v)) onChange([...value, v])
    setInput("")
  }

  return (
    <div>
      <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem" }}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
          placeholder={placeholder}
        />
        <button
          type="button"
          style={{ fontSize: 11, color: "var(--muted)", background: "transparent", border: "1px solid var(--border)", borderRadius: 5, padding: ".4rem .75rem", cursor: "pointer" }}
          onClick={add}
        >
          ＋
        </button>
      </div>
      {value.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".35rem" }}>
          {value.map((t) => (
            <span
              key={t}
              style={{ display: "inline-flex", alignItems: "center", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 4, padding: ".2rem .5rem", fontSize: 11, color: "var(--muted)" }}
            >
              {t}
              <button
                type="button"
                onClick={() => onChange(value.filter(x => x !== t))}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", marginLeft: 4, padding: 0, fontSize: 11 }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function CheckboxGroup({ options, value, onChange }) {
  const toggle = (v) => {
    if (value.includes(v)) onChange(value.filter(x => x !== v))
    else onChange([...value, v])
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          style={{
            fontSize: 11,
            borderRadius: 4,
            border: "1px solid",
            padding: ".3rem .65rem",
            cursor: "pointer",
            transition: ".12s",
            background: value.includes(opt) ? "rgba(201,169,110,.15)" : "var(--surface2)",
            borderColor: value.includes(opt) ? "var(--accent)" : "var(--border)",
            color: value.includes(opt) ? "var(--accent)" : "var(--muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function EmotionsEditor({ emotions, onChange }) {
  const update = (name, pct) => {
    const exists = emotions.find(e => e.name === name)
    if (pct === 0) {
      onChange(emotions.filter(e => e.name !== name))
    } else if (exists) {
      onChange(emotions.map(e => e.name === name ? { ...e, percentage: Number(pct) } : e))
    } else {
      onChange([...emotions, { name, percentage: Number(pct) }])
    }
  }

  const getVal = (name) => emotions.find(e => e.name === name)?.percentage ?? 0

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
      {EMOTIONS_LIST.map(em => {
        const val = getVal(em)
        const active = val > 0
        return (
          <div key={em} style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
            <span style={{ width: 100, fontSize: 11, color: active ? "var(--text)" : "var(--muted)", flexShrink: 0 }}>
              {em}
            </span>
            <input
              type="range"
              min={0} max={100} step={5}
              value={val}
              onChange={(e) => update(em, Number(e.target.value))}
              style={{
                flex: 1,
                accentColor: "var(--accent)",
                height: 3,
                borderRadius: 2,
                outline: "none",
                cursor: "pointer",
              }}
            />
            <span style={{ minWidth: 34, fontSize: 11, textAlign: "right", color: active ? "var(--accent)" : "var(--muted)" }}>
              {val}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

function SizesEditor({ sizes, onChange }) {
  const update = (i, field, val) => {
    const next = sizes.map((s, idx) => idx === i ? { ...s, [field]: val } : s)
    onChange(next)
  }

  const add = () => {
    const nextLabel = SIZE_LABELS[sizes.length] ?? `Taille ${sizes.length + 1}`
    onChange([...sizes, { label: nextLabel, price: "", height: "", diameter: "" }])
  }

  const remove = (i) => onChange(sizes.filter((_, idx) => idx !== i))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
      {sizes.map((sz, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
          <Select value={sz.label} onChange={(e) => update(i, "label", e.target.value)} style={{ width: 90 }}>
            {SIZE_LABELS.map(l => <option key={l}>{l}</option>)}
          </Select>
          <Input
            type="number"
            placeholder="Prix MAD"
            value={sz.price}
            onChange={(e) => update(i, "price", e.target.value)}
            style={{ width: 110 }}
          />
          <Input
            placeholder="Hauteur"
            value={sz.height}
            onChange={(e) => update(i, "height", e.target.value)}
            style={{ flex: 1 }}
          />
          <Input
            placeholder="Diamètre"
            value={sz.diameter}
            onChange={(e) => update(i, "diameter", e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            style={{ width: 26, height: 26, borderRadius: 4, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ✕
          </button>
        </div>
      ))}
      {sizes.length < 4 && (
        <button
          type="button"
          onClick={add}
          style={{ fontSize: 11, color: "var(--muted)", background: "transparent", border: "1px solid var(--border)", borderRadius: 5, padding: ".4rem .75rem", cursor: "pointer", width: "fit-content" }}
        >
          ＋ Ajouter une taille
        </button>
      )}
    </div>
  )
}

function ImagePreview({ images, onRemove, uploading }) {
  return (
    <div>
      <div
        style={{
          border: "1px dashed var(--border)",
          borderRadius: 6,
          padding: "2rem",
          textAlign: "center",
          background: "var(--surface2)",
        }}
      >
        <span style={{ fontSize: "1.5rem", color: "var(--muted)", display: "block", marginBottom: ".5rem" }}>⊕</span>
        <p style={{ fontSize: 12, color: "var(--muted)" }}>
          {uploading ? "Upload en cours..." : "Ajouter des images — glisser ou cliquer"}
        </p>
        <p style={{ fontSize: 10, color: "var(--muted)", opacity: 0.6, marginTop: ".25rem" }}>
          PNG, JPG, WEBP · Les nouvelles images s'ajoutent à la suite
        </p>
      </div>

      {images.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", marginTop: ".75rem" }}>
          {images.map((img, idx) => (
            <div key={idx} style={{ position: "relative", width: 80, height: 80, borderRadius: 5, overflow: "hidden", border: "1px solid var(--border)" }}>
              <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {idx === 0 && <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(201,169,110,.85)", fontSize: 9, textAlign: "center", padding: "2px 0", color: "#0e0d0b" }}>Principal</span>}
              <button
                type="button"
                onClick={() => onRemove(idx)}
                style={{ position: "absolute", top: 3, right: 3, width: 18, height: 18, borderRadius: 3, background: "rgba(14,13,11,.75)", border: "none", color: "var(--text)", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────────────────────────

export default function EditFlowerPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [formData, setFormData] = useState(null)
  const [subcategories, setSubcategories] = useState([])

  useEffect(() => {
    if (slug) {
      fetchFlower()
    }
  }, [slug])

  async function fetchFlower() {
    try {
      const res = await fetch(`/api/flowers/${slug}`)
      if (res.ok) {
        const flower = await res.json()
        setFormData({
          ...flower,
          tags: Array.isArray(flower.tags) ? flower.tags : (flower.tags ? flower.tags.split(",").map(t => t.trim()) : []),
          colors: Array.isArray(flower.colors) ? flower.colors : (flower.colors ? flower.colors.split(",").map(c => c.trim()) : []),
          seo: {
            title: flower.seo?.title || "",
            description: flower.seo?.description || "",
            keywords: Array.isArray(flower.seo?.keywords) ? flower.seo.keywords : (flower.seo?.keywords ? flower.seo.keywords.split(",").map(k => k.trim()) : []),
          },
        })
        updateSubcategories(flower.category)
      } else {
        router.push("/admin/flowers")
      }
    } catch (error) {
      console.error("Failed to fetch flower:", error)
      router.push("/admin/flowers")
    } finally {
      setLoading(false)
    }
  }

  function updateSubcategories(categorySlug) {
    const cat = CATEGORIES.find(c => c.slug === categorySlug)
    setSubcategories(cat?.subs || [])
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  function handleCategory(catSlug) {
    setFormData(prev => ({
      ...prev,
      category: catSlug,
      subcategory: "",
    }))
    updateSubcategories(catSlug)
  }

  function handleOccasionToggle(occasion) {
    setFormData(prev => ({
      ...prev,
      occasions: prev.occasions?.includes(occasion)
        ? prev.occasions.filter(o => o !== occasion)
        : [...(prev.occasions || []), occasion],
    }))
  }

  function handleEmotionChange(emotionName, percentage) {
    setFormData(prev => {
      const existing = prev.emotions?.find(e => e.name === emotionName)
      if (existing) {
        if (percentage === 0) {
          return {
            ...prev,
            emotions: prev.emotions.filter(e => e.name !== emotionName),
          }
        }
        return {
          ...prev,
          emotions: prev.emotions.map(e =>
            e.name === emotionName ? { ...e, percentage: parseInt(percentage) } : e
          ),
        }
      }
      if (percentage > 0) {
        return {
          ...prev,
          emotions: [...(prev.emotions || []), { name: emotionName, percentage: parseInt(percentage) }],
        }
      }
      return prev
    })
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files)
    if (files.length === 0 || !formData) return

    setUploadingImages(true)
    const tempPreviewUrls = files.map(file => URL.createObjectURL(file))

    // Preview immédiate
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...tempPreviewUrls],
    }))

    try {
      const uploadedUrls = []
      const uploadedPublicIds = []

      for (const file of files) {
        const base64 = await fileToBase64(file)
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: [base64],
            flowerName: formData.name,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          if (data.images && data.images[0]) {
            uploadedUrls.push(data.images[0].url)
            uploadedPublicIds.push(data.images[0].publicId)
          }
        }
      }

      // Replace preview URLs with real Cloudinary URLs
      setFormData(prev => {
        const newImages = [...prev.images]
        uploadedUrls.forEach((url, idx) => {
          const previewIndex = newImages.findIndex(img => img.startsWith("blob:"))
          if (previewIndex !== -1) newImages[previewIndex] = url
        })
        return {
          ...prev,
          images: newImages,
          imagePublicIds: [...(prev.imagePublicIds || []), ...uploadedPublicIds],
        }
      })
    } catch (error) {
      console.error("Upload error:", error)
      alert("Erreur lors de l'upload")
    } finally {
      setUploadingImages(false)
    }
  }

  function removeImage(index) {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePublicIds: prev.imagePublicIds?.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)

    const submitData = {
      name: formData.name,
      shortDescription: formData.shortDescription,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
      stock: parseInt(formData.stock) || 0,
      featured: formData.featured,
      popular: formData.popular,
      premium: formData.premium,
      category: formData.category,
      subcategory: formData.subcategory || null,
      flowerType: formData.flowerType || "composition",
      tags: formData.tags,
      occasions: formData.occasions || [],
      emotions: formData.emotions || [],
      colors: formData.colors,
      sizes: (formData.sizes || []).map(sz => ({
        ...sz,
        price: parseFloat(sz.price) || 0,
      })),
      images: formData.images,
      imagePublicIds: formData.imagePublicIds,
      seo: {
        title: formData.seo?.title || "",
        description: formData.seo?.description || "",
        keywords: formData.seo?.keywords || [],
      },
    }

    // Nettoyer les champs undefined
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === undefined) delete submitData[key]
    })

    try {
      const res = await fetch(`/api/flowers/${formData.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      if (res.ok) {
        router.push("/admin/flowers")
      } else {
        const error = await res.json()
        alert(error.error || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      alert("Erreur réseau")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Supprimer définitivement "${formData.name}" ? Cette action est irréversible.`)) return

    try {
      const res = await fetch(`/api/flowers/${formData.slug}`, { method: "DELETE" })
      if (res.ok) {
        router.push("/admin/flowers")
      } else {
        alert("Erreur lors de la suppression")
      }
    } catch (error) {
      alert("Erreur réseau")
    }
  }

  async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
        <p style={{ fontSize: "1.5rem", marginBottom: ".5rem" }}>❀</p>
        <p style={{ fontSize: 12 }}>Chargement...</p>
      </div>
    )
  }

  if (!formData) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
        <p style={{ fontSize: "2rem", marginBottom: ".75rem", opacity: 0.3 }}>❀</p>
        <p style={{ fontSize: 14, color: "var(--text)", marginBottom: ".5rem" }}>Fleur non trouvée</p>
      </div>
    )
  }

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Modifier: {formData.name}</h1>
          <p className="page-sub">
            <span style={{ color: "var(--muted)" }}>slug : </span>
            <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{formData.slug}</span>
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.25rem", alignItems: "start" }}>

          {/* COLONNE PRINCIPALE */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Identité */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <SectionTitle>Identité</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Field label="Nom de la fleur" required>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Field>
                <Field label="Type de fleur">
                  <Input
                    type="text"
                    name="flowerType"
                    value={formData.flowerType || ""}
                    onChange={handleChange}
                    placeholder="ex: rose, pivoine"
                  />
                </Field>
              </div>

              <Field label="Description courte" required>
                <Input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                />
              </Field>

              <Field label="Description longue">
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                />
              </Field>
            </div>

            {/* Images */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <SectionTitle>
                Images <span style={{ color: "var(--accent)" }}>*</span>
                <span style={{ color: "var(--muted)", fontWeight: 400, marginLeft: 8, fontSize: 10 }}>
                  {formData.images?.length || 0} fichier{(formData.images?.length || 0) !== 1 ? "s" : ""}
                </span>
              </SectionTitle>
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                  style={{ marginBottom: "1rem", color: "var(--text)" }}
                />
                {uploadingImages && <p style={{ color: "var(--accent)", fontSize: 11 }}>Upload en cours...</p>}
              </div>
              <ImagePreview
                images={formData.images || []}
                onRemove={removeImage}
                uploading={uploadingImages}
              />
            </div>

            {/* Prix & Stock */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <SectionTitle>Prix & Stock</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <Field label="Prix (MAD)">
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </Field>
                <Field label="Ancien prix (barré)">
                  <Input
                    type="number"
                    name="oldPrice"
                    value={formData.oldPrice || ""}
                    onChange={handleChange}
                  />
                </Field>
                <Field label="Stock">
                  <Input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                  />
                </Field>
              </div>

              <Field label="Déclinaisons de taille (optionnel)">
                <SizesEditor
                  sizes={formData.sizes || []}
                  onChange={(sizes) => setFormData(prev => ({ ...prev, sizes }))}
                />
              </Field>
            </div>

            {/* Émotions */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <SectionTitle>Palette émotionnelle</SectionTitle>
              <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: ".25rem" }}>
                Seules les émotions &gt; 0 sont enregistrées.
              </p>
              <EmotionsEditor
                emotions={formData.emotions || []}
                onChange={(emotions) => setFormData(prev => ({ ...prev, emotions }))}
              />
            </div>

            {/* SEO */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <SectionTitle>SEO</SectionTitle>
              <Field label="Titre SEO">
                <Input
                  type="text"
                  value={formData.seo?.title || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, title: e.target.value } }))}
                  placeholder="≤ 60 caractères"
                />
              </Field>
              <Field label="Meta description">
                <Textarea
                  rows={2}
                  value={formData.seo?.description || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, description: e.target.value } }))}
                  placeholder="≤ 160 caractères"
                />
              </Field>
              <Field label="Mots-clés">
                <TagInput
                  value={formData.seo?.keywords || []}
                  onChange={(keywords) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, keywords } }))}
                  placeholder="Ajouter un mot-clé..."
                />
              </Field>
            </div>
          </div>

          {/* COLONNE LATÉRALE */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Submit button */}
            <button
              type="submit"
              disabled={saving || uploadingImages}
              style={{
                width: "100%",
                background: "var(--accent)",
                color: "#0e0d0b",
                border: "none",
                borderRadius: 5,
                padding: ".85rem",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: ".06em",
                cursor: (saving || uploadingImages) ? "not-allowed" : "pointer",
                opacity: (saving || uploadingImages) ? 0.6 : 1,
              }}
            >
              {saving ? "Sauvegarde..." : "✦ Sauvegarder les modifications"}
            </button>

            {/* Publication */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <SectionTitle>Publication</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
                {[
                  ["featured", "Vedette", "Mise en avant sur la homepage"],
                  ["popular", "Populaire", "Affiché dans les suggestions"],
                  ["premium", "Premium", "Badge premium sur la fiche produit"],
                ].map(([key, label, sub]) => (
                  <label key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", padding: ".35rem 0" }}>
                    <div>
                      <p style={{ fontSize: 12, color: "var(--text)" }}>{label}</p>
                      <p style={{ fontSize: 10, color: "var(--muted)" }}>{sub}</p>
                    </div>
                    <div style={{ position: "relative", width: 34, height: 18, borderRadius: 9, border: "1px solid", background: formData[key] ? "rgba(201,169,110,.3)" : "var(--surface2)", borderColor: formData[key] ? "var(--accent)" : "var(--border)", transition: ".2s" }}>
                      <div style={{
                        position: "absolute",
                        top: 2,
                        left: 2,
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        transition: "transform .2s",
                        transform: formData[key] ? "translateX(16px)" : "translateX(0)",
                        background: formData[key] ? "var(--accent)" : "var(--muted)",
                      }} />
                    </div>
                    <input
                      type="checkbox"
                      name={key}
                      checked={formData[key]}
                      onChange={handleChange}
                      style={{ display: "none" }}
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Catégorisation */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <SectionTitle>Catégorisation</SectionTitle>
              <Field label="Catégorie">
                <Select value={formData.category} onChange={(e) => handleCategory(e.target.value)}>
                  {CATEGORIES.map(cat => (
                    <option key={cat.slug} value={cat.slug}>{cat.label}</option>
                  ))}
                </Select>
              </Field>

              {subcategories.length > 0 && (
                <Field label="Sous-catégorie">
                  <Select
                    name="subcategory"
                    value={formData.subcategory || ""}
                    onChange={handleChange}
                  >
                    <option value="">— Sélectionner —</option>
                    {subcategories.map(sub => (
                      <option key={sub} value={sub}>{SUBCATEGORY_LABELS[sub] || sub}</option>
                    ))}
                  </Select>
                </Field>
              )}
            </div>

            {/* Occasions */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <SectionTitle>Occasions</SectionTitle>
              <CheckboxGroup
                options={OCCASIONS_LIST}
                value={formData.occasions || []}
                onChange={(occasions) => setFormData(prev => ({ ...prev, occasions }))}
              />
            </div>

            {/* Tags */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <SectionTitle>Tags</SectionTitle>
              <TagInput
                value={formData.tags || []}
                onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                placeholder="Ajouter un tag..."
              />
            </div>

            {/* Couleurs */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <SectionTitle>Couleurs</SectionTitle>
              <TagInput
                value={formData.colors || []}
                onChange={(colors) => setFormData(prev => ({ ...prev, colors }))}
                placeholder="Ajouter une couleur..."
              />
            </div>

            {/* Danger zone */}
            <div style={{ background: "var(--surface)", border: "1px solid rgba(196,133,122,.2)", borderRadius: 6, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <SectionTitle>Zone de danger</SectionTitle>
              <p style={{ fontSize: 11, color: "var(--muted)" }}>
                La suppression est irréversible. Les images Cloudinary associées seront également supprimées.
              </p>
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(196,133,122,.4)",
                  color: "var(--danger)",
                  borderRadius: 5,
                  padding: ".55rem 1rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  cursor: "pointer",
                  width: "100%",
                  letterSpacing: ".04em",
                  transition: ".15s",
                }}
              >
                ✕ Supprimer cette fleur
              </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  )
}