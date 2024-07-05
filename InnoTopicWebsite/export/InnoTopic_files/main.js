(self["webpackChunkapp"] = self["webpackChunkapp"] || []).push([["main"],{

/***/ 2043:
/*!**********************************************************!*\
  !*** ./src/app/TopicFriendsShared3/topics-core/Topic.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Topic: () => (/* binding */ Topic),
/* harmony export */   TopicUrls: () => (/* binding */ TopicUrls)
/* harmony export */ });
var _Topic;
function escapeRegexp(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
class TopicUrls {
  constructor(webSite, wikipedia, gitHub, npm, stackOverFlow, stackShare, twitter, alternativeTo, changeLog, runKit) {
    this.webSite = webSite;
    this.wikipedia = wikipedia;
    this.gitHub = gitHub;
    this.npm = npm;
    this.stackOverFlow = stackOverFlow;
    this.stackShare = stackShare;
    this.twitter = twitter;
    this.alternativeTo = alternativeTo;
    this.changeLog = changeLog;
    this.runKit = runKit;
    if (this.alternativeTo === undefined) {
      this.alternativeTo = null; // for firebase
    }
    if (this.changeLog === undefined) {
      this.changeLog = null; // for firebase
    }
    if (this.runKit === undefined) {
      this.runKit = null; // for firebase
    }
  }
}
class Topic {
  // TODO: introduce a separate TopicMetaData or TopicPages class. Will be easier to put it in a separate firebase location.
  constructor(name,
  // public topicId?,
  logo, website, related, urls, dependencies, shortName, logoTypeWide,
  // just to match types for now:
  iconWebsite, iconUrl, subTopics, organisation, categories, ecosystem, logoSmallIcon, description, /** allows more free-form draft text than description or tagline */
  comments, tagline) {
    this.name = name;
    this.website = website;
    this.related = related;
    this.urls = urls;
    this.dependencies = dependencies;
    this.shortName = shortName;
    this.logoTypeWide = logoTypeWide;
    this.iconWebsite = iconWebsite;
    this.iconUrl = iconUrl;
    this.subTopics = subTopics;
    this.organisation = organisation;
    this.categories = categories;
    this.ecosystem = ecosystem;
    this.logoSmallIcon = logoSmallIcon;
    this.description = description;
    this.comments = comments;
    this.tagline = tagline;
    // console.log('new Topic(', name)
    this.setNameAndLogoAndId(name, logo);
    // if ( this.website === undefined ) {
    //   this.website = null // for firebase, because it does not allow to save undefined
    // }
    if (this.related === undefined) {
      this.related = null; // for firebase, because it does not allow to save undefined
    }
    // if ( this.urls === undefined ) {
    //   this.urls = new TopicUrls(null, null, null, null, null, null) // for firebase, because it does not allow to save undefined
    // }
    if (this.id.match(/\.|#|\$|\[|\]|\//)) {
      const message = 'Topic id contains illegal char: ';
      console.error(message, this);
      window.alert(message + this.id);
      return null;
    }
  }
  /** Using Convention Over Configuration */
  setNameAndLogoAndId(name, logo) {
    // console.log('setNameAndLogoAnd name ' + name)
    this.name = name;
    this.id = name.replace('#', '_Sharp').replace(/^\./, 'Dot_').replace(/\./, '_Dot_').replace(/\//, '_Slash_');
    if (this.id !== name) {
      // console.log('id mangled from name: ' + this.id)
    }
    if (this.logo === undefined /* else do not override if specified */) {
      if (logo === null) {
        this.logo = null;
      } else if (logo === undefined) {
        this.logo = this.getLogoPath(this.getLogoFileName(name.toLowerCase()));
      } else {
        this.logo = this.getLogoPath(logo);
      }
    } else {
      if (this.logo !== null) {
        this.logo = this.getLogoPath(this.logo);
      }
    }
    if (this.logo && !this.logo.toLowerCase().match(Topic.regexpImageFileEndingWithExtension)) {
      this.logo = this.logo + '.svg';
    }
    // console.log('setNameAndLogoAndId ' + this.id, this)
  }
  getLogoPath(iconFileName) {
    // return '../../../assets/images/logos/' + iconFileName.toLowerCase() + '-icon.svg'
    // return '../../../assets/images/logos/' + iconFileName
    return '../../../assets/images/logos-l/logos/' + iconFileName;
  }
  getLogoFileName(tag) {
    return tag.toLowerCase().replace(/ /g, '-') + (tag.toLowerCase().match(Topic.regexpImageFileEndingWithExtension) ? '' : '.svg');
  }
  matchesTextFilter(filterString) {
    if (!filterString) {
      return true;
    }
    filterString = escapeRegexp(filterString);
    // return this.name.toLowerCase().indexOf(filterString.toLowerCase()) === 0;
    return this.name.toLowerCase().match(filterString.toLowerCase());
  }
  setLogo(icon) {
    this.logo = this.getLogoPath(icon);
    return this;
  }
  setRelated(...related) {
    this.related = related;
    return this;
  }
  setId(id) {
    this.id = id;
    return this;
  }
  setName(name) {
    this.name = name;
    return this;
  }
  sealAndValidate() {
    // FIXME
  }
}
_Topic = Topic;
_Topic.regexpImageFileEndingWithExtension = /.*\.(png|svg|jpg)$/;

/***/ }),

/***/ 8003:
/*!****************************************************************!*\
  !*** ./src/app/TopicFriendsShared3/topics-core/topics-data.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AI: () => (/* binding */ AI),
/* harmony export */   Backend: () => (/* binding */ Backend),
/* harmony export */   Build_Systems_And_Package_Managers: () => (/* binding */ Build_Systems_And_Package_Managers),
/* harmony export */   Cloud: () => (/* binding */ Cloud),
/* harmony export */   Comprehension_Comparators_Security_And_Exploring: () => (/* binding */ Comprehension_Comparators_Security_And_Exploring),
/* harmony export */   Crypto: () => (/* binding */ Crypto),
/* harmony export */   Databases: () => (/* binding */ Databases),
/* harmony export */   Frontend: () => (/* binding */ Frontend),
/* harmony export */   Frontend_And_Backend_App_Platforms: () => (/* binding */ Frontend_And_Backend_App_Platforms),
/* harmony export */   Frontend_Visual: () => (/* binding */ Frontend_Visual),
/* harmony export */   FunAndSports: () => (/* binding */ FunAndSports),
/* harmony export */   Graphics: () => (/* binding */ Graphics),
/* harmony export */   Java: () => (/* binding */ Java),
/* harmony export */   JavaScript: () => (/* binding */ JavaScript),
/* harmony export */   Languages: () => (/* binding */ Languages),
/* harmony export */   Markup_And_Config_Languages: () => (/* binding */ Markup_And_Config_Languages),
/* harmony export */   Mobile: () => (/* binding */ Mobile),
/* harmony export */   OS: () => (/* binding */ OS),
/* harmony export */   Other: () => (/* binding */ Other),
/* harmony export */   Project_Management_Tools: () => (/* binding */ Project_Management_Tools),
/* harmony export */   Social: () => (/* binding */ Social),
/* harmony export */   Testing: () => (/* binding */ Testing),
/* harmony export */   Tools: () => (/* binding */ Tools),
/* harmony export */   Version_Control: () => (/* binding */ Version_Control),
/* harmony export */   processTopics: () => (/* binding */ processTopics),
/* harmony export */   t: () => (/* binding */ t),
/* harmony export */   tNarrow: () => (/* binding */ tNarrow),
/* harmony export */   tNoIcon: () => (/* binding */ tNoIcon),
/* harmony export */   tSquare: () => (/* binding */ tSquare),
/* harmony export */   tWide: () => (/* binding */ tWide),
/* harmony export */   topicCategoriesArray: () => (/* binding */ topicCategoriesArray),
/* harmony export */   topics: () => (/* binding */ topics),
/* harmony export */   topicsArr: () => (/* binding */ topicsArr)
/* harmony export */ });
/* harmony import */ var _utils_dictionary_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/dictionary-utils */ 4806);
/* harmony import */ var _Topic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Topic */ 2043);
/* harmony import */ var _topics__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./topics */ 6554);



function coerceLogoToTopicData(topicData) {
  // console.log('coerceLogoToTopicData: topicData = ', topicData);
  if (typeof topicData === 'string') {
    topicData = {
      logo: topicData
    };
  }
  // console.log('coerceLogoToTopicData: coerced topicData = ', topicData);
  return topicData;
}
function t(topicData, iconWebsiteTodo) {
  topicData = coerceLogoToTopicData(topicData);
  const topic = Object.create(_Topic__WEBPACK_IMPORTED_MODULE_1__.Topic.prototype);
  Object.assign(topic, topicData);
  // console.log(`t()`, `topicData`, topicData, `topic`, topic, `topic.id`, topic.id)
  // TODO: instantiate Topic class (once we have id). But be careful, if using Object.create, ctor is not called
  // console.log('topic instantiated', topic)
  // instantiate as soon as possible, even incomplete object; even before ID
  // to have access to utility methods e.g. fluent API like .setLogo()
  // and to avoid changing object prototype
  // when having id and post-processing, call smth like finaliseAndValidate, which will post-process/mangle id/name if necessary (keep in mind topics-old which already have name&id)
  // https://jeena.net/constructor-object-create
  return topic;
}
/* Just a placeholder and redirect */
function tNarrow(topicData, logoSize) {
  return tWide(topicData, logoSize);
}
function tSquare(topicData, logoSize) {
  return tWide(topicData, logoSize);
}
function tWide(topicData, logoSize) {
  topicData = coerceLogoToTopicData(topicData);
  return t({
    ...topicData,
    logoTypeWide: true,
    logoSize
  });
}
function tNoIcon(topicData) {
  return t({
    ...topicData,
    logo: undefined
  });
}
class Frontend_Visual {
  constructor() {
    this.Bulma = tNarrow( /* {tagline: 'Modern CSS framework based on Flexbox'} */);
    this['Chakra UI'] = t('chakra-ui-icon' /* {tagline: '⚡️ Simple, Modular & Accessible UI Components for your React Applications'} */);
    this['Mantine'] = tNarrow('mantine-icon.svg' /* {tagline: 'A fully featured React components library'} */);
  }
}
/** TODO split (here, not in highlights) into
 * Frontend - UI/visual (bigger icons for me) (ui libs - where is the line - if it deals with HTML markup; or generates smth visual html/css/svg etc; sass, webgl; maybe docusaurus)
 *  - another criterion: stuff that I actually use for my own apps; e.g. I wouldnt care too much about e.g. Business Intelligence (yest?)
 * Frontend - Other (includes libs like lodash, state mgmt) */
