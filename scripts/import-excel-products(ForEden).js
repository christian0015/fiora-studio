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
const DELAY_BETWEEN_REQUESTS = 500;

// =========================
// MAPPING DES FEUILLES (version complète de ta version)
// =========================
const SHEET_MAPPING = {
  'Plantes': {
    category: 'plante',
    subcategory: null,
    flowerType: 'plante',
    tagsPrefix: ['plante', 'intérieur'],
    occasions: ['entreprise', 'anniversaire'],
    emotions: [{ name: 'calme', percentage: 85 }, { name: 'pureté', percentage: 75 }],
  },
  'Fleurs séchées': {
    category: 'fleur-sechee',
    subcategory: 'composition',
    flowerType: 'composition',
    tagsPrefix: ['fleurs séchées', 'décoration'],
    occasions: ['elegance', 'anniversaire'],
    emotions: [{ name: 'élégance', percentage: 88 }, { name: 'tendresse', percentage: 78 }],
  },
  'Rose Eternelles': {
    category: 'fleur-eternelle',
    subcategory: 'coffret',
    flowerType: 'rose',
    tagsPrefix: ['rose éternelle', 'cadeau'],
    occasions: ['romantique', 'mariage'],
    emotions: [{ name: 'amour', percentage: 95 }, { name: 'élégance', percentage: 90 }],
  },
  'Roses eternelle en transparence': {
    category: 'fleur-eternelle',
    subcategory: 'cadre',
    flowerType: 'rose',
    tagsPrefix: ['rose éternelle', 'luxe'],
    occasions: ['romantique', 'mariage'],
    emotions: [{ name: 'raffinement', percentage: 92 }, { name: 'élégance', percentage: 88 }],
  },
  'Celebrating Love': {
    category: 'fleur-fraiche',
    subcategory: 'bouquet',
    flowerType: 'rose',
    tagsPrefix: ['rose rouge', 'romantique'],
    occasions: ['romantique', 'anniversaire'],
    emotions: [{ name: 'amour', percentage: 98 }, { name: 'passion', percentage: 92 }],
  },
  'Petites Attentions': {
    category: 'fleur-eternelle',
    subcategory: 'coffret',
    flowerType: 'rose',
    tagsPrefix: ['cadeau', 'attention'],
    occasions: ['remerciement', 'anniversaire'],
    emotions: [{ name: 'tendresse', percentage: 85 }, { name: 'joie', percentage: 80 }],
  },
  'Celebrating Mums': {
    category: 'fleur-eternelle',
    subcategory: 'coffret',
    flowerType: 'rose',
    tagsPrefix: ['maman', 'cadeau'],
    occasions: ['remerciement'],
    emotions: [{ name: 'reconnaissance', percentage: 95 }, { name: 'tendresse', percentage: 88 }],
  },
  'Composition Bouquets Roses': {
    category: 'fleur-fraiche',
    subcategory: 'bouquet',
    flowerType: 'rose',
    tagsPrefix: ['rose', 'bouquet'],
    occasions: ['romantique', 'mariage'],
    emotions: [{ name: 'amour', percentage: 94 }, { name: 'joie', percentage: 82 }],
  },
  'Bouquets Compositions Fleurs': {
    category: 'fleur-fraiche',
    subcategory: 'composition',
    flowerType: 'composition',
    tagsPrefix: ['composition', 'bouquet'],
    occasions: ['elegance', 'entreprise'],
    emotions: [{ name: 'élégance', percentage: 88 }, { name: 'raffinement', percentage: 84 }],
  },
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
// EXTRACTION IMAGES (CORRIGÉE)
// =========================
function extractImagesByRow(workbook, worksheet) {
  const imagesMap = {};
  
  if (!workbook.model.media) return imagesMap;
  
  const images = worksheet.getImages();
  
  for (const image of images) {
    const media = workbook.model.media.find(m => m.index === image.imageId);
    if (!media) continue;
    
    const rowNumber = image.range.tl.nativeRow + 1;
    if (!imagesMap[rowNumber]) imagesMap[rowNumber] = [];
    
    imagesMap[rowNumber].push({
      buffer: media.buffer,
      extension: media.extension || 'png',
    });
  }
  
  return imagesMap;
}

// =========================
// DESCRIPTION
// =========================
function buildDescription(product, mapping) {
  if (product.description?.trim()) {
    let desc = product.description.trim();
    if (product.composition) desc += `\n\nComposition : ${product.composition}`;
    if (product.pricePerFlower) desc += `\n\nPrix par fleur : ${product.pricePerFlower}`;
    return desc;
  }
  
  let desc = `${product.name} — création florale Flora Studio.`;
  if (product.composition) desc = `Composition : ${product.composition}. ${desc}`;
  if (mapping.category === 'fleur-eternelle') desc += ` Rose éternelle premium.`;
  if (mapping.category === 'fleur-fraiche') desc += ` Fleurs fraîches sélectionnées.`;
  return desc;
}

function extractDimensions(description) {
  if (!description) return { height: 'Standard', diameter: 'Standard' };
  const heightMatch = description.match(/Hauteur\s*:\s*(\d+(?:[,.]?\d+)?)\s*cm/i);
  const diameterMatch = description.match(/(Diamètre|Largeur)\s*:\s*(\d+(?:[,.]?\d+)?)\s*cm/i);
  return {
    height: heightMatch ? `${heightMatch[1]} cm` : 'Standard',
    diameter: diameterMatch ? `${diameterMatch[2]} cm` : 'Standard',
  };
}

// =========================
// UPLOAD IMAGE
// =========================
async function uploadImage(imageBuffer, flowerName, index) {
  try {
    const base64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;
    const response = await axios.post(`${API_BASE_URL}/api/upload`, {
      images: [base64],
      flowerName: `${flowerName}-${index}`,
    });
    return response.data?.images?.[0]?.url || null;
  } catch (error) {
    console.error(`  ⚠ Upload failed: ${error.message}`);
    return null;
  }
}

// =========================
// CRÉATION PRODUIT
// =========================
async function createProduct(productData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/flowers`, productData);
    console.log(`  ✅ Créé : ${productData.name}`);
    return response.data;
  } catch (error) {
    console.error(`  ❌ Erreur : ${error.response?.data?.error || error.message}`);
    return null;
  }
}

// =========================
// TRAITEMENT FEUILLE (VERSION SÉQUENTIELLE SÉCURISÉE)
// =========================
async function processSheet(workbook, worksheet, mapping) {
  console.log(`\n📄 Feuille : ${worksheet.name}`);
  
  const headers = extractHeaders(worksheet);
  const imagesMap = extractImagesByRow(workbook, worksheet);
  
  // Récupérer toutes les lignes non vides d'abord
  const rows = [];
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const name = getCell(row, headers, ['Nom']);
    if (name?.trim()) rows.push({ row, rowNumber, name });
  });
  
  console.log(`  📋 ${rows.length} produits trouvés`);
  
  const createdProducts = [];
  
  // Traitement séquentiel (pas de risque d'async fou)
  for (const { row, rowNumber, name } of rows) {
    try {
      const description = getCell(row, headers, ['Description']);
      const composition = getCell(row, headers, ['Composition du bouquet', 'Composition']);
      const pricePerFlower = getCell(row, headers, ['Prix par fleur', 'Prix par fleurs']);
      const price = getCell(row, headers, ['Prix']);
      
      const uniqueSlug = `${slugify(name)}-${Date.now()}-${rowNumber}`;
      const dimensions = extractDimensions(description);
      
      // Upload des images
      const rowImages = imagesMap[rowNumber] || [];
      const uploadedImages = [];
      
      for (let i = 0; i < rowImages.length; i++) {
        console.log(`  📤 Upload image ${i + 1}/${rowImages.length} pour : ${name.substring(0, 30)}...`);
        const url = await uploadImage(rowImages[i].buffer, uniqueSlug, i);
        if (url) uploadedImages.push(url);
        await sleep(DELAY_BETWEEN_REQUESTS);
      }
      
      // Couleurs basées sur le nom
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
        shortDescription: name.length > 60 ? `${name.substring(0, 57)}...` : name,
        description: buildDescription({ name, description, composition, pricePerFlower }, mapping),
        price: cleanPrice(price),
        oldPrice: null,
        currency: 'MAD',
        stock: DEFAULT_STOCK,
        featured: Math.random() > 0.85,
        popular: true,
        premium: cleanPrice(price) >= 500,
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
          price: cleanPrice(price),
          height: dimensions.height,
          diameter: dimensions.diameter,
        }],
        images: uploadedImages,
        imagePublicIds: [],
        seo: {
          title: name,
          description: `✨ ${name} — Flora Studio, Casablanca.`,
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
  console.log('\n🚀 IMPORT FLORA STUDIO\n');
  
  const excelPath = process.argv[2];
  if (!excelPath) {
    console.log('❌ Usage: node scripts/import-excel-products.js chemin/fichier.xlsx');
    process.exit(1);
  }
  
  if (!fs.existsSync(excelPath)) {
    console.log('❌ Fichier introuvable');
    process.exit(1);
  }
  
  console.log(`📖 Lecture : ${excelPath}`);
  
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);
  
  let total = 0;
  
  for (const worksheet of workbook.worksheets) {
    const mapping = SHEET_MAPPING[worksheet.name];
    if (!mapping) {
      console.log(`⚠️ Feuille ignorée : ${worksheet.name}`);
      continue;
    }
    const created = await processSheet(workbook, worksheet, mapping);
    total += created.length;
  }
  
  console.log(`\n🎉 Import terminé ! ${total} produits créés.`);
}

main().catch(console.error);