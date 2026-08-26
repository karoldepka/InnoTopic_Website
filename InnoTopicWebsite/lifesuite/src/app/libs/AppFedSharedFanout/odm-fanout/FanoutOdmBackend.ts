import {Injectable, Injector} from '@angular/core'
import {OdmBackend} from '../../AppFedShared/odm/OdmBackend'
import {OdmItem__OLD__} from '../../AppFedShared/odm/OdmItem__OLD__'
import {SupabaseOdmBackend} from '../../AppFedSharedSupabase/odm-supabase/supabase-odm-backend.service'
import {NeonOdmBackend} from '../../AppFedSharedNeon/odm-neon/neon-odm-backend.service'
import {MongoOdmBackend} from '../../AppFedSharedMongo/odm-mongo/mongo-odm-backend.service'
import {SurrealOdmBackend} from '../../AppFedSharedSurreal/odm-surreal/surreal-odm-backend.service'
import {FanoutOdmCollectionBackend} from './FanoutOdmCollectionBackend'
import {environment} from '../../../../environments/environment'

export interface FanoutPeerConfig {
  backend: OdmBackend
  name: string
  required: boolean
}

type FanoutReplicaEnv = {
  enabled?: boolean
  odmApiUrl?: string
}

export function shouldEnableFanoutReplica(peerEnv: FanoutReplicaEnv | undefined): boolean {
  if (peerEnv?.enabled === false) {
    return false
  }
  return !isLoopbackApiUrlUnreachableFromThisBrowser(peerEnv?.odmApiUrl)
}

function isLoopbackApiUrlUnreachableFromThisBrowser(apiUrl: string | undefined): boolean {
  if (!apiUrl || typeof window === 'undefined') {
    return false
  }
  return isLoopbackApiUrlUnreachableFromBrowser(
    apiUrl,
    window.location.href,
    window.location.hostname,
    typeof navigator === 'undefined' ? '' : navigator.userAgent,
  )
}

export function isLoopbackApiUrlUnreachableFromBrowser(
  apiUrl: string,
  browserLocationHref: string,
  browserHostname: string,
  userAgent: string,
): boolean {
  let parsed: URL
  try {
    parsed = new URL(apiUrl, browserLocationHref)
  } catch {
    return false
  }
  if (!isLoopbackHost(parsed.hostname)) {
    return false
  }
  // `localhost` inside a real phone/tablet browser or WebView is that device, not the dev
  // machine running backend-ts. The same is true when the app is served from a LAN hostname/IP.
  return isLikelyMobileBrowser(userAgent) || !isLoopbackHost(browserHostname)
}

function isLoopbackHost(hostname: string | undefined): boolean {
  const host = hostname?.toLowerCase()
  return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]'
}

function isLikelyMobileBrowser(userAgent: string): boolean {
  return /android|iphone|ipad|ipod|mobile/i.test(userAgent)
}

/**
 * Supabase is the required peer; Neon/Mongo/Surreal are enabled replicas. Every write is attempted
 * against every enabled peer, but a secondary replica being offline (common in local dev when
 * backend-ts on localhost:8000 is not running) must not keep the user's durable pending-edit
 * journal stuck after Supabase has accepted the write. Reads still race all enabled peers,
 * forwarding whichever responds first with real data and backfilling the others from that response
 * (see FanoutOdmCollectionBackend.raceQuery - an empty response never preempts a real one still in
 * flight, so a not-yet-backfilled peer can't shadow Supabase's actual data even before the
 * one-time backfill below finishes).
 *
 * On top of that per-query safety net, each FanoutOdmCollectionBackend backfills itself once, the
 * first time it's constructed (see its `backfillFromSupabase()`), pulling every existing item
 * straight from `backfillSourceBackend` (Supabase, which already has the full history) into the
 * others - so steady-state races settle on whichever peer is fastest instead of always waiting out
 * an empty response. See the localStorage-flag guard there for why this runs once.
 *
 * Supabase itself is never gated on `enabled` - it's the one peer every environment (including
 * production) actually has, and `backfillSourceBackend` below assumes it's always present. Since
 * every write blocks on every peer confirming, an `enabled: false` peer here isn't just "not
 * used" - it's "this peer would otherwise break every save in the app for real users" (e.g.
 * Surreal today: a local Docker container, unreachable from a real deployed environment.prod.ts
 * build until it has an actual hosted instance - see environment.prod.ts's override).
 */
@Injectable()
export class FanoutOdmBackend extends OdmBackend {
  readonly peerBackends: OdmBackend[]
  readonly peerConfigs: FanoutPeerConfig[]
  /** Parallel to peerBackends - human-readable names for describeSaveDestination() below, since
   * OdmBackend itself carries no display name. Built from the same enabled-flag conditionals so
   * the two arrays can never drift out of sync with each other. */
  private readonly peerNames: string[]
  /** Supabase - already holds the full history, so it's the one-time backfill source for every
   * other peer. Kept as an explicit reference rather than relying on peerBackends[0]'s order. */
  readonly backfillSourceBackend: OdmBackend

  constructor(
    injector: Injector,
    supabaseOdmBackend: SupabaseOdmBackend,
    neonOdmBackend: NeonOdmBackend,
    mongoOdmBackend: MongoOdmBackend,
    surrealOdmBackend: SurrealOdmBackend,
  ) {
    super(injector)
    const env = environment as any
    this.peerConfigs = [
      {backend: supabaseOdmBackend, name: 'Supabase', required: true},
      ...(shouldEnableFanoutReplica(env.neon) ? [{backend: neonOdmBackend, name: 'Neon', required: env.neon?.required ?? false}] : []),
      ...(shouldEnableFanoutReplica(env.mongo) ? [{backend: mongoOdmBackend, name: 'Mongo', required: env.mongo?.required ?? false}] : []),
      ...(shouldEnableFanoutReplica(env.surreal) ? [{backend: surrealOdmBackend, name: 'Surreal', required: env.surreal?.required ?? false}] : []),
    ]
    this.peerBackends = this.peerConfigs.map(({backend}) => backend)
    this.peerNames = this.peerConfigs.map(({name, required}) => required ? name : `${name} optional`)
    this.backfillSourceBackend = supabaseOdmBackend
    this.initDb()
  }

  createCollectionBackend<T extends OdmItem__OLD__<T>>(
    injector: Injector,
    className: string,
    opts: { dontStoreVersionHistory: boolean },
  ): FanoutOdmCollectionBackend<any> {
    return new FanoutOdmCollectionBackend<T>(injector, className, this, opts)
  }

  override describeSaveDestination(): string {
    return this.peerNames.join(', ')
  }

  protected initDb() {
    this.authService.authUser$.subscribe(user => {
      if (user) {
        this.backendReady$.nextWithCache(true)
      }
    })
  }
}