class Frontend {
  constructor() {
    this['Frontend'] = tSquare('generic/frontend');
    this['HTML5'] = t({
      logo: 'html-5.svg'
    });
    this['CSS3'] = t({
      logo: 'css-3.svg'
    });
    this['PWA'] = tWide();
    this['D3.js'] = t({
      logo: 'd3.svg'
    }); // TODO Vega [Lite] - on top of d3. From Luis Sanchez
    this['Chart.js'] = t({
      logo: "chart-js.svg" /* non-standard svg*/
    });
    this['Stylus'] = tWide();
    this['Less'] = tWide('less-nomasks.svg');
    this['Sass'] = tWide();
    this['PostCSS'] = t(); /* sponsored by tailwind */
    this['Headless UI'] = tSquare('headlessui-icon.svg'); // Completely unstyled, fully accessible UI components, designed to integrate beautifully with Tailwind CSS.
    this['Tailwind CSS'] = tWide('tailwindcss-icon.svg');
    this['Windi CSS'] = tNarrow('windi-css.svg');
    // TODO: https://www.pollen.style/
    this.PouchDB = t({
      categories: 'Databases'
    });
    this.PrimeNG = t({
      iconWebsite: 'https://www.primefaces.org/press-kit/',
      iconUrl: 'https://www.primefaces.org/presskit/primeng-logo.svg',
      urls: new _Topic__WEBPACK_IMPORTED_MODULE_1__.TopicUrls('https://www.primefaces.org/primeng', undefined, 'https://github.com/primefaces/primeng', 'https://www.npmjs.com/package/primeng', 'https://stackoverflow.com/questions/tagged/primeng', undefined, 'https://twitter.com/prime_ng')
    });
    this.Nx = tWide({
      logo: 'nx-logo-white.svg',
      // logoSize: [1048, 652], // FIXME
      iconUrl: 'https://raw.githubusercontent.com/nrwl/nx/master/nx-logo.png'
    });
    this.Rush = tWide('rush-icon.svg');
    this.xplat = tWide('xplat-logo.png', [899, 393]);
    this['Web Components'] = tWide('webcomponents');
    // TODO https://github.com/ampproject/amphtml
    this["Lit"] = tWide('lit-icon.svg'); /* lit elements (Moises) */
    // TODO: https://www.webcomponents.org/ logo
    this.WebPack = t();
    this["Rollup"] = t('rollupjs.svg'); /* comments: The bundler behind Vite */
    this.Vite = t('vitejs');
    this.Vitest = t();
    this["Speedy Web Compiler (SWC)"] = tWide('swc'); /* written in rust */
    this["esbuild"] = t();
    this.Turbopack = t('turbopack-icon.svg');
    this.Turborepo = t('turborepo-icon.svg');
    this.Biome = t('biome-icon.svg'); // Rust
    this.pnpm = t('pnpm-icon');
    this.Angular = tNarrow({
      logo: 'angular-icon',
      urls: new _Topic__WEBPACK_IMPORTED_MODULE_1__.TopicUrls('https://angular.io/', 'https://en.wikipedia.org/wiki/Angular_(application_platform)', 'https://github.com/angular/angular', undefined, 'https://stackoverflow.com/questions/tagged/angular', 'https://stackshare.io/angular-2', 'https://twitter.com/angular'),
      subTopics: {
        'Flex-Layout': t({
          urls: new _Topic__WEBPACK_IMPORTED_MODULE_1__.TopicUrls(undefined, 'https://github.com/angular/flex-layout')
        }),
        'Flex-Layout Responsive API': t({
          urls: new _Topic__WEBPACK_IMPORTED_MODULE_1__.TopicUrls(undefined, 'https://github.com/angular/flex-layout/wiki/Responsive-API')
        }),
        'Change Detection': t(),
        'Dependency Injection': t({
          shortName: 'DI'
        }),
        'Modules': t(),
        'Router': t(),
        'Reactive Forms': t(),
        'Template-Driven Forms': t(),
        'Lazy Loading': t(),
        'i18n': t(),
        'HTTP': t(),
        'Angular Universal': t()
      }
    });
    this.Codelyzer = t();
    this['Angular Elements'] = t('angular-elements-logo.png');
    this['Angular Material'] = t();
    this.AngularJS = tNoIcon({
      urls: new _Topic__WEBPACK_IMPORTED_MODULE_1__.TopicUrls(undefined, 'https://en.wikipedia.org/wiki/AngularJS', 'https://github.com/angular/angular.js', undefined, 'https://stackoverflow.com/questions/tagged/angularjs', 'https://stackshare.io/angularjs', undefined)
    });
    this.Ionic = t({
      /* logos: https://ionicframework.com/press */
      // logo: 'ionic-light-logo-black.svg',
      // logo: 'ionic-logotype-white-on-blue-cropped-print-fixed.svg',
      logo: 'ionic-logo-affinity-export-import-print-fix.svg',
      urls: new _Topic__WEBPACK_IMPORTED_MODULE_1__.TopicUrls('https://ionicframework.com/', 'https://en.wikipedia.org/wiki/Ionic_(mobile_app_framework)', 'https://github.com/ionic-team/ionic', 'https://www.npmjs.com/package/ionic', 'https://stackoverflow.com/questions/tagged/ionic-framework', 'https://stackshare.io/ionic', 'https://twitter.com/Ionicframework'),
      subTopics: {
        Stencil: tNoIcon(),
        Capacitor: tNoIcon()
      }
    });
    this.Stencil = tWide('stenciljs-icon.svg');
    this["WebKit"] = t();
    this["NW.js"] = t('nodewebkit'); /* NW.js */
    this['Electron'] = t();
    this['Expo'] = t('expo-icon');
    this['Compose Multiplatform'] = tNarrow('compose-multiplatform.svg'); /* Develop stunning shared UIs for Android, iOS, desktop, and web. JetBrains. https://stackshare.io/compose-mp */
    this['Vue.js'] = tWide({
      logo: 'vue'
    });
    this['Nuxt'] = tWide('nuxt-icon');
    this['Gridsome'] = t({
      logo: 'gridsome-icon.svg'
    });
    this['Svelte'] = tNarrow('svelte-icon'); // https://github.com/sveltejs/branding
    // TODO Phoenix  https://www.phoenixframework.org/  supposedly most loved; https://github.com/phoenixframework/phoenix
    this['SolidJS'] = t('solidjs-icon');
    this['Qwik'] = tNarrow('qwik-icon.svg');
    this['Astro'] = t('astro-icon.svg');
    this["Inferno"] = t();
    this['Mithril'] = t();
    this['Marko'] = tWide('marko-cropped.svg');
    this['Alpine.js'] = tWide('alpinejs-icon.svg');
    this['Rax'] = t();
    this['Riot'] = t();
    // TODO: Turbo (DHH dropping TypeScript, and not even jsdoc nor .d.ts). + hotwire stimulus
    this['Vercel'] = tWide('vercel-icon.svg');
    // ===== headless CMS:
    this['Storyblok'] = t('storyblok-icon.svg');
    this["Strapi"] = tSquare('strapi-icon.svg');
    // TODO: https://web.dev/
    this.Lodash = t();
    this['TypeDI'] = tNoIcon(); // TODO move to Frontend & Backend / JavaScript / TypeScript
    this['TypeStack'] = tNoIcon();
    this.Bootstrap = tWide();
    this['React-Bootstrap'] = t('react-bootstrap.svg');
    this["Material Design"] = t('Google_Material_Design_Logo.svg');
    this.jQuery = tWide('jquery-icon-cropped.svg');
    this["Hotwired Turbo"] = tNarrow('hotwired-turbo.svg'); // "Hotwire is an alternative approach to building modern web applications without using much JavaScript by sending HTML instead of JSON over the wire."
    this["Hotwired Stimulus"] = tNarrow('hotwired-stimulus.svg');
    this['AG Grid'] = tWide('ag-grid');
    this['ApexCharts.js'] = tNoIcon();
    this.AngularFire = tNoIcon();
    this.NgRx = t(); // https://ngrx.io/presskit
    // NGXS = t({logo: 'ngxs.png', logoSize: [442, 132]})
    this.NGXS = t(); // https://github.com/adisreyaj/store/pull/1/commits/4a7702048653a5261694c40b6ceb61f77a82b59a#diff-feb17517a55f6687ca9433cf00fab45526e32f6b05f018096c0806f1dc767ac8
    this.MobX = t();
    this["MobX-State-Tree"] = t(`mobx-state-tree-logo.svg`
    /* https://github.com/mobxjs/mobx-state-tree/blob/b6c1c9b29d7bd7525ac6588f8f67f6c13eb17b2b/website/static/img/mobx-state-tree-logo.svg
    * https://github.com/mobxjs/mobx-state-tree/blob/master/website/static/img/mobx-state-tree-logo.svg
    * */);
    this.Redux = t();
    this["Redux Toolkit"] = t(`redux--toolkit.svg`);
    this.Recoil = tWide('recoil-icon');
    this.Jotai = tWide('jotai');
    this.Zustand = tWide('zustand--logo512.png--vectorizer.ai--cropped.svg'); // tagline: '🐻 Bear necessities for state management in React'
    this.Pinia = tWide(); // vue state management
    this.React = tWide();
    // TODO: https://web.dev/baseline/ (on MDN)
    // Million = tWide() TODO: https://million.dev/ ; Make React 70% faster
    this.Preact = t();
    this.Gatsby = t('Gatsby-Monogram.svg');
    this["Next.js"] = t('nextjs-icon-export.svg');
    this["Remix"] = t('remix-icon.svg'); /* https://remix.run/ */
    // TODO: Chakra, Playwright
    this.GreenSock = t('greensock-icon.svg');
    this.Ember = tWide();
    this.WebSocket = t();
    this['Chrome Extensions'] = t('chrome.svg');
    this['Dexie.js'] = t('dexie-js.svg');
    this['Aurelia'] = t();
    this['Font Awesome'] = t('fort-awesome-alt-brands.svg');
    this.Workbox = tWide('Workbox-Logo-Grey.svg');
    this['SVG.js'] = t('svg-js.png' /* WTF, PNG for an SVG lib :D */);
    this['Storybook'] = t('storybook-icon.svg');
    // TODO: storyblok?
    this['DDD - Domain-Driven Design'] = t('project-diagram-solid.svg');
    // TODO Scully
    this.Lighthouse = t('google--lighthouse-logo.svg' /*
                                                      https://developers.google.com/web/tools/lighthouse
                                                      https://developers.google.com/web/tools/lighthouse/images/lighthouse-logo.svg*/);
    this['three.js'] = tNoIcon( /*
                                https://threejs.org/
                                pressKit: https://github.com/mrdoob/three.js/issues/2789
                                */);
    this['WebGL'] = tWide('webgl-cropped.svg');
    this['glTF'] = tWide({
      logo: 'GlTF_Official_Logo.svg' /*logoSize: [1250, 1168]*/
    }
    /* pressKit: https://www.khronos.org/legal/trademarks/
     logoFile: https://www.khronos.org/assets/utilities/retrieveFile.php?d=gltf&t=logopacks
     https://upload.wikimedia.org/wikipedia/en/d/dd/GlTF_Official_Logo.svg
     https://www.khronos.org/assets/images/api_logos/gltf.svg
     */);
    this['WebGPU'] = tWide('webgpu-icon--cropped.svg');
    this['Micro Frontends'] = tNoIcon( /* https://martinfowler.com/articles/micro-frontends.html */);
  }
}
class JavaScript {
  constructor() {
    this.Promises = t();
    this.JavaScript = t();
    // RxJS = tNoIcon()
    this.RxJS = t('reactivex');
    // TODO: more like ecosystem
  }
}
class Java {}
class Backend {
  constructor() {
    // TODO: hapi fastify apollo-server koa
    // TODO: type-graphql, typeORM
    this['Microservices'] = tNoIcon();
    this['TypeORM'] = tNoIcon();
    this['TypeGraphQL'] = t(`typegraphql-icon.svg` /* https://github.com/MichalLytek/type-graphql/issues/824 */);
    this['Altair GraphQL Client'] = t(`altair`); // https://altairgraphql.dev/
    this['Apollo'] = t(`apollostack.svg`);
    this['Apollo Studio'] = t(`apollostack.svg`);
    this['Node.js'] = tWide({
      logo: 'nodejs-icon.svg',
      logoSmallIcon: 'nodejs-icon.svg'
    });
    this['NestJS'] = t(`nest--logo-small.ede75a6b.svg`);
    // 'GraalVM' = tWide('graalvm-rgb-cropped.svg')
    this['GraalVM'] = tWide('graalvm_rabbit_icon.svg');
    this.Kong = tWide('kong-icon.svg' /* { tagline: 'the fastest cloud native API platform.' } */);
    this.GraphQL = t();
    this.RabbitMQ = t();
    this.Swagger = t();
    this.OpenAPI = t('openapi-icon.svg'); /* https://www.openapis.org/ ; Compatible with JSON Schema */
    // TODO https://www.asyncapi.com/ (has svgporn)
    this.Django = tSquare('django-icon.svg');
    this.Laravel = t();
    this['Express.js'] = tWide({
      logo: 'express.svg',
      subTopics: [(0,_topics__WEBPACK_IMPORTED_MODULE_2__.tag)('Kraken.js', 'krakenjs', 'http://krakenjs.com/'), (0,_topics__WEBPACK_IMPORTED_MODULE_2__.tag)('FeathersJS', 'feathersjs', 'https://feathersjs.com/'), (0,_topics__WEBPACK_IMPORTED_MODULE_2__.tag)('LoopBack', 'loopback', 'https://loopback.io/'), (0,_topics__WEBPACK_IMPORTED_MODULE_2__.tag)('MEAN Stack', 'meanio', 'http://mean.io/'), (0,_topics__WEBPACK_IMPORTED_MODULE_2__.tag)('Sails', 'sails', 'http://sailsjs.com/')],
      urls: new _Topic__WEBPACK_IMPORTED_MODULE_1__.TopicUrls('https://expressjs.com', 'https://en.wikipedia.org/wiki/Express.js', 'https://github.com/expressjs/express', 'https://www.npmjs.com/package/express', 'https://stackoverflow.com/questions/tagged/express', 'https://stackshare.io/expressjs', 'https://twitter.com/expressjs')
    });
    this['Deno'] = t();
    this["Bun"] = tWide(); /* TODO: mark as non-main experience; written in Zig */
    this.KeystoneJS = t({
      urls: new _Topic__WEBPACK_IMPORTED_MODULE_1__.TopicUrls('http://keystonejs.com/')
    });
    // TODO: adonis ?
    this.Spring = t('spring-icon.svg');
    this['Spring Boot'] = t();
    this.Hibernate = t();
    this["Fermyon"] = tNarrow('fermyon-icon.svg'); // wasm instead of docker { tagline: 'Fermyon Cloud is the easiest way to deploy and manage cloud native WebAssembly applications with Spin, our developer tool.', pressKitUrl: 'https://design.fermyon.dev/' }'
    this.Docker = tWide('docker-simple' /* https://www.docker.com/company/newsroom/media-resources */);
    this['Vagrant'] = tNarrow('vagrant-icon.svg');
    this.Terraform = t('terraform-icon.svg'); /* company: HashiCorp */
    this.Ansible = t('ansible-icon.svg');
    this.Kubernetes = t( /* they had a typo: 'kubernets.svg'*/);
    this.Elasticsearch = t( /* https://www.elastic.co/brand */);
    this.OpenSearch = t('opensearch-icon.svg');
    this.Kibana = t( /* https://www.elastic.co/brand */);
    this.Logstash = t( /* https://www.elastic.co/brand */);
    this.Beats = t( /* https://www.elastic.co/brand */);
    // Analytics
    // TODO: https://superset.apache.org/
    this.NGINX = tWide();
    this['Ruby On Rails'] = t();
  }
}
class Frontend_And_Backend_App_Platforms {
  constructor() {
    this.JHipster = t();
    this.Meteor = tWide();
    this.Hoodie = tWide(); // redirects to rxdb
    this.Feathers = t('feathersjs.svg'); // The API and Real-time Application Framework
    this.Akita = tWide(); // https://github.com/datorama/akita
    // feathers
    // Amplify
  }
}
/** Important coz META-quality to make sense of the rest of topics */
class Comprehension_Comparators_Security_And_Exploring {
  constructor() {
    this.StackShare = tWide(); // {tagline: 'Tech Stack Intelligence" }
    this.Openbase = t('openbase-icon-full.svg'); // { tagline: 'Compare open-source packages with powerful metrics and user reviews.' }
    this.SVGPorn = tWide('svgporn'); // { tagline: 'Compare open-source packages with powerful metrics and user reviews.' }
    this.SVGO = t('svgo-icon'); // Node.js tool for optimizing SVG files; https://github.com/svg/svgo
    // https://tidelift.com/
    // https://npms.io/about - quality/popularity scores
    // TODO npmjs.com ?
    // https://libraries.io/npm/@feathersjs%2Ffeathers
    // codeclimate
    // stackoverflow to see tag stats
    // NOTE: this is highly related to security like Snyk
    // https://bestofjs.org/projects/typebox
    // https://chaoss.community/ ?
    // https://opensource.com/article/19/8/measure-project
    // https://openjsf.org/
  }
}
class Testing {
  constructor() {
    this["AVA"] = tWide();
    this["Selenium"] = t();
    this.TestCafe = tWide();
    this.Cypress = t('cypress-icon.svg' /*`cypress-io-logo-round-flat.svg`*/);
    this.Playwright = tWide(); /* Playwright is a framework for Web Testing and Automation. It allows testing Chromium, Firefox and WebKit with a single API. By Microsoft. */
    this["Testing Library"] = tSquare();
    this["Nightwatch.js"] = tNarrow('nightwatch.svg');
    this["UserTesting"] = tNarrow('user-testing-icon.svg');
    this.BrowserStack = t();
    this["User Testing"] = t();
    this.Spock = tNoIcon();
    this.Jest = t();
    this.Karma = t();
    this.Jasmine = t();
    this.JUnit = t({
      logo: 'Junit.fe42161b-ugly.svg',
      logoSize: [125, 84],
      iconUrl: `https://zebrunner.com/`
    });
    this.TestNG = t({
      logo: 'testng.png',
      logoSize: [634, 176]
    });
    this.Cucumber = t();
    this.Calabash = tNoIcon();
    this.Cobertura = tNoIcon();
    this.Mockito = tNoIcon();
  }
}
class Tools {
  constructor() {
    // browsers:
    this["Brave Browser"] = tNarrow('brave.svg');
    // TODO: arc browser
    this.WebStorm = t( /* https://www.jetbrains.com/de-de/company/brand/logos/ */);
    this.PyCharm = t( /* https://www.jetbrains.com/de-de/company/brand/logos/ */);
    this['JetBrains Fleet'] = t('jetbrains-fleet-icon.svg');
    //  TODO: 'JetBrains ReSharper' = t('') // C#
    // TODO: 'Rider' = t('') // C#
    this.RubyMine = t();
    this['Android Studio'] = t('Android_Studio_icon.svg');
    this.Eclipse = t('eclipse-icon.svg');
    this['IntelliJ IDEA'] = t();
    this['NetBeans'] = t('apache-netbeans');
    this['Visual Studio'] = t();
    this['Visual Studio Code'] = tWide('visual-studio-code--no-masks.svg');
    this['VSCodium'] = tWide('vscodium-codium_cnl.svg');
    this["Open VSX Registry"] = tWide('open-vsx-registry-icon.svg');
    this['Warp'] = tWide('warp-icon.svg');
    this['Vim'] = t();
    // ==== CI:
    this['CircleCI'] = t();
    this['Travis CI'] = t();
    this['Jenkins'] = t('jenkins-icon');
    this['Zeplin'] = tWide();
    this['Dribbble'] = t(`dribbble-ball-mark.svg`); // https://dribbble.com/media-kit
    this['Slack'] = t('slack-icon.svg');
    this['PandaDoc'] = tNoIcon(); /* FIXME logo */
    this['Datadog'] = t('datadog-icon');
    this['Dynatrace'] = t('dynatrace-icon');
    this['Sentry'] = t('sentry-icon');
    this['Snyk'] = tWide();
    this["OWASP"] = t('owasp-icon');
    this['CodeSee'] = tWide('codesee-icon'); // move to comprehension?
    // TODO maybe https://stepsize.com/
    this['Netlify'] = tWide('netlify-icon.svg'); /* https://www.netlify.com/press/#logos */
    this['Jamstack'] = tSquare('jamstack-icon.svg'); /* https://www.netlify.com/jamstack/ */
    this['VirtualBox'] = t({
      iconUrl: 'https://icons8.com/icons/set/oracle-vm-virtualbox'
    });
  }
}
class Project_Management_Tools {
  constructor() {
    this['Pivotal Tracker'] = t(`pivotal_tracker.svg`);
    this['Bugzilla'] = tNoIcon();
    this['Trello'] = t();
    this['JTrac'] = t();
    this['Trac'] = t();
    this['Redmine'] = t();
    this['TeamForge'] = tNoIcon({
      organisation: 'CollabNet'
    });
    this['Jira'] = tWide();
    // TODO: Clubhouse
    // TODO: Monday.com
    this['Agile Central'] = tNoIcon();
    this['YouTrack'] = t({
      organisation: 'JetBrains'
    });
  }
}
/** TODO and UI UX */
class Graphics {
  constructor() {
    this.SVG = t({
      // logo: 'svg-logo-v.svg',
      categories: 'Frontend'
    });
    // Design Ops
    this.Figma = t();
    this.UXPin = t('UXPin-Logo-BlackFill-export.svg');
    this.SVGator = tWide('svgator-icon.svg');
    this.InVision = t();
    this.Blender = tWide();
    this['Adobe Illustrator'] = t('Adobe_Illustrator_CC_icon.svg');
    this['Adobe Photoshop'] = t('adobe--photoshop-32x32.svg');
    this['Adobe Creative Cloud'] = t('adobe--creativecloud-32x32.svg');
    this['Affinity Designer'] = t('affinity-designer.svg');
    this['Gravit Designer'] = t('gravitio-icon.svg');
    this['GIMP'] = t('gimp-wilber-big.png');
    this['Inkscape'] = t('inkscape-logo.svg');
  }
}
class Markup_And_Config_Languages {}
class Languages {
  constructor() {
    this['JetBrains MPS'] = t();
    this.Java = t();
    this.Go = tWide('go-logo-white.svg');
    this.TypeScript = t('typescript-icon');
    this.Kotlin = t({
      logo: 'kotlin-icon.svg',
      categories: 'Mobile'
    });
    this.Swift = t();
    this.Ruby = t();
    this.Crystal = t();
    this.Sorbet = tSquare('sorbet-logo-white-sparkles.svg');
    this.Markdown = tWide();
    this.Python = t({
      urls: new _Topic__WEBPACK_IMPORTED_MODULE_1__.TopicUrls('https://www.python.org/', 'https://en.wikipedia.org/wiki/Python_(programming_language)', 'https://github.com/python', undefined, 'https://stackoverflow.com/questions/tagged/python', 'https://stackshare.io/python', 'https://twitter.com/ThePSF')
    });
    this.mypy = tWide('mypy-icon.svg'); // #AI #Python
    this['Python Pyre'] = tWide('pyre-icon.svg'); // #Python
    this['Pyright'] = tWide('pyright-icon.svg'); // #Python
    this.Mojo = tWide('modular-mojo-icon'); // #AI #Python
    this.Hack = tWide();
    this.Haxe = t();
    this.Scala = t();
    this["Eclipse Ceylon"] = tWide('ceylon-icon.svg');
    this.Clojure = t();
    this.ClojureScript = tSquare('cljs.svg');
    this.Perl = t();
    this.Raku = tWide('raku-cropped.svg');
    this.Fortran = t();
    this.COBOL = tWide('cobol.svg');
    this.C = t();
    this['HolyC'] = tNarrow('HolyC_Logo.svg');
    this['C++'] = t();
    this['C#'] = t('c_sharp.svg');
    this['F#'] = tWide('fsharp.svg');
    this.Dart = t();
    this.Groovy = tWide();
    this.Elm = t();
    this.CoffeeScript = tWide('coffeescript.svg');
    this.PureScript = tWide('purescript-icon');
    this.ReScript = tSquare('rescript-icon');
    this["Roc Lang"] = tNarrow('roc-lang-icon.svg');
    this.Imba = tWide('imba-icon');
    this['Mint Lang'] = tWide('mint-lang-icon-wide.svg');
    this.Zig = tWide('zig-icon.svg');
    this.Nim = tWide('nim-lang-icon-wide.svg');
    this['Google Carbon'] = tSquare('google-carbon-icon.svg');
    this.Rust = t();
    this.RustRover = t();
    this.Tauri = tNarrow('tauri.svg');
    this.Tokio = tNarrow('tokio-fixme.svg'); // https://tokio.rs/img/tokio-horizontal.svg
    this.WebAssembly = t({
      categories: "Frontend",
      ecosystem: "JavaScript"
    });
    this["WebAssembly System Interface (WASI)"] = tWide('wasi-icon-cropped-wide.svg');
    this["Wasmtime"] = tWide('bytecode-alliance-logo-icon.svg');
    this["Wasmer"] = tNarrow('wasmer-icon.svg');
    this["WebAssembly Package Manager (WAPM)"] = tNarrow('wapm-icon.svg');
    this.AssemblyScript = t();
    this.Bash = t('bash-icon.svg');
    this.Lua = t('lua-no-text.svg');
    this.Prolog = tSquare('prolog-icon.svg');
    this.Eiffel = tWide('eiffel-no-text.svg');
    this.Erlang = tWide('erlang-no-text.svg');
    this.Elixir = tWide('elixir-pluginIcon-crop--for-print-fix.svg'); /* https://plugins.jetbrains.com/plugin/7522-elixir for print fix */ // -- other options: simpler, black & white: https://logosear.ch/logos/elixir/index.html
    this.Haskell = tWide('haskell-icon');
    this.Lisp = tWide('lisp-logo.svg');
    this.OCaml = tWide('ocaml-no-text.svg' /* https://ocaml.org/docs/logos.html  http://ocaml.org/logo/Colour/SVG/colour-logo.svg
                                           Square -- https://ocaml.org/img/OCaml_Sticker.svg */);
    this['R Language'] = tWide('r-lang.svg');
    this['V Language'] = t('v-logo.svg');
    this['D Language'] = tWide('dlang-simple' /*, 'https://en.wikipedia.org/wiki/File:D_Programming_Language_logo.svg'*/);
    this.Julia = tWide('julia-dots-no-text.svg');
    this.PHP = tWide();
    // TODO: PHP & Hack lang, HHVM
  }
}
class OS {
  constructor() {
    this.Linux = t('tux.svg');
    this['Ubuntu Linux'] = t('ubuntu.svg');
    this['SUSE Linux'] = tWide('suse.svg');
    this['RedHat Linux'] = t('redhat-icon.svg');
    this['CentOS Linux'] = tWide('centos.svg');
    this['Debian Linux'] = t('debian.svg');
    this['Fedora Linux'] = t('fedora.svg' /* Officially just "Fedora", but better for filtering*/);
    this['macOS'] = t('macosx.svg');
    this['Microsoft Windows'] = t();
  }
}
class Mobile {
  constructor() {
    this.iOS = t();
    this.Android = tWide({
      logo: 'android-icon.svg',
      subTopics: {
        'Recycler View': tNoIcon({})
      }
    });
    this.Capacitor = t(`capacitor-icon.svg`); // FIXME: remove (is in sub-topics of Ionic)
    this.Cordova = t();
    this.PhoneGap = t();
    this.NativeScript = t();
    this.Flutter = tWide('flutter.svg');
    this['Java Micro Edition'] = t('java');
    this['BlackBerry'] = tNoIcon();
  }
}
class Cloud {
  constructor() {
    // TODO: cloud-native
    this['Supabase'] = tNarrow('supabase-icon.svg'); /* open source Firebase alternative supabase.com; https://supabase.com/brand-assets ; https://golden.com/wiki/Supabase-YX5N66V ; Build in a weekend.
                                                     Scale to millions.
                                                     Supabase is an open source Firebase alternative. Start your project with a Postgres database, Authentication, instant APIs, Edge Functions, Realtime subscriptions, and Storage.*/
    this['Redis'] = tWide('redis.svg');
    this['Firebase'] = t({
      subTopics: {
        // most are from firebase console left navbar:
        'Authentication': t(),
        'Realtime Database': t('Firebase-realtime-database.svg'),
        'Storage': t('Firebase-storage.svg'),
        'Hosting': t('Firebase-hosting.svg'),
        'Cloud Functions': t(),
        'Stability': t(),
        'Crashlytics': t('Crashlytics.svg'),
        'Analytics': t(),
        'Grow': t()
      }
    });
    this['Cloud Firestore'] = t('firebase-firestore.svg');
    this['GCP - Google Cloud Platform'] = t({
      logo: 'gcp-google-cloud-platform-logo.svg',
      iconUrl: 'logo_gcp_hexagon_rgb.png'
      /* logos SVG-s: https://googlecloudcheatsheet.withgoogle.com/ */
    });
    this.Algolia = t('algolia-icon.svg'); /* new icon ~2023 */
    this["Meilisearch"] = tWide('meilisearch-icon-wide.svg'); /* Rust 99% */
    this["Typesense"] = tWide('typesense-icon.svg');
    this.MindsDB = tWide('mindsdb-icon-wide.svg'); // { iconUrl: 'mindsdb-icon-wide.svg', comments: 'Embedding AI in DB (select query from models e.g. from HuggingFace'}); automatic #MLOps
    this.Weaviate = tWide('weaviate-icon--crop-simplified.svg'); // https://weaviate.io/img/site/weaviate-nav-logo-light.svg // original had base64 png-s // simple orig was green https://github.com/weaviate/weaviate
    this.Chroma = tWide('chroma.svg'); // https://github.com/chroma-core/chroma /* the AI-native open-source embedding database; www.trychroma.com */
    this.Milvus = tWide('milvus-icon.svg'); // https://milvus.io/
    this.Qdrant = tNarrow('qdrant-icon.svg'); // https://qdrant.tech/ ; from Luis Lopez CommerceHub
    this.Pinecone = tNarrow('pinecone-icon.svg');
    this.Vespa = tNarrow('vespa-icon.svg');
    this.LlamaIndex = tNarrow('llamaindex-icon2-gradient.svg'); // AKA gpt-index
    this["Apache Cassandra"] = tWide('cassandra-icon.svg'); // also vector DB according to https://en.wikipedia.org/wiki/Vector_database#cite_note-7
    /// TODO next to elastic, algolia
    // =====
    // TODO: CockroachDB
    this.tRPC = t('trpc-icon.svg'); // end-to-end typescript typesafe; powered by Vercel. https://trpc.io/media (RIGHT CLICK on logo! I'm impressed :D)
    this["Microsoft Azure"] = t('microsoft-azure');
    this.AWS = tWide();
    this['AWS Amplify'] = tWide('aws-amplify.svg');
    // TODO: CLoudFlare - has its own databases, D1, on the edge
  }
}
// TODO: ai -> vector_databases
class Databases {
  constructor() {
    this["8base"] = t('8base-icon'); // like Hasura; "Create custom JavaScript and TypeScript logic and run as 8base Serverless Functions."
    this.Prisma = tWide(); /* "Next-generation Node.js and TypeScript ORM" */
    this.MongoDB = tWide('mongodb-icon.svg');
    this.ArangoDB = tWide('arangodb-icon'); /* native multi-model database with flexible data models for documents, graphs, and key-values. Build high performance applications using a convenient SQL-like query language or JavaScript extensions. */
    this.Mongoose = tNoIcon();
    // TODO
    this.NoSQL = tNoIcon();
    this.SQL = tNoIcon();
    this.PostgreSQL = t(); // it's also a data framework
    this.MySQL = t('mysql-icon');
    this.MariaDB = t();
    this.Oracle = tWide();
    this.IndexedDB = tNoIcon();
    this.SurrealDB = t('surrealdb-icon'); // Multi-modal. ACID transactions, while scaling horizontally. Feels like SQL, but uses arrows to connect nodes and edges
    this.Xata = t('xata-icon'); // Postgres + Elastic. Feels like a developer-friendly alternative to Notion or AirTable. Treats your data like a spreadsheet.
    this.Dgraph = t('dgraph-icon');
    this.Fauna = t('fauna-icon'); /* document db that supports joins; custom query language called FQL; closed-source */
    this.RethinkDB = tWide('rethinkdb');
    this["RxDB"] = tNarrow('rxdb-icon'); /* A fast, offline-first, reactive database for JavaScript Applications */
    // TODO: sqlite
    // EdgeDB - Graph-Relational; types not tables; eliminates need for joins
  }
}
class Version_Control {
  constructor() {
    this.Git = t({
      logo: 'git-icon.svg',
      subTopics: {
        Rebase: {},
        Submodules: {},
        Bisect: {}
      }
    });
    this.GitHub = t({
      logo: 'github-icon',
      categories: 'ProjectManagementTools' /* secondary categories */
    });
    this.GitLab = t({
      categories: 'ProjectManagementTools' /* secondary categories */
    });
    this['Gerrit'] = tNoIcon();
    this.Subversion = t();
    this['Plastic SCM'] = t();
  }
}
/*
* Tech topics.
*
* Grouping (pick the right granularity based on count) :
*/
class Other {
  constructor() {
    this['Mailgun'] = t('mailgun-icon.svg');
    this['reCAPTCHA'] = t('recaptcha.svg'); // TODO: crop icon only
    this['AudioSalad'] = t(`audiosalad-traced.svg`);
    this['WorldFirst'] = tNoIcon();
    this['Payoneer'] = tWide();
    this['PayPal'] = t();
    this['TransferWise'] = tNoIcon();
    this['Axios'] = tNoIcon();
    this['Discord'] = tWide(`discord-icon.svg`);
    this['Y Combinator'] = tWide(`ycombinator.svg`);
    this['Sequoia Capital'] = tNarrow(`sequoia-capital-icon.svg`);
    this['Wikipedia'] = tWide(`generic/fun/wikipedia-w2.svg`);
    this['Google Play'] = t('google-play-icon');
    this['WordPress'] = t('wordpress-icon.svg');
    this['.NET'] = t('dotnet-logo-2020.svg', 'https://github.com/dotnet/brand/blob/main/logo/dotnet-logo.svg');
    this['Blazor'] = tWide('blazor2.svg');
    // 'NET.smth' = t('dotnet.svg') // for testing dot
    // 'test' = t('dotnet.svg')
    this.ReactiveX = t();
    this.Airtable = tWide();
    this.Notion = t('notion-icon-no-text.svg');
    this.Coda = t('coda-icon.svg');
    this.Observable = t('observablehq.svg'); // "Collaborative data platform and canvas"; "Explore, analyze and explain data. As a team."
    this.Carbide = t('carbide.svg');
    this.Replit = tNarrow('replit-icon.svg'); /* highlights: social coding; computation token currency; AI-assisted IDE (Ghostwriter) */
    this["Ghostwriter"] = tNarrow('ghostwriter-icon-cropped.svg'); /* #AI #IDE */
    this["Cursor.sh"] = tNarrow('FIXME-cursor');
    this["Rift"] = tWide('rift-icon.svg'); /* #AI #VScode*/
    this["MetaMage"] = tNarrow('FIXME-metamage');
    this.Zapier = t('zapier-icon');
    this.IFTTT = tWide('ifttt.svg');
    // ======== LowCode / NoCode / CMS:
    this.Shopify = tNarrow();
    this.WebFlow = t('webflow-mark-vector-blue.svg'); /* https://brand-at.webflow.io/resources#logos */
    this.Wix = tWide();
    this['Vercel V0'] = tWide('vercel-v0-icon.svg');
    this['Builder.io'] = t('builder-io-icon.svg');
    this['Budibase'] = tSquare('budibase-icon.svg');
    this['Bubble'] = t('bubble-icon'); /** is a **visual programming language**, a no-code development platform and an application platform as a service, developed by Bubble Group, that enables non-technical people to build web applications without needing to type code */
    this['Framer'] = t();
    this['AFFiNE'] = tWide('affine-icon.svg');
    this.RegExp = t('_icon_hammer-solid.svg');
    this['Java Swing'] = t('java');
    this['Google Maps'] = tNarrow('google-maps.svg');
    this['Mapbox'] = t('mapbox-icon.svg');
    this.Guice = tNoIcon();
    this.SOAP = tNoIcon();
    this.XML = tNoIcon();
    this['XML Schema'] = tNoIcon();
    this.BiPRO = tNoIcon();
    this.DDEX = tNoIcon();
    this.PDF = tNoIcon();
    this.iText = tNoIcon();
    this.JAXB = tNoIcon();
    this['Customer Support'] = t('user-solid.svg');
    this['Agile'] = t('project-diagram-solid.svg');
    this['Scrum'] = t('project-diagram-solid.svg');
    this['ALM - Application Lifecycle Management'] = t('project-diagram-solid.svg');
    this['Algorithms'] = t('project-diagram-solid.svg');
    this['Data Structures'] = t('project-diagram-solid.svg');
    this['OOP - Object Oriented Programming'] = t('project-diagram-solid.svg');
    this['SOLID Principles'] = t('project-diagram-solid.svg');
    this['API Design'] = t('project-diagram-solid.svg');
    this['Library Design'] = t('project-diagram-solid.svg');
    this['FP - Functional Programming'] = t('project-diagram-solid.svg');
    this['AOP - Aspect-Oriented Programming'] = t('project-diagram-solid.svg');
    this['Design Patterns'] = t('project-diagram-solid.svg');
    this['Software Architecture'] = t('project-diagram-solid.svg');
    // TODO: UML
    this['Refactoring'] = t('_icon_hammer-solid.svg');
    this['Code Review'] = t('project-diagram-solid.svg');
    this['TDD - Test-Driven Development'] = t('project-diagram-solid.svg');
    this['BDD - Behavior-Driven Development'] = t('project-diagram-solid.svg');
    this['DSL - Domain-Specific Languages'] = t('project-diagram-solid.svg');
    this['Antipatterns'] = t('project-diagram-solid.svg');
    this['Making Presentations'] = t('project-diagram-solid.svg');
    this['Leadership'] = t('project-diagram-solid.svg');
    this['Performance Optimization'] = t('project-diagram-solid.svg');
    this['Performance Profiling'] = t('project-diagram-solid.svg');
    this['UX - User Experience'] = t('project-diagram-solid.svg');
    this['Troubleshooting'] = t('project-diagram-solid.svg');
    this['Graphic Design'] = t('project-diagram-solid.svg');
    this['Testing'] = t('project-diagram-solid.svg');
    // TODO: google docs
  }
}
/** crypto / blockchain / decentralized */
class Crypto {
  constructor() {
    this.Bitcoin = t();
    this.Ethereum = t();
    this["Basic Attention Token (BAT)"] = tWide('brave_basic_attention_token_logo.svg');
    this.Solidity = t();
    this["Web3"] = t();
    this["web3.js"] = t('web3js');
    this["ethers.js"] = tWide('ethers.svg');
    this["Solid"] = tWide(); // https://solidproject.org/ (re-decentralizing the web)
  }
}
/** AI / Machine Learning ML */
class AI {
  constructor() {
    this["C3 AI"] = tWide('c3-ai.svg');
    this["LangChain"] = tWide('langchain.svg');
    this["Microsoft AutoGen"] = tNarrow('autogen-icon.svg');
    this["Microsoft Bing"] = tNarrow('bing.svg');
    this["Microsoft Copilot"] = tNarrow('microsoft-copilot.svg');
    this["GitHub Copilot"] = tWide('github-copilot.svg');
    this["Tabnine"] = tNarrow('tabnine-icon.svg');
    // "JetBrains AI Assistant"
    // TODO: CodeGPT / https://www.codegpt.co/#start
    // TODO: AskCodi /  https://www.askcodi.com/
    this["CodiumAI"] = tWide('codium-icon.svg' /* from svgporn */);
    this["Safurai"] = tWide('safurai-icon.svg');
    this["Sourcegraph"] = tWide('sourcegraph.svg');
    this["Cody AI"] = tWide('cody-icon.svg');
    this["Continue"] = tWide('continue-icon.svg');
    this["TabbyML"] = tNarrow('tabbyml-icon.svg');
    this["OpenAI Codex"] = tNarrow('openai-codex');
    this.OpenAI = t('openai-icon');
    this.xAI = t('x.ai.svg');
    this["Magic.dev"] = tWide('magic.dev.svg'); // Magic is working on frontier-scale code models to build a coworker, not just a copilot.
    this['Tesla'] = tWide('fixme-tesla'); // next to xAI
    this['1X Technologies'] = tWide('1x-technologies.svg'); // https://www.1x.tech/ // autonomous robots; "Founded in Norway."
    this['Boston Dynamics'] = tNarrow('boston-dynamics.svg');
    this['Stanford University'] = tWide('FIXME-stanford'); // https://mobile-aloha.github.io/
    this['Phind'] = tWide('phind.svg');
    this['Amazon CodeWhisperer'] = tSquare('Arch_Amazon-CodeWhisperer_16.svg');
    this['Amazon Bedrock'] = tSquare('Arch_Amazon-Bedrock_16.svg');
    this['Amazon Q'] = tNarrow('amazon-q.svg');
    this['Amazon SageMaker'] = tSquare('Arch_Amazon-SageMaker_16.svg');
    this['Amazon Lex'] = tSquare('Arch_Amazon-Lex_16.svg');
    this['Amazon Comprehend'] = tSquare('Arch_Amazon-Comprehend_16.svg'); // Gewinnen Sie wertvolle Einblicke und Erkenntnisse aus Ihren Textdokumenten
    this['Amazon Kendra'] = tSquare('Arch_Amazon-Kendra_16.svg');
    this['Perplexity.ai'] = tNarrow('perplexity-ai.svg');
    this['Hume AI'] = tWide('hume-ai-icon.svg');
    this['Quora Poe'] = tWide('quora-poe.svg');
    this['Open Assistant'] = tWide('open-assistant-icon-wide.svg'); // https://github.com/LAION-AI/Open-Assistant
    this['Google Bard'] = tSquare('Google_Bard_logo.svg');
    this['Google Gemini'] = tSquare('google-gemini-icon.svg');
    this['Google DeepMind'] = tSquare('google-deepmind-icon.svg');
    this['Google Vertex AI'] = tNarrow('vertexai.svg'); // MLOps
    this['Anthropic'] = tWide('anthropic-icon.svg');
    this['AI21 Labs'] = tWide('ai21.svg');
    this['Mistral AI'] = tWide('mistral-ai-icon.svg');
    this['LAION'] = t();
    this['Ollama'] = tNarrow('ollama.svg');
    this.Gradio = tWide('gradio-icon.svg');
    this.Streamlit = tWide('streamlit.svg');
    this['Stable Diffusion'] = tWide('stable-diffusion-logo-vectorizer.ai.svg'); // not official?
    this['Midjourney'] = tWide('midjourney.svg');
    this['Runway'] = tSquare('runwayml-icon.svg');
    this['Stability AI'] = tSquare('stability-ai-icon.svg' /* by vectorizer.ai */); // https://www.linkedin.com/company/stability-ai/
    this['Google Colaboratory'] = tWide('google-colab-icon-wide.svg');
    this.TensorFlow = t();
    this.NumPy = t();
    this['Hugging Face'] = tWide('huggingface_logo-noborder.svg');
    this['Cohere'] = tSquare('cohere-icon.svg');
    this["Weights & Biases"] = tSquare('weights-and-biases-icon.svg');
    this["Open Neural Network Exchange"] = t('onnxai-icon.svg'); /* ONNX  acronym; */ // https://www.vectorlogo.zone/logos/onnxai/index.html
    this["Google JAX"] = tWide('Google_JAX_logo.svg'); // https://jax.readthedocs.io/en/latest/
    this.Jupyter = tWide('jupyter-icon2');
    this["Conda"] = tNarrow('conda-icon.svg');
    this["Anaconda"] = tNarrow('anaconda-icon.svg');
    this["JetBrains DataLore"] = t('jetbrains-datalore-icon.svg');
    this.PyTorch = tWide('pytorch-icon');
    this.pandas = tNarrow('pandas-icon.svg');
    this.Keras = t /*Wide*/('keras.svg' /*{
                                        https://github.com/valohai/ml-logos/blob/master/keras.svg
                                        logo: 'keras-logo-2018-large-1200.png',
                                        logoSize: [1200, 348],
                                        logoSmallIcon: 'keras-logo-small.jpg',
                                        }*/);
  }
}
class Build_Systems_And_Package_Managers {
  constructor() {
    this.Gradle = t();
    this.Maven = tWide();
    this.Yarn = t();
    this.NPM = tWide();
    this.Bazel = t(`bazel-icon.svg`);
  }
}
class FunAndSports {
  constructor() {
    this.Volleyball = t(`generic/fun/volleyball-ball-solid.svg`); /* TODO FIVB logo - cool*/ /* TODO: beach volleyball icon - net on the sand */
    this['Interpersonal Networking'] = t('generic/users-solid.svg');
    this['Hiking'] = t('generic/fun/hiking-solid');
    this.Outdoors = t('generic/fun/cloud-sun-solid.svg');
    this.Nature = t('generic/fun/tree-solid.svg');
    this['Car trips'] = t('generic/fun/car-solid');
    this['Bicycle'] = tWide('generic/fun/bicycle-solid');
    this['Table Tennis'] = t('generic/fun/table-tennis-solid.svg'); /* search terms: ping pong */
    this.Padel = t('generic/fun/tennis-ball-svgrepo-com.svg'); /* search terms: paddle paddel */
    this.Swimming = tWide('generic/fun/swimmer-solid-karol.svg');
    this.Chess = t('generic/fun/chess-solid.svg');
    this['Triskelion'] = t('generic/fun/triskelion4.svg');
    this['Business'] = t('generic/business--chart-line');
    this['Psychology'] = t('generic/brain-solid');
    this['Guitar'] = t('generic/fun/heavy-metal-sharpen-guitar-like-an-insect-svgrepo-com.svg');
    this['ASG'] = t('generic/fun/gun.svg');
  }
}
class Social /* and media platforms */ {
  constructor() {
    this['YouTube'] = tWide('youtube-icon.svg');
    this['Vimeo'] = tWide('vimeo-icon.svg');
    this['Twitch'] = tNarrow('twitch.svg'); // also live coding
    this['Spotify'] = tNarrow('spotify-icon.svg'); // also podcasts
    this['Meetup'] = tWide(`meetup-seeklogo.com.svg`);
    this['LinkedIn'] = t('linkedin-icon');
    this['Mastodon'] = t('mastodon-icon');
  }
}
function processTopics(inputTopics /*: Topics*/) {
  // inputTopics = setIdsFromKeys(inputTopics, 'name')
  for (let topicKey of Object.getOwnPropertyNames(inputTopics)) {
    if (inputTopics.hasOwnProperty(topicKey)) {
      // console.log('transformTopics', topicKey)
      let topic = inputTopics[topicKey];
      if (!topic) {
        topic = new _Topic__WEBPACK_IMPORTED_MODULE_1__.Topic(topicKey);
      }
      ;
      inputTopics[topicKey] = topic;
      topic.setNameAndLogoAndId(topicKey); // TODO ; or setNameAndIdAndIcon
      topic.sealAndValidate(); // finalise / solidify
    }
  }
  return inputTopics;
}
function mergeTopics(t1, t2, t3, t4, t5) {
  return Object.assign({}, Object.create(t1), Object.create(t2), Object.create(t3), Object.create(t4), Object.create(t5));
}
function processCategory(cat) {
  // let catName = cat.constructor.name;
  let catName = cat.name;
  // (cat as any).name = catName
  let catTopics = cat.topicsById;
  Object.keys(catTopics).forEach(key => {
    // console.log('processing category key', key)
    // if ( key !== 'name' ) {
    let topic = catTopics[key];
    topic.category = catName;
    // }
  });
  cat.topicsArray = (0,_utils_dictionary_utils__WEBPACK_IMPORTED_MODULE_0__.getDictionaryValuesAsArray)(cat.topicsById);
  return cat;
}
/** Note: names are specified as strings, because in ng prod build, class names are lost */
const topicCategoriesArray = [new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('Comparators', new Comprehension_Comparators_Security_And_Exploring()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('Frontend', new Frontend()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('Frontend - Visual', new Frontend_Visual()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('Backend', new Backend()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('Frontend and backend app platforms', new Frontend_And_Backend_App_Platforms()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('Testing', new Testing()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('Tools', new Tools()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('Languages', new Languages()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('Databases', new Databases()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('Version Control', new Version_Control()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('Project Management Tools', new Project_Management_Tools()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('Graphics', new Graphics()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('OS', new OS()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('Mobile', new Mobile()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('Cloud', new Cloud()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('Java', new Java()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('JavaScript', new JavaScript()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('Build Systems and package managers', new Build_Systems_And_Package_Managers()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('AI', new AI()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('Other', new Other()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('Crypto', new Crypto()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('Fun and Sports', new FunAndSports()), new _topics__WEBPACK_IMPORTED_MODULE_2__.TopicCategory('Social', new Social())];
const topics = processTopics(
// mergeTopics(Frontend, Backend, Other, Testing, {})
// mergeTopics(new Frontend, Backend, Other, Testing, {})
Object.assign({}, ...topicCategoriesArray.map(cat => processCategory(cat).topicsById)));
const topicsArr = (0,_utils_dictionary_utils__WEBPACK_IMPORTED_MODULE_0__.getDictionaryValuesAsArray)(topics);

/***/ }),

/***/ 6554:
/*!***********************************************************!*\
  !*** ./src/app/TopicFriendsShared3/topics-core/topics.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TopicCategory: () => (/* binding */ TopicCategory),
/* harmony export */   tag: () => (/* binding */ tag),
/* harmony export */   tagLogoType: () => (/* binding */ tagLogoType),
/* harmony export */   tagNoIcon: () => (/* binding */ tagNoIcon)
/* harmony export */ });
/* harmony import */ var _Topic__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Topic */ 2043);

function tag(name, logo, webSite, related, urls, logoTipoWide) {
  return new _Topic__WEBPACK_IMPORTED_MODULE_0__.Topic(name, logo, webSite, related, urls, undefined, undefined, logoTipoWide);
}
function tagNoIcon(name, related, urls) {
  return new _Topic__WEBPACK_IMPORTED_MODULE_0__.Topic(name, null, null, related, urls);
}
/** Will cause double width for icon, because the logotipo's font otherwise is too tiny */
function tagLogoType(name, logo, website, related, urls) {
  return tag(name, logo, website, related, urls, true); // pass visual hint later
}
class TopicCategory {
  get id() {
    return this.name;
  }
  constructor(name, topicsById) {
    this.name = name;
    this.topicsById = topicsById;
  }
}

/***/ }),

/***/ 4114:
/*!***************************************!*\
  !*** ./src/app/app-routing.module.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AppRoutingModule: () => (/* binding */ AppRoutingModule)
/* harmony export */ });
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ 5072);
/* harmony import */ var _cv_page_topics_graph_topics_graph_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./cv-page/topics-graph/topics-graph.component */ 8640);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 7580);
var _AppRoutingModule;




// import {TechGraphD3Component} from "./cv-page/tech-graph-d3/tech-graph-d3.component";
// import {TechGraphD3Index1Component} from "./cv-page/tech-graph-d3-index1/tech-graph-d3-index1.component";
// import {CvPageComponent} from "./cv-page/cv-page.component";
// import {EpicEliteComponent} from "./jobs/epic-elite/epic-elite.component";
// import {ShirtComponent} from "./shirt/shirt.component";
const routes = [{
  path: '',
  redirectTo: 'karol-depka',
  pathMatch: 'full'
}, {
  path: 'folder/:id',
  loadChildren: () => __webpack_require__.e(/*! import() */ "src_app_folder_folder_module_ts").then(__webpack_require__.bind(__webpack_require__, /*! ./folder/folder.module */ 5313)).then(m => m.FolderPageModule)
}, {
  path: 'theme-demo',
  loadChildren: () => __webpack_require__.e(/*! import() */ "default-src_app_themes_theme-demo_theme-demo_module_ts").then(__webpack_require__.bind(__webpack_require__, /*! ./themes/theme-demo/theme-demo.module */ 2138)).then(m => m.ThemeDemoPageModule)
}, {
  path: 'theme',
  loadChildren: () => __webpack_require__.e(/*! import() */ "default-src_app_themes_theme-demo_theme-demo_module_ts").then(__webpack_require__.bind(__webpack_require__, /*! ./themes/theme-demo/theme-demo.module */ 2138)).then(m => m.ThemeDemoPageModule)
}, {
  path: 'shirt',
  loadChildren: () => Promise.all(/*! import() */[__webpack_require__.e("default-src_app_themes_theme-demo_theme-demo_module_ts"), __webpack_require__.e("default-src_app_topics-shared_topics-shared_module_ts"), __webpack_require__.e("default-src_app_skills_work-experience-highlights-data_ts"), __webpack_require__.e("src_app_shirt_shirt_module_ts")]).then(__webpack_require__.bind(__webpack_require__, /*! ./shirt/shirt.module */ 7811)).then(m => m.ShirtPageModule)
}, {
  path: ['print', 'cv'],
  loadChildren: () => Promise.all(/*! import() */[__webpack_require__.e("default-src_app_themes_theme-demo_theme-demo_module_ts"), __webpack_require__.e("default-src_app_topics-shared_topics-shared_module_ts"), __webpack_require__.e("default-src_app_skills_work-experience-highlights-data_ts"), __webpack_require__.e("src_app_shirt_shirt_module_ts")]).then(__webpack_require__.bind(__webpack_require__, /*! ./shirt/shirt.module */ 7811)).then(m => m.ShirtPageModule)
},
// ====
// {
//   path: 'karol-depka',
//   loadChildren: () => import('./cv-page/cv-page.module').then( m => m.CvPageModule)
// },
// {
//   path: 'karol-depka',
//   component: CvPageComponent,
// },
// {
//   path: 'jobs/epic-elite',
//   component: EpicEliteComponent,
// },
// {
//   path: 'shirt',
//   component: ShirtComponent,
// },
// {
//   path: '',
//   redirectTo: 'karol-depka',
//   pathMatch: 'full',
//   //   canActivate: [AuthGuard]
// },
{
  path: 'karol-depka',
  loadChildren: () => Promise.all(/*! import() */[__webpack_require__.e("default-src_app_themes_theme-demo_theme-demo_module_ts"), __webpack_require__.e("default-src_app_topics-shared_topics-shared_module_ts"), __webpack_require__.e("default-src_app_skills_work-experience-highlights-data_ts"), __webpack_require__.e("default-src_app_topic-skills_topic-skills_module_ts"), __webpack_require__.e("default-src_app_cv_cv_module_ts")]).then(__webpack_require__.bind(__webpack_require__, /*! ./cv/cv.module */ 7287)).then(m => m.CvPageModule)
}, {
  path: 'cv-page-print',
  loadChildren: () => Promise.all(/*! import() */[__webpack_require__.e("default-src_app_themes_theme-demo_theme-demo_module_ts"), __webpack_require__.e("default-src_app_topics-shared_topics-shared_module_ts"), __webpack_require__.e("default-src_app_skills_work-experience-highlights-data_ts"), __webpack_require__.e("default-src_app_topic-skills_topic-skills_module_ts"), __webpack_require__.e("default-src_app_cv_cv_module_ts"), __webpack_require__.e("src_app_cv-page-print_cv-page-print_module_ts")]).then(__webpack_require__.bind(__webpack_require__, /*! ./cv-page-print/cv-page-print.module */ 6699)).then(m => m.CvPagePrintPageModule)
},
//
// // Experimental routes
// {
//   path: 'tech-graph-d3',
//   component: TechGraphD3Component,
// },
{
  path: 'topics-graph',
  component: _cv_page_topics_graph_topics_graph_component__WEBPACK_IMPORTED_MODULE_0__.TopicsGraphComponent
},
// {
//   path: 'tech-graph-d3-index1',
//   component: TechGraphD3Index1Component,
//   /* FCK, no lazy loading; move to Ionic pages anyway */
// },
//
{
  path: 'test-tag',
  loadChildren: () => Promise.all(/*! import() */[__webpack_require__.e("default-src_app_themes_theme-demo_theme-demo_module_ts"), __webpack_require__.e("default-src_app_topics-shared_topics-shared_module_ts"), __webpack_require__.e("default-src_app_topic-skills_topic-skills_module_ts"), __webpack_require__.e("src_app_test-tag_test-tag_module_ts")]).then(__webpack_require__.bind(__webpack_require__, /*! ./test-tag/test-tag.module */ 4615)).then(m => m.TestTagPageModule)
}, {
  path: 'experiments',
  loadChildren: () => __webpack_require__.e(/*! import() */ "src_app_experiments_experiments_module_ts").then(__webpack_require__.bind(__webpack_require__, /*! ./experiments/experiments.module */ 243)).then(m => m.ExperimentsPageModule)
}, {
  path: '**',
  redirectTo: 'karol-depka' /* FIXME: does not work? */
}];
class AppRoutingModule {}
_AppRoutingModule = AppRoutingModule;
_AppRoutingModule.ɵfac = function AppRoutingModule_Factory(t) {
  return new (t || _AppRoutingModule)();
};
_AppRoutingModule.ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineNgModule"]({
  type: _AppRoutingModule
});
_AppRoutingModule.ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjector"]({
  imports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__.RouterModule.forRoot(routes, {
    preloadingStrategy: _angular_router__WEBPACK_IMPORTED_MODULE_2__.PreloadAllModules
  }), _angular_router__WEBPACK_IMPORTED_MODULE_2__.RouterModule]
});
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsetNgModuleScope"](AppRoutingModule, {
    imports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__.RouterModule],
    exports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__.RouterModule]
  });
})();

