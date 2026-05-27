// scripts/import-excel-products.js
// Installation préalable : npm install exceljs axios form-data

const ExcelJS = require('exceljs');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'http://localhost:3000'; // À adapter si besoin
const DEFAULT_STOCK = 100;
const DELAY_BETWEEN_REQUESTS = 500; // ms entre chaque upload pour éviter surcharge

// Mapping feuille → catégorie + sous-catégorie + occasions par défaut
const SHEET_MAPPING = {
  'Plantes': {
    category: 'plante',
    subcategory: null,
    defaultOccasions: ['elegance', 'entreprise', 'anniversaire'],
    defaultEmotions: [
      { name: 'calme', percentage: 85 },
      { name: 'pureté', percentage: 70 },
      { name: 'espoir', percentage: 65 },
    ],
    flowerType: 'plante',
    tagsPrefix: ['plante', 'intérieur', 'dépolluante'],
  },
  'Fleurs séchées': {
    category: 'fleur-sechee',
    subcategory: 'composition',
    defaultOccasions: ['elegance', 'anniversaire', 'remerciement'],
    defaultEmotions: [
      { name: 'calme', percentage: 80 },
      { name: 'élégance', percentage: 75 },
      { name: 'tendresse', percentage: 70 },
    ],
    flowerType: 'composition',
    tagsPrefix: ['fleurs séchées', 'composition', 'décoration'],
  },
  'Rose Eternelles': {
    category: 'fleur-eternelle',
    subcategory: 'coffret',
    defaultOccasions: ['romantique', 'anniversaire', 'mariage'],
    defaultEmotions: [
      { name: 'amour', percentage: 90 },
      { name: 'élégance', percentage: 85 },
      { name: 'pureté', percentage: 80 },
    ],
    flowerType: 'rose',
    tagsPrefix: ['rose éternelle', 'cadeau', 'premium'],
  },
  'Roses eternelle en transparence': {
    category: 'fleur-eternelle',
    subcategory: 'cadre',
    defaultOccasions: ['romantique', 'anniversaire', 'mariage'],
    defaultEmotions: [
      { name: 'amour', percentage: 88 },
      { name: 'élégance', percentage: 90 },
      { name: 'raffinement', percentage: 85 },
    ],
    flowerType: 'rose',
    tagsPrefix: ['rose éternelle', 'sous cloche', 'luxe'],
  },
  'Celebrating Love': {
    category: 'fleur-fraiche',
    subcategory: 'bouquet',
    defaultOccasions: ['romantique', 'anniversaire', 'mariage'],
    defaultEmotions: [
      { name: 'amour', percentage: 98 },
      { name: 'passion', percentage: 95 },
      { name: 'désir', percentage: 90 },
    ],
    flowerType: 'rose',
    tagsPrefix: ['rose rouge', 'bouquet', 'romantique'],
  },
  'Petites Attentions': {
    category: 'fleur-eternelle',
    subcategory: 'coffret',
    defaultOccasions: ['anniversaire', 'remerciement', 'excuses'],
    defaultEmotions: [
      { name: 'tendresse', percentage: 85 },
      { name: 'sincérité', percentage: 80 },
      { name: 'joie', percentage: 75 },
    ],
    flowerType: 'rose',
    tagsPrefix: ['mini rose', 'petite attention', 'cadeau'],
  },
  'Celebrating Mums': {
    category: 'fleur-eternelle',
    subcategory: 'coffret',
    defaultOccasions: ['anniversaire', 'remerciement'],
    defaultEmotions: [
      { name: 'reconnaissance', percentage: 95 },
      { name: 'tendresse', percentage: 90 },
      { name: 'joie', percentage: 85 },
    ],
    flowerType: 'rose',
    tagsPrefix: ['rose éternelle', 'box', 'cadeau'],
  },
  'Composition Bouquets Roses': {
    category: 'fleur-fraiche',
    subcategory: 'bouquet',
    defaultOccasions: ['romantique', 'anniversaire', 'mariage', 'excuses'],
    defaultEmotions: [
      { name: 'amour', percentage: 95 },
      { name: 'passion', percentage: 85 },
      { name: 'joie', percentage: 80 },
    ],
    flowerType: 'rose',
    tagsPrefix: ['rose', 'bouquet', 'fleurs fraîches'],
  },
  'Bouquets Compositions Fleurs': {
    category: 'fleur-fraiche',
    subcategory: 'composition',
    defaultOccasions: ['romantique', 'anniversaire', 'elegance', 'entreprise'],
    defaultEmotions: [
      { name: 'élégance', percentage: 88 },
      { name: 'joie', percentage: 82 },
      { name: 'raffinement', percentage: 80 },
    ],
    flowerType: 'composition',
    tagsPrefix: ['bouquet', 'composition', 'fleurs fraîches'],
  },
};

