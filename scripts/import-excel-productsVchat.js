// scripts/import-excel-products.js
// Installation :
// npm install exceljs axios slugify

const ExcelJS = require('exceljs');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const slugifyLib = require('slugify');

// =========================
// CONFIG
// =========================

const API_BASE_URL = 'http://localhost:3000';

const DEFAULT_STOCK = 100;

const DELAY_BETWEEN_REQUESTS = 400;

// =========================
// MAPPING DES FEUILLES
// =========================

const SHEET_MAPPING = {
  'Plantes': {
    category: 'plante',
    subcategory: null,
    flowerType: 'plante',
    tagsPrefix: ['plante', 'intérieur'],
    occasions: ['entreprise', 'anniversaire'],
    emotions: [
      { name: 'calme', percentage: 85 },
      { name: 'pureté', percentage: 75 },
    ],
  },

  'Fleurs séchées': {
    category: 'fleur-sechee',
    subcategory: 'composition',
    flowerType: 'composition',
    tagsPrefix: ['fleurs séchées', 'décoration'],
    occasions: ['elegance', 'anniversaire'],
    emotions: [
      { name: 'élégance', percentage: 88 },
      { name: 'tendresse', percentage: 78 },
    ],
  },

  'Rose Eternelles': {
    category: 'fleur-eternelle',
    subcategory: 'coffret',
    flowerType: 'rose',
    tagsPrefix: ['rose éternelle', 'cadeau'],
    occasions: ['romantique', 'mariage'],
    emotions: [
      { name: 'amour', percentage: 95 },
      { name: 'élégance', percentage: 90 },
    ],
  },

  'Roses eternelle en transparence': {
    category: 'fleur-eternelle',
    subcategory: 'cadre',
    flowerType: 'rose',
    tagsPrefix: ['rose éternelle', 'luxe'],
    occasions: ['romantique', 'mariage'],
    emotions: [
      { name: 'raffinement', percentage: 92 },
      { name: 'élégance', percentage: 88 },
    ],
  },

  'Celebrating Love': {
    category: 'fleur-fraiche',
    subcategory: 'bouquet',
    flowerType: 'rose',
    tagsPrefix: ['rose rouge', 'romantique'],
    occasions: ['romantique', 'anniversaire'],
    emotions: [
      { name: 'amour', percentage: 98 },
      { name: 'passion', percentage: 92 },
    ],
  },

  'Petites Attentions': {
    category: 'fleur-eternelle',
    subcategory: 'coffret',
    flowerType: 'rose',
    tagsPrefix: ['cadeau', 'attention'],
    occasions: ['remerciement', 'anniversaire'],
    emotions: [
      { name: 'tendresse', percentage: 85 },
      { name: 'joie', percentage: 80 },
    ],
  },

  'Celebrating Mums': {
    category: 'fleur-eternelle',
    subcategory: 'coffret',
    flowerType: 'rose',
    tagsPrefix: ['maman', 'cadeau'],
    occasions: ['remerciement'],
    emotions: [
      { name: 'reconnaissance', percentage: 95 },
      { name: 'tendresse', percentage: 88 },
    ],
  },

  'Composition Bouquets Roses': {
    category: 'fleur-fraiche',
    subcategory: 'bouquet',
    flowerType: 'rose',
    tagsPrefix: ['rose', 'bouquet'],
    occasions: ['romantique', 'mariage'],
    emotions: [
      { name: 'amour', percentage: 94 },
      { name: 'joie', percentage: 82 },
    ],
  },

  'Bouquets Compositions Fleurs': {
    category: 'fleur-fraiche',
    subcategory: 'composition',
    flowerType: 'composition',
    tagsPrefix: ['composition', 'bouquet'],
    occasions: ['elegance', 'entreprise'],
    emotions: [
      { name: 'élégance', percentage: 88 },
      { name: 'raffinement', percentage: 84 },
    ],
  },
};

// =========================
// UTILITAIRES
// =========================

