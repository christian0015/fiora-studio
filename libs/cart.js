/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  Fiora — cart.js                                            ║
 * ║  Zustand store · localStorage persistence                   ║
 * ║  Actions : addItem · removeItem · updateQty · clearCart     ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/* ─────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────── */

/** Clé unique par ligne : id produit + taille choisie */
function lineKey(id, sizeLabel) {
  return `${id}__${sizeLabel ?? 'default'}`
}

/* ─────────────────────────────────────────────────────────────
   STORE
   ───────────────────────────────────────────────────────────── */
export const useCartStore = create(
  persist(
    (set, get) => ({

      /* ── State ─────────────────────────────────────────────── */
      items: [],   // CartItem[]

      /* ── Getters (dérivés) ─────────────────────────────────── */

      /** Nombre total d'articles (somme des quantités) */
      totalQty: () =>
        get().items.reduce((acc, it) => acc + it.qty, 0),

      /** Montant total en MAD */
      totalPrice: () =>
        get().items.reduce(
          (acc, it) => acc + (it.selectedSize?.price ?? it.price) * it.qty,
          0
        ),

      /** Vérifie si un produit (+ taille) est déjà dans le panier */
      hasItem: (id, sizeLabel) =>
        get().items.some(
          it => lineKey(it.id, it.selectedSize?.label) === lineKey(id, sizeLabel)
        ),

      /* ── Actions ───────────────────────────────────────────── */

      /**
       * Ajouter un article.
       * Si la même ligne (id + taille) existe déjà → incrémente qty.
       * @param {Object} flower        Objet fleur complet
       * @param {Object} selectedSize  { label, price, height, diameter }
       * @param {number} qty           Quantité à ajouter (défaut 1)
       */
      addItem: (flower, selectedSize, qty = 1) => {
        /* Compatibilité : l'ancien code passait flower avec selectedSize intégré */
        const size = selectedSize ?? flower.selectedSize ?? flower.sizes?.[0]
        const key  = lineKey(flower.id, size?.label)

        set(state => {
          const existing = state.items.find(
            it => lineKey(it.id, it.selectedSize?.label) === key
          )

          if (existing) {
            return {
              items: state.items.map(it =>
                lineKey(it.id, it.selectedSize?.label) === key
                  ? { ...it, qty: it.qty + qty }
                  : it
              ),
            }
          }

          return {
            items: [
              ...state.items,
              {
                /* Données produit utiles au panier */
                id:           flower.id,
                slug:         flower.slug,
                name:         flower.name,
                shortDescription: flower.shortDescription,
                price:        flower.price,
                images:       flower.images,
                category:     flower.category,
                /* Ligne */
                selectedSize: size,
                qty,
              },
            ],
          }
        })
      },

      /**
       * Supprimer une ligne du panier.
       * @param {number|string} id        id produit
       * @param {string}        sizeLabel label de la taille (ex: 'Moyen')
       */
      removeItem: (id, sizeLabel) => {
        const key = lineKey(id, sizeLabel)
        set(state => ({
          items: state.items.filter(
            it => lineKey(it.id, it.selectedSize?.label) !== key
          ),
        }))
      },

      /**
       * Mettre à jour la quantité d'une ligne.
       * Si qty ≤ 0 → supprime la ligne.
       * @param {number|string} id        id produit
       * @param {string}        sizeLabel label de la taille
       * @param {number}        qty       nouvelle quantité
       */
      updateQty: (id, sizeLabel, qty) => {
        const key = lineKey(id, sizeLabel)

        if (qty <= 0) {
          set(state => ({
            items: state.items.filter(
              it => lineKey(it.id, it.selectedSize?.label) !== key
            ),
          }))
          return
        }

        set(state => ({
          items: state.items.map(it =>
            lineKey(it.id, it.selectedSize?.label) === key
              ? { ...it, qty }
              : it
          ),
        }))
      },

      /** Vider entièrement le panier */
      clearCart: () => set({ items: [] }),
    }),

    /* ── Persistence localStorage ─────────────────────────────── */
    {
      name:    'i-cart',
      storage: createJSONStorage(() => localStorage),

      /* Ne persister que les items, pas les fonctions dérivées */
      partialize: (state) => ({ items: state.items }),
    }
  )
)