// Fonctions utilitaires
function generateRandomRating() {
  return +(4.5 + Math.random() * 0.5).toFixed(1);
}

function generateRandomReviews() {
  return Math.floor(50 + Math.random() * 200);
}

function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function cleanPrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = String(priceStr)
    .replace(/[^\d.,]/g, '')
    .replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num);
}

function extractDimensions(description) {
  if (!description) return { height: '', diameter: '' };
  const heightMatch = description.match(/Hauteur\s*:\s*(\d+(?:[,.]?\d+)?)\s*(?:cm|centimètres)/i);
  const widthMatch = description.match(/(?:Largeur|Diamètre|Diametre)\s*:\s*(\d+(?:[,.]?\d+)?)\s*(?:cm|centimètres)/i);
  return {
    height: heightMatch ? `${heightMatch[1]} cm` : '',
    diameter: widthMatch ? `${widthMatch[1]} cm` : '',
  };
}

function buildDescription(product) {
  if (product.Description && product.Description.trim()) {
    let desc = product.Description;
    if (product['Composition du bouquet']) {
      desc += `\n\nComposition : ${product['Composition du bouquet']}`;
    }
    if (product['Prix par fleurs']) {
      desc += `\n\nPrix par fleur : ${product['Prix par fleurs']}`;
    }
    return desc;
  }
  // Construction automatique
  let desc = `${product.Nom} — une création unique Flora Studio.`;
  if (product['Composition du bouquet']) {
    desc = `Composition florale : ${product['Composition du bouquet']}. ${desc}`;
  }
  return desc;
}

// Extraction des images depuis Excel
async function extractImagesFromSheet(workbook, sheetName) {
  const images = [];
  
  if (!workbook.model.media) return images;
  
  for (const media of workbook.model.media) {
    if (media.name && media.name.includes(sheetName)) {
      const imageBuffer = media.buffer;
      const extension = media.extension || 'png';
      images.push({
        buffer: imageBuffer,
        extension,
        name: media.name,
      });
    }
  }
  
  return images;
}

// Upload vers Cloudinary via ton API
async function uploadImageToCloudinary(imageBuffer, flowerName, index) {
  const base64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/upload`, {
      images: [base64],
      flowerName: `${flowerName}-${index}`,
    }, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.data.success && response.data.images[0]) {
      return {
        url: response.data.images[0].url,
        publicId: response.data.images[0].publicId,
      };
    }
    return null;
  } catch (error) {
    console.error(`Upload error: ${error.message}`);
    return null;
  }
}

// Création d'un produit via API
async function createProduct(productData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/flowers`, productData, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log(`✓ Créé : ${productData.name}`);
    return response.data;
  } catch (error) {
    console.error(`✗ Erreur ${productData.name}:`, error.response?.data?.error || error.message);
    return null;
  }
}

