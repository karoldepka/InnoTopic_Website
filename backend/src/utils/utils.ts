import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';
import { mkdir } from 'fs/promises';


export class Context {
    visitedPages = new Set<string>()
    downloadedImages = new Set<string>()
    downloadsDirAbsolute = 'downloads'
    fileExtensions = ['.svg', '.png', '.jpg', '.jpeg', '.gif'];
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper for network resilience
async function withRetry<T>(fn: () => Promise<T>, label = '', retries = 9999000, delay = 9999000): Promise<T | null> {
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


  // Get the direct download link for the SVG file
  async function getDirectSVGLinks(context: Context, svgPageUrl: string): Promise<string | null> {
    const $ = await fetchHTML(svgPageUrl);
    const fileLink = $('a:contains("Original file")').attr('href');
    return fileLink ? 'https:' + fileLink : null;
  }
  
  // Download SVG file to given folder
  async function downloadPicture(ctx: Context, url: string, outputDirRelative: string) {
    console.log("downloadSVG", url)
    const fileDirAbsolute = path.join(ctx.downloadsDirAbsolute, outputDirRelative)
    await mkdir(fileDirAbsolute, { recursive: true });
    const fileBaseName = path.basename(new URL(url).pathname)
    // const fileName = path.join(ctx.downloadsDirAbsolute, );
    const fileFullPath = path.join(fileDirAbsolute, fileBaseName);
  
    if (fs.existsSync(fileFullPath)) {
      console.debug(`[SKIP] Already downloaded: ${fileFullPath}`);
      return;
    }
  
    // if (!fs.existsSync(folder)) {
    //   await mkdir(folder, { recursive: true });
    // }
  
    console.debug(`[DOWNLOAD] ${url} → ${fileFullPath}`);
  
    const success = await withRetry(async () => {
      const response = await axios.get(url, {
        responseType: 'stream',
        timeout: 9999000,
      });
      console.log('fullPath')
      const writer = fs.createWriteStream(fileFullPath);
      response.data.pipe(writer);
      return new Promise<void>((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    }, `Download SVG: ${url}`);
  
    if (success) {
      console.debug(`[DONE] Saved: ${fileFullPath}`);
    }
  }
  
  

// Get cheerio-loaded HTML
export async function fetchHTML(url: string): Promise<cheerio.CheerioAPI> {
    const result = await withRetry(() =>
      axios.get(url, { timeout: 9999000 }).then(res => cheerio.load(res.data)),
      `Fetch HTML: ${url}`
    );
    if (!result) throw new Error(`Failed to fetch HTML from ${url}`);
    return result;
  }

export async function crawlPageForImages(ctx: Context, pageUrl: string, outputDirRelative: string) {
    if (ctx.visitedPages.has(pageUrl)) {
      console.debug(`[SKIP] Page already visited: ${pageUrl}`);
      return;
    }
    console.debug(`[PAGE] Visiting: ${pageUrl}`);
    ctx.visitedPages.add(pageUrl);
  
    const $ = await fetchHTML(pageUrl);
    console.debug(`[DEBUG] Scraping for SVGs...`, pageUrl );

    const aElements = $('a').toArray(); // converts cheerio object to array

    for (const el of aElements) {
      const src = $(el).attr('src') !
      downloadPicture(ctx, src, outputDirRelative)
    
  
      // Example of async operation
      // const result = await someAsyncFunction(href);
  

    // Debug: Log all the links we're looking at
    
  
    // // 1. Search for links to SVGs
    // for ( let _ of $('a').toArray() ) {
    //   const href = $(el).attr('href');
    //   if (!href) return;
  
    //   if (ctx.fileExtensions.some(x=>href.endsWith(x))) {
    //     let fileTitle = '';
  
    //     // Case 2: Handle /#/media/File: links directly
    //     if (href.includes('#/media/File:')) {
    //       const match = href.match(/File:([^#]+(\.svg|\.png|\.jpg))/); // FIXME SVG
    //       if (match) fileTitle = match[1];
    //     } 
    //     // Case 3: Handle /wiki/File: links
    //     else if (href.startsWith('/wiki/File:')) {
    //       const match = href.match(/File:(.+(\.svg|\.png|\.jpg))/);
    //       if (match) fileTitle = match[1];
    //     }
    //     console.log('$imagePage = await fetchHTML(pageUrl);', pageUrl)
    //     const $imagePage = await fetchHTML(pageUrl);
    //     $('img').each((_, el) => {
    //       const src = $(el).attr('src');
    //       if (!src) return;
        
    //       // Only download images hosted on Wikimedia Commons
    //       if (src.startsWith('//upload.wikimedia.org/')) {
    //         const fullUrl = 'https:' + src;
    //         const fileName = path.basename(new URL(fullUrl).pathname);
        
    //         if (!ctx.visitedPages.has(fullUrl)) {
    //           console.debug(`[FOUND IMG] ${fullUrl}`);
    //           downloadPicture(ctx, fullUrl);
    //         }
    //       }
    //     });

        

        // if (fileTitle) {
        //   const safeFilename = decodeURIComponent(fileTitle);
        //   const directUrl = `https://upload.wikimedia.org/wikipedia/commons/${getHashPath(safeFilename)}/${safeFilename}`;
        //   if (!svgUrls.has(directUrl)) {
        //     console.debug(`[FOUND Picture] ${directUrl}`);
        //     downloadPicture(directUrl, downloadsDir);
        //     svgUrls.add(directUrl);
        //   }
        // }
      }
    };
  
    // Debug: Check how many SVG links were found
    // console.debug(`[DEBUG] Found ${svgUrls.size} SVG links in ${pageUrl}`);
  
    // await sleep(500);
  }