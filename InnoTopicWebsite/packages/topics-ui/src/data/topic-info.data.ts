/**
 * Short (few-sentences) blurbs about topics, shown on click in the UI (see TopicsService.getTopicInfo).
 *
 * Kept separate from topics-data.ts (per #1) so that adding/editing blurbs doesn't require
 * touching the already-huge topic definition file. Keyed by Topic.id (falls back to Topic.name).
 */
export const topicInfoById: Record<string, string> = {
  Angular: 'A TypeScript-based web framework by Google for building single-page applications, with a full toolkit for routing, forms, and dependency injection built in.',
  'Angular Material': "Angular's official UI component library, implementing Google's Material Design system as a set of ready-made, accessible components.",
  HTML5: 'The latest evolution of the standard markup language for structuring content on the web, adding native support for audio, video, canvas, and semantic elements.',
  TypeScript: 'A statically typed superset of JavaScript developed by Microsoft that compiles to plain JS, catching errors at compile time and powering editor tooling like autocomplete.',
  Sass: 'A CSS preprocessor that adds variables, nesting, mixins, and functions on top of plain CSS, compiled down to standard stylesheets.',
  SVG: 'Scalable Vector Graphics: an XML-based format for describing 2D vector images that stay crisp at any resolution and can be styled and animated with CSS/JS.',
  Git: 'A distributed version control system that tracks changes to source code, enabling branching, merging, and collaboration without a central server.',
  GitHub: 'A web-based hosting platform for Git repositories, adding collaboration features like pull requests, issues, and CI/CD via GitHub Actions.',
  WebStorm: 'A JetBrains IDE specialised for JavaScript and TypeScript development, with deep code analysis, refactoring, and debugging support.',
  'Affinity Designer': 'A professional vector graphics editor by Serif, used as an affordable alternative to Adobe Illustrator for icon and illustration work.',
  Figma: 'A collaborative, browser-based design tool for UI/UX design and prototyping, allowing multiple people to edit the same file in real time.',
  WebGL: 'A JavaScript API for rendering interactive 2D and 3D graphics in the browser without plugins, based on OpenGL ES and running on the GPU.',
  glTF: "A royalty-free file format for 3D scenes and models, nicknamed the 'JPEG of 3D' for how efficiently it transmits and loads 3D content.",
  Blender: 'A free, open-source 3D creation suite covering modelling, rigging, animation, simulation, rendering, and video editing.',
  'Web Components': 'A set of browser-native APIs (Custom Elements, Shadow DOM, HTML templates) for building reusable, encapsulated UI elements without a framework.',
  JavaScript: 'The dynamic, prototype-based scripting language that runs natively in every web browser, and via Node.js on the server too.',
  React: 'A component-based JavaScript library by Meta for building user interfaces, popularised by its declarative style and virtual DOM.',
  'Node.js': "A JavaScript runtime built on Chrome's V8 engine that lets JavaScript run outside the browser, commonly used to build servers and CLI tools.",
  Docker: 'A platform for packaging applications and their dependencies into portable, isolated containers that run consistently across environments.',
  RxJS: 'A library for reactive programming using Observables, making it easier to compose asynchronous and event-based code.',
  Ionic: 'An open-source UI toolkit for building cross-platform mobile, desktop, and web apps from a single codebase, commonly paired with Angular, React, or Vue.',
}
