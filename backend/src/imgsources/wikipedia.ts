import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const visitedCategories = new Set<string>();
const visitedPages = new Set<string>();

// Retry wrapper for network resilience
async function withRetry<T>(fn: () => Promise<T>, label = '', retries = 3, delay = 2000): Promise<T | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      console.warn(`[RETRY ${attempt}/${retries}] ${label} - ${err?.message || err}`);
      if (attempt < retries) await sleep(delay);
    }
  }
  console.error(`[FAILED] ${label} after ${retries} retries.`);
  return null;
}

// Get cheerio-loaded HTML
async function fetchHTML(url: string): Promise<cheerio.CheerioAPI> {
  const result = await withRetry(() =>
    axios.get(url, { timeout: 10000 }).then(res => cheerio.load(res.data)),
    `Fetch HTML: ${url}`
  );
  if (!result) throw new Error(`Failed to fetch HTML from ${url}`);
  return result;
}

// Extracts the category name from URL
function extractCategoryName(categoryUrl: string): string {
  const match = categoryUrl.match(/Category:([^/?#]+)/);
  return match ? decodeURIComponent(match[1].replace(/\s+/g, '_')) : 'UnknownCategory';
}

// Crawl a category page and subcategories recursively
async function crawlCategory(categoryUrl: string, svgUrls: Set<string>, outputDir: string) {
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
      crawlPageForImages(pageUrl, svgUrls, outputDir);
    }
  });

  // Crawl subcategories
  $('div.CategoryTreeItem a').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.startsWith('/wiki/Category:')) {
      const subcategoryUrl = baseUrl + href;
      crawlCategory(subcategoryUrl, svgUrls, outputDir /** FIXME subdir for subcategory */);
    }
  });

  // Handle pagination
  const nextLink = $('a:contains("next page")').attr('href');
  if (nextLink) {
    const nextPageUrl = baseUrl + nextLink;
    await crawlCategory(nextPageUrl, svgUrls, outputDir);
  }

  // await sleep(1000);
}

// Find SVG links in a Wikipedia article page
async function crawlPageForImages(pageUrl: string, svgUrls: Set<string>, downloadsDir: string) {
    if (visitedPages.has(pageUrl)) {
      console.debug(`[SKIP] Page already visited: ${pageUrl}`);
      return;
    }
    console.debug(`[PAGE] Visiting: ${pageUrl}`);
    visitedPages.add(pageUrl);
  
    const $ = await fetchHTML(pageUrl);
  
    // Debug: Log all the links we're looking at
    console.debug(`[DEBUG] Scraping ${pageUrl} for SVGs...`);
  
    // 1. Search for links to SVGs
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;
  
      const fileExtensions = ['.svg', '.png', '.jpg', '.jpeg', '.gif'];
      if (fileExtensions.some(x=>href.endsWith(x))) {
        let fileTitle = '';
  
        // Case 2: Handle /#/media/File: links directly
        if (href.includes('#/media/File:')) {
          const match = href.match(/File:([^#]+(\.svg|\.png|\.jpg))/); // FIXME SVG
          if (match) fileTitle = match[1];
        } 
        // Case 3: Handle /wiki/File: links
        else if (href.startsWith('/wiki/File:')) {
          const match = href.match(/File:(.+(\.svg|\.png|\.jpg))/);
          if (match) fileTitle = match[1];
        }
  
        if (fileTitle) {
          const safeFilename = decodeURIComponent(fileTitle);
          const directUrl = `https://upload.wikimedia.org/wikipedia/commons/${getHashPath(safeFilename)}/${safeFilename}`;
          if (!svgUrls.has(directUrl)) {
            console.debug(`[FOUND Picture] ${directUrl}`);
            downloadPicture(directUrl, downloadsDir);
            svgUrls.add(directUrl);
          }
        }
      }
    });
  
    // Debug: Check how many SVG links were found
    console.debug(`[DEBUG] Found ${svgUrls.size} SVG links in ${pageUrl}`);
  
    // await sleep(500);
  }
  
  function getHashPath(fileName: string): string {
    const first = fileName[0] || '_';
    const second = fileName[1] || '_';
    return `${first}/${first}${second}`;
  }
  

// Get the direct download link for the SVG file
async function getDirectSVGLinks(svgPageUrl: string): Promise<string | null> {
  const $ = await fetchHTML(svgPageUrl);
  const fileLink = $('a:contains("Original file")').attr('href');
  return fileLink ? 'https:' + fileLink : null;
}

// Download SVG file to given folder
async function downloadPicture(url: string, folder: string) {
  console.log("downloadSVG", url)
  const fileName = path.basename(new URL(url).pathname);
  const fullPath = path.join(folder, fileName);

  if (fs.existsSync(fullPath)) {
    console.debug(`[SKIP] Already downloaded: ${fileName}`);
    return;
  }

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  console.debug(`[DOWNLOAD] ${url} → ${fullPath}`);

  const success = await withRetry(async () => {
    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 10000,
    });
    console.log('fullPath')
    const writer = fs.createWriteStream(fullPath);
    response.data.pipe(writer);
    return new Promise<void>((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }, `Download SVG: ${url}`);

  if (success) {
    console.debug(`[DONE] Saved: ${fileName}`);
  }
}

// Main execution flow
async function main() {
  const categoryUrls = [
    'https://en.wikipedia.org/wiki/Category:Psychedelic_drugs',
    // Add more categories here
  ];

  for (const categoryUrl of categoryUrls) {
    const categoryName = extractCategoryName(categoryUrl);
    const outputDir = path.join('downloads', 'wikipedia', categoryName);
    const svgPageUrls = new Set<string>();

    console.log(`\n🔍 Crawling category: ${categoryName}`);
    await crawlCategory(categoryUrl, svgPageUrls, outputDir);

    console.log(`🔗 Found ${svgPageUrls.size} SVG page(s) in ${categoryName}.`);

    // for (const svgPageUrl of svgPageUrls) {
    //   const directLink = await getDirectSVGLinks(svgPageUrl);
    //   if (directLink) {
    //     await downloadPicture(directLink, outputDir);
    //     // await sleep(500);
    //   }
    // }
  }

  console.log('\n✅ All downloads complete.');
}

console.log("start")
main().catch(console.error);