// Traitement d'une feuille Excel
async function processSheet(workbook, sheetName, mapping) {
  console.log(`\n📄 Traitement de la feuille : ${sheetName}`);
  
  const worksheet = workbook.getWorksheet(sheetName);
  if (!worksheet) {
    console.log(`  ⚠ Feuille non trouvée : ${sheetName}`);
    return [];
  }
  
  // Extraction des images de la feuille
  const extractedImages = await extractImagesFromSheet(workbook, sheetName);
  console.log(`  📷 ${extractedImages.length} images trouvées`);
  
  // Lecture des données
  const rows = [];
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    
    const product = {
      Nom: row.getCell(1).text || '',
      Description: row.getCell(2).text || '',
      Prix: row.getCell(3)?.text || row.getCell(4)?.text || '',
      Composition: row.getCell(3)?.text || '',
      PrixParFleur: row.getCell(4)?.text || '',
      Image: '',
    };
    
    // Gestion spéciale pour Bouquets Compositions Fleurs (colonne D = Prix, E = composition)
    if (sheetName === 'Bouquets Compositions Fleurs') {
      product.Prix = row.getCell(4)?.text || '';
      product.Composition = row.getCell(3)?.text || '';
      product.PrixParFleur = row.getCell(5)?.text || '';
    }
    
    if (product.Nom && product.Nom.trim()) {
      rows.push(product);
    }
  });
  
  console.log(`  📋 ${rows.length} produits trouvés`);
  
  const createdProducts = [];
  
  for (let i = 0; i < rows.length; i++) {
    const product = rows[i];
    const slug = slugify(product.Nom);
    const dimensions = extractDimensions(product.Description);
    const rating = generateRandomRating();
    const reviews = generateRandomReviews();
    
    // Upload des images
    const uploadedImages = [];
    if (extractedImages[i]) {
      console.log(`  📤 Upload image pour : ${product.Nom}`);
      const uploaded = await uploadImageToCloudinary(extractedImages[i].buffer, slug, i);
      if (uploaded) {
        uploadedImages.push(uploaded.url);
      }
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
    }
    
    // Construction du produit
    const productData = {
      name: product.Nom,
      slug: slug,
      shortDescription: product.Nom.length > 60 ? product.Nom.substring(0, 57) + '...' : product.Nom,
      description: buildDescription(product),
      price: cleanPrice(product.Prix),
      oldPrice: null,
      currency: 'MAD',
      stock: DEFAULT_STOCK,
      featured: i < 5, // Les 5 premiers en vedette
      popular: true,
      premium: cleanPrice(product.Prix) >= 500,
      rating: rating,
      reviews: reviews,
      category: mapping.category,
      subcategory: mapping.subcategory,
      flowerType: mapping.flowerType,
      tags: [...mapping.tagsPrefix],
      occasions: mapping.defaultOccasions,
      emotions: mapping.defaultEmotions.map(e => ({ ...e })),
      colors: [],
      sizes: [{
        label: 'Unique',
        price: cleanPrice(product.Prix),
        height: dimensions.height || 'Standard',
        diameter: dimensions.diameter || 'Standard',
      }],
      images: uploadedImages,
      imagePublicIds: [],
      seo: {
        title: product.Nom,
        description: `✨ ${product.Nom} — ${mapping.defaultEmotions[0]?.name || 'élégance'} et raffinement. Livraison à Casablanca offerte.`,
        keywords: [slug, mapping.category, ...mapping.tagsPrefix],
      },
    };
    
    // Ajout de la composition dans la description si présente
    if (product.Composition && product.Composition.trim()) {
      productData.description = `${product.Composition}\n\n${productData.description}`;
    }
    
    // Ajout des émotions aléatoires supplémentaires
    const extraEmotions = ['joie', 'sincérité', 'reconnaissance', 'espoir'].slice(0, Math.floor(Math.random() * 3));
    extraEmotions.forEach(emotion => {
      if (!productData.emotions.find(e => e.name === emotion)) {
        productData.emotions.push({ name: emotion, percentage: 50 + Math.random() * 30 });
      }
    });
    
    // Ajout des couleurs basées sur le nom
    if (product.Nom.toLowerCase().includes('rose')) productData.colors.push('rose');
    if (product.Nom.toLowerCase().includes('rouge')) productData.colors.push('rouge');
    if (product.Nom.toLowerCase().includes('blanc')) productData.colors.push('blanc');
    if (product.Nom.toLowerCase().includes('vert')) productData.colors.push('vert');
    if (product.Nom.toLowerCase().includes('bleu')) productData.colors.push('bleu');
    
    const created = await createProduct(productData);
    if (created) {
      createdProducts.push(created);
    }
    
    // Pause entre les créations
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
  }
  
  return createdProducts;
}

// Fonction principale
async function main() {
  console.log('🚀 Import Excel vers Flora Studio\n');
  console.log('📁 Vérification du fichier...');
  
  const excelPath = process.argv[2];
  if (!excelPath) {
    console.error('❌ Usage: node import-excel-products.js <chemin_excel.xlsx>');
    process.exit(1);
  }
  
  if (!fs.existsSync(excelPath)) {
    console.error(`❌ Fichier non trouvé : ${excelPath}`);
    process.exit(1);
  }
  
  console.log(`📖 Lecture du fichier : ${excelPath}\n`);
  
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);
  
  console.log(`📚 Feuilles disponibles : ${workbook.worksheets.map(w => w.name).join(', ')}\n`);
  
  let allProducts = [];
  
  for (const [sheetName, mapping] of Object.entries(SHEET_MAPPING)) {
    if (workbook.getWorksheet(sheetName)) {
      const products = await processSheet(workbook, sheetName, mapping);
      allProducts = allProducts.concat(products);
    } else {
      console.log(`⚠ Feuille ignorée (non trouvée) : ${sheetName}`);
    }
  }
  
  console.log(`\n✅ Import terminé ! ${allProducts.length} produits créés sur ${allProducts.length} tentatives.`);
}

// Exécution
main().catch(console.error);