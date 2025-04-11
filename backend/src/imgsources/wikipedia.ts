import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';

// Sets to track visited pages and categories
const visitedPages = new Set<string>();
const visitedCategories = new Set<string>();

// Utility function to download SVG file
async function downloadSVG(url: string, folder: string) {
  const fileName = path.basename(new URL(url).pathname);
  const fullPath = path.join(folder, fileName);

  // Skip if already downloaded
  if (fs.existsSync(fullPath)) {
    console.debug(`[SKIP] Already downloaded: ${fileName}`);
    return;
  }

  // Create folder if doesn't exist
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  console.debug(`[DOWNLOAD] ${url} → ${fullPath}`);

  try {
    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 10000,
    });
    const writer = fs.createWriteStream(fullPath);
    response.data.pipe(writer);
    writer.on('finish', () => console.debug(`[DONE] Saved: ${fileName}`));
    writer.on('error', (err) => console.error(`[ERROR] Failed to save: ${fileName} - ${err.message}`));
  } catch (err) {
    console.error(`[ERROR] Download failed: ${url} - ${err.message}`);
  }
}

// Fetch HTML from the URL
async function fetchHTML(url: string): Promise<cheerio.CheerioAPI> {
  const result = await axios.get(url, { timeout: 10000 }).then(res => cheerio.load(res.data));
  if (!result) throw new Error(`Failed to fetch HTML from ${url}`);
  return result;
}

// Crawl a Wikipedia page to find SVG links and download them
async function crawlPageForSVGs(pageUrl: string, svgUrls: Set<string>) {
  if (visitedPages.has(pageUrl)) {
    console.debug(`[SKIP] Page already visited: ${pageUrl}`);
    return;
  }
  console.debug(`[PAGE] Visiting: ${pageUrl}`);
  visitedPages.add(pageUrl);

  const $ = await fetchHTML(pageUrl);

  // Search for <a> tags with the class that contains the download link
  $('a.cdx-button--fake-button.mw-mmv-download-button').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      const downloadUrl = href.startsWith('https') ? href : `https://upload.wikimedia.org${href}`;
      if (!svgUrls.has(downloadUrl)) {
        console.debug(`[FOUND SVG] ${downloadUrl}`);
        svgUrls.add(downloadUrl);
        downloadSVG(downloadUrl, './downloads/wikipedia'); // Instant download
      }
    }
  });
}

// Crawl the category page and recursively visit subcategories
async function crawlCategory(categoryUrl: string, svgUrls: Set<string>) {
  if (visitedCategories.has(categoryUrl)) {
    console.debug(`[SKIP] Category already visited: ${categoryUrl}`);
    return;
  }
  console.debug(`[CATEGORY] Visiting: ${categoryUrl}`);
  visitedCategories.add(categoryUrl);

  const $ = await fetchHTML(categoryUrl);
  const baseUrl = 'https://en.wikipedia.org';

  // Crawl member pages
  $('div.mw-category a').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.startsWith('/wiki/') && !href.includes(':')) {
      const pageUrl = baseUrl + href;
      crawlPageForSVGs(pageUrl, svgUrls);
    }
  });

  // Crawl subcategories
  $('div.CategoryTreeItem a').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.startsWith('/wiki/Category:')) {
      const subcategoryUrl = baseUrl + href;
      crawlCategory(subcategoryUrl, svgUrls);
    }
  });

  // Handle pagination (if applicable)
  const nextLink = $('a:contains("next page")').attr('href');
  if (nextLink) {
    const nextPageUrl = baseUrl + nextLink;
    await crawlCategory(nextPageUrl, svgUrls);
  }

  await sleep(1000);
}

// Utility function to sleep (in milliseconds)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Main function to start crawling
async function main() {
  const categoryUrls = [
    'https://en.wikipedia.org/wiki/Category:Psychedelic_drugs',
    // Add other categories here
  ];

  const svgUrls = new Set<string>();

  for (const categoryUrl of categoryUrls) {
    console.log(`\n🔍 Crawling category: ${categoryUrl}`);
    await crawlCategory(categoryUrl, svgUrls);
  }

  console.log(`\n✅ All SVGs found: ${svgUrls.size} SVG(s)`);
}

main().catch(console.error);