/***/ }),

/***/ 92:
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AppComponent: () => (/* binding */ AppComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ionic/angular */ 7401);
var _AppComponent;


class AppComponent {
  constructor() {
    this.appPages = [{
      title: 'Inbox',
      url: '/folder/inbox',
      icon: 'mail'
    }, {
      title: 'Outbox',
      url: '/folder/outbox',
      icon: 'paper-plane'
    }, {
      title: 'Favorites',
      url: '/folder/favorites',
      icon: 'heart'
    }, {
      title: 'Archived',
      url: '/folder/archived',
      icon: 'archive'
    }, {
      title: 'Trash',
      url: '/folder/trash',
      icon: 'trash'
    }, {
      title: 'Spam',
      url: '/folder/spam',
      icon: 'warning'
    }];
    this.labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  }
}
_AppComponent = AppComponent;
_AppComponent.ɵfac = function AppComponent_Factory(t) {
  return new (t || _AppComponent)();
};
_AppComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({
  type: _AppComponent,
  selectors: [["app-root"]],
  decls: 1,
  vars: 0,
  consts: [["id", "main-content"]],
  template: function AppComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "ion-router-outlet", 0);
    }
  },
  dependencies: [_ionic_angular__WEBPACK_IMPORTED_MODULE_1__.IonRouterOutlet],
  styles: ["ion-menu[_ngcontent-%COMP%]   ion-content[_ngcontent-%COMP%] {\n  --background: var(--ion-item-background, var(--ion-background-color, #fff));\n}\n\nion-menu.md[_ngcontent-%COMP%]   ion-content[_ngcontent-%COMP%] {\n  --padding-start: 8px;\n  --padding-end: 8px;\n  --padding-top: 20px;\n  --padding-bottom: 20px;\n}\n\nion-menu.md[_ngcontent-%COMP%]   ion-list[_ngcontent-%COMP%] {\n  padding: 20px 0;\n}\n\nion-menu.md[_ngcontent-%COMP%]   ion-note[_ngcontent-%COMP%] {\n  margin-bottom: 30px;\n}\n\nion-menu.md[_ngcontent-%COMP%]   ion-list-header[_ngcontent-%COMP%], ion-menu.md[_ngcontent-%COMP%]   ion-note[_ngcontent-%COMP%] {\n  padding-left: 10px;\n}\n\nion-menu.md[_ngcontent-%COMP%]   ion-list#inbox-list[_ngcontent-%COMP%] {\n  border-bottom: 1px solid var(--ion-color-step-150, #d7d8da);\n}\n\nion-menu.md[_ngcontent-%COMP%]   ion-list#inbox-list[_ngcontent-%COMP%]   ion-list-header[_ngcontent-%COMP%] {\n  font-size: 22px;\n  font-weight: 600;\n  min-height: 20px;\n}\n\nion-menu.md[_ngcontent-%COMP%]   ion-list#labels-list[_ngcontent-%COMP%]   ion-list-header[_ngcontent-%COMP%] {\n  font-size: 16px;\n  margin-bottom: 18px;\n  color: #757575;\n  min-height: 26px;\n}\n\nion-menu.md[_ngcontent-%COMP%]   ion-item[_ngcontent-%COMP%] {\n  --padding-start: 10px;\n  --padding-end: 10px;\n  border-radius: 4px;\n}\n\nion-menu.md[_ngcontent-%COMP%]   ion-item.selected[_ngcontent-%COMP%] {\n  --background: rgba(var(--ion-color-primary-rgb), 0.14);\n}\n\nion-menu.md[_ngcontent-%COMP%]   ion-item.selected[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n}\n\nion-menu.md[_ngcontent-%COMP%]   ion-item[_ngcontent-%COMP%]   ion-label[_ngcontent-%COMP%] {\n  font-weight: 500;\n}\n\nion-menu.ios[_ngcontent-%COMP%]   ion-content[_ngcontent-%COMP%] {\n  --padding-bottom: 20px;\n}\n\nion-menu.ios[_ngcontent-%COMP%]   ion-list[_ngcontent-%COMP%] {\n  padding: 20px 0 0 0;\n}\n\nion-menu.ios[_ngcontent-%COMP%]   ion-note[_ngcontent-%COMP%] {\n  line-height: 24px;\n  margin-bottom: 20px;\n}\n\nion-menu.ios[_ngcontent-%COMP%]   ion-item[_ngcontent-%COMP%] {\n  --padding-start: 16px;\n  --padding-end: 16px;\n  --min-height: 50px;\n}\n\nion-menu.ios[_ngcontent-%COMP%]   ion-item.selected[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n}\n\nion-menu.ios[_ngcontent-%COMP%]   ion-item[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 24px;\n  color: #73849a;\n}\n\nion-menu.ios[_ngcontent-%COMP%]   ion-list#labels-list[_ngcontent-%COMP%]   ion-list-header[_ngcontent-%COMP%] {\n  margin-bottom: 8px;\n}\n\nion-menu.ios[_ngcontent-%COMP%]   ion-list-header[_ngcontent-%COMP%], ion-menu.ios[_ngcontent-%COMP%]   ion-note[_ngcontent-%COMP%] {\n  padding-left: 16px;\n  padding-right: 16px;\n}\n\nion-menu.ios[_ngcontent-%COMP%]   ion-note[_ngcontent-%COMP%] {\n  margin-bottom: 8px;\n}\n\nion-note[_ngcontent-%COMP%] {\n  display: inline-block;\n  font-size: 16px;\n  color: var(--ion-color-medium-shade);\n}\n\nion-item.selected[_ngcontent-%COMP%] {\n  --color: var(--ion-color-primary);\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvYXBwLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsMkVBQUE7QUFDRjs7QUFFQTtFQUNFLG9CQUFBO0VBQ0Esa0JBQUE7RUFDQSxtQkFBQTtFQUNBLHNCQUFBO0FBQ0Y7O0FBRUE7RUFDRSxlQUFBO0FBQ0Y7O0FBRUE7RUFDRSxtQkFBQTtBQUNGOztBQUVBOztFQUVFLGtCQUFBO0FBQ0Y7O0FBRUE7RUFDRSwyREFBQTtBQUNGOztBQUVBO0VBQ0UsZUFBQTtFQUNBLGdCQUFBO0VBRUEsZ0JBQUE7QUFBRjs7QUFHQTtFQUNFLGVBQUE7RUFFQSxtQkFBQTtFQUVBLGNBQUE7RUFFQSxnQkFBQTtBQUhGOztBQU1BO0VBQ0UscUJBQUE7RUFDQSxtQkFBQTtFQUNBLGtCQUFBO0FBSEY7O0FBTUE7RUFDRSxzREFBQTtBQUhGOztBQU1BO0VBQ0UsK0JBQUE7QUFIRjs7QUFVQTtFQUNFLGdCQUFBO0FBUEY7O0FBVUE7RUFDRSxzQkFBQTtBQVBGOztBQVVBO0VBQ0UsbUJBQUE7QUFQRjs7QUFVQTtFQUNFLGlCQUFBO0VBQ0EsbUJBQUE7QUFQRjs7QUFVQTtFQUNFLHFCQUFBO0VBQ0EsbUJBQUE7RUFDQSxrQkFBQTtBQVBGOztBQVVBO0VBQ0UsK0JBQUE7QUFQRjs7QUFVQTtFQUNFLGVBQUE7RUFDQSxjQUFBO0FBUEY7O0FBVUE7RUFDRSxrQkFBQTtBQVBGOztBQVVBOztFQUVFLGtCQUFBO0VBQ0EsbUJBQUE7QUFQRjs7QUFVQTtFQUNFLGtCQUFBO0FBUEY7O0FBVUE7RUFDRSxxQkFBQTtFQUNBLGVBQUE7RUFFQSxvQ0FBQTtBQVJGOztBQVdBO0VBQ0UsaUNBQUE7QUFSRiIsInNvdXJjZXNDb250ZW50IjpbImlvbi1tZW51IGlvbi1jb250ZW50IHtcbiAgLS1iYWNrZ3JvdW5kOiB2YXIoLS1pb24taXRlbS1iYWNrZ3JvdW5kLCB2YXIoLS1pb24tYmFja2dyb3VuZC1jb2xvciwgI2ZmZikpO1xufVxuXG5pb24tbWVudS5tZCBpb24tY29udGVudCB7XG4gIC0tcGFkZGluZy1zdGFydDogOHB4O1xuICAtLXBhZGRpbmctZW5kOiA4cHg7XG4gIC0tcGFkZGluZy10b3A6IDIwcHg7XG4gIC0tcGFkZGluZy1ib3R0b206IDIwcHg7XG59XG5cbmlvbi1tZW51Lm1kIGlvbi1saXN0IHtcbiAgcGFkZGluZzogMjBweCAwO1xufVxuXG5pb24tbWVudS5tZCBpb24tbm90ZSB7XG4gIG1hcmdpbi1ib3R0b206IDMwcHg7XG59XG5cbmlvbi1tZW51Lm1kIGlvbi1saXN0LWhlYWRlcixcbmlvbi1tZW51Lm1kIGlvbi1ub3RlIHtcbiAgcGFkZGluZy1sZWZ0OiAxMHB4O1xufVxuXG5pb24tbWVudS5tZCBpb24tbGlzdCNpbmJveC1saXN0IHtcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLWlvbi1jb2xvci1zdGVwLTE1MCwgI2Q3ZDhkYSk7XG59XG5cbmlvbi1tZW51Lm1kIGlvbi1saXN0I2luYm94LWxpc3QgaW9uLWxpc3QtaGVhZGVyIHtcbiAgZm9udC1zaXplOiAyMnB4O1xuICBmb250LXdlaWdodDogNjAwO1xuXG4gIG1pbi1oZWlnaHQ6IDIwcHg7XG59XG5cbmlvbi1tZW51Lm1kIGlvbi1saXN0I2xhYmVscy1saXN0IGlvbi1saXN0LWhlYWRlciB7XG4gIGZvbnQtc2l6ZTogMTZweDtcblxuICBtYXJnaW4tYm90dG9tOiAxOHB4O1xuXG4gIGNvbG9yOiAjNzU3NTc1O1xuXG4gIG1pbi1oZWlnaHQ6IDI2cHg7XG59XG5cbmlvbi1tZW51Lm1kIGlvbi1pdGVtIHtcbiAgLS1wYWRkaW5nLXN0YXJ0OiAxMHB4O1xuICAtLXBhZGRpbmctZW5kOiAxMHB4O1xuICBib3JkZXItcmFkaXVzOiA0cHg7XG59XG5cbmlvbi1tZW51Lm1kIGlvbi1pdGVtLnNlbGVjdGVkIHtcbiAgLS1iYWNrZ3JvdW5kOiByZ2JhKHZhcigtLWlvbi1jb2xvci1wcmltYXJ5LXJnYiksIDAuMTQpO1xufVxuXG5pb24tbWVudS5tZCBpb24taXRlbS5zZWxlY3RlZCBpb24taWNvbiB7XG4gIGNvbG9yOiB2YXIoLS1pb24tY29sb3ItcHJpbWFyeSk7XG59XG5cbi8vaW9uLW1lbnUubWQgaW9uLWl0ZW0gaW9uLWljb24ge1xuLy8gIGNvbG9yOiAjNjE2ZTdlO1xuLy99XG5cbmlvbi1tZW51Lm1kIGlvbi1pdGVtIGlvbi1sYWJlbCB7XG4gIGZvbnQtd2VpZ2h0OiA1MDA7XG59XG5cbmlvbi1tZW51LmlvcyBpb24tY29udGVudCB7XG4gIC0tcGFkZGluZy1ib3R0b206IDIwcHg7XG59XG5cbmlvbi1tZW51LmlvcyBpb24tbGlzdCB7XG4gIHBhZGRpbmc6IDIwcHggMCAwIDA7XG59XG5cbmlvbi1tZW51LmlvcyBpb24tbm90ZSB7XG4gIGxpbmUtaGVpZ2h0OiAyNHB4O1xuICBtYXJnaW4tYm90dG9tOiAyMHB4O1xufVxuXG5pb24tbWVudS5pb3MgaW9uLWl0ZW0ge1xuICAtLXBhZGRpbmctc3RhcnQ6IDE2cHg7XG4gIC0tcGFkZGluZy1lbmQ6IDE2cHg7XG4gIC0tbWluLWhlaWdodDogNTBweDtcbn1cblxuaW9uLW1lbnUuaW9zIGlvbi1pdGVtLnNlbGVjdGVkIGlvbi1pY29uIHtcbiAgY29sb3I6IHZhcigtLWlvbi1jb2xvci1wcmltYXJ5KTtcbn1cblxuaW9uLW1lbnUuaW9zIGlvbi1pdGVtIGlvbi1pY29uIHtcbiAgZm9udC1zaXplOiAyNHB4O1xuICBjb2xvcjogIzczODQ5YTtcbn1cblxuaW9uLW1lbnUuaW9zIGlvbi1saXN0I2xhYmVscy1saXN0IGlvbi1saXN0LWhlYWRlciB7XG4gIG1hcmdpbi1ib3R0b206IDhweDtcbn1cblxuaW9uLW1lbnUuaW9zIGlvbi1saXN0LWhlYWRlcixcbmlvbi1tZW51LmlvcyBpb24tbm90ZSB7XG4gIHBhZGRpbmctbGVmdDogMTZweDtcbiAgcGFkZGluZy1yaWdodDogMTZweDtcbn1cblxuaW9uLW1lbnUuaW9zIGlvbi1ub3RlIHtcbiAgbWFyZ2luLWJvdHRvbTogOHB4O1xufVxuXG5pb24tbm90ZSB7XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgZm9udC1zaXplOiAxNnB4O1xuXG4gIGNvbG9yOiB2YXIoLS1pb24tY29sb3ItbWVkaXVtLXNoYWRlKTtcbn1cblxuaW9uLWl0ZW0uc2VsZWN0ZWQge1xuICAtLWNvbG9yOiB2YXIoLS1pb24tY29sb3ItcHJpbWFyeSk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
});