function slugify(text) {
  return slugifyLib(text || '', {
    lower: true,
    strict: true,
    trim: true,
  });
}

function randomRating() {
  return +(4.5 + Math.random() * 0.5).toFixed(1);
}

function randomReviews() {
  return Math.floor(50 + Math.random() * 200);
}

function cleanPrice(price) {
  if (!price) return 0;

  const cleaned = String(price)
    .replace(/[^\d.,]/g, '')
    .replace(',', '.');

  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? 0 : Math.round(parsed);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// =========================
// HEADERS
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
    const normalized = normalizeHeader(cell.text);

    headers[normalized] = colNumber;
  });

  return headers;
}

function getCell(row, headers, possibleNames = []) {
  for (const name of possibleNames) {
    const normalized = normalizeHeader(name);

    if (headers[normalized]) {
      return row.getCell(headers[normalized]).text || '';
    }
  }

  return '';
}

// =========================
// EXTRACTION DES IMAGES
// =========================

function extractImagesByRow(workbook, worksheet) {
  const imagesMap = {};

  const images = worksheet.getImages();

  for (const image of images) {
    const imageId = image.imageId;

    const media = workbook.model.media.find(
      (m) => m.index === imageId
    );

    if (!media) continue;

    const row = image.range.tl.nativeRow + 1;

    if (!imagesMap[row]) {
      imagesMap[row] = [];
    }

    imagesMap[row].push({
      buffer: media.buffer,
      extension: media.extension || 'png',
      name: media.name || `image-${row}`,
    });
  }

  return imagesMap;
}

// =========================
// DESCRIPTION INTELLIGENTE
// =========================

function buildDescription(product, mapping) {
  if (product.description?.trim()) {
    let desc = product.description.trim();

    if (product.composition) {
      desc += `\n\nComposition : ${product.composition}`;
    }

    if (product.pricePerFlower) {
      desc += `\n\nPrix par fleur : ${product.pricePerFlower}`;
    }

    return desc;
  }

  let desc =
    `${product.name} est une création florale ${mapping.subcategory || ''} réalisée avec soin par Flora Studio.`;

  if (product.composition) {
    desc += ` Composition : ${product.composition}.`;
  }

  if (mapping.category === 'fleur-eternelle') {
    desc += ` Une création durable et élégante idéale comme cadeau raffiné.`;
  }

  if (mapping.category === 'fleur-fraiche') {
    desc += ` Réalisée avec des fleurs fraîches soigneusement sélectionnées.`;
  }

  return desc;
}

// =========================
// DIMENSIONS
// =========================

function extractDimensions(description) {
  if (!description) {
    return {
      height: 'Standard',
      diameter: 'Standard',
    };
  }

  const heightMatch = description.match(
    /Hauteur\s*:\s*(\d+(?:[,.]?\d+)?)\s*cm/i
  );

  const diameterMatch = description.match(
    /(Diamètre|Diametre|Largeur)\s*:\s*(\d+(?:[,.]?\d+)?)\s*cm/i
  );

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
    const base64 =
      `data:image/png;base64,${imageBuffer.toString('base64')}`;

    const response = await axios.post(
      `${API_BASE_URL}/api/upload`,
      {
        images: [base64],
        flowerName: `${flowerName}-${index}`,
      }
    );

    if (
      response.data?.success &&
      response.data?.images?.[0]
    ) {
      return response.data.images[0].url;
    }

    return null;
  } catch (error) {
    console.error('Upload image error:', error.message);
    return null;
  }
}

// =========================
// CREATION PRODUIT
// =========================

