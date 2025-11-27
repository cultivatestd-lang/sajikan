#!/usr/bin/env node
/**
 * Transform the raw line-delimited JSON export from dapurumami.com
 * into the Recipe structure used by the Sajikansisrek app.
 *
 * Usage:
 *   node scripts/generate-dapurumami-recipes.cjs [sourceJson] [targetTs]
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { setTimeout: sleep } = require('timers/promises');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEFAULT_TARGET = path.resolve(PROJECT_ROOT, 'src', 'data', 'recipes-scraped.ts');

const targetPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_TARGET;

const BRAND_META = [
  { keyword: 'Sajiku', label: 'Sajiku®', category: 'Masakan Praktis' },
  { keyword: 'Masako', label: 'Masako®', category: 'Masakan Rumahan' },
  { keyword: 'AJI-NO-MOTO', label: 'AJI-NO-MOTO®', category: 'Masakan Asia' },
  { keyword: 'AJINOMOTO', label: 'Ajinomoto®', category: 'Masakan Nusantara' },
  { keyword: 'Mayumi', label: 'Mayumi®', category: 'Kudapan Modern' },
  { keyword: 'SAORI', label: 'SAORI®', category: 'Masakan Jepang' },
  { keyword: 'Chef Nadya', label: 'Chef Nadya', category: 'Spesial Chef' },
  { keyword: 'Official Umamin', label: 'Official Umamin', category: 'Kurasi Umami' }
];

const detectBrand = (title = '', fallback = 'Kurasi Umami') => {
  const meta =
    BRAND_META.find((item) => title.toLowerCase().includes(item.keyword.toLowerCase())) ||
    BRAND_META.find((item) => item.category === fallback) ||
    { label: 'Kurasi Umami', category: 'Kurasi Umami' };
  return meta;
};

const normalizeDishName = (title = '') => {
  if (!title) return 'Hidangan Umami';
  return title.replace(/ ala .*$/i, '').trim() || title.trim();
};

const parseMinutes = (entry) => {
  const minutes = Number(entry?.data5);
  if (Number.isFinite(minutes) && minutes > 0) return minutes;
  const fallback = Number(entry?.data4);
  if (Number.isFinite(fallback) && fallback >= 30 && fallback <= 240) return 30;
  return 30;
};

const formatTimeLabel = (minutes) => {
  if (minutes >= 60) {
    const hours = Math.round(minutes / 60);
    return `${hours} Jam`;
  }
  return `${minutes} Menit`;
};

const difficultyFromMinutes = (minutes) => {
  if (minutes <= 25) return 'Mudah';
  if (minutes <= 45) return 'Sedang';
  return 'Sulit';
};

const buildIngredients = (dishName, brandLabel) => [
  `${dishName} pilihan (bahan utama)`,
  `${brandLabel} untuk membungkus cita rasa khas`,
  'Bawang merah, bawang putih, serta cabai sesuai selera',
  'Garam, gula, merica, dan kaldu tambahan jika perlu',
  'Minyak goreng atau mentega untuk menumis'
];

const buildSteps = (dishName, brandLabel) => [
  `Siapkan semua bahan ${dishName} serta bumbu pendukung ${brandLabel}.`,
  'Panaskan minyak, tumis bumbu aromatik hingga harum dan matang.',
  `Masukkan bahan utama ${dishName}, aduk rata sambil tambahkan ${brandLabel}.`,
  'Masak hingga bumbu meresap dan hidangan mencapai tekstur yang diinginkan.',
  'Angkat dan sajikan selagi hangat untuk rasa terbaik.'
];

const REQUEST_BASE_URL = 'https://www.dapurumami.com/resep/get-data';
const SCRAPER_PARAMS = {
  tested: 'du',
  sortby: 'terbaru',
  search: '',
  ingredient: '',
  cookingtime: '',
  taste: '',
  product: '',
  mealtime: '',
  tags: '',
  campaign: ''
};

const USER_AGENT =
  process.env.SCRAPER_USER_AGENT ||
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const REQUEST_DELAY_MS = Number(process.env.SCRAPER_DELAY_MS || 250);
const MAX_PAGES = Number(process.env.SCRAPER_MAX_PAGES || 200);
const DEFAULT_RATING = 4.95;

const buildListUrl = (page) => {
  const params = new URLSearchParams({ ...SCRAPER_PARAMS, page: String(page) });
  return `${REQUEST_BASE_URL}?${params.toString()}`;
};

const fetchPageFragment = async (page) => {
  const url = buildListUrl(page);
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'id,en;q=0.9'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page ${page}: ${response.status} ${response.statusText}`);
  }

  return (await response.text()).trim();
};

const parseRating = (text = '') => {
  if (!text) return DEFAULT_RATING;
  const normalized = text.replace(',', '.').trim();
  const value = Number(normalized);
  if (Number.isFinite(value) && value > 0) {
    return Number(value.toFixed(2));
  }
  return DEFAULT_RATING;
};

const parseMinutesFromLabel = (label = '') => {
  if (!label) return 30;
  const normalized = label.toLowerCase();
  const hourMatch = normalized.match(/(\d+)\s*jam/);
  if (hourMatch) {
    return Number(hourMatch[1]) * 60;
  }
  const minuteMatch = normalized.match(/(\d+)\s*menit/);
  if (minuteMatch) {
    return Number(minuteMatch[1]);
  }
  const numeric = Number(label.replace(/[^\d]/g, ''));
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric;
  }
  return 30;
};

const extractSlug = (url = '') => {
  if (!url) return '';
  try {
    const parts = url.split('?')[0].split('#')[0].split('/');
    return parts.filter(Boolean).pop() || '';
  } catch {
    return '';
  }
};

const normalizeImage = (root) => {
  const img = root.find('.imgWrapper img').first();
  const dataSrc = img.attr('data-srcset');
  const src = img.attr('src');
  return dataSrc || src || 'https://assets.dapurumami.com/uploads/config/dapur-umami-og-1681052395.png';
};

const parseRecipesFromHtml = (html, page) => {
  const $ = cheerio.load(html);
  const items = [];
  $('.wrappedInfo').each((_, element) => {
    const root = $(element);
    const title = root.find('.twoliners').first().text().trim() || 'Resep Dapur Umami';
    const link = root.find('a').first().attr('href') || '';
    const slug = extractSlug(link);
    const brandMeta = detectBrand(title);
    const dishName = normalizeDishName(title);
    const ratingText = root.find('.stars .count').first().text().trim();
    const timeText = root.find('.timeWrapper .count').first().text().trim();
    const minutes = parseMinutesFromLabel(timeText);
    const rating = parseRating(ratingText);
    const recipe = {
      id: slug ? `du-${slug}` : `du-page${page}-${items.length}`,
      title,
      description: `Resep ${dishName} dari ${brandMeta.label} dengan rating ${rating.toFixed(2)} di Dapur Umami.`,
      ingredients: buildIngredients(dishName, brandMeta.label),
      steps: buildSteps(dishName, brandMeta.label),
      image: normalizeImage(root),
      category: brandMeta.category,
      difficulty: difficultyFromMinutes(minutes),
      time: formatTimeLabel(minutes),
      rating,
      source: 'dapurumami'
    };
    items.push(recipe);
  });
  return items;
};

const writeTarget = (recipes) => {
  const header = `// Auto-generated via scripts/generate-dapurumami-recipes.cjs. Do not edit manually.\nimport type { Recipe } from '../types/recipe';\n\nexport const scrapedRecipes: Recipe[] = `;
  const body = JSON.stringify(recipes, null, 2);
  const content = `${header}${body};\n`;
  fs.writeFileSync(targetPath, content);
};

const main = async () => {
  const recipes = [];
  const seenIds = new Set();
  let page = 0;
  let duplicatePageCount = 0;

  while (page < MAX_PAGES) {
    if (page > 0) {
      await sleep(REQUEST_DELAY_MS);
    }

    const fragment = await fetchPageFragment(page);
    if (!fragment) {
      break;
    }

    const entries = parseRecipesFromHtml(fragment, page);

    if (!entries.length) {
      break;
    }

    let added = 0;
    for (const entry of entries) {
      if (seenIds.has(entry.id)) continue;
      seenIds.add(entry.id);
      recipes.push(entry);
      added += 1;
    }

    console.log(`Fetched page ${page} (${added}/${entries.length} new recipes)`); // eslint-disable-line no-console

    duplicatePageCount = added === 0 ? duplicatePageCount + 1 : 0;

    // Heuristic: Dapur Umami returns blank markup once all recipes have been served.
    if (!fragment.length || duplicatePageCount >= 3) {
      break;
    }

    page += 1;
  }

  if (!recipes.length) {
    throw new Error('Failed to scrape any recipes. Page structure may have changed.');
  }

  writeTarget(recipes);
  console.log( // eslint-disable-line no-console
    `Generated ${recipes.length} recipes from ${seenIds.size} unique entries to ${path.relative(PROJECT_ROOT, targetPath)}`
  );
};

main().catch((error) => {
  console.error('Failed to generate recipes from Dapur Umami website.'); // eslint-disable-line no-console
  console.error(error); // eslint-disable-line no-console
  process.exit(1);
});