/***/ }),

/***/ 635:
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AppModule: () => (/* binding */ AppModule),
/* harmony export */   initializeApp: () => (/* binding */ initializeApp)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/platform-browser */ 436);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ 5072);
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @ionic/angular */ 7401);
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./app.component */ 92);
/* harmony import */ var _app_routing_module__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./app-routing.module */ 4114);
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @ngrx/store */ 1383);
/* harmony import */ var _ngrx_effects__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @ngrx/effects */ 347);
/* harmony import */ var _store_effects_theme_config_effects__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./store/effects/theme-config.effects */ 5175);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/forms */ 4456);
/* harmony import */ var _store_reducers_theme_config_reducer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./store/reducers/theme-config-reducer */ 4325);
/* harmony import */ var _ngrx_store_devtools__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @ngrx/store-devtools */ 1925);
/* harmony import */ var _store_actions_theme_config_actions__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./store/actions/theme-config-actions */ 6350);
var _AppModule;
// import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { RouteReuseStrategy } from '@angular/router';
//
// import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
//
// import { AppComponent } from './app.component';
// import { AppRoutingModule } from './app-routing.module';
//
// @NgModule({
//   declarations: [AppComponent],
//   imports: [
//     BrowserModule, IonicModule.forRoot(), AppRoutingModule
//   ],
//   providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
//   bootstrap: [AppComponent],
// })
// export class AppModule {}


















