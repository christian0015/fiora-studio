// scripts/import-excel-products.js
const ExcelJS = require('exceljs');
const axios = require('axios');
const fs = require('fs');
const slugifyLib = require('slugify');

// =========================
// CONFIG
// =========================
const API_BASE_URL = 'http://localhost:3000';
const DEFAULT_STOCK = 100;
const DELAY_BETWEEN_REQUESTS = 300;

// =========================
// ORDRE D'EXÉCUTION DES FEUILLES (INVERSÉ POUR AFFICHAGE CHRONOLOGIQUE)
// =========================
const DESIRED_SHEET_ORDER = [
  'Vases et Accessoires',
  'Plantes',
  'Collection petits bonheurs',
  'Fraicheur de Printemps',
  'Fleurs Séchées',
  'Roses Préservées',
  'Roses Fraiches',
];

// =========================
// MAPPING DES FEUILLES GLOVO
// =========================
const SHEET_MAPPING = {
  // Onglets ignorés explicitement
  'Promotions': null,
  'Top des ventes': null,
  'For your Love': null, // Ignoré (5 on saute)

  // 1. Fraîcheur de Saison (Anciennement Fleur Fraîche)
  'Roses Fraiches': {
    category: 'fraicheur-de-saison',
    subcategory: 'rose-fraiche',
    flowerType: 'rose',
    tagsPrefix: ['fraîcheur de saison', 'roses fraîches', 'rose'],
    occasions: ['romantique', 'anniversaire', 'mariage'],
    emotions: [{ name: 'amour', percentage: 95 }, { name: 'joie', percentage: 85 }],
  },
  'Fraicheur de Printemps': {
    category: 'fraicheur-de-saison',
    subcategory: 'autre-fleur',
    flowerType: 'composition',
    tagsPrefix: ['fraîcheur de saison', 'autres fleurs', 'printemps', 'bouquet'],
    occasions: ['anniversaire', 'remerciement', 'elegance'],
    emotions: [{ name: 'joie', percentage: 92 }, { name: 'fraîcheur', percentage: 88 }],
  },
  'Collection petits bonheurs': {
    category: 'fraicheur-de-saison',
    subcategory: 'autre-fleur',
    flowerType: 'composition',
    tagsPrefix: ['fraîcheur de saison', 'autres fleurs', 'petits bonheurs', 'bouquet'],
    occasions: ['anniversaire', 'remerciement', 'plaisir-d-offrir'],
    emotions: [{ name: 'joie', percentage: 90 }, { name: 'tendresse', percentage: 85 }],
  },

  // 2. Fleurs Séchées
  'Fleurs Séchées': {
    category: 'fleur-sechee',
    subcategory: 'composition',
    flowerType: 'composition',
    tagsPrefix: ['fleurs séchées', 'décoration'],
    occasions: ['elegance', 'anniversaire'],
    emotions: [{ name: 'élégance', percentage: 88 }, { name: 'tendresse', percentage: 78 }],
  },

  // 3. Roses Éternelles / Préservées
  'Roses Préservées': {
    category: 'fleur-eternelle',
    subcategory: 'coffret',
    flowerType: 'rose',
    tagsPrefix: ['rose éternelle', 'préservée', 'cadeau'],
    occasions: ['romantique', 'mariage', 'anniversaire'],
    emotions: [{ name: 'amour', percentage: 96 }, { name: 'élégance', percentage: 90 }],
  },

  // 4. Plantes
  'Plantes': {
    category: 'plante',
    subcategory: null,
    flowerType: 'plante',
    tagsPrefix: ['plante', 'intérieur', 'végétal'],
    occasions: ['entreprise', 'anniversaire', 'maison'],
    emotions: [{ name: 'calme', percentage: 85 }, { name: 'pureté', percentage: 75 }],
  },

  // 5. Objets déco / Vases et accessoires
  'Vases et Accessoires': {
    category: 'accessoire',
    subcategory: 'vase',
    flowerType: 'accessoire',
    tagsPrefix: ['vase', 'accessoire', 'décoration'],
    occasions: ['maison', 'elegance'],
    emotions: [{ name: 'élégance', percentage: 85 }],
  }
};

// =========================
// UTILITAIRES
// =========================
function slugify(text) {
  return slugifyLib(text || '', { lower: true, strict: true, trim: true });
}

function randomRating() {
  return +(4.5 + Math.random() * 0.5).toFixed(1);
}

function randomReviews() {
  return Math.floor(50 + Math.random() * 200);
}

