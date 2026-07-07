import '../src/instrumentation.js';
import { handle } from 'hono/vercel';
import { app } from '../src/app.js';

/** Vercel serverless entry point - see vercel.json's catch-all rewrite, which sends every request
 * here regardless of path (the app's own routes are registered at their real paths, e.g.
 * /health, /api/odm/items, not nested under /api/*, so a plain "everything -> this function"
 * rewrite is what preserves the existing environment.base.ts URLs unchanged). Dotenv isn't needed
 * here the way index.ts needs it for local dev - Vercel injects configured environment variables
 * directly, there's no .env file to load in that environment. */
export const runtime = 'nodejs';

export default handle(app);
