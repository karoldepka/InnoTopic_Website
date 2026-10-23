// Serves the Vercel functions in api/ locally for `ng serve`, which proxies /api here
// (src/proxy.conf.json). A function at api/<name>.ts answers /api/<name> through its exported
// HTTP-method handlers (POST, GET, ...), the same Web-standard signature Vercel calls.
//   node scripts/dev-api.mjs        (pnpm dev-api)
import { build } from 'esbuild'
import { readdirSync } from 'node:fs'
import { createServer } from 'node:http'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const apiDir = join(root, 'api')
const outDir = join(root, 'node_modules/.cache/dev-api')
const port = Number(process.env.PORT ?? 8003)

// Files starting with "_" are helpers, not functions (as on Vercel).
const names = readdirSync(apiDir).filter(file => /^[^_].*\.ts$/.test(file)).map(file => file.slice(0, -3))
await build({
  entryPoints: names.map(name => join(apiDir, `${name}.ts`)),
  outdir: outDir,
  outExtension: { '.js': '.mjs' },
  bundle: true,
  packages: 'external',
  platform: 'node',
  format: 'esm',
  logLevel: 'warning',
})
const functions = Object.fromEntries(await Promise.all(names.map(async name =>
  [name, await import(pathToFileURL(join(outDir, `${name}.mjs`)).href)])))

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${port}`)
  const handler = functions[url.pathname.replace(/^\/api\//, '')]?.[req.method ?? 'GET']
  if (!handler) {
    res.writeHead(404).end('Not found')
    return
  }
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
  const request = new Request(url, {
    method: req.method,
    headers: Object.entries(req.headers).flatMap(([key, value]) => [value ?? []].flat().map(v => [key, v])),
    body: hasBody ? Readable.toWeb(req) : undefined,
    duplex: 'half',
  })
  try {
    const response = await handler(request)
    res.writeHead(response.status, Object.fromEntries(response.headers))
    if (response.body) Readable.fromWeb(response.body).pipe(res)
    else res.end()
  } catch (error) {
    console.error(`${url.pathname} failed:`, error)
    res.writeHead(500).end('Function failed')
  }
}).listen(port, () => console.log(`API functions (${names.join(', ')}) on http://localhost:${port}/api/`))