function initializeApp(store) {
  return () => {
    const storageVal = localStorage.getItem('theme_config');
    const state = storageVal ? JSON.parse(storageVal) : _store_reducers_theme_config_reducer__WEBPACK_IMPORTED_MODULE_3__.initialState;
    store.dispatch((0,_store_actions_theme_config_actions__WEBPACK_IMPORTED_MODULE_4__.updateThemeConfig)(state));
  };
}
class AppModule {}
_AppModule = AppModule;
_AppModule.ɵfac = function AppModule_Factory(t) {
  return new (t || _AppModule)();
};
_AppModule.ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineNgModule"]({
  type: _AppModule,
  bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_0__.AppComponent]
});
_AppModule.ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineInjector"]({
  providers: [{
    provide: _angular_router__WEBPACK_IMPORTED_MODULE_6__.RouteReuseStrategy,
    useClass: _ionic_angular__WEBPACK_IMPORTED_MODULE_7__.IonicRouteStrategy
  }, {
    provide: _angular_core__WEBPACK_IMPORTED_MODULE_5__.APP_INITIALIZER,
    useFactory: initializeApp,
    deps: [_ngrx_store__WEBPACK_IMPORTED_MODULE_8__.Store],
    multi: true
  }],
  imports: [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_9__.BrowserModule, _ionic_angular__WEBPACK_IMPORTED_MODULE_7__.IonicModule.forRoot(), _app_routing_module__WEBPACK_IMPORTED_MODULE_1__.AppRoutingModule, _ngrx_store__WEBPACK_IMPORTED_MODULE_8__.StoreModule.forRoot({
    themeConfig: _store_reducers_theme_config_reducer__WEBPACK_IMPORTED_MODULE_3__.themeConfigReducer
  }), _ngrx_effects__WEBPACK_IMPORTED_MODULE_10__.EffectsModule.forRoot([_store_effects_theme_config_effects__WEBPACK_IMPORTED_MODULE_2__.ThemeConfigEffects]), _ngrx_store_devtools__WEBPACK_IMPORTED_MODULE_11__.StoreDevtoolsModule.instrument({
    maxAge: 25,
    connectInZone: true
  }), _angular_forms__WEBPACK_IMPORTED_MODULE_12__.FormsModule]
});
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵsetNgModuleScope"](AppModule, {
    declarations: [_app_component__WEBPACK_IMPORTED_MODULE_0__.AppComponent],
    imports: [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_9__.BrowserModule, _ionic_angular__WEBPACK_IMPORTED_MODULE_7__.IonicModule, _app_routing_module__WEBPACK_IMPORTED_MODULE_1__.AppRoutingModule, _ngrx_store__WEBPACK_IMPORTED_MODULE_8__.StoreRootModule, _ngrx_effects__WEBPACK_IMPORTED_MODULE_10__.EffectsRootModule, _ngrx_store_devtools__WEBPACK_IMPORTED_MODULE_11__.StoreDevtoolsModule, _angular_forms__WEBPACK_IMPORTED_MODULE_12__.FormsModule]
  });
})();