function cleanPrice(price) {
  if (!price) return 0;
  const cleaned = String(price).replace(/[^\d.,]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =========================
// HEADERS NORMALISÉS
// =========================
function normalizeHeader(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function extractHeaders(worksheet) {
  const headers = {};
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headers[normalizeHeader(cell.text)] = colNumber;
  });
  return headers;
}

function getCell(row, headers, possibleNames) {
  for (const name of possibleNames) {
    const col = headers[normalizeHeader(name)];
    if (col) return row.getCell(col).text || '';
  }
  return '';
}

// =========================
// UPLOAD DE L'URL IMAGE VERS CLOUDINARY
// =========================
async function uploadImageUrl(imageUrl, flowerName) {
  if (!imageUrl || !imageUrl.startsWith('http')) return null;
  try {
    const response = await axios.post(`${API_BASE_URL}/api/upload`, {
      images: [imageUrl],
      flowerName: flowerName,
    });
    return response.data?.images?.[0]?.url || imageUrl;
  } catch (error) {
    console.warn(`  ⚠️ Échec upload Cloudinary pour l'URL, utilisation directe : ${imageUrl}`);
    return imageUrl;
  }
}

// =========================
// CRÉATION PRODUIT
// =========================
async function createProduct(productData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/flowers`, productData);
    console.log(`  ✅ Créé : ${productData.name} (${productData.price} MAD)`);
    return response.data;
  } catch (error) {
    console.error(`  ❌ Erreur : ${error.response?.data?.error || error.message}`);
    return null;
  }
}

// =========================
// TRAITEMENT FEUILLE
// =========================
async function processSheet(worksheet, mapping) {
  console.log(`\n📄 Traitement de la feuille : ${worksheet.name}`);
  
  const headers = extractHeaders(worksheet);
  const rows = [];

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const name = getCell(row, headers, ['Nom du produit', 'Nom']);
    if (name?.trim()) rows.push({ row, rowNumber, name });
  });

  console.log(`  📋 ${rows.length} produits trouvés`);

  const createdProducts = [];

  for (const { row, rowNumber, name } of rows) {
    try {
      const priceRaw = getCell(row, headers, ['Prix']);
      const oldPriceRaw = getCell(row, headers, ['Ancien Prix', 'Ancien prix']);
      const imageUrlRaw = getCell(row, headers, ['Source Image (URL / Chemin Local)', 'Source Image', 'Image']);

      const price = cleanPrice(priceRaw);
      const parsedOldPrice = cleanPrice(oldPriceRaw);
      const oldPrice = parsedOldPrice > 0 ? parsedOldPrice : null;

      const uniqueSlug = `${slugify(name)}-${Date.now()}-${rowNumber}`;

      const uploadedImages = [];
      if (imageUrlRaw) {
        console.log(`  📤 Traitement de l'image pour : ${name.substring(0, 30)}...`);
        const url = await uploadImageUrl(imageUrlRaw, uniqueSlug);
        if (url) uploadedImages.push(url);
      }

      const colors = [];
      const lower = name.toLowerCase();
      if (lower.includes('rose')) colors.push('rose');
      if (lower.includes('rouge')) colors.push('rouge');
      if (lower.includes('blanc')) colors.push('blanc');
      if (lower.includes('bleu')) colors.push('bleu');
      if (lower.includes('vert')) colors.push('vert');
      if (lower.includes('jaune')) colors.push('jaune');
      if (lower.includes('pourpre') || lower.includes('violet')) colors.push('violet');

      const productData = {
        name,
        slug: uniqueSlug,
        shortDescription: `${name} — Fiora Studio, Casablanca.`,
        description: `${name} — Création florale Fiora Studio Casablanca.`,
        price: price,
        oldPrice: oldPrice,
        currency: 'MAD',
        stock: DEFAULT_STOCK,
        featured: Math.random() > 0.85,
        popular: true,
        premium: price >= 500,
        rating: randomRating(),
        reviews: randomReviews(),
        category: mapping.category,
        subcategory: mapping.subcategory,
        flowerType: mapping.flowerType,
        tags: [...mapping.tagsPrefix],
        occasions: mapping.occasions,
        emotions: [...mapping.emotions],
        colors,
        sizes: [{
          label: 'Unique',
          price: price,
          height: 'Standard',
          diameter: 'Standard',
        }],
        images: uploadedImages,
        imagePublicIds: [],
        seo: {
          title: name,
          description: `✨ ${name} — Fiora Studio, Casablanca.`,
          keywords: [uniqueSlug, mapping.category, ...mapping.tagsPrefix],
        },
      };

      const created = await createProduct(productData);
      if (created) createdProducts.push(created);

      await sleep(DELAY_BETWEEN_REQUESTS);
    } catch (error) {
      console.error(`  ❌ Ligne ${rowNumber} erreur:`, error.message);
    }
  }

  return createdProducts;
}

// =========================
// MAIN
// =========================
async function main() {
  console.log('\n🚀 IMPORT FIORA STUDIO VERS MONGODB\n');

  const excelPath = process.argv[2];
  if (!excelPath) {
    console.log('❌ Usage: node scripts/import-excel-products.js catalogue_fiora_studio.xlsx');
    process.exit(1);
  }

  if (!fs.existsSync(excelPath)) {
    console.log('❌ Fichier introuvable');
    process.exit(1);
  }

  console.log(`📖 Lecture du fichier : ${excelPath}`);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);

  let total = 0;

  const orderedWorksheets = DESIRED_SHEET_ORDER
    .map(name => workbook.getWorksheet(name))
    .filter(Boolean);

  workbook.worksheets.forEach(sheet => {
    if (!orderedWorksheets.includes(sheet)) {
      orderedWorksheets.push(sheet);
    }
  });

  for (const worksheet of orderedWorksheets) {
    const mapping = SHEET_MAPPING[worksheet.name];

    if (mapping === null) {
      console.log(`\n⏭️ Onglet ignoré : ${worksheet.name}`);
      continue;
    }

    if (!mapping) {
      console.log(`\n⚠️ Feuille non mappée ignorée : ${worksheet.name}`);
      continue;
    }

    const created = await processSheet(worksheet, mapping);
    total += created.length;
  }

  console.log(`\n🎉 Import terminé ! ${total} produits créés dans MongoDB.`);
}

main().catch(console.error);