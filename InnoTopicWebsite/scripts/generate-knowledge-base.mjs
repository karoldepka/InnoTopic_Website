// Writes the work history and skill levels for the CV agent (agents/CvAgent):
// - knowledge-base/: Markdown documents for its Bedrock knowledge base, each with a
//   "<file>.metadata.json" sidecar Bedrock reads for metadata filtering. The agent's deploy uploads
//   them to the knowledge base's S3 data source and starts an ingestion (agentcore/cdk/lib/cdk-stack.ts);
// - app/tools/work_history/work-history.json: the same data, structured, for its work-history tools.
//   node scripts/generate-knowledge-base.mjs        (pnpm knowledge-base)
import { build } from 'esbuild'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const outDir = join(root, 'agents/CvAgent/knowledge-base')

const { outputFiles } = await build({
  entryPoints: [join(root, 'scripts/knowledge-base.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
  logLevel: 'warning',
})
const { knowledgeBaseDocuments, workHistoryData } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`)
const documents = knowledgeBaseDocuments()

rmSync(outDir, { recursive: true, force: true })
for (const { path, markdown, metadata } of documents) {
  const file = join(outDir, path)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, markdown)
  writeFileSync(`${file}.metadata.json`, JSON.stringify({ metadataAttributes: metadata }, null, 2) + '\n')
}
console.log(`Wrote ${documents.length} documents to ${outDir}`)

const toolsData = join(root, 'agents/CvAgent/app/tools/work_history/work-history.json')
mkdirSync(dirname(toolsData), { recursive: true })
writeFileSync(toolsData, JSON.stringify(workHistoryData(), null, 2) + '\n')
console.log(`Wrote ${toolsData}`)