/***/ }),

/***/ 8640:
/*!****************************************************************!*\
  !*** ./src/app/cv-page/topics-graph/topics-graph.component.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TopicsGraphComponent: () => (/* binding */ TopicsGraphComponent)
/* harmony export */ });
/* harmony import */ var _Users_kd_R_InnoTopic_InnoTopic_Website_InnoTopicWebsite_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ 9204);
/* harmony import */ var _TopicFriendsShared3_topics_core_topics_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../TopicFriendsShared3/topics-core/topics-data */ 8003);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 7580);

var _TopicsGraphComponent;


const preset1 = {
  // forceLinkStrength: 3,
  forceLinkStrength: 0.1,
  // forceManyBodyStrength: -1000,
  forceManyBodyStrength: -50
};
const preset = {
  // forceLinkStrength: 3,
  forceLinkStrength: 1,
  // forceManyBodyStrength: -1000,
  forceManyBodyStrength: -200,
  allowZoom: true
};
// TODO: try d3.forceRadial(radius[, x][, y])
const veryBigSize = 2,
  bigSize = 1.76,
  midSize = 1.25,
  smallSize = 0.7,
  verySmallSize = 0.35;
class TopicsGraphComponent {
  constructor() {
    this.nodes = {
      /* only nodes that I want to apply special properties */
      jQuery: {/*size: small*/},
      Angular: {/*size: big*/}
    };
    this.connections = {
      CSS3: {
        sizeMult: bigSize,
        connections: {
          Sass: {},
          Stylus: {
            sizeMult: smallSize
          },
          Less: {
            sizeMult: smallSize
          }
        }
      },
      JavaScript: {
        sizeMult: bigSize,
        connections: {
          'TypeScript': {
            sizeMult: veryBigSize,
            strengthMul: 0.4
          },
          'Frontend': {
            strengthMul: 1.5,
            sizeMult: veryBigSize,
            // strengthMul: 0.4,
            connections: {
              Svelte: {
                sizeMult: midSize
              },
              Qwik: {
                sizeMult: smallSize
              },
              // Astro: {},
              SolidJS: {
                sizeMult: smallSize
              },
              Ionic: {
                strengthMul: 2,
                sizeMult: veryBigSize,
                connections: {
                  'Angular': {
                    strengthMul: 0.7,
                    sizeMult: veryBigSize,
                    connections: {
                      NgRx: {
                        strengthMul: 2
                      }
                    }
                  },
                  'Vue.js': {
                    strengthMul: 0.5,
                    sizeMult: bigSize
                  },
                  'React': {
                    strengthMul: 0.5,
                    sizeMult: veryBigSize
                  },
                  Android: {
                    strengthMul: 1.5,
                    sizeMult: midSize,
                    connections: {
                      Java: {
                        strengthMul: 3,
                        sizeMult: smallSize,
                        connections: {
                          "Spring Boot": {
                            strengthMul: 2,
                            sizeMult: verySmallSize
                            /* TODO could display old stuff as faded/transparent/grayed */
                            // ...small
                          }
                        }
                      },
                      Kotlin: {}
                    }
                  },
                  'Stencil': {
                    strengthMul: 2,
                    connections: {
                      'Web Components': {}
                    }
                  }
                }
              }
            }
          },
          'Node.js': {},
          Deno: {
            connections: {
              Rust: {
                connections: {
                  Turbopack: {},
                  Turborepo: {}
                },
                strengthMul: 2
              }
            }
          },
          Jest: {},
          Redux: {},
          RxJS: {},
          Vite: {
            strengthMul: 0.5
          },
          // Turbopack: {
          //   connections: {
          //     Turborepo: {},
          //   },
          // },
          // TODO: "JS build & deploy node" - icon with a box and up-arrow (a'la upload): vercel, esbuild turbopack, netlify, vite
          // "JavaScript Libraries": {},
          // Astro: {},
          // TurboPack,
          Vercel: {},
          Netlify: {}
        }
      },
      HTML5: {
        sizeMult: bigSize,
        connections: {
          SVG: {
            sizeMult: bigSize,
            strengthMul: 2,
            connections: {
              "Affinity Designer": {
                sizeMult: smallSize
              },
              Figma: {},
              'D3.js': {}
            }
          }
        }
      }
    };
    this.d3Nodes = [];
    this.d3Links = [
    // {source: 'Web Components', target: 'HTML5'},
    {
      source: 'Kotlin',
      target: 'Java'
    }, {
      source: 'Turbopack',
      target: 'Vercel'
    }, {
      source: 'Turborepo',
      target: 'Vercel'
    },
    // {source: 'Angular', target: 'TypeScript', strengthMul: 0.3},
    {
      source: 'Frontend',
      target: 'CSS3'
    }, {
      source: 'Frontend',
      target: 'HTML5'
    }
    // TODO: introduce a grouping element for "Frontend" (to separate a bit from Node.js, deno)
    ];
  }
  ngOnInit() {
    console.log('generateNodes', this.d3Nodes);
    this.generateNodes(this.connections);
    console.log('d3Nodes', this.d3Nodes);
    this.generateLinks(this.connections);
    this.fetchIcons(); // this inits graph when finished
  }
  fetchIcons() {
    var _this = this;
    return (0,_Users_kd_R_InnoTopic_InnoTopic_Website_InnoTopicWebsite_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
      // const topicNodes = [topics.Svelte, topics['Vue.js'], topics.React]
      const topicNodes = _this.d3Nodes.map(d3Node => {
        let topicId = d3Node.id;
        const topic = _TopicFriendsShared3_topics_core_topics_data__WEBPACK_IMPORTED_MODULE_1__.topics[topicId];
        if (!topic) {
          console.error('No topic for graph node id:', topicId);
        }
        return topic;
      });
      let logosPromises = topicNodes.map(topic => {
        console.log(`topic`, topic);
        const responsePromise = fetch(topic.logo);
        // responsePromise.then(resp => {
        //   resp.text().then(text => {
        //     const d3Node = this.d3Nodes.find(n => n.id === topic.name /* not id coz _dot_js */);
        //     if ( ! d3Node ) {
        //       console.error('no node', topic.id)
        //     }
        //     d3Node.body = text.trim().substr(text.indexOf('<svg')) // TODO maybe remove other attrs like width height
        //     // TODO: prolly i really wanna remove stuff AFTER <svg
        //     console.log('d3Node with text', d3Node)
        //   })
        // })
        return responsePromise; /*.then(x => {
                                console.log('topic svg fetched', x.text())
                                })*/
        // return (await responsePromise).text()
      });
      console.log(`topic logosPromises`, logosPromises);
      const topicLogosResponses = yield Promise.all(logosPromises);
      const topicLogosTexts = yield Promise.all(topicLogosResponses.map(resp => resp.text())).then(texts => {
        texts.forEach((text, i) => {
          const topic = topicNodes[i];
          const id = topic.name;
          const d3Node = _this.d3Nodes.find(n => n.id === topic.name /* not id coz _dot_js */);
          if (!d3Node) {
            console.error('no node', topic.id);
          }
          d3Node.body = text.trim().substr(text.indexOf('<svg')); // TODO maybe remove other attrs like width height
          // TODO: prolly i really wanna remove stuff AFTER <svg
          console.log('d3Node with text', d3Node);
        });
        _this.initD3Graph(); // FIXME
      });
      // const topicLogosTexts = await Promise.all(topicLogosResponses)
      console.log(`topic logos`, topicLogosResponses);
      console.log(`topic logos topicLogosTexts`, topicLogosTexts);
      // setTimeout(() => {
      //   this.initD3Graph() // FIXME
      // }, 3000)
      // fetch('../../../assets/images/logos-l/logos/stencil.svg').then(x => {
      //   console.log('svg fetched', x.text())
      // })
    })();
  }
  initD3Graph() {
    const svgRootElement = d3.select("#topics-graph-d3"),
      width = +svgRootElement.attr("width"),
      height = +svgRootElement.attr("height");
    const svg = svgRootElement.append("g"); /* actually a <g>, to fix transform not working in <svg> on chrome:
                                            http://stackoverflow.com/questions/27283610/d3-workaround-for-svg-transform-in-chrome */
    // svgRootElement.call(zoom1.transform, d3.zoomIdentity
    //   .translate(150, 100)
    //   .scale(2))
    if (preset.allowZoom) {
      svgRootElement.call(d3.zoom().on("zoom", function () {
        // https://www.geeksforgeeks.org/d3-js-transform-scale-function/
        console.log('transform d3.event.transform', d3.event.transform);
        svg.attr("transform", d3.event.transform);
        // svg.attr("transform", {k: 0.6087830093314941, x: 176.23706425069088, y: 116.76122945091723})
        // svg.attr("transform", d3.transform({k: 0.6087830093314941, x: 176.23706425069088, y: 116.76122945091723}))
      }));
    }
    // var color = d3.scaleOrdinal(d3.schemeCategory20);
    // const color = d3.rgb(230, 230, 230, 128);
    console.log(`d3`, d3);
    // const color = d3.rgb(80, 80, 80)// .copy({opacity: 0.5});
    const color = d3.color(`rgba(80, 80, 80, 0.5)`); // .copy({opacity: 0.5});
    /* Base Example:
       Force-Directed Graph: https://bl.ocks.org/mbostock/4062045 */
    const simulation = d3.forceSimulation()
    // .force("gravity", 3)
    // .velocityDecay(3)
    .force("link", d3.forceLink().id(function (d) {
      return d.id;
    }).strength(function (d) {
      var _d$strengthMul;
      if (d.strengthMul) {
        console.log('d.strengthMul', d.strengthMul);
      }
      // return preset.forceLinkStrength;
      //          return 1 / Math.min(count(link.source), count(link.target));
      return preset.forceLinkStrength * ((_d$strengthMul = d.strengthMul) !== null && _d$strengthMul !== void 0 ? _d$strengthMul : 1);
    })).force("charge", d3.forceManyBody().strength(function (d) {
      var _d$sizeMult;
      const size = (_d$sizeMult = d.sizeMult) !== null && _d$sizeMult !== void 0 ? _d$sizeMult : midSize;
      // return preset.forceManyBodyStrength
      // return size**5 * preset.forceManyBodyStrength / 3
      // return size**10 * preset.forceManyBodyStrength / 100 // this was kinda working
      return size ** 1.5 * preset.forceManyBodyStrength / 1; // this was kinda working
      // return size * 1000000
    })).force("center", d3.forceCenter(width / 2, height / 2));
    // simulation.force("charge", function() {
    ////        return (d.sizeMult ? d.sizeMult : 1) * 100 }
    //            return -1000000;
    //        })
    const nodes = {};
    // const links = [
    //   {source: Java, target: "Scala"},
    //   {source: Java, target: Android},
    //   {source: Java, target: Kotlin, distance: 1.3},
    //   {source: Java, target: "Groovy"},
    //   {source: Ruby, target: "Groovy", thick: 0},
    // ];
    // const nodesWebOnly = [
    //   nodes.Cordova,
    //   nodes.HTML5,
    // ];
    /* ToDo: Bower, Grunt, JSLint */
    // const linksWebOnly = [
    //   {source: HTML5, target: CSS, thick: 10},
    //   {source: SVG, target: HTML5, thick: 10, distance: 1.5},
    // ];
    const nodesKeys = Object.keys(nodes);
    const nodesArray = nodesKeys.map(function (v) {
      return nodes[v];
    });
    // initial xy: https://observablehq.com/@d3/force-layout-phyllotaxis
    const graph = {
      nodes: this.d3Nodes,
      links: this.d3Links
    };
    const allLinksGroup = svg.append("g").attr("class", "links").selectAll("line").data(graph.links).enter().append("line").attr("stroke-width", function (d) {
      return 5; // Math.sqrt(d.thick == null ? 10 : d.thick );
    });
    const allNodesGroup = svg.append("g") /* Group that contains all nodes */.attr("class", "nodes").selectAll(".node").data(graph.nodes).enter();
    const perNodeMainGroup = allNodesGroup.append("g") /* top-level group of a node which will include the circle and icon */.attr("class", "node");
    allNodesGroup.selectAll(".techCircleOverlay").data(graph.nodes);
    simulation.nodes(graph.nodes).on("tick", ticked);
    simulation.force("link").links(graph.links).distance(function (link) {
      //        return link.graph === 0 ? height/2 : height/4;
      const multip = link.distance == null ? 0.7 : link.distance;
      return multip * 70;
    });
    const defaultRadius = 23;
    let isDragging = false;
    const radiusFunc = function (d) {
      return d.sizeMult ? d.sizeMult * defaultRadius : defaultRadius;
    };
    const radiusFuncRect = function (d) {
      return radiusFunc(d) * 2;
    };
    const nodeCircle = perNodeMainGroup.append("circle").attr("class", function (d) {
      d.id + '_background' + ' circleBg' + ' techCircle';
    }).attr("r", radiusFunc).attr("id2", function (d) {
      return d.id;
    }).attr("id", function (d) {
      return d.id;
    }).attr("fill", function (d) {
      return color;
    });
    const foreignObjectW = 100; // foreign object width
    const foreignObjectH = 50;
    const defaultSize = 30;
    perNodeMainGroup.append("g").html(function (d) {
      const bodyText = d.body || "";
      const size = d.sizeMult ? d.sizeMult * defaultSize : defaultSize;
      if (bodyText.trim().endsWith("</svg>")) {
        const htmlContent = '<svg ' + 'width=\"' + size + 'px\" ' + 'height=\"' + size + 'px\" ' + 'x="' + -size / 2 + '" ' + 'y="' + -size / 2 + '" ' + bodyText /* also contains </svg> */;
        return htmlContent;
      } else {
        return "";
      }
    });
    const border = 0;
    perNodeMainGroup.append("foreignObject").attr("style", "pointer-events:none;").attr("width", foreignObjectW).attr("height", foreignObjectH).attr("height", foreignObjectH).attr("x", -foreignObjectW / 2).attr("y", -foreignObjectH / 2).style("font", "9px 'Helvetica Neue'").html(function (d) {
      if (d.body) {
        return ""; // has icon: no need for text
      }
      const bodyText = d.html || d.id;
      return "<div style='display: table;" + "text-align:center;" + "height:100%; width:100%'>" + "<p style='display: table-cell; " + "vertical-align: middle'>" + bodyText + "</p></div>";
    });
    function unHighlightHover(d) {
      $('.techCircleHover').removeClass("techCircleHover", false);
      d3.select(".techCircleHover").classed("techCircleHover", false);
    }
    /* need to set the overlay's position separately in root,
       because of jerky movement issue with drag&drop and "translate(...)" transform
    */
    const nodeCircleOverlay = allNodesGroup.append("rect")
    //        .attr("r", radiusFunc)
    .attr("width", radiusFuncRect).attr("height", radiusFuncRect).attr("rx", radiusFunc).attr("ry", radiusFunc)
    //        .attr("x", 0)
    //        .attr("x", -defaultRadius)
    //        .attr("y", 0)
    //        .attr("y", -defaultRadius)
    .classed("techCircleOverlay", true);
    nodeCircleOverlay.on("mouseover", function (d) {
      if (!isDragging) {
        //            $('tech').hover(function() {
        $('#' + d.id).addClass("techCircleHover");
        //            $("[id2='"+ d.id + "']").css('background-color','rgba(0, 0, 0, 0.6)');
        $("." + d.id + '_background').css('background-color', 'rgba(0, 0, 0, 0.6)');
        d3.select(this).classed("techCircleHover", true); // "#fff8ee00"
      }
    }).on("mouseout", function (d) {
      if (!isDragging) {
        /* While dragging, the highlight shall stay */
        unHighlightHover.call(this, d);
      }
    });
    nodeCircleOverlay.call(d3.drag().on("start", dragStarted).on("drag", dragged).on("end", dragEnded));
    const titleFunc = function (d) {
      return d.id;
    };
    nodeCircle.append("title").text(titleFunc);
    nodeCircleOverlay.append("title").text(titleFunc);
    function ticked() {
      allLinksGroup.attr("x1", function (d) {
        return d.source.x;
      }).attr("y1", function (d) {
        return d.source.y;
      }).attr("x2", function (d) {
        return d.target.x;
      }).attr("y2", function (d) {
        return d.target.y;
      });
      perNodeMainGroup.attr("x", function (d) {
        return d.x - radiusFunc(d);
      }).attr("y", function (d) {
        return d.y - radiusFunc(d);
      });
      nodeCircleOverlay /* need to set position separately, because of issue with drag&drop and "translate(...)" transform */.attr("x", function (d) {
        return (d.fx || d.x) - radiusFunc(d);
      }).attr("y", function (d) {
        return (d.fy || d.y) - radiusFunc(d);
      });
      perNodeMainGroup.attr("transform", function (d) {
        // return "translate(" + (d.x + radiusFunc(d) / 2) + "," + (d.y + radiusFunc(d) / 2) + ")";
        return "translate(" + d.x + "," + d.y + ")";
      });
    }
    function dragStarted(d) {
      isDragging = true;
      if (!d3.event.active) {
        simulation.alphaTarget(0.3).restart();
      }
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(d) {
      isDragging = true; // just in case...
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
    function dragEnded(d) {
      isDragging = false;
      unHighlightHover();
      if (!d3.event.active) {
        simulation.alphaTarget(0);
      }
      d.fx = null;
      d.fy = null;
    }
  }
  generateNodes(connections) {
    // const nodesSet = new Set(GraphNodeId)
    const nodes = [];
    nodes.push(...Object.keys(connections).map(key => {
      const child = connections[key];
      const childConnections = child.connections;
      if (childConnections) {
        this.generateNodes(childConnections);
      }
      // return {id: key, html: key}
      return {
        id: key,
        ...child /* TODO keep in mind that I might be mixing connection and note attrs here; so maybe smth like: 'connection: xyz' */
      };
    }));
    this.d3Nodes.push(...nodes);
  }
  generateLinks(connections) {
    Object.keys(connections).map(sourceId => {
      const child = connections[sourceId];
      const childConnections = child.connections;
      if (childConnections) {
        this.generateLinks(childConnections);
      }
      // const nestedConnections = child.connections
      const nestedConnections = connections[sourceId].connections || {};
      const links = Object.keys(nestedConnections).map(key => {
        const d3Link = {
          source: sourceId,
          target: key,
          strengthMul: nestedConnections[key].strengthMul
        };
        return d3Link;
      });
      this.d3Links.push(...links);
    });
    console.log(`links`, this.d3Links);
  }
}
_TopicsGraphComponent = TopicsGraphComponent;
_TopicsGraphComponent.ɵfac = function TopicsGraphComponent_Factory(t) {
  return new (t || _TopicsGraphComponent)();
};
_TopicsGraphComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({
  type: _TopicsGraphComponent,
  selectors: [["app-topics-graph"]],
  inputs: {
    nodes: "nodes",
    connections: "connections"
  },
  decls: 1,
  vars: 0,
  consts: [["id", "topics-graph-d3", "width", "600", "height", "600"]],
  template: function TopicsGraphComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnamespaceSVG"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](0, "svg", 0);
    }
  },
  styles: [".links line {\n  stroke: #999;\n  stroke-opacity: 0.2;\n  stroke-dasharray: 1 3;\n  animation: dash 1s linear infinite;\n}\n\n@keyframes dash {\n  from {\n    stroke-dashoffset: 12;\n  }\n  to {\n    stroke-dashoffset: 0;\n  }\n}\n.circleBg {\n  stroke: #fff;\n  stroke-width: 1.5px;\n}\n\n/*         .attr(\"fill\", d3.rgb(180,180,180, 0)) */\n/*.attr(\"style\", \"stroke-width: 1.5px;\")*/\n.techCircle {\n  fill: #000;\n  stroke: #fff;\n  fill-opacity: 0.2;\n  stroke-width: 1.5px;\n  transition: all 0.2s ease-in;\n}\n\n.techCircleHover {\n  stroke: #fff;\n  fill: #aaa;\n  stroke-width: 1.5px;\n  transition: all 0.2s ease-in;\n}\n\ntech {\n  border-radius: 4px;\n  background: #e6e6e6;\n  /*border-style: solid;*/\n  /*border-color: #e0e0e0;*/\n  padding: 5px;\n  /*width: 200px;*/\n  height: 2000px;\n  transition: all 0.2s ease-in;\n  box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.63);\n}\n\n.techCircleOverlay, .techCircleMouseOver {\n  fill: #f00;\n  fill-opacity: 0;\n  stroke: #fff;\n  stroke-width: 0px;\n}\n\n/*{*/\n *  /*fill: #f00;*/\n *  /*fill-opacity: 0.2;*/\n *  /*stroke: #fff;*/\n *  /*stroke-width: 0px;*/\n/*}*/\n/*@keyframes tech {*/\n *  /*0% { transform: scale(1); }*/\n *  /*30% { transform: scale(1); }*/\n *  /*40% { transform: scale(1.08); }*/\n *  /*50% { transform: scale(1); }*/\n *  /*60% { transform: scale(1); }*/\n *  /*70% { transform: scale(1.05); }*/\n *  /*80% { transform: scale(1); }*/\n *  /*100% { transform: scale(1); }*/\n/*}*/\ntech:hover {\n  background-color: yellow;\n  transition: all 0.2s ease-in;\n  transform: scale(1.18);\n}\n\n#techBody {\n  padding: 5px;\n  overflow: scroll;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY3YtcGFnZS90b3BpY3MtZ3JhcGgvdG9waWNzLWdyYXBoLmNvbXBvbmVudC5zYXNzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsWUFBQTtFQUNBLG1CQUFBO0VBQ0EscUJBQUE7RUFFQSxrQ0FBQTtBQUFGOztBQVNBO0VBQ0U7SUFDRSxxQkFBQTtFQU5GO0VBT0E7SUFDRSxvQkFBQTtFQUxGO0FBQ0Y7QUFNQTtFQUNFLFlBQUE7RUFDQSxtQkFBQTtBQUpGOztBQU9BLGtEQUFBO0FBQ0EseUNBQUE7QUFHQTtFQUNFLFVBQUE7RUFDQSxZQUFBO0VBQ0EsaUJBQUE7RUFDQSxtQkFBQTtFQUNBLDRCQUFBO0FBTkY7O0FBU0E7RUFDRSxZQUFBO0VBQ0EsVUFBQTtFQUNBLG1CQUFBO0VBQ0EsNEJBQUE7QUFORjs7QUFRQTtFQUNFLGtCQUFBO0VBQ0EsbUJBQUE7RUFDQSx1QkFBQTtFQUNBLHlCQUFBO0VBQ0EsWUFBQTtFQUNBLGdCQUFBO0VBQ0EsY0FBQTtFQUNBLDRCQUFBO0VBR0EsK0NBQUE7QUFMRjs7QUFRQTtFQUNFLFVBQUE7RUFDQSxlQUFBO0VBQ0EsWUFBQTtFQUNBLGlCQUFBO0FBTEY7O0FBT0EsSUFBQTtDQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0VBbUJFLHdCQUFBO0VBQ0EsNEJBQUE7RUFDQSxzQkFBQTtBQU5GOztBQVFBO0VBQ0UsWUFBQTtFQUNBLGdCQUFBO0FBTEYiLCJzb3VyY2VzQ29udGVudCI6WyIubGlua3MgbGluZVxuICBzdHJva2U6ICM5OTlcbiAgc3Ryb2tlLW9wYWNpdHk6IDAuMlxuICBzdHJva2UtZGFzaGFycmF5OiAxIDMgLy8gVE9ETyBjYW4gYW5pbWF0ZSB0aGUgb2Zmc2V0XG4gIC8vc3Ryb2tlLXdpZHRoOiA0cHhcbiAgYW5pbWF0aW9uOiBkYXNoIDFzIGxpbmVhciBpbmZpbml0ZVxuXG4vL3BhdGgsXG4vLy5hbmltbGluZSB7XG4vLyAgc3Ryb2tlLWRhc2hhcnJheTogMztcbi8vICBzdHJva2UtZGFzaG9mZnNldDogMDtcbi8vICBjb2xvcjogdmFyKC0taW9uLWNvbG9yLXByaW1hcnkpO1xuLy99XG5cbkBrZXlmcmFtZXMgZGFzaFxuICBmcm9tXG4gICAgc3Ryb2tlLWRhc2hvZmZzZXQ6IDEyXG4gIHRvXG4gICAgc3Ryb2tlLWRhc2hvZmZzZXQ6IDBcblxuLmNpcmNsZUJnXG4gIHN0cm9rZTogI2ZmZlxuICBzdHJva2Utd2lkdGg6IDEuNXB4XG5cblxuLyogICAgICAgICAuYXR0cihcImZpbGxcIiwgZDMucmdiKDE4MCwxODAsMTgwLCAwKSkgKi9cbi8qLmF0dHIoXCJzdHlsZVwiLCBcInN0cm9rZS13aWR0aDogMS41cHg7XCIpKi9cblxuXG4udGVjaENpcmNsZVxuICBmaWxsOiAjMDAwXG4gIHN0cm9rZTogI2ZmZlxuICBmaWxsLW9wYWNpdHk6IDAuMlxuICBzdHJva2Utd2lkdGg6IDEuNXB4XG4gIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2UtaW5cblxuXG4udGVjaENpcmNsZUhvdmVyXG4gIHN0cm9rZTogI2ZmZlxuICBmaWxsOiAjYWFhXG4gIHN0cm9rZS13aWR0aDogMS41cHhcbiAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZS1pblxuXG50ZWNoXG4gIGJvcmRlci1yYWRpdXM6IDRweFxuICBiYWNrZ3JvdW5kOiAjZTZlNmU2XG4gIC8qYm9yZGVyLXN0eWxlOiBzb2xpZDsqL1xuICAvKmJvcmRlci1jb2xvcjogI2UwZTBlMDsqL1xuICBwYWRkaW5nOiA1cHhcbiAgLyp3aWR0aDogMjAwcHg7Ki9cbiAgaGVpZ2h0OiAyMDAwcHhcbiAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZS1pblxuICAtd2Via2l0LWJveC1zaGFkb3c6IDBweCAwcHggMnB4IDFweCByZ2JhKDAsMCwwLDAuNjMpXG4gIC1tb3otYm94LXNoYWRvdzogMHB4IDBweCAycHggMXB4IHJnYmEoMCwwLDAsMC42MylcbiAgYm94LXNoYWRvdzogMHB4IDBweCAycHggMXB4IHJnYmEoMCwwLDAsMC42MylcblxuXG4udGVjaENpcmNsZU92ZXJsYXksIC50ZWNoQ2lyY2xlTW91c2VPdmVyXG4gIGZpbGw6ICNmMDBcbiAgZmlsbC1vcGFjaXR5OiAwLjBcbiAgc3Ryb2tlOiAjZmZmXG4gIHN0cm9rZS13aWR0aDogMHB4XG5cbi8qeyovXG4gICAgLypmaWxsOiAjZjAwOyovXG4gICAgLypmaWxsLW9wYWNpdHk6IDAuMjsqL1xuICAgIC8qc3Ryb2tlOiAjZmZmOyovXG4gICAgLypzdHJva2Utd2lkdGg6IDBweDsqL1xuLyp9Ki9cblxuXG4vKkBrZXlmcmFtZXMgdGVjaCB7Ki9cbiAgICAvKjAlIHsgdHJhbnNmb3JtOiBzY2FsZSgxKTsgfSovXG4gICAgLyozMCUgeyB0cmFuc2Zvcm06IHNjYWxlKDEpOyB9Ki9cbiAgICAvKjQwJSB7IHRyYW5zZm9ybTogc2NhbGUoMS4wOCk7IH0qL1xuICAgIC8qNTAlIHsgdHJhbnNmb3JtOiBzY2FsZSgxKTsgfSovXG4gICAgLyo2MCUgeyB0cmFuc2Zvcm06IHNjYWxlKDEpOyB9Ki9cbiAgICAvKjcwJSB7IHRyYW5zZm9ybTogc2NhbGUoMS4wNSk7IH0qL1xuICAgIC8qODAlIHsgdHJhbnNmb3JtOiBzY2FsZSgxKTsgfSovXG4gICAgLyoxMDAlIHsgdHJhbnNmb3JtOiBzY2FsZSgxKTsgfSovXG4vKn0qL1xudGVjaDpob3ZlclxuICBiYWNrZ3JvdW5kLWNvbG9yOiB5ZWxsb3dcbiAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZS1pblxuICB0cmFuc2Zvcm06IHNjYWxlKDEuMTgpXG5cbiN0ZWNoQm9keVxuICBwYWRkaW5nOiA1cHhcbiAgb3ZlcmZsb3c6IHNjcm9sbFxuXG4iXSwic291cmNlUm9vdCI6IiJ9 */"],
  encapsulation: 2
});