async function createProduct(productData) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/flowers`,
      productData
    );

    console.log(`✅ Produit créé : ${productData.name}`);

    return response.data;
  } catch (error) {
    console.error(
      `❌ Erreur création ${productData.name}:`,
      error.response?.data || error.message
    );

    return null;
  }
}

// =========================
// TRAITEMENT FEUILLE
// =========================

async function processSheet(workbook, worksheet, mapping) {
  console.log(`\n📄 Feuille : ${worksheet.name}`);

  const headers = extractHeaders(worksheet);

  const imagesMap = extractImagesByRow(workbook, worksheet);

  const createdProducts = [];

  worksheet.eachRow(
    { includeEmpty: false },
    async (row, rowNumber) => {
      if (rowNumber === 1) return;

      try {
        const name = getCell(row, headers, ['Nom']);

        if (!name?.trim()) return;

        const description = getCell(row, headers, [
          'Description',
        ]);

        const composition = getCell(row, headers, [
          'Composition du bouquet',
          'Composition',
        ]);

        const pricePerFlower = getCell(row, headers, [
          'Prix par fleur',
          'Prix par fleurs',
          'Prix par fleur(optionnel)',
        ]);

        const price = getCell(row, headers, [
          'Prix',
        ]);

        const slug =
          `${slugify(name)}-${Date.now()}-${rowNumber}`;

        const dimensions = extractDimensions(description);

        const rowImages = imagesMap[rowNumber] || [];

        const uploadedImages = [];

        for (let i = 0; i < rowImages.length; i++) {
          const uploaded = await uploadImage(
            rowImages[i].buffer,
            slug,
            i
          );

          if (uploaded) {
            uploadedImages.push(uploaded);
          }

          await sleep(DELAY_BETWEEN_REQUESTS);
        }

        const colors = [];

        const lower = name.toLowerCase();

        if (lower.includes('rose')) colors.push('rose');
        if (lower.includes('rouge')) colors.push('rouge');
        if (lower.includes('blanc')) colors.push('blanc');
        if (lower.includes('bleu')) colors.push('bleu');
        if (lower.includes('vert')) colors.push('vert');

        const productData = {
          name,

          slug,

          shortDescription:
            name.length > 60
              ? `${name.substring(0, 57)}...`
              : name,

          description: buildDescription(
            {
              name,
              description,
              composition,
              pricePerFlower,
            },
            mapping
          ),

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

          emotions: mapping.emotions,

          colors,

          sizes: [
            {
              label: 'Unique',
              price: cleanPrice(price),
              height: dimensions.height,
              diameter: dimensions.diameter,
            },
          ],

          images: uploadedImages,

          imagePublicIds: [],

          seo: {
            title: name,

            description:
              `✨ ${name} — création florale Flora Studio.`,

            keywords: [
              slug,
              mapping.category,
              ...mapping.tagsPrefix,
            ],
          },
        };

        const created = await createProduct(productData);

        if (created) {
          createdProducts.push(created);
        }

        await sleep(DELAY_BETWEEN_REQUESTS);
      } catch (error) {
        console.error(
          `❌ Ligne ${rowNumber} erreur:`,
          error.message
        );
      }
    }
  );

  return createdProducts;
}

// =========================
// MAIN
// =========================

async function main() {
  console.log('\n🚀 IMPORT FLORA STUDIO\n');

  const excelPath = process.argv[2];

  if (!excelPath) {
    console.log(
      '❌ Usage : node scripts/import-excel-products.js fichier.xlsx'
    );
    process.exit(1);
  }

  if (!fs.existsSync(excelPath)) {
    console.log('❌ Fichier introuvable');
    process.exit(1);
  }

  console.log(`📖 Lecture : ${excelPath}`);

  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.readFile(excelPath);

  console.log(
    '\n📚 Feuilles trouvées :\n',
    workbook.worksheets.map((w) => `- ${w.name}`).join('\n')
  );

  let total = 0;

  for (const worksheet of workbook.worksheets) {
    const mapping = SHEET_MAPPING[worksheet.name];

    if (!mapping) {
      console.log(
        `⚠️ Feuille ignorée : ${worksheet.name}`
      );
      continue;
    }

    const created = await processSheet(
      workbook,
      worksheet,
      mapping
    );

    total += created.length;
  }

  console.log(`\n🎉 Import terminé`);
  console.log(`✅ ${total} produits créés`);
}

// =========================
// EXECUTION
// =========================

main().catch(console.error);