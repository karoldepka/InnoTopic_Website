import { Topics } from './topics-data';

/**
 * Richer, opt-in info about a handful of topics: a one-line tagline, a longer description,
 * and the year the topic was first released. Shown in the topic tag's click-to-info popover
 * (see TopicsService.getTopicInfo), on top of the shorter blurbs in topic-info.data.ts.
 *
 * Kept separate from topics-data.ts (per #1, same rationale as topic-info.data.ts) so that
 * adding/editing this doesn't require touching the already-huge topic definition file.
 * Keyed by Topic.id (falls back to Topic.name); keys are checked against real topic names,
 * but this is only ever a subset, not every topic needs an entry.
 */
export interface TopicExtendedInfo {
  tagline?: string
  description?: string
  whenFirstReleased?: string
}

export const topicsDataExtended: Partial<Record<keyof Topics, TopicExtendedInfo>> = {
  Angular: {
    tagline: 'A batteries-included, TypeScript-first web framework by Google.',
    description: 'Ships routing, forms, HTTP, and dependency injection out of the box, favouring one opinionated way of building single-page applications over picking your own libraries.',
    whenFirstReleased: '2016',
  },
  React: {
    tagline: 'A component-based UI library by Meta.',
    description: 'Popularised the virtual DOM and a declarative, functional style of building interfaces; forms the base of ecosystems like Next.js and React Native.',
    whenFirstReleased: '2013',
  },
  'Vue.js': {
    tagline: 'An approachable, incrementally adoptable frontend framework.',
    description: 'Blends template-based markup with a reactive data model; designed to be easy to drop into an existing page or scale up to a full SPA.',
    whenFirstReleased: '2014',
  },
  TypeScript: {
    tagline: 'A typed superset of JavaScript by Microsoft.',
    description: 'Compiles down to plain JS, catching type errors at compile time and powering editor tooling like autocomplete and refactoring.',
    whenFirstReleased: '2012',
  },
  JavaScript: {
    tagline: 'The dynamic scripting language that runs in every web browser.',
    description: 'Originally built in 10 days for Netscape Navigator; now also runs on servers and CLIs via Node.js and is one of the most widely used languages in the world.',
    whenFirstReleased: '1995',
  },
  'Node.js': {
    tagline: "A JavaScript runtime built on Chrome's V8 engine.",
    description: 'Lets JavaScript run outside the browser with an event-driven, non-blocking I/O model, commonly used to build servers, CLIs, and build tooling.',
    whenFirstReleased: '2009',
  },
  Python: {
    tagline: 'A readable, general-purpose language with a huge ecosystem.',
    description: 'Popular for web backends, scripting, data science, and machine learning thanks to libraries like Django, NumPy, and PyTorch.',
    whenFirstReleased: '1991',
  },
  Java: {
    tagline: '"Write once, run anywhere" via the JVM.',
    description: 'A statically typed, object-oriented language that still powers a large share of enterprise backends, Android apps, and big-data tooling.',
    whenFirstReleased: '1995',
  },
  Kotlin: {
    tagline: 'A modern, concise language that runs on the JVM.',
    description: "JetBrains' answer to Java's verbosity; fully interoperable with Java and now Google's preferred language for Android development.",
    whenFirstReleased: '2011',
  },
  Rust: {
    tagline: 'A systems language focused on memory safety without a garbage collector.',
    description: "Uses a compile-time ownership/borrow checker to eliminate whole classes of bugs (use-after-free, data races) that plague C/C++, at no runtime cost.",
    whenFirstReleased: '2010',
  },
  'C#': {
    tagline: "Microsoft's statically typed, object-oriented language for .NET.",
    description: 'Originally designed as a modern alternative to Java; now spans web (ASP.NET), desktop, games (Unity), and cloud workloads.',
    whenFirstReleased: '2000',
  },
  '.NET': {
    tagline: "Microsoft's free, cross-platform application framework.",
    description: 'Runs C#, F#, and VB.NET on Windows, Linux, and macOS; rebuilt from the ground up as open source starting with .NET Core.',
    whenFirstReleased: '2002',
  },
  Docker: {
    tagline: 'Packages an app and its dependencies into a portable container.',
    description: 'Made "works on my machine" mostly a solved problem by shipping the whole runtime environment as a lightweight, isolated image.',
    whenFirstReleased: '2013',
  },
  Kubernetes: {
    tagline: 'An open-source system for orchestrating containers at scale.',
    description: 'Originally designed at Google (based on their internal Borg system); automates deployment, scaling, and healing of containerised applications.',
    whenFirstReleased: '2014',
  },
  Terraform: {
    tagline: 'Infrastructure as code, for (almost) any cloud provider.',
    description: 'Lets you describe cloud resources in a declarative config language (HCL) and plan/apply changes as a repeatable, version-controlled process.',
    whenFirstReleased: '2014',
  },
  AWS: {
    tagline: "Amazon's cloud computing platform.",
    description: 'The largest public cloud by market share, offering compute, storage, databases, and hundreds of managed services on a pay-as-you-go basis.',
    whenFirstReleased: '2006',
  },
  Kafka: {
    tagline: 'A distributed event-streaming platform.',
    description: 'Built at LinkedIn to handle high-throughput, durable, ordered logs of events; widely used as the backbone for microservice messaging and stream processing.',
    whenFirstReleased: '2011',
  },
  'Kafka Streams': {
    tagline: "Kafka's client library for building stream-processing applications.",
    description: 'Lets you process and transform data in Kafka topics directly in your application code, without needing a separate processing cluster.',
    whenFirstReleased: '2016',
  },
  RabbitMQ: {
    tagline: 'A general-purpose message broker.',
    description: 'Implements the AMQP protocol to route messages between producers and consumers with flexible exchange/queue topologies; a common choice for task queues.',
    whenFirstReleased: '2007',
  },
  Spring: {
    tagline: 'A dependency-injection framework for Java.',
    description: 'Introduced inversion-of-control containers and aspect-oriented programming to mainstream Java development, becoming the foundation for most modern Java backends.',
    whenFirstReleased: '2004',
  },
  'Spring Boot': {
    tagline: 'Opinionated, convention-over-configuration setup for Spring apps.',
    description: 'Cuts the XML/boilerplate of classic Spring down to auto-configured starters, letting you get a production-ready service running in minutes.',
    whenFirstReleased: '2014',
  },
  Django: {
    tagline: 'A batteries-included Python web framework.',
    description: 'Ships an ORM, admin panel, auth, and templating out of the box, following a "don\'t repeat yourself" philosophy for building web apps fast.',
    whenFirstReleased: '2005',
  },
  Laravel: {
    tagline: 'An expressive, batteries-included PHP web framework.',
    description: "Brought modern conventions (routing, an ORM called Eloquent, templating via Blade) to PHP, greatly improving on the ecosystem's ad-hoc past.",
    whenFirstReleased: '2011',
  },
  GraphQL: {
    tagline: 'A query language for APIs.',
    description: 'Lets clients ask for exactly the fields they need in a single request, developed by Facebook to replace many ad-hoc REST endpoints.',
    whenFirstReleased: '2015',
  },
  PostgreSQL: {
    tagline: 'A powerful, standards-compliant open-source relational database.',
    description: 'Known for correctness and extensibility (custom types, extensions like PostGIS/pgvector); often the default choice for new relational-database projects.',
    whenFirstReleased: '1996',
  },
  MySQL: {
    tagline: 'The world\'s most widely deployed open-source relational database.',
    description: 'Prioritised speed and ease of use, which made it the default database for the early web (the "M" in the LAMP stack).',
    whenFirstReleased: '1995',
  },
  MongoDB: {
    tagline: 'A document-oriented NoSQL database.',
    description: 'Stores JSON-like documents instead of rows/tables, trading strict schemas and joins for flexibility and horizontal scalability.',
    whenFirstReleased: '2009',
  },
  Redis: {
    tagline: 'An in-memory data store used as a cache, queue, and database.',
    description: 'Extremely fast key-value store supporting rich data structures (lists, sets, sorted sets, streams), commonly used for caching and pub/sub.',
    whenFirstReleased: '2009',
  },
  Git: {
    tagline: 'A distributed version control system.',
    description: 'Created by Linus Torvalds for Linux kernel development; every clone is a full repository, enabling offline commits, branching, and merging without a central server.',
    whenFirstReleased: '2005',
  },
  RxJS: {
    tagline: 'Reactive programming for JavaScript using Observables.',
    description: 'Makes it easier to compose asynchronous and event-based code (clicks, HTTP calls, timers) with operators like map/filter/switchMap; powers much of Angular\'s async plumbing.',
    whenFirstReleased: '2015',
  },
  HTML5: {
    tagline: 'The current standard markup language for the web.',
    description: 'Added native support for audio, video, canvas, and semantic elements, ending the era of relying on plugins like Flash for rich media.',
    whenFirstReleased: '2014',
  },
  CSS3: {
    tagline: 'The modularised evolution of CSS.',
    description: 'Split the single CSS2 spec into independent modules (flexbox, grid, animations, etc.) that can evolve and ship separately.',
    whenFirstReleased: '1999',
  },
  Sass: {
    tagline: 'A CSS preprocessor with variables, nesting, and mixins.',
    description: 'Compiles down to plain CSS, adding programming-language features that vanilla CSS lacked for years before native custom properties and nesting arrived.',
    whenFirstReleased: '2006',
  },
  'Tailwind CSS': {
    tagline: 'A utility-first CSS framework.',
    description: 'Styles elements by composing small, single-purpose classes directly in markup instead of writing custom CSS files, trading indirection for speed of iteration.',
    whenFirstReleased: '2017',
  },

  // ====== Build systems & package managers
  Gradle: {
    tagline: 'A build automation tool for the JVM, configured with Groovy or Kotlin instead of XML.',
    description: 'Replaced Maven\'s rigid POM files with a real scripting language and incremental, cacheable builds; the default build tool for Android.',
    whenFirstReleased: '2007',
  },
  Maven: {
    tagline: 'An XML-based build and dependency management tool for Java.',
    description: 'Introduced a standard project layout and declarative dependency management, taming the ad-hoc Ant scripts that came before it.',
    whenFirstReleased: '2004',
  },

  // ====== AI hardware
  Groq: {
    tagline: 'Builds custom LPU chips designed specifically for fast LLM inference.',
    description: 'Trades general-purpose flexibility for extremely low-latency, high-throughput token generation compared to running the same models on GPUs.',
    whenFirstReleased: '2016',
  },

  // ====== Tooling
  SVGO: {
    tagline: 'A Node.js tool for optimising SVG files.',
    description: 'Strips redundant metadata and simplifies paths to shrink SVG file size without changing how the image renders.',
    whenFirstReleased: '2012',
  },
  SVGPorn: {
    tagline: 'A community-curated collection of brand and technology logos as clean SVGs.',
    description: 'A go-to source for consistent, scalable tech-stack icons instead of hunting down and cleaning up each vendor\'s own logo assets.',
  },

  // ====== Version control
  Gerrit: {
    tagline: 'A web-based code review tool built around Git.',
    description: 'Gates every commit through a review-and-approval workflow before it lands, originally built at Google to scale Android development.',
    whenFirstReleased: '2008',
  },
  GitHub: {
    tagline: 'The most widely used web-based hosting platform for Git repositories.',
    description: 'Added pull requests, issues, and later CI/CD via Actions on top of Git, turning it into the default home for open-source collaboration.',
    whenFirstReleased: '2008',
  },
  GitLab: {
    tagline: 'A Git hosting platform bundled with its own built-in CI/CD.',
    description: 'Positions itself as a single "DevOps platform" (planning, repo hosting, pipelines, and registries in one product) and is also self-hostable.',
    whenFirstReleased: '2011',
  },
  Subversion: {
    tagline: 'A centralized version control system (often called SVN).',
    description: 'Improved on CVS with atomic commits and cheap branching, but requires a central server, unlike the distributed model Git later popularised.',
    whenFirstReleased: '2000',
  },

  // ====== Monitoring & observability
  Datadog: {
    tagline: 'A SaaS platform unifying metrics, logs, and traces monitoring.',
    description: 'Ships agents/integrations for most infrastructure and languages, correlating dashboards, alerts, and APM traces in one place.',
    whenFirstReleased: '2010',
  },
  Grafana: {
    tagline: 'An open-source tool for building dashboards over metrics from many data sources.',
    description: 'Became the default visualization layer for time-series databases like Prometheus and InfluxDB, and now also supports logs and traces.',
    whenFirstReleased: '2014',
  },
  Sentry: {
    tagline: 'An error-tracking and application-monitoring platform.',
    description: 'Captures stack traces and context from crashes in production across many languages/frameworks and groups them into actionable issues.',
    whenFirstReleased: '2008',
  },

  // ====== Operating systems
  Linux: {
    tagline: 'The open-source kernel underpinning most servers, Android, and a growing share of desktops.',
    description: 'Started as a hobby project by Linus Torvalds; now runs the majority of the public internet and every major cloud provider.',
    whenFirstReleased: '1991',
  },
  'Debian Linux': {
    tagline: 'One of the oldest and most influential Linux distributions.',
    description: 'Built entirely by volunteers with a strong free-software charter; the base that Ubuntu and many other distros are built on top of.',
    whenFirstReleased: '1993',
  },
  'Ubuntu Linux': {
    tagline: 'A Debian-based Linux distribution focused on ease of use.',
    description: 'Backed by Canonical with predictable release cycles and long-term support versions; a common default for developer workstations and cloud VMs.',
    whenFirstReleased: '2004',
  },
  'CentOS Linux': {
    tagline: 'A free rebuild of Red Hat Enterprise Linux.',
    description: 'Was the go-to no-cost, RHEL-compatible OS for servers until Red Hat discontinued the traditional stable-point-release model in 2021 in favour of CentOS Stream.',
    whenFirstReleased: '2004',
  },
  macOS: {
    tagline: "Apple's desktop and laptop operating system.",
    description: 'Rebuilt on a Unix (Darwin/BSD) foundation, giving it a real terminal and POSIX compatibility underneath its GUI, popular with developers.',
    whenFirstReleased: '2001',
  },
  'Microsoft Windows': {
    tagline: "Microsoft's graphical operating system for PCs.",
    description: 'The dominant desktop OS worldwide for decades; WSL later brought a real Linux environment to it for developers.',
    whenFirstReleased: '1985',
  },

  // ====== Frontend visual / CSS libraries
  Bulma: {
    tagline: 'A modern CSS framework based on Flexbox, with no JavaScript included.',
    description: 'Provides ready-made layout and component classes purely in CSS, leaving all behaviour/interactivity up to you.',
    whenFirstReleased: '2016',
  },
  'Chakra UI': {
    tagline: 'A simple, accessible component library for React.',
    description: 'Built accessibility (ARIA attributes, keyboard nav) into every component by default, alongside a themeable style-prop API.',
    whenFirstReleased: '2019',
  },
  Mantine: {
    tagline: 'A fully featured React component library.',
    description: 'Ships 100+ customizable components and hooks covering most app needs (forms, dates, notifications) without reaching for extra dependencies.',
    whenFirstReleased: '2021',
  },

  // ====== Crypto / blockchain
  Bitcoin: {
    tagline: 'The first decentralized cryptocurrency.',
    description: 'Introduced the blockchain as a public, tamper-resistant ledger secured by proof-of-work mining instead of a central authority.',
    whenFirstReleased: '2009',
  },
  Ethereum: {
    tagline: 'A blockchain platform for programmable smart contracts.',
    description: 'Extended Bitcoin\'s ledger idea with a general-purpose virtual machine, letting developers deploy arbitrary decentralized applications.',
    whenFirstReleased: '2015',
  },
  Solidity: {
    tagline: 'The main smart-contract programming language for Ethereum.',
    description: 'A statically typed, JavaScript-influenced language compiled to EVM bytecode; the de facto standard for writing Ethereum contracts.',
    whenFirstReleased: '2014',
  },
  'Basic Attention Token (BAT)': {
    tagline: "The utility token behind the Brave browser's ad-rewards system.",
    description: 'Pays users and sites for privacy-respecting attention/ads instead of the usual tracking-based advertising model.',
    whenFirstReleased: '2017',
  },
  Web3: {
    tagline: 'An umbrella term for a more decentralized, blockchain-based web.',
    description: 'Envisions users owning their data and assets directly via wallets and smart contracts, instead of through centralized platforms.',
  },
  'web3.js': {
    tagline: 'The original JavaScript library for talking to Ethereum nodes.',
    description: 'Wraps Ethereum\'s JSON-RPC API so web apps can read chain state and send transactions from the browser.',
    whenFirstReleased: '2015',
  },
  'ethers.js': {
    tagline: 'A compact, well-typed JavaScript library for Ethereum.',
    description: 'Became the popular alternative to web3.js, favoured for its smaller bundle size and cleaner, more consistent API.',
    whenFirstReleased: '2016',
  },
  Solid: {
    tagline: "Tim Berners-Lee's project to re-decentralize the web.",
    description: 'Lets people store their data in personal "pods" that apps request access to, instead of each app locking data into its own silo.',
    whenFirstReleased: '2016',
  },

  // ====== Mobile
  Android: {
    tagline: "Google's mobile operating system.",
    description: 'Open-source (AOSP) and licensed by device makers worldwide, making it by far the most-installed mobile OS globally.',
    whenFirstReleased: '2008',
  },
  iOS: {
    tagline: "Apple's mobile operating system for iPhone.",
    description: "Set the template for the modern touch-based smartphone UI and app store distribution model that Android later followed.",
    whenFirstReleased: '2007',
  },
  Flutter: {
    tagline: "Google's UI toolkit for building apps from one Dart codebase.",
    description: 'Renders its own widgets directly to the screen (instead of wrapping native ones), giving pixel-identical UI across iOS, Android, web, and desktop.',
    whenFirstReleased: '2017',
  },
  'React Native': {
    tagline: "Meta's framework for building native mobile apps with React.",
    description: 'Lets React components render to real native UI widgets instead of a WebView, sharing logic (not pixels) between iOS and Android.',
    whenFirstReleased: '2015',
  },
  NativeScript: {
    tagline: 'A framework for building native iOS/Android apps with JavaScript, Angular, or Vue.',
    description: 'Gives direct access to native platform APIs from JS/TS without a bridge-based abstraction layer like some competitors.',
    whenFirstReleased: '2014',
  },
  Cordova: {
    tagline: 'A framework for packaging web apps (HTML/CSS/JS) as installable mobile apps.',
    description: 'Runs your app inside a native WebView shell with plugins bridging to device APIs like camera or GPS; started life as PhoneGap.',
    whenFirstReleased: '2009',
  },
  BlackBerry: {
    tagline: 'A pioneering smartphone platform, once dominant in enterprise messaging.',
    description: 'Known for its physical keyboards and secure push email; lost its market to iOS/Android through the 2010s before exiting hardware.',
    whenFirstReleased: '1999',
  },
  'Java Micro Edition': {
    tagline: 'A stripped-down Java platform for feature phones and embedded devices.',
    description: 'Let developers write portable "write once, run anywhere" apps for the pre-smartphone mobile phone era.',
    whenFirstReleased: '1999',
  },
  Mobile: {
    tagline: 'Building applications for phones and tablets.',
    description: 'Spans native platforms (iOS/Android) and cross-platform frameworks that share one codebase across both.',
  },

  // ====== Project management tools
  Jira: {
    tagline: "Atlassian's issue and project tracker.",
    description: 'Originally a bug tracker, now the default backbone for agile/Scrum boards, sprints, and workflows at most software companies.',
    whenFirstReleased: '2002',
  },
  Trello: {
    tagline: 'A simple, visual kanban-board tool.',
    description: 'Popularised the drag-and-drop card/list board as an easy entry point into visual task management, well beyond software teams.',
    whenFirstReleased: '2011',
  },
  Bugzilla: {
    tagline: "Mozilla's open-source bug-tracking system.",
    description: 'One of the earliest widely adopted bug trackers, still used by large open-source projects for its powerful search and workflow rules.',
    whenFirstReleased: '1998',
  },
  Trac: {
    tagline: 'A lightweight wiki and issue tracker for software projects.',
    description: 'Paired a minimal bug tracker with an integrated wiki and source browser, popular for small to mid-sized open-source projects.',
    whenFirstReleased: '2003',
  },
  'Pivotal Tracker': {
    tagline: 'An agile project-tracking tool built around a prioritized backlog.',
    description: 'Auto-calculates team velocity and projected delivery dates from story points instead of requiring manual sprint planning.',
    whenFirstReleased: '2006',
  },
  'Agile Central': {
    tagline: 'An enterprise agile planning tool, formerly known as Rally Software.',
    description: 'Targets scaled agile frameworks (SAFe) for large organisations coordinating many teams, now owned by Broadcom.',
    whenFirstReleased: '2002',
  },
  TeamForge: {
    tagline: "CollabNet's application lifecycle management platform.",
    description: 'Bundled source control, issue tracking, and release management for enterprises before dedicated SaaS tools became the norm.',
    whenFirstReleased: '2007',
  },

  // ====== Databases
  Oracle: {
    tagline: 'One of the earliest and most widely deployed commercial relational databases.',
    description: 'Pioneered SQL-based relational databases in the enterprise and still dominates large mission-critical deployments (banking, telecom).',
    whenFirstReleased: '1979',
  },
  DynamoDB: {
    tagline: "AWS's fully managed, serverless NoSQL key-value/document database.",
    description: 'Scales automatically with single-digit-millisecond latency at virtually any throughput, with no servers to manage.',
    whenFirstReleased: '2012',
  },
  MariaDB: {
    tagline: 'A community-driven fork of MySQL.',
    description: "Created by MySQL's original developers after Oracle acquired Sun/MySQL, to keep a fully open-source, community-governed alternative.",
    whenFirstReleased: '2009',
  },
  ArangoDB: {
    tagline: 'A multi-model database combining documents, graphs, and key/value in one engine.',
    description: 'Lets you query documents and graph relationships together with one query language (AQL) instead of running separate specialised databases.',
    whenFirstReleased: '2011',
  },
  SurrealDB: {
    tagline: 'A newer multi-model database blending document, graph, and relational features.',
    description: 'Aims to replace the typical database-plus-cache-plus-search-engine stack with one engine that speaks SQL-like syntax over all of them.',
    whenFirstReleased: '2021',
  },
  Dgraph: {
    tagline: 'A native GraphQL graph database.',
    description: 'Built from the ground up around graph traversal and GraphQL as its query language, rather than bolting GraphQL onto a relational store.',
    whenFirstReleased: '2016',
  },
  Mongoose: {
    tagline: 'An object-modeling (ODM) library for MongoDB in Node.js.',
    description: 'Adds schemas, validation, and typed models on top of MongoDB\'s schema-less documents, closer to how an ORM feels for SQL.',
    whenFirstReleased: '2010',
  },
  Fauna: {
    tagline: 'A serverless, globally distributed document-relational database.',
    description: 'Combines document flexibility with relational features (joins, ACID transactions) and ships as an API with no infrastructure to manage.',
    whenFirstReleased: '2014',
  },
  '8base': {
    tagline: 'A low-code backend-as-a-service built around GraphQL.',
    description: 'Generates a full GraphQL API, database, and admin UI from a schema, aimed at shipping backends without writing server code.',
    whenFirstReleased: '2018',
  },
  Xata: {
    tagline: 'A serverless data platform built on Postgres with a spreadsheet-like UI.',
    description: 'Pairs a real Postgres database with built-in full-text search and a friendly table-editor UI, feeling closer to Airtable than psql.',
    whenFirstReleased: '2022',
  },
  Databases: {
    tagline: 'Systems for storing, querying, and persisting structured data.',
    description: 'Spans relational (SQL), document, key-value, and graph models, each trading off consistency, flexibility, and query power differently.',
  },

  // ====== Graphics & design tools
  Figma: {
    tagline: 'A collaborative, browser-based UI/UX design tool.',
    description: 'Let multiple designers edit the same file in real time from any OS, which is what made it displace desktop-only tools like Sketch.',
    whenFirstReleased: '2016',
  },
  'Adobe Illustrator': {
    tagline: "Adobe's industry-standard vector graphics editor.",
    description: 'The long-standing default for logo design and print/vector illustration work, still central to the Adobe Creative Cloud suite.',
    whenFirstReleased: '1987',
  },
  'Affinity Designer': {
    tagline: 'A professional vector graphics editor by Serif.',
    description: 'Used as an affordable, one-time-purchase alternative to Adobe Illustrator for icon and illustration work.',
    whenFirstReleased: '2014',
  },
  Blender: {
    tagline: 'A free, open-source 3D creation suite.',
    description: 'Covers modelling, rigging, animation, simulation, and rendering in one tool; open-sourced in 2002 after a community "Free Blender" fundraiser.',
    whenFirstReleased: '1994',
  },
  GIMP: {
    tagline: 'A free, open-source raster image editor.',
    description: 'The long-running open-source alternative to Photoshop for photo retouching and image composition.',
    whenFirstReleased: '1996',
  },
  Inkscape: {
    tagline: 'A free, open-source vector graphics editor.',
    description: 'The most established open-source alternative to Illustrator, built around the SVG format natively.',
    whenFirstReleased: '2003',
  },
  'Gravit Designer': {
    tagline: 'A free, cross-platform vector design app.',
    description: 'Runs both as a desktop app and directly in the browser, aimed at lightweight vector/UI design without a subscription.',
    whenFirstReleased: '2014',
  },
  UXPin: {
    tagline: 'A design and prototyping tool that can work with real code components.',
    description: 'Lets teams build interactive, code-backed prototypes instead of static mockups, closing the gap between design and engineering handoff.',
    whenFirstReleased: '2010',
  },
  SVGator: {
    tagline: 'An online tool for animating SVGs without writing code.',
    description: 'Provides a timeline-based visual editor to add motion to vector graphics and export them as lightweight, scalable web animations.',
    whenFirstReleased: '2018',
  },
  SVG: {
    tagline: 'Scalable Vector Graphics: an XML-based format for 2D vector images.',
    description: 'Describes shapes mathematically instead of as pixels, so images stay crisp at any resolution and can be styled/animated with CSS and JS.',
    whenFirstReleased: '2001',
  },

  // ====== Testing
  Selenium: {
    tagline: 'The original browser-automation framework, still an industry standard.',
    description: 'Drives real browsers programmatically via the WebDriver protocol, which most later end-to-end testing tools are built on or compared against.',
    whenFirstReleased: '2004',
  },
  Cypress: {
    tagline: 'A JavaScript end-to-end testing framework that runs directly inside the browser.',
    description: 'Trades WebDriver\'s remote-control model for running in the same run-loop as the app, giving fast, reliable, easy-to-debug tests.',
    whenFirstReleased: '2015',
  },
  Playwright: {
    tagline: "Microsoft's cross-browser end-to-end testing framework.",
    description: 'Automates Chromium, Firefox, and WebKit from one API with built-in auto-waiting, aiming to fix Selenium\'s flakiness pain points.',
    whenFirstReleased: '2020',
  },
  TestCafe: {
    tagline: 'A Node.js end-to-end testing framework needing no browser plugins or drivers.',
    description: 'Injects its test logic directly into the page via script rewriting, so it works against any browser out of the box.',
    whenFirstReleased: '2016',
  },
  JUnit: {
    tagline: 'The original unit-testing framework for Java.',
    description: 'Established the "assert this, run that setup/teardown" pattern that most other language\'s testing frameworks (NUnit, PyTest, Jest) borrowed.',
    whenFirstReleased: '1997',
  },
  TestNG: {
    tagline: 'A Java testing framework inspired by JUnit and NUnit, with more features.',
    description: 'Added test grouping, parallel execution, and dependency-based test ordering that classic JUnit lacked for years.',
    whenFirstReleased: '2004',
  },
  Mockito: {
    tagline: 'A mocking framework for Java unit tests.',
    description: 'Lets you stub out and verify interactions with dependencies (databases, services) so tests can isolate just the code under test.',
    whenFirstReleased: '2008',
  },
  Jest: {
    tagline: 'A JavaScript testing framework built at Facebook.',
    description: 'Bundled a test runner, assertion library, and mocking into one zero-config tool, becoming the default choice for React projects.',
    whenFirstReleased: '2014',
  },
  Jasmine: {
    tagline: 'A BDD-style JavaScript testing framework.',
    description: 'Reads tests as human-readable specifications ("it should...") with no dependency on the DOM or a specific browser.',
    whenFirstReleased: '2010',
  },
  Karma: {
    tagline: 'A JavaScript test runner built by the AngularJS team.',
    description: 'Runs the same test suite across real browsers, watching files and re-running tests on change during development.',
    whenFirstReleased: '2012',
  },
  Cucumber: {
    tagline: 'A BDD testing tool that runs tests written in plain-language Gherkin syntax.',
    description: 'Lets non-developers (product, QA) write "Given/When/Then" scenarios that step definitions then wire up to real test code.',
    whenFirstReleased: '2008',
  },
  Spock: {
    tagline: 'A testing and specification framework for Java and Groovy.',
    description: 'Combines JUnit-style test running with a much more expressive, readable Groovy DSL for specifications and data-driven tests.',
    whenFirstReleased: '2008',
  },
  'Testing Library': {
    tagline: 'A family of testing utilities (React Testing Library, etc.) for testing UI like a user would.',
    description: 'Deliberately queries the DOM by visible text/roles instead of component internals, so tests survive refactors that don\'t change behaviour.',
    whenFirstReleased: '2018',
  },
  Cobertura: {
    tagline: 'A code-coverage measurement tool for Java.',
    description: 'Instruments compiled bytecode to report which lines and branches your test suite actually exercises.',
    whenFirstReleased: '2005',
  },
  Calabash: {
    tagline: 'A BDD-style acceptance testing framework for native mobile apps.',
    description: 'Paired Cucumber-style Gherkin scenarios with the ability to drive real iOS/Android UI interactions end-to-end.',
    whenFirstReleased: '2012',
  },
  BrowserStack: {
    tagline: 'A cloud platform for testing across real browsers and devices.',
    description: 'Gives on-demand access to hundreds of real browser/OS/device combinations, so you don\'t need a physical device lab to test compatibility.',
    whenFirstReleased: '2011',
  },
  UserTesting: {
    tagline: 'A platform for gathering real user feedback on UX by recording think-aloud sessions.',
    description: 'Recruits panel participants to narrate their experience using your product/prototype, surfacing usability issues automated tests can\'t catch.',
    whenFirstReleased: '2007',
  },

  // ====== Developer tools & IDEs
  'Visual Studio Code': {
    tagline: "Microsoft's free, cross-platform code editor.",
    description: 'Built on Electron with a huge extension ecosystem; became the most widely used code editor within a few years of release.',
    whenFirstReleased: '2015',
  },
  'IntelliJ IDEA': {
    tagline: "JetBrains' flagship IDE for Java and the JVM.",
    description: 'Known for deep static analysis, smart refactoring, and code completion that goes well beyond simple syntax highlighting.',
    whenFirstReleased: '2001',
  },
  PyCharm: {
    tagline: "JetBrains' IDE specialised for Python.",
    description: 'Built on the same platform as IntelliJ IDEA, adding Python-specific refactoring, debugging, and scientific/Django tooling.',
    whenFirstReleased: '2010',
  },
  WebStorm: {
    tagline: "JetBrains' IDE specialised for JavaScript and TypeScript.",
    description: 'Adds deep code analysis, refactoring, and debugging support tailored to modern JS/TS and frontend framework projects.',
    whenFirstReleased: '2010',
  },
  RubyMine: {
    tagline: "JetBrains' IDE for Ruby and Ruby on Rails.",
    description: 'Brings the same refactoring and navigation tooling as IntelliJ IDEA to Ruby, with first-class Rails project support.',
    whenFirstReleased: '2010',
  },
  Eclipse: {
    tagline: 'An open-source, plugin-based IDE originally built by IBM.',
    description: 'Its plugin architecture made it extensible into IDEs for many languages beyond Java; long the default free Java IDE before IntelliJ overtook it.',
    whenFirstReleased: '2001',
  },
  NetBeans: {
    tagline: 'An open-source Java IDE, one of the first modular IDE platforms.',
    description: 'Originally a student project (Xelfi) later backed by Sun, it pioneered the plugin-module architecture that Eclipse also later adopted.',
    whenFirstReleased: '2000',
  },
  'Android Studio': {
    tagline: 'The official IDE for Android development.',
    description: "Built on JetBrains' IntelliJ platform, replacing the earlier Eclipse-based ADT toolchain as Google's officially supported Android IDE.",
    whenFirstReleased: '2013',
  },
  'JetBrains Fleet': {
    tagline: "JetBrains' next-generation, lightweight distributed IDE.",
    description: 'Rebuilt from scratch with a distributed client/backend architecture, aiming to be fast like a text editor but as smart as IntelliJ.',
    whenFirstReleased: '2022',
  },
  VSCodium: {
    tagline: 'A community-built distribution of VS Code without Microsoft\'s telemetry and branding.',
    description: 'Builds the same open-source "Code - OSS" codebase that VS Code ships from, but without Microsoft\'s proprietary additions and tracking.',
    whenFirstReleased: '2018',
  },
  'Open VSX Registry': {
    tagline: "An open-source alternative to Microsoft's VS Code Marketplace for extensions.",
    description: "Exists because Microsoft's official marketplace terms don't allow other VS Code-based editors (like VSCodium) to use it directly.",
    whenFirstReleased: '2020',
  },
  Jenkins: {
    tagline: 'A long-standing open-source automation server for CI/CD.',
    description: 'Forked from the Hudson project; its huge plugin ecosystem let it automate almost any build/deploy pipeline, self-hosted.',
    whenFirstReleased: '2011',
  },
  'Travis CI': {
    tagline: 'One of the first hosted CI services built around GitHub integration.',
    description: 'Made "every pull request runs your test suite automatically" the default expectation for open-source projects.',
    whenFirstReleased: '2011',
  },
  CircleCI: {
    tagline: 'A cloud-based CI/CD platform.',
    description: 'Competed with Travis CI and Jenkins on faster builds and Docker-native pipelines, becoming a common default for modern projects.',
    whenFirstReleased: '2011',
  },
  Netlify: {
    tagline: 'A platform for building, deploying, and hosting modern (Jamstack) web apps.',
    description: 'Popularised git-push-to-deploy for static sites and frontend frameworks, with preview URLs on every pull request.',
    whenFirstReleased: '2014',
  },
  Jamstack: {
    tagline: 'An architecture pattern built on pre-rendered markup, JavaScript, and APIs.',
    description: 'Coined by Netlify to describe decoupling the frontend from the backend, serving static assets from a CDN instead of a server per request.',
    whenFirstReleased: '2015',
  },
  Slack: {
    tagline: 'A team messaging and collaboration platform.',
    description: 'Organised workplace chat into channels with deep third-party integrations, largely displacing email for internal team communication.',
    whenFirstReleased: '2013',
  },
  Dribbble: {
    tagline: 'A community platform for designers to showcase and discover work.',
    description: 'Became the default portfolio site and inspiration feed for UI/UX and graphic designers, similar to what GitHub is for code.',
    whenFirstReleased: '2009',
  },
  Zeplin: {
    tagline: 'A tool that turns design files into developer-ready specs.',
    description: 'Extracts colors, spacing, fonts, and assets from a design file into a handoff doc, cutting down on manual "what\'s the padding here?" questions.',
    whenFirstReleased: '2014',
  },
  OWASP: {
    tagline: 'A nonprofit foundation focused on web application security.',
    description: 'Best known for the OWASP Top 10, the widely cited list of the most critical web application security risks.',
    whenFirstReleased: '2001',
  },
  Snyk: {
    tagline: 'A developer security platform for finding vulnerabilities in dependencies and containers.',
    description: 'Scans open-source packages, containers, and IaC configs for known vulnerabilities directly in the developer workflow (CLI/CI/PRs).',
    whenFirstReleased: '2015',
  },
  PandaDoc: {
    tagline: 'A platform for creating, sending, and e-signing documents and proposals.',
    description: 'Combines document templates, e-signatures, and payment collection into one workflow for sales and contract documents.',
    whenFirstReleased: '2011',
  },
  CodeSee: {
    tagline: 'A tool for visualizing a codebase\'s structure as an interactive map.',
    description: 'Generates architecture diagrams and dependency maps automatically from the code, aimed at onboarding new contributors faster.',
    whenFirstReleased: '2020',
  },

  // ====== Backend
  'Express.js': {
    tagline: 'A minimal, unopinionated web framework for Node.js.',
    description: 'Became the default way to build HTTP servers and APIs in Node, with most later Node frameworks (NestJS, KeystoneJS) building on its middleware model.',
    whenFirstReleased: '2010',
  },
  NestJS: {
    tagline: 'A progressive Node.js framework for building server-side applications in TypeScript.',
    description: "Borrows Angular's module/dependency-injection architecture to bring structure to Node backends, instead of Express's minimal, unopinionated style.",
    whenFirstReleased: '2017',
  },
  Deno: {
    tagline: "A secure JavaScript/TypeScript runtime by Node.js's original creator.",
    description: 'Runs TypeScript natively, sandboxes file/network/env access by default, and ships its own package registry instead of npm.',
    whenFirstReleased: '2018',
  },
  Bun: {
    tagline: 'An all-in-one, extremely fast JavaScript runtime, bundler, and package manager.',
    description: 'Built on JavaScriptCore instead of V8 and written in Zig, aiming to replace Node, npm, and bundlers like esbuild all in one binary.',
    whenFirstReleased: '2022',
  },
  Elasticsearch: {
    tagline: 'A distributed search and analytics engine built on Apache Lucene.',
    description: 'Indexes JSON documents for near-instant full-text search and aggregations at scale; the "E" in the ELK/Elastic stack.',
    whenFirstReleased: '2010',
  },
  Logstash: {
    tagline: 'A data-processing pipeline for ingesting, transforming, and shipping logs.',
    description: 'Parses and enriches log lines from many sources before sending them on to Elasticsearch; the "L" in the ELK stack.',
    whenFirstReleased: '2009',
  },
  Kibana: {
    tagline: 'The visualization and dashboard layer for Elasticsearch.',
    description: 'Turns indexed data into searchable dashboards and charts; the "K" in the ELK stack.',
    whenFirstReleased: '2013',
  },
  Beats: {
    tagline: 'Lightweight data shippers from Elastic (Filebeat, Metricbeat, etc.).',
    description: 'Small, single-purpose agents installed on servers to forward logs and metrics into the Elastic stack with minimal overhead.',
    whenFirstReleased: '2015',
  },
  Kong: {
    tagline: 'An open-source API gateway built on top of Nginx.',
    description: 'Centralises cross-cutting concerns (auth, rate limiting, logging) for microservices behind one pluggable proxy layer.',
    whenFirstReleased: '2015',
  },
  Ansible: {
    tagline: 'An agentless IT automation and configuration-management tool.',
    description: 'Describes infrastructure changes as YAML playbooks pushed over SSH, needing no agent installed on the managed machines (unlike Puppet/Chef).',
    whenFirstReleased: '2012',
  },
  Vagrant: {
    tagline: 'A tool for building and sharing reproducible development environments.',
    description: 'Wraps VirtualBox/other providers with a single config file, so a whole team can spin up an identical VM with one command.',
    whenFirstReleased: '2010',
  },
  GraalVM: {
    tagline: "Oracle's high-performance, polyglot JDK.",
    description: 'Can compile Java (and other JVM languages) ahead-of-time into a native executable, drastically cutting startup time and memory use.',
    whenFirstReleased: '2018',
  },
  Swagger: {
    tagline: 'A toolset for designing, building, and documenting REST APIs.',
    description: "The original spec/tools that were donated to the Linux Foundation and renamed the OpenAPI Specification for the format itself.",
    whenFirstReleased: '2011',
  },
  OpenAPI: {
    tagline: 'A standard specification format for describing REST APIs.',
    description: "Formerly the \"Swagger Specification\"; lets you generate docs, client SDKs, and server stubs from one machine-readable API description.",
    whenFirstReleased: '2011',
  },
  TypeORM: {
    tagline: 'A TypeScript ORM supporting many SQL and NoSQL databases.',
    description: 'Brings Active Record and Data Mapper patterns, migrations, and decorators-based entities to Node/TypeScript backends.',
    whenFirstReleased: '2016',
  },
  TypeGraphQL: {
    tagline: 'A library for building GraphQL APIs in TypeScript using classes and decorators.',
    description: 'Lets you define a GraphQL schema and resolvers as typed TS classes instead of hand-writing separate schema definition files.',
    whenFirstReleased: '2018',
  },
  Apollo: {
    tagline: 'A popular implementation stack (client + server) for GraphQL.',
    description: 'Apollo Client handles caching and data-fetching in frontend apps, while Apollo Server is a common choice for building the GraphQL API itself.',
    whenFirstReleased: '2016',
  },
  'Apollo Studio': {
    tagline: "Apollo's cloud platform for managing and monitoring GraphQL schemas.",
    description: 'Tracks schema changes over time, flags breaking changes across a federated graph, and reports field-level usage/performance.',
    whenFirstReleased: '2019',
  },
  'Altair GraphQL Client': {
    tagline: 'A feature-rich desktop/browser client for testing GraphQL APIs.',
    description: 'Plays the same role for GraphQL that Postman plays for REST: crafting, saving, and replaying queries against an API.',
    whenFirstReleased: '2018',
  },
  KeystoneJS: {
    tagline: 'A headless CMS and application framework for Node.js.',
    description: 'Generates an admin UI and a GraphQL API straight from a schema definition, aimed at content-driven apps and sites.',
    whenFirstReleased: '2013',
  },
  Backend: {
    tagline: 'The server-side half of an application.',
    description: 'Covers business logic, APIs, and data access, as opposed to what actually renders in the user\'s browser or device.',
  },

  // ====== Cloud & hosted platforms
  'GCP - Google Cloud Platform': {
    tagline: "Google's public cloud computing platform.",
    description: 'Grew out of Google App Engine into a full suite of compute, storage, and managed data/AI services, competing with AWS and Azure.',
    whenFirstReleased: '2008',
  },
  'Microsoft Azure': {
    tagline: "Microsoft's public cloud computing platform.",
    description: 'Strong in enterprises already invested in the Microsoft stack (Windows Server, Active Directory, .NET), alongside the usual IaaS/PaaS services.',
    whenFirstReleased: '2010',
  },
  Amazon: {
    tagline: 'The e-commerce company whose internal infrastructure needs spawned AWS.',
    description: "AWS, its cloud division, began as a way to sell spare internal infrastructure capacity and became the largest public cloud provider.",
    whenFirstReleased: '1994',
  },
  Firebase: {
    tagline: "Google's platform for building mobile/web apps without managing backend infrastructure.",
    description: 'Bundles a realtime database, authentication, hosting, and serverless functions behind one SDK, aimed at moving fast without a dedicated backend team.',
    whenFirstReleased: '2011',
  },
  'Cloud Firestore': {
    tagline: "Firebase's newer NoSQL document database.",
    description: 'Succeeded the original Firebase Realtime Database with richer querying, better scaling, and multi-region support.',
    whenFirstReleased: '2017',
  },
  Supabase: {
    tagline: 'An open-source alternative to Firebase, built on Postgres.',
    description: 'Pairs a real Postgres database with instant auto-generated APIs, auth, storage, and realtime subscriptions, keeping data in an open, standard SQL database.',
    whenFirstReleased: '2020',
  },
  Appwrite: {
    tagline: 'An open-source backend-as-a-service platform.',
    description: 'Self-hostable alternative to Firebase covering auth, databases, storage, and serverless functions behind one API.',
    whenFirstReleased: '2019',
  },
  'Apache Cassandra': {
    tagline: 'A distributed, wide-column NoSQL database built for massive write scale.',
    description: 'Originated at Facebook, combining ideas from Amazon\'s Dynamo and Google\'s Bigtable papers; has no single point of failure across a cluster.',
    whenFirstReleased: '2008',
  },
  Algolia: {
    tagline: 'A hosted, developer-focused search-as-a-service API.',
    description: 'Delivers typo-tolerant, sub-50ms search results without running your own search infrastructure like Elasticsearch.',
    whenFirstReleased: '2012',
  },
  Typesense: {
    tagline: 'An open-source, typo-tolerant search engine positioned as an Algolia alternative.',
    description: 'Aims for the same instant, fuzzy search experience as Algolia, but self-hostable and open source.',
    whenFirstReleased: '2016',
  },
  Meilisearch: {
    tagline: 'An open-source, fast, typo-tolerant search engine API.',
    description: 'Another self-hostable, developer-friendly answer to Algolia, focused on simple setup and fast out-of-the-box relevance.',
    whenFirstReleased: '2018',
  },
  'Vector Databases': {
    tagline: 'Databases specialised for storing and searching high-dimensional embedding vectors.',
    description: 'Power similarity search for AI applications (semantic search, RAG, recommendations) by finding "nearest neighbour" vectors instead of exact matches.',
  },
  Pinecone: {
    tagline: 'A managed vector database for AI/ML similarity search.',
    description: 'One of the first popular hosted vector databases, widely used to add long-term memory/retrieval to LLM applications.',
    whenFirstReleased: '2019',
  },
  Weaviate: {
    tagline: 'An open-source vector database with built-in ML model integrations.',
    description: 'Can generate and store embeddings itself via built-in model modules, instead of requiring a separate embedding step before inserting data.',
    whenFirstReleased: '2019',
  },
  Milvus: {
    tagline: 'An open-source vector database for large-scale AI similarity search.',
    description: 'Built specifically to index and query billions of embedding vectors efficiently, commonly paired with LangChain/LlamaIndex-style RAG pipelines.',
    whenFirstReleased: '2019',
  },
  Qdrant: {
    tagline: 'An open-source vector similarity search engine written in Rust.',
    description: 'Positions itself on speed and a simple API for filtered vector search, often embedded directly into AI application backends.',
    whenFirstReleased: '2021',
  },
  Vespa: {
    tagline: 'A big-data serving engine for search, recommendation, and ranking at scale.',
    description: 'Built at Yahoo to serve results (not just store data) with real-time ranking over huge datasets; open-sourced years later.',
    whenFirstReleased: '2017',
  },
  Chroma: {
    tagline: 'An open-source embedding/vector database built for AI applications.',
    description: 'Designed to be the simplest way to add retrieval-augmented generation (RAG) to an LLM app, often used for local prototyping.',
    whenFirstReleased: '2022',
  },
  LlamaIndex: {
    tagline: 'A data framework for connecting LLMs to your own data.',
    description: 'Handles ingesting, indexing, and querying custom documents so an LLM can answer questions grounded in your own data (RAG), alongside LangChain.',
    whenFirstReleased: '2022',
  },
  MindsDB: {
    tagline: 'An open-source "AI layer" for running machine learning models via SQL.',
    description: 'Lets you train and query predictive models directly against your existing database using familiar SQL syntax.',
    whenFirstReleased: '2018',
  },
  AppFlowy: {
    tagline: 'An open-source, privacy-first alternative to Notion.',
    description: 'A self-hostable workspace/notes app aimed at people who want Notion-like flexibility without their data living on someone else\'s servers.',
    whenFirstReleased: '2021',
  },
  Outline: {
    tagline: 'An open-source, Notion-like team wiki and knowledge base.',
    description: 'Focused specifically on team documentation with fast search and Markdown editing, rather than being a general all-purpose workspace.',
    whenFirstReleased: '2017',
  },
  Refine: {
    tagline: 'A React-based framework for quickly building admin panels and dashboards.',
    description: 'Handles the repetitive CRUD/data-fetching/auth plumbing of internal tools, leaving the UI itself to your own components or a UI kit.',
    whenFirstReleased: '2021',
  },
  Zod: {
    tagline: 'A TypeScript-first schema validation library.',
    description: 'Lets you define a schema once and get both runtime validation and a static TypeScript type inferred from it, instead of keeping the two in sync by hand.',
    whenFirstReleased: '2020',
  },
  Cloud: {
    tagline: 'Running infrastructure and services on someone else\'s servers, on demand.',
    description: 'Trades owning physical hardware for pay-as-you-go compute, storage, and managed services from providers like AWS, Azure, and GCP.',
  },

  // ====== Languages
  C: {
    tagline: 'The foundational systems programming language behind Unix.',
    description: 'Gave programmers close-to-the-metal control with a portable syntax; most modern languages (C++, Java, Rust) trace their syntax back to it.',
    whenFirstReleased: '1972',
  },
  'C++': {
    tagline: "Bjarne Stroustrup's object-oriented extension of C.",
    description: 'Added classes, templates, and RAII on top of C\'s low-level control, and still underpins games engines, browsers, and performance-critical systems.',
    whenFirstReleased: '1985',
  },
  Go: {
    tagline: "Google's statically typed, compiled language built for simplicity and concurrency.",
    description: 'Built-in goroutines and channels make concurrent code far less painful to write than in most languages; a common choice for cloud infrastructure tools.',
    whenFirstReleased: '2009',
  },
  Ruby: {
    tagline: 'A dynamic, expressive scripting language designed for programmer happiness.',
    description: 'Prioritises readability and elegant syntax; became mainstream largely thanks to the Ruby on Rails web framework built on top of it.',
    whenFirstReleased: '1995',
  },
  Scala: {
    tagline: 'A JVM language blending object-oriented and functional programming.',
    description: 'Fully interoperable with Java, but adds pattern matching, immutability by default, and a much stronger type system; the language behind Apache Spark.',
    whenFirstReleased: '2004',
  },
  Swift: {
    tagline: "Apple's modern language for iOS/macOS development.",
    description: 'Designed to replace Objective-C with safer memory handling and cleaner syntax, while staying fast enough for systems-level code.',
    whenFirstReleased: '2014',
  },
  Haskell: {
    tagline: 'A purely functional, lazily evaluated programming language.',
    description: 'Has no mutable state or side effects by default, which makes it a common teaching language for functional programming concepts.',
    whenFirstReleased: '1990',
  },
  Erlang: {
    tagline: 'A concurrent, fault-tolerant language built for telecom switching systems.',
    description: 'Built at Ericsson for systems that must run for years without downtime; its BEAM VM later became the foundation for Elixir.',
    whenFirstReleased: '1986',
  },
  Elixir: {
    tagline: 'A functional language built on the battle-tested Erlang VM (BEAM).',
    description: 'Pairs Erlang\'s legendary fault-tolerance and concurrency with a friendlier, Ruby-inspired syntax; the Phoenix framework is its most popular use case.',
    whenFirstReleased: '2011',
  },
  Clojure: {
    tagline: 'A modern Lisp dialect for the JVM.',
    description: 'Emphasises immutable data structures and a functional style, while giving full access to the Java ecosystem.',
    whenFirstReleased: '2007',
  },
  ClojureScript: {
    tagline: 'Clojure compiled to JavaScript.',
    description: 'Brings Clojure\'s immutable-by-default, functional style to the browser instead of the JVM.',
    whenFirstReleased: '2011',
  },
  Lisp: {
    tagline: 'One of the oldest high-level programming languages still in use.',
    description: 'Pioneered ideas like recursion, garbage collection, and treating code as data, which influenced most languages that came after it.',
    whenFirstReleased: '1958',
  },
  Groovy: {
    tagline: 'A dynamic language for the JVM with syntax close to Java.',
    description: 'Lets Java developers write far less boilerplate for scripting tasks; also the language Gradle build scripts are written in.',
    whenFirstReleased: '2003',
  },
  Perl: {
    tagline: 'A general-purpose scripting language famed for text processing.',
    description: 'Its terse regular-expression-heavy style made it the go-to "glue" language for sysadmin scripts and early CGI web scripts in the 1990s.',
    whenFirstReleased: '1987',
  },
  Lua: {
    tagline: 'A lightweight, embeddable scripting language.',
    description: 'Designed to be easy to embed inside a host application; widely used as the scripting layer in games (Roblox, World of Warcraft addons) and Neovim config.',
    whenFirstReleased: '1993',
  },
  Julia: {
    tagline: 'A language built for high-performance numerical and scientific computing.',
    description: 'Aims to combine Python\'s ease of use with C-like speed for math-heavy code, popular in data science and research.',
    whenFirstReleased: '2012',
  },
  'R Language': {
    tagline: 'A language and environment built specifically for statistical computing.',
    description: 'The long-standing default in academic statistics and data analysis, with an enormous package ecosystem (CRAN) for it.',
    whenFirstReleased: '1993',
  },
  Dart: {
    tagline: "Google's language that powers Flutter.",
    description: 'Originally pitched as a JavaScript alternative for the browser; found its real niche years later as Flutter\'s app-development language.',
    whenFirstReleased: '2011',
  },
  Elm: {
    tagline: 'A purely functional language that compiles to JavaScript.',
    description: 'Designed around "no runtime exceptions in practice," using a strict compiler and the Elm Architecture that later inspired Redux.',
    whenFirstReleased: '2012',
  },
  OCaml: {
    tagline: 'A functional/imperative hybrid language from the ML family.',
    description: 'Known for a fast native compiler and strong type inference; the language much of the original Rust compiler tooling was prototyped in.',
    whenFirstReleased: '1996',
  },
  'F#': {
    tagline: 'A functional-first language for the .NET platform.',
    description: 'Brings ML/OCaml-style functional programming (pattern matching, immutability, strong type inference) to the .NET ecosystem alongside C#.',
    whenFirstReleased: '2005',
  },
  Prolog: {
    tagline: 'A logic-programming language foundational to early AI research.',
    description: 'Instead of writing step-by-step instructions, you declare facts and rules and let Prolog\'s inference engine search for answers.',
    whenFirstReleased: '1972',
  },
  Fortran: {
    tagline: 'The oldest widely used high-level programming language.',
    description: 'Still actively used today for high-performance numerical and scientific computing, decades after most of its contemporaries disappeared.',
    whenFirstReleased: '1957',
  },
  COBOL: {
    tagline: 'A business-oriented language from the late 1950s that refuses to die.',
    description: 'Still runs a huge share of banking, insurance, and government mainframe systems, decades after most companies stopped teaching it.',
    whenFirstReleased: '1959',
  },
  Crystal: {
    tagline: 'A compiled language with Ruby-like syntax but static typing and speed.',
    description: 'Aims to keep Ruby\'s readability while compiling down to fast native code with compile-time type checking.',
    whenFirstReleased: '2014',
  },
  Zig: {
    tagline: 'A low-level systems language positioned as a modern alternative to C.',
    description: 'No hidden control flow or hidden allocations, and ships its own C/C++ compiler toolchain, making cross-compilation famously easy.',
    whenFirstReleased: '2016',
  },
  Nim: {
    tagline: 'A statically typed, compiled language with Python-like syntax.',
    description: 'Compiles to C (or C++/JS) for speed and portability, while keeping code readable and indentation-based like Python.',
    whenFirstReleased: '2008',
  },
  Haxe: {
    tagline: 'A cross-platform language and toolkit that compiles to many targets.',
    description: 'One codebase can compile to JavaScript, C++, Java, C#, and more, popular for cross-platform game development.',
    whenFirstReleased: '2005',
  },
  CoffeeScript: {
    tagline: 'A language that compiles to JavaScript with cleaner, Python/Ruby-inspired syntax.',
    description: 'Popular before ES6 arrived; many of its ideas (arrow functions, classes, destructuring) directly influenced modern JavaScript itself.',
    whenFirstReleased: '2009',
  },
  Bash: {
    tagline: 'The standard Unix shell and scripting language.',
    description: 'The default shell on most Linux distributions and, since WSL/macOS, extremely common in developer tooling and CI scripts.',
    whenFirstReleased: '1989',
  },
  PHP: {
    tagline: 'The language originally built for the early dynamic web.',
    description: 'Powers a huge share of the web to this day largely through WordPress; frameworks like Laravel modernised it far beyond its "PHP: Personal Home Page" origins.',
    whenFirstReleased: '1995',
  },
  Hack: {
    tagline: "Facebook's gradually-typed dialect of PHP.",
    description: 'Adds static typing and generics on top of PHP syntax, running on Meta\'s own HHVM runtime instead of the standard Zend engine.',
    whenFirstReleased: '2014',
  },
  'D Language': {
    tagline: 'A systems language aiming to modernise C++.',
    description: 'Keeps C++-like performance while adding garbage collection (optional), built-in unit testing, and much simpler metaprogramming.',
    whenFirstReleased: '2001',
  },
  Eiffel: {
    tagline: 'A pioneering object-oriented language known for "design by contract."',
    description: 'Let methods declare formal preconditions/postconditions checked automatically at runtime, an idea later borrowed by other languages\' assertion libraries.',
    whenFirstReleased: '1985',
  },
  Raku: {
    tagline: 'A from-scratch redesign of Perl, formerly called Perl 6.',
    description: 'Kept Perl\'s expressiveness while overhauling its object system, concurrency model, and grammar-based parsing, ultimately renamed to its own identity.',
    whenFirstReleased: '2015',
  },
  PureScript: {
    tagline: 'A strongly typed functional language compiling to JavaScript, inspired by Haskell.',
    description: 'Brings Haskell-style type classes and purity to frontend development, more strict than TypeScript\'s gradual typing.',
    whenFirstReleased: '2013',
  },
  ReScript: {
    tagline: 'A statically typed language that compiles to clean, readable JavaScript.',
    description: 'Descended from Reason/BuckleScript (themselves built on OCaml), rebranded with a focus on fast builds and 100% type safety.',
    whenFirstReleased: '2020',
  },
  Imba: {
    tagline: 'A language combining Ruby-like syntax with a fast built-in DOM renderer.',
    description: 'Compiles both logic and view templates from one file, with a memoized DOM diffing engine built into the language itself rather than a separate library.',
    whenFirstReleased: '2012',
  },
  'V Language': {
    tagline: 'A simple, fast compiled language emphasising easy readability.',
    description: "Compiles extremely quickly to native code (or C) and deliberately keeps the language's feature set small and easy to hold in your head.",
    whenFirstReleased: '2019',
  },
  'Eclipse Ceylon': {
    tagline: 'A statically typed language for the JVM and JavaScript, created at Red Hat.',
    description: 'Aimed to fix Java\'s pain points (verbosity, null handling) while staying fully interoperable with existing Java code.',
    whenFirstReleased: '2011',
  },
  HolyC: {
    tagline: 'The esoteric language Terry A. Davis created for his TempleOS project.',
    description: 'A quirky mix of C and BASIC built specifically for TempleOS\'s own kernel and toolchain, not intended for general-purpose use elsewhere.',
    whenFirstReleased: '2003',
  },
  'Google Carbon': {
    tagline: "An experimental successor language to C++ from Google.",
    description: 'Aims to give C++ codebases a memory-safer, more modern language with straightforward, bidirectional interop, rather than a clean-slate rewrite.',
    whenFirstReleased: '2022',
  },
  AssemblyScript: {
    tagline: 'A TypeScript-like language that compiles directly to WebAssembly.',
    description: 'Lets you write in familiar TS syntax while getting predictable, statically typed low-level control suited to compiling to WASM.',
    whenFirstReleased: '2018',
  },
  WebAssembly: {
    tagline: 'A portable, binary instruction format that runs at near-native speed in the browser.',
    description: 'Gives languages like C++, Rust, and Go a compile target that runs safely sandboxed alongside JavaScript, instead of being limited to JS itself.',
    whenFirstReleased: '2017',
  },
  'WebAssembly System Interface (WASI)': {
    tagline: 'A standardized system interface for running WebAssembly outside the browser.',
    description: 'Defines a portable, capability-based API (files, clocks, sockets) so the same WASM module can run safely on servers, not just in a browser tab.',
    whenFirstReleased: '2019',
  },
  'WebAssembly Package Manager (WAPM)': {
    tagline: 'A package manager for distributing and installing WebAssembly modules.',
    description: 'Plays the role for portable WASM binaries that npm/Cargo play for their respective ecosystems.',
    whenFirstReleased: '2018',
  },
  Wasmer: {
    tagline: 'A WebAssembly runtime for running WASM modules outside the browser.',
    description: 'Lets WASM binaries run standalone on servers/desktops (and embed into other languages), not just inside a browser tab.',
    whenFirstReleased: '2019',
  },
  Wasmtime: {
    tagline: "The Bytecode Alliance's standalone WebAssembly runtime.",
    description: 'A reference-quality, security-focused WASM/WASI runtime backed by Mozilla, Fastly, Intel, and others, rather than a single vendor.',
    whenFirstReleased: '2019',
  },
  Tokio: {
    tagline: 'The most widely used asynchronous runtime for Rust.',
    description: 'Provides the async task scheduler, timers, and I/O that Rust\'s async/await syntax needs to actually run, since Rust itself ships no built-in runtime.',
    whenFirstReleased: '2016',
  },
  Tonic: {
    tagline: 'A gRPC implementation for Rust, built on top of Tokio.',
    description: 'A common choice for writing high-performance, strongly typed RPC services in Rust.',
    whenFirstReleased: '2018',
  },
  Tauri: {
    tagline: 'A Rust-based framework for building lightweight desktop apps with web frontends.',
    description: 'Uses the OS\'s native webview instead of bundling a whole Chromium (like Electron does), producing far smaller app binaries.',
    whenFirstReleased: '2020',
  },
  Yew: {
    tagline: 'A Rust framework for building web frontends, compiled to WebAssembly.',
    description: 'Offers a React-like component model (with a virtual DOM) but written entirely in Rust instead of JavaScript.',
    whenFirstReleased: '2017',
  },
  Dioxus: {
    tagline: 'A Rust UI framework portable across web, desktop, and mobile.',
    description: 'Uses a React-like component and hooks model, but one codebase can target a WASM web app, a native desktop window, or a mobile app.',
    whenFirstReleased: '2021',
  },
  Pyright: {
    tagline: "Microsoft's fast static type checker for Python.",
    description: 'Powers type checking and IntelliSense in VS Code\'s Python extension (Pylance), catching type errors without running the code.',
    whenFirstReleased: '2019',
  },
  'Python Pyre': {
    tagline: 'A performant static type checker for Python, built at Meta.',
    description: 'Designed to type-check very large Python codebases (like Instagram\'s) incrementally and fast.',
    whenFirstReleased: '2018',
  },
  Sorbet: {
    tagline: "Stripe's static type checker for Ruby.",
    description: 'Adds gradual, opt-in static typing to Ruby so large codebases can catch type errors before runtime, without abandoning Ruby itself.',
    whenFirstReleased: '2018',
  },
  'JetBrains RustRover': {
    tagline: "JetBrains' dedicated IDE for Rust.",
    description: 'Brings the same deep static analysis and refactoring JetBrains IDEs are known for specifically to Rust\'s borrow-checker-heavy codebases.',
    whenFirstReleased: '2023',
  },
  'JetBrains MPS': {
    tagline: "JetBrains' language workbench for building your own domain-specific languages.",
    description: 'Lets you design a custom DSL with its own projectional editor, rather than writing a traditional text-based parser/grammar by hand.',
    whenFirstReleased: '2005',
  },
  FastAPI: {
    tagline: 'A modern, high-performance Python web framework using type hints.',
    description: 'Auto-generates OpenAPI docs and request validation straight from Python type annotations, and is fast enough to compete with Node/Go frameworks.',
    whenFirstReleased: '2018',
  },
  Flask: {
    tagline: "A lightweight Python \"microframework\" for web applications.",
    description: 'Gives you routing and templating with almost no built-in opinions beyond that, leaving choices like the ORM entirely up to you (unlike Django).',
    whenFirstReleased: '2010',
  },
  Commodore: {
    tagline: 'A pioneering home computer company behind the Commodore 64 and Amiga.',
    description: 'The Commodore 64, launched in 1982, remains the best-selling single computer model in history.',
    whenFirstReleased: '1982',
  },
  Amiga: {
    tagline: "Commodore's influential multimedia-capable home computer platform.",
    description: 'Had custom graphics/audio chips far ahead of contemporary PCs, making it a favourite for video, music, and game production in the late 1980s.',
    whenFirstReleased: '1985',
  },
  Markdown: {
    tagline: 'A lightweight plain-text formatting syntax.',
    description: 'Designed by John Gruber to be readable even unrendered as plain text; now the default format for READMEs, docs, and chat apps everywhere.',
    whenFirstReleased: '2004',
  },

  // ====== Other
  XML: {
    tagline: 'A markup language for encoding structured documents and data.',
    description: 'Became the default interchange format for config files and web services (SOAP) in the late 90s/2000s, before JSON took over most of that role.',
    whenFirstReleased: '1998',
  },
  'XML Schema': {
    tagline: 'A W3C standard for defining the structure and constraints of XML documents.',
    description: 'Lets you declare exactly what elements, attributes, and data types a valid XML document must have, so it can be validated automatically.',
    whenFirstReleased: '2001',
  },
  SOAP: {
    tagline: 'An XML-based messaging protocol for web services.',
    description: 'The formal, contract-driven (WSDL) alternative to REST; still common in enterprise and banking/insurance integrations that predate the REST era.',
    whenFirstReleased: '1998',
  },
  PDF: {
    tagline: "Adobe's Portable Document Format for fixed-layout documents.",
    description: 'Designed to look identical on any device or printer regardless of the software used to create it; now an open ISO standard.',
    whenFirstReleased: '1993',
  },
  iText: {
    tagline: 'A Java/.NET library for creating and manipulating PDF documents in code.',
    description: 'Lets applications generate invoices, reports, and other PDFs programmatically instead of relying on a separate authoring tool.',
    whenFirstReleased: '2000',
  },
  JAXB: {
    tagline: 'A Java standard for converting between XML and Java objects.',
    description: 'Auto-generates Java classes from an XML Schema (or the reverse), avoiding hand-written parsing code for XML-based APIs.',
    whenFirstReleased: '2003',
  },
  Guice: {
    tagline: "Google's lightweight dependency-injection framework for Java.",
    description: 'A simpler, code-first alternative to Spring\'s XML-heavy DI configuration from the same era, using annotations instead.',
    whenFirstReleased: '2007',
  },
  ReactiveX: {
    tagline: 'A cross-language API for asynchronous programming using observable streams.',
    description: 'Originated as Rx.NET at Microsoft and was later ported to nearly every major language (RxJS, RxJava, RxSwift...), all sharing the same operators.',
    whenFirstReleased: '2009',
  },
  'BDD - Behavior-Driven Development': {
    tagline: 'A methodology extending TDD with a shared, plain-language vocabulary.',
    description: 'Frames tests as "Given/When/Then" scenarios that both developers and non-technical stakeholders can read and agree on, popularised by tools like Cucumber.',
    whenFirstReleased: '2003',
  },
  'DSL - Domain-Specific Languages': {
    tagline: 'Small languages purpose-built for one specific problem domain.',
    description: 'Trades general-purpose flexibility for expressiveness in one narrow area (build scripts, regexes, SQL) rather than being usable for arbitrary programs.',
  },
  'Customer Support': {
    tagline: 'Helping users solve problems with a product after they\'ve started using it.',
    description: 'Ranges from live chat and ticketing systems to self-serve docs, often the first place product feedback and bug reports actually surface.',
  },

  // Data / BI / analytics platforms
  'Apache Spark': {
    tagline: 'A unified analytics engine for large-scale data processing.',
    description: 'Processes data in-memory across a cluster, making it far faster than the disk-based MapReduce jobs it effectively replaced.',
    whenFirstReleased: '2014',
  },
  'Apache Superset': {
    tagline: 'An open-source data exploration and visualization platform.',
    description: 'Originated at Airbnb (as "Caravel") as a self-hostable, SQL-backed alternative to commercial BI tools like Tableau.',
    whenFirstReleased: '2016',
  },
  ClickHouse: {
    tagline: 'An open-source columnar database built for real-time analytics at scale.',
    description: 'Built at Yandex to run aggregation queries over billions of rows in sub-second time, by storing and scanning data column-by-column instead of row-by-row.',
    whenFirstReleased: '2016',
  },
  Metabase: {
    tagline: 'An open-source business intelligence and dashboarding tool.',
    description: 'Lets non-technical teammates explore data and build charts through a UI, without needing to write SQL themselves.',
    whenFirstReleased: '2015',
  },
  Observable: {
    tagline: 'A collaborative, JavaScript-based notebook platform for data visualization.',
    description: 'Cells re-run reactively as you edit them (like a spreadsheet), aimed at exploring, analysing, and explaining data as a team.',
    whenFirstReleased: '2017',
  },

  // Low-code / no-code / CMS / builders
  Notion: {
    tagline: 'An all-in-one workspace for notes, docs, wikis, and light project tracking.',
    description: 'Replaced a pile of separate note/wiki/task apps with one flexible block-based editor that teams can shape into almost anything.',
    whenFirstReleased: '2016',
  },
  AFFiNE: {
    tagline: 'An open-source, all-in-one workspace combining notes, docs, and a whiteboard.',
    description: 'Positions itself as a privacy-respecting, self-hostable alternative to Notion.',
    whenFirstReleased: '2022',
  },
  Bubble: {
    tagline: 'A visual, no-code platform for building full web applications.',
    description: 'Lets non-technical people build and host database-backed web apps by arranging UI elements and workflows visually instead of writing code.',
    whenFirstReleased: '2012',
  },
  Budibase: {
    tagline: 'An open-source low-code platform for building internal tools and admin apps.',
    description: 'Generates CRUD screens and workflows over your existing database or API, self-hostable rather than only available as SaaS.',
    whenFirstReleased: '2020',
  },
  WebFlow: {
    tagline: 'A visual, no-code website builder that outputs real, clean HTML/CSS.',
    description: 'Gives designers direct control over markup and styling visually, unlike page builders that generate messy, locked-in output.',
    whenFirstReleased: '2013',
  },
  Wix: {
    tagline: 'A drag-and-drop website building and hosting platform.',
    description: 'One of the earliest mainstream no-code site builders aimed at small businesses and individuals rather than developers.',
    whenFirstReleased: '2006',
  },
  PrestaShop: {
    tagline: 'An open-source e-commerce platform.',
    description: 'A self-hostable alternative to SaaS platforms like Shopify, popular for stores that want full control over hosting and customization.',
    whenFirstReleased: '2007',
  },
  Odoo: {
    tagline: 'An open-source suite of business applications (ERP, CRM, e-commerce, and more).',
    description: 'Started as "TinyERP," was renamed OpenERP, then Odoo as its scope grew from accounting into a full modular business-apps platform.',
    whenFirstReleased: '2005',
  },
  Framer: {
    tagline: 'A design tool that lets you prototype and publish real interactive websites.',
    description: 'Started as an advanced prototyping tool for designers and has since grown into a no-code website builder that ships production sites.',
    whenFirstReleased: '2014',
  },
  Mattermost: {
    tagline: 'An open-source, self-hostable alternative to Slack.',
    description: 'Gives teams (often ones with strict data-residency or security requirements) the same channel-based chat model without depending on a SaaS vendor.',
    whenFirstReleased: '2015',
  },
  Blazor: {
    tagline: "Microsoft's framework for building web UIs with C# instead of JavaScript.",
    description: 'Runs C#/.NET either compiled to WebAssembly in the browser or over a SignalR connection from the server, so teams can skip JavaScript entirely.',
    whenFirstReleased: '2018',
  },

  // Maps / location
  'Google Maps': {
    tagline: "Google's web-based mapping and navigation service.",
    description: 'Became the default embeddable maps API for websites and apps long before most competitors caught up on coverage and routing quality.',
    whenFirstReleased: '2005',
  },
  Mapbox: {
    tagline: 'A platform for building custom, styleable maps and location-based apps.',
    description: 'Gives developers far more control over map styling and data layers than embedding a standard Google Maps widget.',
    whenFirstReleased: '2010',
  },

  // Automation / integration
  Zapier: {
    tagline: 'A no-code automation tool that connects different web apps\' workflows.',
    description: '"When X happens in one app, do Y in another" without writing integration code, via thousands of pre-built app connectors.',
    whenFirstReleased: '2011',
  },
  IFTTT: {
    tagline: '"If This Then That" — simple conditional automations between apps and devices.',
    description: 'Popularised the single-trigger, single-action automation recipe, especially for smart-home and consumer app integrations.',
    whenFirstReleased: '2011',
  },
  n8n: {
    tagline: 'An open-source, self-hostable workflow automation tool.',
    description: 'A source-available alternative to Zapier/Make with a visual node-based workflow editor you can run on your own infrastructure.',
    whenFirstReleased: '2019',
  },
  Mailgun: {
    tagline: 'An email API service for sending, receiving, and tracking transactional email.',
    description: 'Handles the deliverability/infrastructure headaches (SPF/DKIM, bounce handling) of sending app emails at scale, so apps just call an API.',
    whenFirstReleased: '2010',
  },
  reCAPTCHA: {
    tagline: "Google's service for telling humans and bots apart on web forms.",
    description: 'Evolved from distorted-text challenges into an invisible, behaviour-based risk score, cutting down on the annoying "click all the traffic lights" puzzles.',
    whenFirstReleased: '2007',
  },

  // Social / reference / distribution
  Discord: {
    tagline: 'A chat and voice platform originally built for gamers.',
    description: 'Organises communities into servers with text/voice channels, and has since spread far beyond gaming into general online communities.',
    whenFirstReleased: '2015',
  },
  Wikipedia: {
    tagline: 'A free, collaboratively edited online encyclopedia.',
    description: 'Built on the MediaWiki software, anyone can edit an article, with disputes resolved through discussion pages and community consensus.',
    whenFirstReleased: '2001',
  },
  'Google Play': {
    tagline: "Google's digital storefront for Android apps and content.",
    description: "Unified the earlier Android Market with Google's music, movies, and books stores into one branded storefront.",
    whenFirstReleased: '2012',
  },

  // AI-assisted coding tools
  'Cursor.sh': {
    tagline: 'An AI-native code editor built as a fork of VS Code.',
    description: 'Bakes AI chat, inline edits, and multi-file code generation directly into the editor experience, rather than bolting AI on as a side panel extension.',
    whenFirstReleased: '2023',
  },
  Ghostwriter: {
    tagline: "Replit's built-in AI coding assistant.",
    description: 'Offers inline code completion and an AI chat assistant directly inside Replit\'s browser-based IDE.',
    whenFirstReleased: '2022',
  },
  Rift: {
    tagline: 'An AI-native coding assistant built as a VS Code extension.',
    description: 'Aimed at deeper, more autonomous AI pair-programming inside the editor than simple inline autocomplete.',
    whenFirstReleased: '2023',
  },
  'Vercel V0': {
    tagline: "Vercel's AI tool that generates UI code from a text prompt or image.",
    description: 'Generates working React/Tailwind component code from a plain-language description, meant as a fast starting point rather than a finished product.',
    whenFirstReleased: '2023',
  },

  // Niche / industry-specific
  BiPRO: {
    tagline: 'A German insurance-industry standard for data exchange.',
    description: 'Defines standardized interfaces (originally XML/SOAP-based) so insurers, brokers, and comparison portals can exchange policy and claims data consistently.',
    whenFirstReleased: '2004',
  },
  AudioSalad: {
    tagline: 'A B2B platform for digital music distribution and royalty management.',
    description: 'Used by labels and distributors to deliver releases to streaming/download stores and manage the resulting royalty accounting.',
  },
  Carbide: {
    tagline: 'A collaborative coding/data notebook tool.',
    description: 'Sits in the same space as tools like Observable and Replit: a browser-based canvas for writing and running code together.',
  },

  // ====== Frontend frameworks & meta-frameworks
  'Next.js': {
    tagline: 'A React framework with file-based routing and server rendering built in.',
    description: 'Bundles routing, SSR/SSG, and API routes on top of React so teams don\'t have to hand-assemble that infrastructure themselves; built by Vercel.',
    whenFirstReleased: '2016',
  },
  Vercel: {
    tagline: "Next.js's creator, and a cloud platform for deploying frontend apps.",
    description: 'Popularised git-push-to-deploy with instant preview URLs per pull request; originally launched as "ZEIT" before rebranding.',
    whenFirstReleased: '2015',
  },
  Vite: {
    tagline: 'A fast frontend build tool created by Vue\'s author, Evan You.',
    description: 'Serves source files over native ES modules during development instead of bundling everything upfront, making the dev server start almost instantly.',
    whenFirstReleased: '2020',
  },
  Svelte: {
    tagline: 'A UI framework that compiles components to vanilla JS at build time.',
    description: 'Does its reactivity work at compile time instead of via a virtual DOM at runtime, shipping less framework code to the browser.',
    whenFirstReleased: '2016',
  },
  SolidJS: {
    tagline: 'A fine-grained reactive UI library with a React-like API but no virtual DOM.',
    description: 'Compiles JSX to real DOM updates that track only the exact values that changed, aiming for React\'s ergonomics with much better raw performance.',
    whenFirstReleased: '2018',
  },
  Qwik: {
    tagline: 'A framework built around "resumability" for near-instant page loads.',
    description: 'Ships almost no JavaScript on first load and resumes exactly where server rendering left off, instead of re-hydrating the whole page like most frameworks.',
    whenFirstReleased: '2021',
  },
  Astro: {
    tagline: 'A framework for content-focused sites that ships zero JS by default.',
    description: 'Lets you use components from any framework (React, Vue, Svelte) but only sends JavaScript to the browser for the interactive "islands" that actually need it.',
    whenFirstReleased: '2021',
  },
  Remix: {
    tagline: 'A full-stack React framework built around web standards.',
    description: 'Leans on browser primitives (forms, HTTP caching) instead of framework-specific abstractions; built by the team behind React Router.',
    whenFirstReleased: '2021',
  },
  Gatsby: {
    tagline: 'A React-based static site generator with a built-in GraphQL data layer.',
    description: 'Pulls data from any source (CMS, filesystem, APIs) through one GraphQL query layer at build time, then outputs pre-rendered static pages.',
    whenFirstReleased: '2015',
  },
  Marko: {
    tagline: 'A UI library and compiler built by eBay, optimised for server rendering.',
    description: 'Designed from the start around streaming server-rendered HTML fast, at a time when most competitors were client-rendering-first.',
    whenFirstReleased: '2014',
  },
  Inferno: {
    tagline: 'An extremely fast, React-like JavaScript UI library.',
    description: 'Trims features React has to squeeze out significantly better raw rendering performance, at the cost of some flexibility.',
    whenFirstReleased: '2016',
  },
  Rax: {
    tagline: "A lightweight, React-like framework built by Alibaba for universal rendering.",
    description: 'Targets web, native apps, and miniapp platforms (like Alipay Mini Programs) from one React-flavoured codebase.',
    whenFirstReleased: '2016',
  },
  Mithril: {
    tagline: 'A small, fast client-side JavaScript framework.',
    description: 'Ships routing, XHR helpers, and a virtual DOM in a tiny footprint, aimed at teams who find React/Angular too heavy for the job.',
    whenFirstReleased: '2014',
  },
  Riot: {
    tagline: 'A simple, component-based UI library.',
    description: "Uses custom HTML-like tags similar to Vue's single-file components, aiming for a gentler learning curve than bigger frameworks.",
    whenFirstReleased: '2013',
  },
  Hono: {
    tagline: 'An ultrafast, lightweight web framework built for edge runtimes.',
    description: 'Runs on Cloudflare Workers, Deno, Bun, and Node alike from one small codebase, aimed at APIs that need to run close to the user.',
    whenFirstReleased: '2021',
  },
  'Hotwired Turbo': {
    tagline: 'Speeds up server-rendered apps by sending HTML over the wire instead of JSON.',
    description: 'Part of Basecamp\'s Hotwire suite; swaps in new page fragments from the server directly, skipping most client-side JS/JSON plumbing.',
    whenFirstReleased: '2020',
  },
  'Hotwired Stimulus': {
    tagline: 'A minimal JavaScript framework for adding behaviour to server-rendered HTML.',
    description: 'Attaches small "controllers" to existing markup instead of taking over rendering, the other half of Basecamp\'s Hotwire approach alongside Turbo.',
    whenFirstReleased: '2018',
  },

  // ====== State management
  Redux: {
    tagline: 'A predictable state container for JavaScript apps.',
    description: 'Borrowed the Elm Architecture\'s single-store, action-based update model, and became the default state manager for React apps for years.',
    whenFirstReleased: '2015',
  },
  MobX: {
    tagline: 'A state-management library based on transparent, observable reactivity.',
    description: 'Lets you mutate state directly and have every dependent computation/UI update automatically, instead of Redux\'s explicit action/reducer boilerplate.',
    whenFirstReleased: '2015',
  },
  'MobX-State-Tree': {
    tagline: 'An opinionated state-management library built on top of MobX.',
    description: 'Adds a strict, snapshot-able tree structure with runtime type-checking on top of MobX\'s free-form observables.',
    whenFirstReleased: '2017',
  },
  NgRx: {
    tagline: "Angular's Redux-inspired state management library, built on RxJS.",
    description: 'Brings the same predictable, action/reducer/effects pattern as Redux to Angular, using Observables instead of plain callbacks.',
    whenFirstReleased: '2016',
  },
  NGXS: {
    tagline: 'A state-management library for Angular with less boilerplate than NgRx.',
    description: 'Uses decorators and classes to define state, aiming to feel closer to plain Angular services than NgRx\'s more ceremony-heavy action/reducer setup.',
    whenFirstReleased: '2017',
  },
  Pinia: {
    tagline: "Vue's official, modern state-management library.",
    description: 'Replaced Vuex as Vue\'s recommended store, with a simpler API and first-class TypeScript support.',
    whenFirstReleased: '2019',
  },

  // ====== DOM helpers / utilities / animation
  jQuery: {
    tagline: 'The library that made cross-browser DOM manipulation and AJAX sane.',
    description: 'Papered over years of inconsistent browser APIs with one simple API; still runs on a huge share of the web\'s older sites.',
    whenFirstReleased: '2006',
  },
  'Backbone.js': {
    tagline: 'One of the earliest MV*-style JavaScript frameworks.',
    description: 'Gave models, views, and events real structure at a time when most frontend code was still jQuery spaghetti.',
    whenFirstReleased: '2010',
  },
  'D3.js': {
    tagline: 'A JavaScript library for binding data to the DOM and building custom visualizations.',
    description: 'A lower-level toolkit than most charting libraries: instead of pre-built chart types, it gives you full control to build any visualization from primitives.',
    whenFirstReleased: '2011',
  },
  'Chart.js': {
    tagline: 'A simple, canvas-based charting library.',
    description: 'Covers the common chart types (line, bar, pie) with sane defaults and minimal configuration, versus D3\'s full-control/full-effort approach.',
    whenFirstReleased: '2013',
  },
  Lodash: {
    tagline: 'A utility library for common array, object, and function operations.',
    description: 'Filled in gaps in JavaScript\'s standard library (deep clone, debounce, grouping) long before many of those landed natively.',
    whenFirstReleased: '2012',
  },
  'Dexie.js': {
    tagline: "A wrapper library that makes the browser's IndexedDB API easier to use.",
    description: 'Turns IndexedDB\'s notoriously clunky, callback-heavy native API into a clean, Promise-based interface with queries.',
    whenFirstReleased: '2014',
  },
  GreenSock: {
    tagline: 'A high-performance JavaScript animation library (GSAP).',
    description: 'Handles complex, sequenced animation timelines smoothly across browsers, long favoured by teams doing intricate motion design on the web.',
    whenFirstReleased: '2008',
  },

  // ====== CSS / design systems / component libraries
  Bootstrap: {
    tagline: "Twitter's CSS framework, one of the most widely used ever.",
    description: 'Made responsive, cross-browser-consistent layouts and components accessible to teams without a dedicated CSS specialist.',
    whenFirstReleased: '2011',
  },
  Less: {
    tagline: 'A CSS preprocessor adding variables, nesting, and mixins.',
    description: 'One of the first popular tools to add programming-language features on top of plain CSS, alongside Sass.',
    whenFirstReleased: '2009',
  },
  Stylus: {
    tagline: 'A CSS preprocessor with a flexible, whitespace-optional syntax.',
    description: 'Lets you drop braces, colons, and semicolons entirely if you want, aiming for the most terse of the mainstream CSS preprocessors.',
    whenFirstReleased: '2010',
  },
  PostCSS: {
    tagline: 'A tool for transforming CSS using JavaScript plugins.',
    description: 'Powers plugins like Autoprefixer and Tailwind itself; less a preprocessor with fixed features than an extensible pipeline for CSS transformations.',
    whenFirstReleased: '2013',
  },
  'Material Design': {
    tagline: "Google's design language and system.",
    description: 'Defined a consistent visual language (elevation, motion, typography) across Google\'s own products and any app that adopts its component libraries.',
    whenFirstReleased: '2014',
  },
  'Material UI': {
    tagline: 'A React component library implementing Material Design (now branded MUI).',
    description: 'One of the most widely used React UI kits, giving teams production-ready Material Design components out of the box.',
    whenFirstReleased: '2014',
  },
  PrimeNG: {
    tagline: 'A rich UI component library for Angular.',
    description: 'Ships 90+ components (tables, charts, forms) from the PrimeFaces team, filling gaps Angular Material deliberately leaves unstyled/unbuilt.',
    whenFirstReleased: '2016',
  },
  'Headless UI': {
    tagline: 'Completely unstyled, fully accessible UI components from Tailwind Labs.',
    description: 'Handles the hard, easy-to-get-wrong behaviour (focus trapping, keyboard nav, ARIA) of components like modals/menus, leaving 100% of the styling to you.',
    whenFirstReleased: '2020',
  },
  'Font Awesome': {
    tagline: 'An icon toolkit distributed as icon fonts or SVGs.',
    description: 'Became the default drop-in icon set for web projects for years before per-icon SVG/tree-shakeable approaches became more common.',
    whenFirstReleased: '2012',
  },
  'Web Components': {
    tagline: 'A set of browser-native APIs for building reusable, encapsulated UI elements.',
    description: 'Custom Elements, Shadow DOM, and HTML templates let you build framework-agnostic components usable from React, Vue, Angular, or plain HTML alike.',
    whenFirstReleased: '2011',
  },
  Lit: {
    tagline: "Google's lightweight library for building web components.",
    description: "The spiritual successor to the Polymer project, adding a small, fast reactive layer on top of the native Web Components APIs.",
    whenFirstReleased: '2019',
  },
  Stencil: {
    tagline: 'A compiler that generates standards-based Web Components.',
    description: "Lets you write components with a React/JSX-like developer experience, then compiles them down to framework-agnostic custom elements; built by the Ionic team.",
    whenFirstReleased: '2017',
  },

  // ====== Cross-platform / app shells
  Ionic: {
    tagline: 'A cross-platform UI toolkit for building mobile, desktop, and web apps from one codebase.',
    description: 'Provides native-feeling UI components on top of standard web tech, commonly paired with Angular, React, or Vue.',
    whenFirstReleased: '2013',
  },
  Electron: {
    tagline: 'A framework for building cross-platform desktop apps with web technology.',
    description: 'Bundles Chromium and Node.js so a web app can become a real desktop app (VS Code and Slack\'s desktop apps are both built on it); built by GitHub.',
    whenFirstReleased: '2013',
  },
  Expo: {
    tagline: 'A platform and toolchain built on top of React Native.',
    description: 'Removes most of the native build/config overhead of plain React Native, letting you develop and preview apps without touching Xcode/Android Studio directly.',
    whenFirstReleased: '2012',
  },
  'Compose Multiplatform': {
    tagline: "JetBrains' UI toolkit extending Kotlin's Jetpack Compose beyond Android.",
    description: 'Lets one Kotlin/Compose UI codebase target desktop, web, and iOS as well as Android, instead of writing separate UIs per platform.',
    whenFirstReleased: '2020',
  },

  // ====== Data grids
  'AG Grid': {
    tagline: 'A feature-rich JavaScript data grid component.',
    description: 'Handles very large, complex tabular data (virtual scrolling, grouping, pivoting, filtering) far beyond what a plain HTML table can manage performantly.',
    whenFirstReleased: '2015',
  },
  'Alpine.js': {
    tagline: 'A minimal JavaScript framework for adding interactivity directly in your HTML.',
    description: 'Described as "jQuery for the Tailwind generation": sprinkle small behaviours onto server-rendered markup without a build step or component framework.',
    whenFirstReleased: '2019',
  },

  // ====== Build tools / bundlers / monorepos
  Biome: {
    tagline: 'A fast, Rust-based formatter and linter toolchain.',
    description: 'The community successor to the Rome project, aiming to replace the combination of ESLint plus Prettier with one faster, unified tool.',
    whenFirstReleased: '2023',
  },
  esbuild: {
    tagline: 'An extremely fast JavaScript/TypeScript bundler and minifier written in Go.',
    description: 'Bundles and minifies orders of magnitude faster than JS-based bundlers of its era, and now powers parts of Vite\'s dev pipeline.',
    whenFirstReleased: '2020',
  },
  Rollup: {
    tagline: 'A JavaScript module bundler focused on tree-shaking ES modules.',
    description: 'Popularised aggressively removing unused exports from a bundle; the bundler behind many popular libraries, and originally behind Vite too.',
    whenFirstReleased: '2015',
  },
  Turbopack: {
    tagline: "A Rust-based successor to Webpack, built by Vercel/Next.js's team.",
    description: "Built by webpack's original creator with incremental computation at its core, aiming to make large apps' rebuilds near-instant.",
    whenFirstReleased: '2022',
  },
  Turborepo: {
    tagline: 'A high-performance build system for JavaScript/TypeScript monorepos.',
    description: 'Caches and parallelises tasks across a monorepo\'s packages so only what actually changed gets rebuilt; later acquired by Vercel.',
    whenFirstReleased: '2021',
  },
  'Speedy Web Compiler (SWC)': {
    tagline: 'A Rust-based platform for extremely fast JavaScript/TypeScript compilation.',
    description: 'A drop-in, much faster alternative to Babel for transpiling and minifying JS/TS; powers parts of Next.js\'s and Deno\'s toolchains.',
    whenFirstReleased: '2020',
  },
  pnpm: {
    tagline: 'A fast, disk-space-efficient, npm-compatible package manager.',
    description: 'Stores one copy of each package version on disk and hard-links it into every project that needs it, instead of duplicating node_modules everywhere.',
    whenFirstReleased: '2016',
  },
  Nx: {
    tagline: 'An extensible build system and monorepo toolset for JavaScript (and beyond) projects.',
    description: 'Adds computation caching, dependency-graph-aware task running, and code generators on top of a monorepo, from the former AngularJS team at Nrwl.',
    whenFirstReleased: '2017',
  },
  Rush: {
    tagline: "Microsoft's scalable monorepo manager for large JavaScript codebases.",
    description: 'Focused on very large-scale monorepos with strict, reproducible dependency installs across many teams and packages.',
    whenFirstReleased: '2016',
  },
  Storybook: {
    tagline: 'A tool for developing and testing UI components in isolation.',
    description: 'Renders each component in its own sandboxed "story" outside the full app, making visual review and edge-case testing much faster.',
    whenFirstReleased: '2016',
  },
  Strapi: {
    tagline: 'An open-source, JavaScript-based headless CMS.',
    description: 'Generates a customizable REST/GraphQL API and admin panel from a content-type schema, leaving the actual frontend entirely up to you.',
    whenFirstReleased: '2015',
  },

  // ====== Graphics APIs / formats
  WebGL: {
    tagline: 'A JavaScript API for rendering interactive 2D and 3D graphics in the browser.',
    description: 'Exposes GPU-accelerated rendering (based on OpenGL ES) directly to web pages without needing a plugin like the old Flash/Silverlight did.',
    whenFirstReleased: '2011',
  },
  WebGPU: {
    tagline: 'A newer, lower-level graphics and compute API for the web, succeeding WebGL.',
    description: 'Maps much more directly onto modern native GPU APIs (Vulkan/Metal/DirectX 12), unlocking better performance and general-purpose GPU compute in-browser.',
    whenFirstReleased: '2023',
  },
  glTF: {
    tagline: "A royalty-free file format for 3D scenes and models, nicknamed the \"JPEG of 3D.\"",
    description: 'Designed to be efficient to transmit and fast to load, rather than a rich authoring format like FBX/Blender\'s own file format.',
    whenFirstReleased: '2015',
  },
  PWA: {
    tagline: 'Progressive Web App: web technologies used to make a site feel like a native app.',
    description: 'A set of practices (service workers, a manifest, HTTPS) rather than one library, letting a website be installed, work offline, and send push notifications.',
    whenFirstReleased: '2015',
  },

  // ====== AI: labs & foundation models
  OpenAI: {
    tagline: 'The AI research company behind GPT and ChatGPT.',
    description: 'ChatGPT\'s 2022 launch is widely credited with kicking off the mainstream LLM boom, on top of years of earlier GPT research.',
    whenFirstReleased: '2015',
  },
  Anthropic: {
    tagline: 'An AI safety-focused company behind the Claude models.',
    description: 'Founded by former OpenAI researchers, with a research emphasis on making powerful models more interpretable and steerable.',
    whenFirstReleased: '2021',
  },
  'Google DeepMind': {
    tagline: "Google's AI research lab, formed by merging DeepMind and Google Brain.",
    description: 'DeepMind (known for AlphaGo and AlphaFold) merged with Google Brain in 2023 to consolidate Google\'s AI research under one roof.',
    whenFirstReleased: '2010',
  },
  'Google Gemini': {
    tagline: "Google's family of multimodal large language models.",
    description: 'Replaced Bard as Google\'s flagship consumer/developer-facing AI assistant and model line.',
    whenFirstReleased: '2023',
  },
  'Google Bard': {
    tagline: "Google's original conversational AI chatbot, since succeeded by Gemini.",
    description: "Google's first mainstream answer to ChatGPT, later rebranded and absorbed into the Gemini product line.",
    whenFirstReleased: '2023',
  },
  'Google JAX': {
    tagline: "Google's high-performance library for numerical computing and automatic differentiation.",
    description: 'Popular in ML research for combining NumPy-like syntax with just-in-time compilation and easy parallelisation across GPUs/TPUs.',
    whenFirstReleased: '2018',
  },
  'Google Vertex AI': {
    tagline: "Google Cloud's unified platform for building and deploying ML models.",
    description: 'Consolidated Google Cloud\'s previously separate AI Platform and AutoML products into one managed ML workflow.',
    whenFirstReleased: '2021',
  },
  'Mistral AI': {
    tagline: 'A French AI lab known for efficient, often openly-weighted language models.',
    description: 'Positioned itself as a European alternative to OpenAI/Anthropic, releasing several of its smaller models under open licenses.',
    whenFirstReleased: '2023',
  },
  xAI: {
    tagline: "Elon Musk's AI company, behind the Grok models.",
    description: 'Positions Grok with real-time access to X (Twitter) data and a more unfiltered conversational style than some competitors.',
    whenFirstReleased: '2023',
  },
  'AI21 Labs': {
    tagline: 'An Israeli AI company known for its Jurassic family of language models.',
    description: 'One of the earlier commercial LLM providers, offering large language models via API before the post-ChatGPT boom.',
    whenFirstReleased: '2017',
  },
  'Stability AI': {
    tagline: 'The company behind Stable Diffusion, championing openly-weighted generative models.',
    description: 'Bet on releasing model weights openly rather than API-only access, in contrast to OpenAI/Anthropic\'s more closed approach.',
    whenFirstReleased: '2019',
  },
  LAION: {
    tagline: 'A nonprofit providing large open datasets used to train AI models.',
    description: 'Its LAION-5B image-text dataset was a key ingredient behind Stable Diffusion and other open text-to-image models.',
    whenFirstReleased: '2021',
  },

  // ====== AI: image / video / creative generation
  'Stable Diffusion': {
    tagline: 'An openly-weighted text-to-image generation model.',
    description: 'Unlike closed competitors, its weights are downloadable and runnable on your own hardware, spawning a huge ecosystem of fine-tunes and tools.',
    whenFirstReleased: '2022',
  },
  Midjourney: {
    tagline: 'A popular text-to-image AI art generator, originally accessed via a Discord bot.',
    description: 'Known for a distinctive, painterly default aesthetic that made it a favourite for concept art and illustration rather than photorealism.',
    whenFirstReleased: '2022',
  },
  Runway: {
    tagline: 'A company building AI-powered creative tools, especially for video generation and editing.',
    description: 'Its Gen-series models were among the first widely available text/image-to-video generation tools for creators.',
    whenFirstReleased: '2018',
  },

  // ====== AI: developer tools / coding assistants
  'Microsoft Copilot': {
    tagline: "Microsoft's brand for AI assistants across its products.",
    description: 'Covers everything from GitHub Copilot\'s code completion to Copilot in Office/Windows, all under one product name.',
    whenFirstReleased: '2021',
  },
  'JetBrains AI Assistant': {
    tagline: "JetBrains IDEs' built-in AI coding assistant.",
    description: 'Adds chat, code completion, and explain/refactor actions directly inside IntelliJ-family IDEs.',
    whenFirstReleased: '2023',
  },
  'Cody AI': {
    tagline: "Sourcegraph's AI coding assistant.",
    description: 'Leans on Sourcegraph\'s code-search/indexing engine to give the assistant context from your whole codebase, not just the open file.',
    whenFirstReleased: '2023',
  },
  Continue: {
    tagline: 'An open-source AI coding assistant you can plug your own model into.',
    description: 'Lets you bring your own LLM (local or hosted) into VS Code/JetBrains instead of being locked to one vendor\'s model.',
    whenFirstReleased: '2023',
  },
  Tabnine: {
    tagline: 'One of the earliest AI code-completion tools.',
    description: 'Started as "Codota" doing Java code completion years before GitHub Copilot existed, later rebranded and expanded to many languages.',
    whenFirstReleased: '2013',
  },
  Safurai: {
    tagline: 'An AI coding assistant extension for editors.',
    description: 'Offers chat-based code explanation, refactoring, and generation similar to other AI pair-programming tools of its generation.',
    whenFirstReleased: '2022',
  },
  MetaMage: {
    tagline: 'An AI coding assistant tool.',
    description: 'Sits alongside tools like Cody and Continue in the AI pair-programming space.',
  },
  Phind: {
    tagline: 'An AI-powered search engine tailored specifically for developers.',
    description: 'Answers coding questions directly with cited sources and runnable code, instead of just linking out to Stack Overflow/docs.',
    whenFirstReleased: '2022',
  },
  'Perplexity.ai': {
    tagline: 'An AI-powered answer engine that cites its sources.',
    description: 'Positions itself as a conversational alternative to traditional search, returning a synthesized answer with linked citations rather than a list of links.',
    whenFirstReleased: '2022',
  },
  'Quora Poe': {
    tagline: "Quora's platform for chatting with many different AI models in one app.",
    description: 'Lets users switch between GPT, Claude, and other providers\' models side by side instead of using each vendor\'s own app.',
    whenFirstReleased: '2022',
  },

  // ====== AI: agents / RAG / "chat with your data"
  LangChain: {
    tagline: 'A framework for building applications powered by LLMs.',
    description: 'Provides building blocks (chains, agents, retrieval) for combining an LLM with your own data and tools, rather than calling a raw completion API directly.',
    whenFirstReleased: '2022',
  },
  AutoGen: {
    tagline: "Microsoft's framework for building multi-agent LLM applications.",
    description: 'Lets multiple specialised AI agents converse with each other to jointly solve a task, instead of relying on one single-agent prompt.',
    whenFirstReleased: '2023',
  },
  Botpress: {
    tagline: 'An open-source platform for building conversational AI chatbots.',
    description: 'Provides a visual flow builder plus NLU on top of any LLM, aimed at building customer-facing chatbots without starting from scratch.',
    whenFirstReleased: '2016',
  },
  Quivr: {
    tagline: 'An open-source "second brain" tool for chatting with your own documents.',
    description: 'A self-hostable retrieval-augmented-generation (RAG) app: upload your files and ask an LLM questions grounded in them.',
    whenFirstReleased: '2023',
  },
  AnythingLLM: {
    tagline: 'An open-source, self-hostable app for chatting with your documents using any LLM.',
    description: 'Bundles a vector database, document ingestion, and a chat UI into one deployable app, letting you swap in whichever model you prefer.',
    whenFirstReleased: '2023',
  },
  RAGFlow: {
    tagline: 'An open-source RAG engine focused on deep document understanding.',
    description: 'Puts extra effort into parsing complex documents (tables, layouts) accurately before retrieval, rather than naive text chunking.',
    whenFirstReleased: '2024',
  },
  Ollama: {
    tagline: 'A tool for running open-weight LLMs locally on your own machine.',
    description: 'Wraps model downloading, quantization, and serving behind one simple CLI/API, making local LLM experimentation as easy as `docker run`.',
    whenFirstReleased: '2023',
  },

  // ====== AI: ML tooling & data science
  Jupyter: {
    tagline: 'An interactive notebook environment for mixing code, output, and text.',
    description: 'Spun out of the earlier IPython Notebook project to support multiple languages ("Julia, Python, R"), and became the standard tool for exploratory data science.',
    whenFirstReleased: '2014',
  },
  PyTorch: {
    tagline: "Meta's widely used deep learning framework.",
    description: 'Favoured in research for its dynamic, "define-by-run" computation graph, which made debugging models far more natural than earlier static-graph frameworks.',
    whenFirstReleased: '2016',
  },
  pandas: {
    tagline: 'The standard Python library for data manipulation and analysis.',
    description: 'Introduced the DataFrame to the Python data ecosystem, becoming as fundamental to data science in Python as NumPy itself.',
    whenFirstReleased: '2008',
  },
  Polars: {
    tagline: 'A fast DataFrame library written in Rust, positioned as a pandas alternative.',
    description: 'Uses multi-threaded, columnar execution to process large datasets significantly faster than pandas\' single-threaded default.',
    whenFirstReleased: '2020',
  },
  Anaconda: {
    tagline: 'A Python/R distribution bundling the data science stack.',
    description: 'Ships NumPy, pandas, Jupyter, and hundreds of other packages preconfigured, sparing you from resolving native-library install headaches yourself.',
    whenFirstReleased: '2012',
  },
  Conda: {
    tagline: 'The package and environment manager behind Anaconda.',
    description: 'Unlike pip, it manages non-Python native dependencies too (compiled C libraries, CUDA, etc.), which is why it dominates in data science/ML setups.',
    whenFirstReleased: '2012',
  },
  Streamlit: {
    tagline: 'A Python framework for quickly building data/ML web apps.',
    description: 'Turns a plain Python script into an interactive web app with just a few extra lines, without needing separate frontend code.',
    whenFirstReleased: '2019',
  },
  Gradio: {
    tagline: 'A Python library for quickly building demo UIs for ML models.',
    description: 'Popular for sharing a quick, shareable web demo of a model (upload an image, get a prediction) with minimal code, often paired with Hugging Face.',
    whenFirstReleased: '2019',
  },
  'Hugging Face': {
    tagline: 'A platform and company hosting ML models, datasets, and the Transformers library.',
    description: 'Became the de facto "GitHub for machine learning models," hosting most openly-available LLMs, vision, and audio models.',
    whenFirstReleased: '2016',
  },
  'Weights & Biases': {
    tagline: 'A platform for tracking and visualizing machine learning experiments.',
    description: 'Logs metrics, hyperparameters, and artifacts across training runs so teams can compare experiments instead of tracking results in spreadsheets.',
    whenFirstReleased: '2018',
  },
  MLflow: {
    tagline: "Databricks' open-source platform for managing the ML lifecycle.",
    description: 'Covers experiment tracking, model packaging, and deployment in one open-source tool, rather than a fully hosted SaaS-only product.',
    whenFirstReleased: '2018',
  },

  // ====== AI-adjacent companies & platforms
  'Boston Dynamics': {
    tagline: 'A robotics company famous for its Atlas and Spot robots.',
    description: 'Known for viral videos of dynamically balancing, highly agile robots, well ahead of most competitors on real-world mobility.',
    whenFirstReleased: '1992',
  },
  Neuralink: {
    tagline: "Elon Musk's brain-computer interface company.",
    description: 'Develops implantable devices aiming to let the brain communicate directly with computers, initially targeting people with paralysis.',
    whenFirstReleased: '2016',
  },
  'Home Assistant': {
    tagline: 'An open-source home automation platform.',
    description: 'Runs locally (rather than depending on a vendor\'s cloud) to tie together smart-home devices from many different brands under one dashboard/automation engine.',
    whenFirstReleased: '2013',
  },
  v7: {
    tagline: 'An AI data-annotation and workflow automation platform (V7 Labs).',
    description: 'Used to label and manage training data for computer-vision models, and to build automated document/data-processing pipelines.',
    whenFirstReleased: '2018',
  },
  Apple: {
    tagline: 'A consumer technology company known for tightly integrated hardware and software.',
    description: 'Makes the Mac, iPhone, and iPad along with macOS/iOS, and has increasingly built AI features ("Apple Intelligence") directly into its own devices.',
    whenFirstReleased: '1976',
  },
  Meta: {
    tagline: 'The parent company of Facebook, Instagram, and WhatsApp.',
    description: "Renamed from Facebook in 2021; also a major open AI research contributor, releasing PyTorch and the Llama model family.",
    whenFirstReleased: '2004',
  },
  'Artificial Intelligence': {
    tagline: 'Building systems that perform tasks normally requiring human intelligence.',
    description: 'Spans everything from classic rule-based systems to today\'s large language and generative models.',
  },
  'Amazon SageMaker': {
    tagline: "AWS's fully managed platform for building, training, and deploying ML models.",
    description: 'Handles the infrastructure (notebooks, training clusters, hosting endpoints) around a model, rather than the model architecture itself.',
    whenFirstReleased: '2017',
  },
  'Amazon Bedrock': {
    tagline: "AWS's managed service for accessing foundation models from multiple providers via one API.",
    description: 'Lets you call models like Claude or Llama through AWS\'s own infrastructure/billing instead of integrating with each vendor\'s API separately.',
    whenFirstReleased: '2023',
  },
  'Amazon Kendra': {
    tagline: "AWS's intelligent enterprise search service.",
    description: 'Uses NLP to return direct answers from internal documents/wikis, instead of just a list of keyword-matched links like classic enterprise search.',
    whenFirstReleased: '2019',
  },
  'Amazon Lex': {
    tagline: "AWS's service for building conversational chatbot interfaces.",
    description: 'Built on the same speech/NLU technology behind Amazon Alexa, exposed as a service for building your own voice or text bots.',
    whenFirstReleased: '2017',
  },
  'Amazon Q': {
    tagline: "AWS's generative AI assistant for work and software development tasks.",
    description: 'Covers both a Copilot-like coding assistant and a business-data chat assistant, both branded under the same "Amazon Q" name.',
    whenFirstReleased: '2023',
  },
  'Angular Material': {
    tagline: "Angular's official UI component library implementing Material Design.",
    description: "Ships ready-made, accessible components matching Google's Material Design system, maintained by the Angular team itself rather than a third party.",
    whenFirstReleased: '2016',
  },
  'React-Bootstrap': {
    tagline: 'Bootstrap components reimplemented as native React components.',
    description: "Replaces Bootstrap's original jQuery-based JS with real React component state, so it behaves correctly in a React app rather than fighting the DOM.",
    whenFirstReleased: '2014',
  },
  Rexx: {
    tagline: 'A scripting language developed by IBM designed to be simple and readable.',
    description: 'Widely used for scripting on IBM mainframes (CMS/TSO) and later OS/2, prized for reading almost like structured English.',
    whenFirstReleased: '1979',
  },
}

export function formatTopicExtendedInfo(info: TopicExtendedInfo): string {
  const parts = [info.tagline, info.description].filter(Boolean)
  const text = parts.join(' ')
  // "since 2016" (rather than "first released: 2016") reads correctly for both products
  // and the many companies/labs/orgs in this dictionary (Anthropic, Apple, Boston Dynamics...).
  return info.whenFirstReleased ? `${text} (since ${info.whenFirstReleased})` : text
}