/***/ }),

/***/ 6350:
/*!*******************************************************!*\
  !*** ./src/app/store/actions/theme-config-actions.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   updateThemeConfig: () => (/* binding */ updateThemeConfig)
/* harmony export */ });
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ngrx/store */ 1383);

const updateThemeConfig = (0,_ngrx_store__WEBPACK_IMPORTED_MODULE_0__.createAction)('[Theme Config] Update Theme Config', (0,_ngrx_store__WEBPACK_IMPORTED_MODULE_0__.props)());

/***/ }),

/***/ 5175:
/*!*******************************************************!*\
  !*** ./src/app/store/effects/theme-config.effects.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ThemeConfigEffects: () => (/* binding */ ThemeConfigEffects)
/* harmony export */ });
/* harmony import */ var _ngrx_effects__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @ngrx/effects */ 347);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/operators */ 8764);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/operators */ 2136);
/* harmony import */ var _actions_theme_config_actions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../actions/theme-config-actions */ 6350);
/* harmony import */ var _utils_colors_colorUtils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/colors/colorUtils */ 6869);
/* harmony import */ var _utils_colors_ionic_color_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/colors/ionic-color-utils */ 7461);
/* harmony import */ var _utils_colors_adjustLuminance__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/colors/adjustLuminance */ 3518);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/core */ 7580);
var _ThemeConfigEffects;








class ThemeConfigEffects {
  constructor(actions$) {
    this.actions$ = actions$;
    this.updateThemeConfig$ = (0,_ngrx_effects__WEBPACK_IMPORTED_MODULE_4__.createEffect)(() => this.actions$.pipe((0,_ngrx_effects__WEBPACK_IMPORTED_MODULE_4__.ofType)(_actions_theme_config_actions__WEBPACK_IMPORTED_MODULE_0__.updateThemeConfig),
    // withLatestFrom(this.store.pipe(select(fromRoot.selectEntireState))),
    // concatLatestFrom
    (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.tap)(action => {
      const storeVal = action; // FIXME
      console.log(`action`, action);
      const root = document.documentElement.style;
      for (const [key, value] of Object.entries(action)) {
        // const variable = `--${key.replace('_', '-')}`;
        const varName = `--${key.replace(/_/g, '-')}`;
        const val = varName.startsWith('--shadow') ? `${value}px` : value;
        root.setProperty(varName, val);
        // set shade and tint:
        // TODO: might be better to increase/decrease luminance by ~0.2
        root.setProperty(`${varName}-shade`, `color-mix(in srgb, var(${varName}) 75%, black`);
        root.setProperty(`${varName}-tint`, `color-mix(in srgb, var(${varName}) 75%, white`);
        //--shadow-light-color: #f0f0f0;
        /* FIXME: shadows should be based on luminance increase/decrease, instead of opacity which is like mixing;
            e.g. white is much farther away from dark bg, than black */
        const shadowLumAdjust = action.shadow_opacity /* FIXME */ / 100; // TODO: calculate Max diff from bg lum to black/white (coz / 100 causes part of the slider to be HSL 1.0)
        // root.setProperty('--shadow-light-color', `#ffffff${action.shadow_opacity}`)
        root.setProperty('--shadow-light-color', (0,_utils_colors_adjustLuminance__WEBPACK_IMPORTED_MODULE_3__.adjustLuminance)(action.ion_background_color, shadowLumAdjust));
        // root.setProperty('--shadow-dark-color' , `#000000${action.shadow_opacity}`)
        root.setProperty('--shadow-dark-color', (0,_utils_colors_adjustLuminance__WEBPACK_IMPORTED_MODULE_3__.adjustLuminance)(action.ion_background_color, -shadowLumAdjust));
        root.setProperty('--ion-item-border-color', 'var(--ion-color-step-100)');
        const contrastValue = 'high';
        const backgroundColor = action.ion_background_color;
        if (backgroundColor) {
          let fg = (0,_utils_colors_colorUtils__WEBPACK_IMPORTED_MODULE_1__.getIonicTextColor)(backgroundColor, contrastValue);
          root.setProperty('--ion-text-color', fg);
          root.setProperty('--color', fg);
          (0,_utils_colors_ionic_color_utils__WEBPACK_IMPORTED_MODULE_2__.setIonicColorSteps)(fg);
        }
        const primaryColor = action.ion_color_primary;
        if (primaryColor) {
          let fg = (0,_utils_colors_colorUtils__WEBPACK_IMPORTED_MODULE_1__.getIonicTextColor)(primaryColor, contrastValue);
          const varName = '--ion-color-primary-contrast';
          (0,_utils_colors_ionic_color_utils__WEBPACK_IMPORTED_MODULE_2__.setIonicColorVarHexAndRgb)(root, varName, fg);
        }
        const secondaryColor = action.ion_color_secondary;
        if (secondaryColor) {
          let fg = (0,_utils_colors_colorUtils__WEBPACK_IMPORTED_MODULE_1__.getIonicTextColor)(secondaryColor, contrastValue);
          (0,_utils_colors_ionic_color_utils__WEBPACK_IMPORTED_MODULE_2__.setIonicColorVarHexAndRgb)(root, '--ion-color-secondary-contrast', fg);
        }
        root.setProperty('--chip-shadow-margin', +storeVal.shadow_blur_radius / 4 /* TODO could take opacity into account for dividing */ + Math.abs(+storeVal.shadow_offset) + 2 + 'px');
        //--shadow-dark-color: #d0d0d0;
        // localStorage.setItem('theme_config', JSON.stringify(action)); // FIXME extract to another effect
      }
    })), {
      dispatch: false
    });
    /* FIXME test / fix */
    this.setLocalStorage$ = (0,_ngrx_effects__WEBPACK_IMPORTED_MODULE_4__.createEffect)(() => this.actions$.pipe((0,_ngrx_effects__WEBPACK_IMPORTED_MODULE_4__.ofType)(_actions_theme_config_actions__WEBPACK_IMPORTED_MODULE_0__.updateThemeConfig), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_6__.throttleTime)(1000, undefined, {
      leading: true,
      trailing: true
    }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.tap)(action => {
      console.log('setLocalStorage$ action: ', action);
      // FIXME: store entire config, not just patch (action)
      localStorage.setItem('theme_config', JSON.stringify(action));
    })), {
      dispatch: false
    });
  }
}
_ThemeConfigEffects = ThemeConfigEffects;
_ThemeConfigEffects.ɵfac = function ThemeConfigEffects_Factory(t) {
  return new (t || _ThemeConfigEffects)(_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵinject"](_ngrx_effects__WEBPACK_IMPORTED_MODULE_4__.Actions));
};
_ThemeConfigEffects.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdefineInjectable"]({
  token: _ThemeConfigEffects,
  factory: _ThemeConfigEffects.ɵfac
});

