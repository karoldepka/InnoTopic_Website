import { errorAlert } from './error-alert';

function escapeRegexp(s: any) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Icon base paths - root-relative by default (`/assets/topics-ui/...`), so resolution only
 * depends on the current page's origin, never on the current route's depth or on wherever a
 * bundler happens to relocate this module's own JS. Two prior approaches were tried and
 * rejected: (1) the original Angular app's '../../../assets/...' was resolved by the browser
 * relative to the current PAGE URL, which only worked by accident (the '../' count happened to
 * match the app's routing depth); (2) `new URL(..., import.meta.url)` (relative to *this
 * module's own location*) broke under Vite's dev-mode dependency pre-bundling, which relocates
 * this module into its own cache directory - so "relative to the module" pointed at a location
 * that never actually had the asset files.
 * Configurable so a consumer can serve the bundled icons from a different mount point, or point
 * at its own hosted copy instead - see setIconBasePath()/setCountryIconBasePath().
 */
let iconBasePath = '/assets/topics-ui/logos-l/'
let countryIconBasePath = '/assets/topics-ui/countries/'

export function setIconBasePath(path: string) { iconBasePath = path }
export function setCountryIconBasePath(path: string) { countryIconBasePath = path }

export class TopicUrls {
  constructor(
    public webSite?: string | null,
    public wikipedia?: string | null,
    public gitHub?: string | null,
    public npm?: string | null,
    public stackOverFlow?: string | null,
    public stackShare?: string | null,
    public twitter?: string | null,
    public alternativeTo?: string | null,
    public changeLog?: string | null,
    public runKit?: string | null,
  ) {
    if ( this.alternativeTo === undefined ) {
      this.alternativeTo = null // for firebase
    }
    if ( this.changeLog === undefined ) {
      this.changeLog = null // for firebase
    }
    if ( this.runKit === undefined ) {
      this.runKit = null // for firebase
    }
  }
}


export type Url = string

export class Topic {
  logo!: string | null;
  id!: string
  logoSize!: number[]
  attribution?: string
  license?: string
  author?: string
  downloadedFrom?: string
  url?: string

  public pressKitUrl?: Url

  // TODO: introduce a separate TopicMetaData or TopicPages class. Will be easier to put it in a separate firebase location.

  constructor(
    public name: string,
    // public topicId?,
    logo?: string | null,
    public website?: Url | null ,
    public related?: Topic[] | null,
    public urls?: TopicUrls,
    public dependencies?: Topic[],
    public shortName?: string | null,
    public logoTypeWide?: boolean | null,
    // just to match types for now:
    public iconWebsite?: string | string[],
    public iconUrl?: Url | null,
    public subTopics?: any,
    public organisation?: any,
    public categories?: any,
    public ecosystem?: any,
    public logoSmallIcon?: string,
    public description?: string,
    /** allows more free-form draft text than description or tagline */
    public comments?: string,
    public tagline?: string,
  ) {
    // console.log('new Topic(', name)
    this.setNameAndLogoAndId(name, logo);
    // if ( this.website === undefined ) {
    //   this.website = null // for firebase, because it does not allow to save undefined
    // }
    if ( this.related === undefined ) {
      this.related = null // for firebase, because it does not allow to save undefined
    }
    // if ( this.urls === undefined ) {
    //   this.urls = new TopicUrls(null, null, null, null, null, null) // for firebase, because it does not allow to save undefined
    // }
    if ( this.id.match(/\.|#|\$|\[|\]|\//) ) {
      errorAlert('Topic id contains illegal char:', this.id)
      return null as any
    }
  }

  private static regexpImageFileEndingWithExtension = /.*\.(png|svg|jpg)$/;

  /** Using Convention Over Configuration */
  public setNameAndLogoAndId(name: string, logo?: string | null) {
    // console.log('setNameAndLogoAnd name ' + name)
    this.name = name
    this.id = name
      .replace('#', '_Sharp')
      .replace(/^\./, 'Dot_')
      .replace(/\./, '_Dot_')
      .replace(/\//, '_Slash_');
    if (this.id !== name) {
      // console.log('id mangled from name: ' + this.id)
    }
    if ( this.logo === undefined /* else do not override if specified */ ) {
      if (logo === null) {
        this.logo = null;
      } else if (logo === undefined) {
        this.logo = this.getLogoPath(this.getLogoFileName(name.toLowerCase()))
      } else {
        this.logo = this.getLogoPath(logo);
      }
    } else {
      if ( this.logo !== null ) {
        this.logo = this.getLogoPath(this.logo)
      }
    }
    if ( this.logo && ! this.logo.toLowerCase().match(Topic.regexpImageFileEndingWithExtension) ) {
      this.logo = this.logo + '.svg'
    }
    // console.log('setNameAndLogoAndId ' + this.id, this)
  }

  public getLogoPath(iconFileName: string) {
    if ( !iconFileName ) // FIXME: have a zero-width image for null, coz vertical align
      return null // FIXME: undefined ; well actually it is NULL

    const countriesPrefix = 'countries/' // maybe clients, but still we colorize companies logos
    const isCountry = iconFileName.startsWith(countriesPrefix)
    return isCountry
      ? countryIconBasePath + iconFileName.slice(countriesPrefix.length)
      : iconBasePath + iconFileName
  }

  private getLogoFileName(tag: string) {
    return tag.toLowerCase().replace(/ /g, '-') +
      (tag.toLowerCase().match(Topic.regexpImageFileEndingWithExtension) ? '' : '.svg');
  }

  matchesTextFilter(filterString: string) {
    if ( ! filterString ) {
      return true;
    }
    filterString = escapeRegexp(filterString)
    // return this.name.toLowerCase().indexOf(filterString.toLowerCase()) === 0;
    return this.name.toLowerCase().match(filterString.toLowerCase());
  }

  setLogo(icon: string) {
    this.logo = this.getLogoPath(icon)
    return this
  }

  setRelated(...related: any) {
    this.related = related
    return this
  }

  setId(id: any) {
    this.id = id
    return this
  }

  setName(name: any) {
    this.name = name
    return this
  }

  sealAndValidate() {
    // FIXME
  }
}
