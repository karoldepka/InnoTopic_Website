import axios from 'axios'
import * as cheerio from 'cheerio'
import * as fs from 'fs'
import * as path from 'path'
import { URL } from 'url'
import { Context, crawlPageForImages, fetchHTML } from '../utils/utils'

const ctx = new Context()

const visitedCategories = new Set<string>()

// Extracts the category name from URL
function extractCategoryName(categoryUrl: string): string {
	const match = categoryUrl.match(/Category:([^/?#]+)/)
	return match ? decodeURIComponent(match[1].replace(/\s+/g, '_')) : 'UnknownCategory'
}

// Crawl a category page and subcategories recursively
async function crawlCategory(ctx: Context, categoryUrl: string) {
  const categoryName = extractCategoryName(categoryUrl)
  console.log(`categoryName`, categoryName)
  const outputDirRelative = categoryName //, path.join(ctx.downloadsDir, 'wikipedia', categoryName)

  console.log(`\n🔍 Crawling category: ${categoryName}`)

	if (visitedCategories.has(categoryUrl)) {
		console.debug(`[SKIP] Category already visited: ${categoryUrl}`)
		return
	}
	console.debug(`[CATEGORY] Visiting: ${categoryUrl}`)
	visitedCategories.add(categoryUrl)

	const $ = await fetchHTML(categoryUrl)

	// Crawl member pages
	const memberLinks = $('div.mw-category a').toArray()
	for (const el of memberLinks) {
		const href = $(el).attr('href')
		if (href && href.startsWith('/wiki/') && !href.includes(':')) {
			const pageUrl = ctx.baseUrl + href
			await crawlPageForImages(ctx, pageUrl, outputDirRelative)
		}
	}

	// Crawl subcategories
	const subcategoryLinks = $('div.CategoryTreeItem a').toArray()
	for (const el of subcategoryLinks) {
		const href = $(el).attr('href')
		if (href && href.startsWith('/wiki/Category:')) {
			const subcategoryUrl = ctx.baseUrl + href
			await crawlCategory(ctx, subcategoryUrl, /*outputDirRelative */ /** FIXME subdir for subcategory */)
		}
	}

	// Handle pagination
	const nextLink = $('a:contains("next page")').attr('href')
	if (nextLink) {
		const nextPageUrl = baseUrl + nextLink
		await crawlCategory(ctx, nextPageUrl, outputDir)
	}

	// await sleep(1000);
}

// function getHashPath(fileName: string): string {
//   const first = fileName[0] || '_';
//   const second = fileName[1] || '_';
//   return `${first}/${first}${second}`;
// }

// Main execution flow
async function main() {
	const categoryUrls = [
		'https://en.wikipedia.org/wiki/Category:Psychedelic_drugs',
		// Add more categories here
	]

	for (const categoryUrl of categoryUrls) {
		await crawlCategory(ctx, categoryUrl)

		// console.log(`🔗 Found ${ctx.svgPageUrls.size} SVG page(s) in ${categoryName}.`);

		// for (const svgPageUrl of svgPageUrls) {
		//   const directLink = await getDirectSVGLinks(svgPageUrl);
		//   if (directLink) {
		//     await downloadPicture(directLink, outputDir);
		//     // await sleep(500);
		//   }
		// }
	}

	console.log('\n✅ All downloads complete.')
}

console.log('start')
main().catch(console.error)