/***/ }),

/***/ 4325:
/*!********************************************************!*\
  !*** ./src/app/store/reducers/theme-config-reducer.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initialState: () => (/* binding */ initialState),
/* harmony export */   themeConfigReducer: () => (/* binding */ themeConfigReducer)
/* harmony export */ });
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ngrx/store */ 1383);
/* harmony import */ var _actions_theme_config_actions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../actions/theme-config-actions */ 6350);


/* TODO de-duplicate the patch type */
const initialState = {
  ion_color_primary: '#007bff',
  ion_color_secondary: '#6c757d',
  // ion_background_color: '#f8f9fa',
  // ion_background_color: '#ff3434', //'#ff8080',
  ion_background_color: '#ffffff',
  shadow_offset: '5',
  // shadow_offset_x: '5px',
  // shadow_offset_y: '5px',
  shadow_blur_radius: '10',
  shadow_opacity: 50
};
const themeConfigReducer = (0,_ngrx_store__WEBPACK_IMPORTED_MODULE_1__.createReducer)(initialState,
// on(ThemeConfigActions.init, (state) => state),
(0,_ngrx_store__WEBPACK_IMPORTED_MODULE_1__.on)(_actions_theme_config_actions__WEBPACK_IMPORTED_MODULE_0__.updateThemeConfig, (state, action) => {
  return {
    ...state,
    ...action
    // (((themeColor$ | async).themeConfig.shadow_blur_radius) + abs(((themeColor$ | async).themeConfig.shadow_offset)))/2 + 2 + 'px'
  };
}));

/***/ }),

/***/ 3518:
/*!*************************************************!*\
  !*** ./src/app/utils/colors/adjustLuminance.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   adjustLuminance: () => (/* binding */ adjustLuminance),
/* harmony export */   toHsl: () => (/* binding */ toHsl),
/* harmony export */   toRgb: () => (/* binding */ toRgb)
/* harmony export */ });
function toRgb(input) {
  let r, g, b;
  if (typeof input === 'string') {
    const c = input[0] === '#' ? input.substr(1) : input;
    const num = parseInt(c, 16);
    r = num >> 16 & 255;
    g = num >> 8 & 255;
    b = num & 255;
  } else {
    [r, g, b] = input;
  }
  return [r, g, b];
}
function toHsl(rgb) {
  const [r, g, b] = rgb.map(c => c / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  let h = 0,
    s = 0,
    l = (max + min) / 2;
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    switch (max) {
      case r:
        h = (g - b) / diff + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
}
function fromHsl(hsl) {
  const [h, s, l] = hsl;
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}
function adjustLuminance(color, amount) {
  const rgb = toRgb(color);
  const hsl = toHsl(rgb);
  hsl[2] = Math.min(Math.max(hsl[2] + amount, 0), 1);
  console.log(`amount`, amount, `hsl[2]`, hsl[2]);
  return fromHsl(hsl);
}

/***/ }),

/***/ 6869:
/*!********************************************!*\
  !*** ./src/app/utils/colors/colorUtils.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getIonicTextColor: () => (/* binding */ getIonicTextColor),
/* harmony export */   hexToRgb: () => (/* binding */ hexToRgb)
/* harmony export */ });
function hexToRgb(hex) {
  let r = 0,
    g = 0,
    b = 0;
  // 3 digits
  if (hex.length == 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  }
  // 6 digits
  else if (hex.length == 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}
function getIonicTextColor(backgroundColor, contrastValue) {
  // Convert the background color to RGB format
  const hexToRgb = hex => {
    const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!match) {
      throw new Error(`Invalid hexadecimal color code: ${hex}`);
    }
    const [_, r, g, b] = match;
    return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
  };
  const rgbBackground = hexToRgb(backgroundColor);
  // Calculate the relative luminance of the background color
  const luminance = (rgbBackground[0] * 0.299 + rgbBackground[1] * 0.587 + rgbBackground[2] * 0.114) / 255;
  // Determine the appropriate foreground color based on the contrast value
  if (contrastValue === 'high') {
    return luminance > 0.5 ? '#000000' : '#ffffff';
  } else if (contrastValue === 'medium') {
    return luminance > 0.4 ? '#000000' : '#ffffff';
  } else if (contrastValue === 'low') {
    return luminance > 0.6 ? '#000000' : '#ffffff';
  } else {
    return '#000000'; // default to black if contrast value is invalid
  }
}

/***/ }),

/***/ 7461:
/*!***************************************************!*\
  !*** ./src/app/utils/colors/ionic-color-utils.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   setIonicColorSteps: () => (/* binding */ setIonicColorSteps),
/* harmony export */   setIonicColorVarHexAndRgb: () => (/* binding */ setIonicColorVarHexAndRgb)
/* harmony export */ });
/* harmony import */ var chroma_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! chroma-js */ 5330);
/* harmony import */ var chroma_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(chroma_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _colorUtils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./colorUtils */ 6869);


function setIonicColorSteps(baseColor, step = 50, limit = 950) {
  const root = document.documentElement;
  for (let i = step; i <= limit; i += step) {
    const factor = i / 1000;
    let color = '';
    // if(chroma(baseColor).luminance() < 0.5) {
    //   // FIXME: use chroma.mix 0..1 bg & fg or just opacity
    //   color = chroma(baseColor).brighten(factor/* *3 */).css();
    // } else {
    //   color = chroma(baseColor).darken(factor/* *3 */).css();
    // }
    color = chroma_js__WEBPACK_IMPORTED_MODULE_0__(baseColor).alpha(factor).css();
    const ccsVarName = `--ion-color-step-${i}`;
    root.style.setProperty(ccsVarName, color);
    // console.log(`ccsVarName, color`, factor, ccsVarName, color)
  }
}
function setIonicColorVarHexAndRgb(root, varName, colorValue) {
  // console.log(`root.setProperty(, )`, varName, colorValue);
  root.setProperty(varName, colorValue);
  // set in RGB format: https://ionicframework.com/docs/theming/advanced#the-alpha-problem
  root.setProperty(`${varName}-rgb`, (0,_colorUtils__WEBPACK_IMPORTED_MODULE_1__.hexToRgb)(colorValue));
}

/***/ }),

/***/ 4806:
/*!*******************************************!*\
  !*** ./src/app/utils/dictionary-utils.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   dictToArrayAssigningIds: () => (/* binding */ dictToArrayAssigningIds),
/* harmony export */   getDictionaryValuesAsArray: () => (/* binding */ getDictionaryValuesAsArray),
/* harmony export */   setIdsFromKeys: () => (/* binding */ setIdsFromKeys)
/* harmony export */ });
/**
 * Created by kd on 2017-08-01.
 */
function getDictionaryValuesAsArray(dictionary) {
  // console.log('getDictionaryValuesAsArray dictionary', dictionary)
  const values = [];
  if (dictionary) {
    for (const key of Object.getOwnPropertyNames(dictionary)) {
      // if (dictionary.hasOwnProperty(key)) {
      let dictionaryElement = dictionary[key];
      // console.log('getDictionaryValuesAsArray', key, dictionaryElement)
      values.push(dictionaryElement);
      // }
    }
  }
  return values;
}
function setIdsFromKeys(dictionary, idKeyName = 'id') {
  // idKeyName = idKeyName || 'id';
  let ownPropertyNames = Object.getOwnPropertyNames(dictionary);
  // console.log('setIdsFromKeys ownPropertyNames', ownPropertyNames);
  for (const id of ownPropertyNames) {
    const curExp = dictionary[id];
    ;
    curExp[idKeyName] = id;
    // console.log('setIdsFromKeys', id, curExp);
  }
  return dictionary;
}
function dictToArrayAssigningIds(dictionary, idKeyName = 'id') {
  const dictWithIdsFromKeys = setIdsFromKeys(dictionary, idKeyName);
  return getDictionaryValuesAsArray(dictWithIdsFromKeys);
}

/***/ }),

/***/ 5312:
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   environment: () => (/* binding */ environment)
/* harmony export */ });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const environment = {
  production: false
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

/***/ }),

/***/ 4429:
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/platform-browser */ 436);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./app/app.module */ 635);
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./environments/environment */ 5312);




if (_environments_environment__WEBPACK_IMPORTED_MODULE_1__.environment.production) {
  (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.enableProdMode)();
}
_angular_platform_browser__WEBPACK_IMPORTED_MODULE_3__.platformBrowser().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_0__.AppModule).catch(err => console.log(err));

/***/ }),

/***/ 8996:
/*!******************************************************************************************************************************************!*\
  !*** ./node_modules/@ionic/core/dist/esm/ lazy ^\.\/.*\.entry\.js$ include: \.entry\.js$ exclude: \.system\.entry\.js$ namespace object ***!
  \******************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./ion-accordion_2.entry.js": [
		7518,
		"common",
		"node_modules_ionic_core_dist_esm_ion-accordion_2_entry_js"
	],
	"./ion-action-sheet.entry.js": [
		1981,
		"common",
		"node_modules_ionic_core_dist_esm_ion-action-sheet_entry_js"
	],
	"./ion-alert.entry.js": [
		1603,
		"common",
		"node_modules_ionic_core_dist_esm_ion-alert_entry_js"
	],
	"./ion-app_8.entry.js": [
		2273,
		"common",
		"node_modules_ionic_core_dist_esm_ion-app_8_entry_js"
	],
	"./ion-avatar_3.entry.js": [
		9642,
		"node_modules_ionic_core_dist_esm_ion-avatar_3_entry_js"
	],
	"./ion-back-button.entry.js": [
		2095,
		"common",
		"node_modules_ionic_core_dist_esm_ion-back-button_entry_js"
	],
	"./ion-backdrop.entry.js": [
		2335,
		"node_modules_ionic_core_dist_esm_ion-backdrop_entry_js"
	],
	"./ion-breadcrumb_2.entry.js": [
		8221,
		"common",
		"node_modules_ionic_core_dist_esm_ion-breadcrumb_2_entry_js"
	],
	"./ion-button_2.entry.js": [
		7184,
		"node_modules_ionic_core_dist_esm_ion-button_2_entry_js"
	],
	"./ion-card_5.entry.js": [
		8759,
		"node_modules_ionic_core_dist_esm_ion-card_5_entry_js"
	],
	"./ion-checkbox.entry.js": [
		4248,
		"common",
		"node_modules_ionic_core_dist_esm_ion-checkbox_entry_js"
	],
	"./ion-chip.entry.js": [
		9863,
		"node_modules_ionic_core_dist_esm_ion-chip_entry_js"
	],
	"./ion-col_3.entry.js": [
		1769,
		"node_modules_ionic_core_dist_esm_ion-col_3_entry_js"
	],
	"./ion-datetime-button.entry.js": [
		2569,
		"default-node_modules_ionic_core_dist_esm_data-b8307d99_js-node_modules_ionic_core_dist_esm_th-33339e",
		"node_modules_ionic_core_dist_esm_ion-datetime-button_entry_js"
	],
	"./ion-datetime_3.entry.js": [
		6534,
		"default-node_modules_ionic_core_dist_esm_data-b8307d99_js-node_modules_ionic_core_dist_esm_th-33339e",
		"common",
		"node_modules_ionic_core_dist_esm_ion-datetime_3_entry_js"
	],
	"./ion-fab_3.entry.js": [
		5458,
		"common",
		"node_modules_ionic_core_dist_esm_ion-fab_3_entry_js"
	],
	"./ion-img.entry.js": [
		654,
		"node_modules_ionic_core_dist_esm_ion-img_entry_js"
	],
	"./ion-infinite-scroll_2.entry.js": [
		6034,
		"common",
		"node_modules_ionic_core_dist_esm_ion-infinite-scroll_2_entry_js"
	],
	"./ion-input.entry.js": [
		761,
		"common",
		"node_modules_ionic_core_dist_esm_ion-input_entry_js"
	],
	"./ion-item-option_3.entry.js": [
		6492,
		"common",
		"node_modules_ionic_core_dist_esm_ion-item-option_3_entry_js"
	],
	"./ion-item_8.entry.js": [
		9557,
		"common",
		"node_modules_ionic_core_dist_esm_ion-item_8_entry_js"
	],
	"./ion-loading.entry.js": [
		8353,
		"node_modules_ionic_core_dist_esm_ion-loading_entry_js"
	],
	"./ion-menu_3.entry.js": [
		1024,
		"common",
		"node_modules_ionic_core_dist_esm_ion-menu_3_entry_js"
	],
	"./ion-modal.entry.js": [
		9160,
		"common",
		"node_modules_ionic_core_dist_esm_ion-modal_entry_js"
	],
	"./ion-nav_2.entry.js": [
		393,
		"node_modules_ionic_core_dist_esm_ion-nav_2_entry_js"
	],
	"./ion-picker-column-internal.entry.js": [
		3970,
		"common",
		"node_modules_ionic_core_dist_esm_ion-picker-column-internal_entry_js"
	],
	"./ion-picker-internal.entry.js": [
		437,
		"node_modules_ionic_core_dist_esm_ion-picker-internal_entry_js"
	],
	"./ion-popover.entry.js": [
		6772,
		"node_modules_ionic_core_dist_esm_ion-popover_entry_js"
	],
	"./ion-progress-bar.entry.js": [
		4810,
		"node_modules_ionic_core_dist_esm_ion-progress-bar_entry_js"
	],
	"./ion-radio_2.entry.js": [
		4639,
		"common",
		"node_modules_ionic_core_dist_esm_ion-radio_2_entry_js"
	],
	"./ion-range.entry.js": [
		628,
		"common",
		"node_modules_ionic_core_dist_esm_ion-range_entry_js"
	],
	"./ion-refresher_2.entry.js": [
		852,
		"common",
		"node_modules_ionic_core_dist_esm_ion-refresher_2_entry_js"
	],
	"./ion-reorder_2.entry.js": [
		1479,
		"common",
		"node_modules_ionic_core_dist_esm_ion-reorder_2_entry_js"
	],
	"./ion-ripple-effect.entry.js": [
		4065,
		"node_modules_ionic_core_dist_esm_ion-ripple-effect_entry_js"
	],
	"./ion-route_4.entry.js": [
		7971,
		"node_modules_ionic_core_dist_esm_ion-route_4_entry_js"
	],
	"./ion-searchbar.entry.js": [
		3184,
		"common",
		"node_modules_ionic_core_dist_esm_ion-searchbar_entry_js"
	],
	"./ion-segment_2.entry.js": [
		469,
		"common",
		"node_modules_ionic_core_dist_esm_ion-segment_2_entry_js"
	],
	"./ion-select_3.entry.js": [
		8471,
		"common",
		"node_modules_ionic_core_dist_esm_ion-select_3_entry_js"
	],
	"./ion-spinner.entry.js": [
		388,
		"common",
		"node_modules_ionic_core_dist_esm_ion-spinner_entry_js"
	],
	"./ion-split-pane.entry.js": [
		2392,
		"node_modules_ionic_core_dist_esm_ion-split-pane_entry_js"
	],
	"./ion-tab-bar_2.entry.js": [
		6059,
		"common",
		"node_modules_ionic_core_dist_esm_ion-tab-bar_2_entry_js"
	],
	"./ion-tab_2.entry.js": [
		5427,
		"node_modules_ionic_core_dist_esm_ion-tab_2_entry_js"
	],
	"./ion-text.entry.js": [
		198,
		"node_modules_ionic_core_dist_esm_ion-text_entry_js"
	],
	"./ion-textarea.entry.js": [
		1735,
		"common",
		"node_modules_ionic_core_dist_esm_ion-textarea_entry_js"
	],
	"./ion-toast.entry.js": [
		7510,
		"node_modules_ionic_core_dist_esm_ion-toast_entry_js"
	],
	"./ion-toggle.entry.js": [
		5297,
		"common",
		"node_modules_ionic_core_dist_esm_ion-toggle_entry_js"
	]
};
function webpackAsyncContext(req) {
	if(!__webpack_require__.o(map, req)) {
		return Promise.resolve().then(() => {
			var e = new Error("Cannot find module '" + req + "'");
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		});
	}

	var ids = map[req], id = ids[0];
	return Promise.all(ids.slice(1).map(__webpack_require__.e)).then(() => {
		return __webpack_require__(id);
	});
}
webpackAsyncContext.keys = () => (Object.keys(map));
webpackAsyncContext.id = 8996;
module.exports = webpackAsyncContext;

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ __webpack_require__.O(0, ["vendor"], () => (__webpack_exec__(886), __webpack_exec__(4429)));
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=main.js.map
