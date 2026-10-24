// Writes the work history and skill levels as documents for an Amazon Bedrock knowledge base, to
// dist/knowledge-base/: Markdown files, each with a "<file>.metadata.json" sidecar Bedrock reads for
// metadata filtering. Upload the folder to the knowledge base's S3 data source and sync it:
//   node scripts/generate-knowledge-base.mjs
//   aws s3 sync dist/knowledge-base s3://<bucket>/<prefix> --delete
//   aws bedrock-agent start-ingestion-job --knowledge-base-id <id> --data-source-id <id>
import { build } from 'esbuild'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const outDir = join(root, 'dist/knowledge-base')

const { outputFiles } = await build({
  entryPoints: [join(root, 'scripts/knowledge-base.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
  logLevel: 'warning',
})
const { knowledgeBaseDocuments } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`)
const documents = knowledgeBaseDocuments()

rmSync(outDir, { recursive: true, force: true })
for (const { path, markdown, metadata } of documents) {
  const file = join(outDir, path)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, markdown)
  writeFileSync(`${file}.metadata.json`, JSON.stringify({ metadataAttributes: metadata }, null, 2) + '\n')
}
console.log(`Wrote ${documents.length} documents to ${outDir}`)
