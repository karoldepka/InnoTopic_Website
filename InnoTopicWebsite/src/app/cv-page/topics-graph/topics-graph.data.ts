import {GraphConnections, LinkByIds} from "./topics-graph.types";

export const size = {
  verySmall: 0.35,
  small: 0.7,
  mid: 1.15,
  big: 1.56,
  veryBig: 2.5,
};

export const strength = {
  ...size,
  veryBig: 4,
};

export const
  veryBigSize = size.veryBig,
  bigSize = size.big,
  midSize = size.mid,
  smallSize = size.small,
  verySmallSize = size.small;

export const nodeConnections: GraphConnections = {
  "InnoTopic" : {
    sizeMult: size.veryBig,
    connections: {
      "Artificial Intelligence": {
        connections: {
          OpenAI: {},
          "Amazon Bedrock": {},
          "Google Gemini": {},
          "Ollama": {},
          "Anthropic": {},
          "LangChain": {},
          "Amazon SageMaker": {},
          "Jupyter": {},
          "Vector Databases": {
            connections: {
              "Qdrant": {},
              "Milvus": {},
              "Pinecone": {},
              "MindsDB": {},
            },
          },
        },
      },
      Ethereum: {
        connections: {
          Solidity: {},
          Bitcoin: {},
        }
      },
      CSS3: {
        sizeMult: bigSize,
        connections: {
          Sass: {},
          Stylus: { sizeMult: smallSize},
          Less: { sizeMult: smallSize},
        }
      },
      JavaScript: {
        sizeMult: bigSize,
        connections: {
          'TypeScript': { /*type: 'writtenIn'*/ /* dependsOn / uses */
            sizeMult: veryBigSize,
            strengthMul: 0.4,
          },

          // backend, cloud

          'Frontend': { /*type: 'writtenIn'*/ /* dependsOn / uses */
            strengthMul: 1.5,
            sizeMult: veryBigSize,
            // strengthMul: 0.4,
            connections: {
              Backend: {
                sizeMult: size.veryBig,
                strengthMul: 1.5,
                connections: {
                  Cloud: {
                    connections: {
                      AWS: {},
                      "GCP - Google Cloud Platform": {},
                      "Microsoft Azure": {},
                      // "Cloud Firestore": {},

                    },
                  },

                  Databases: {
                    connections: {
                      "Cloud Firestore": {},
                      "PostgreSQL": {},
                      "MongoDB": {
                        sizeMult: size.veryBig,
                      },
                      "Supabase": {},
                      "MariaDB": {},
                      "SurrealDB": {},
                    }
                  },
                  Python: {
                    sizeMult: size.veryBig,
                    connections: {
                      Django: {
                        sizeMult: size.veryBig,

                      },
                      Flask: {
                        sizeMult: size.mid
                      },
                      FastAPI: {
                        sizeMult: size.mid
                      },
                    }
                  }
                }
              },
              Svelte: {sizeMult: midSize},
              Qwik: {sizeMult: smallSize},
              // Astro: {},
              SolidJS: {
                sizeMult: smallSize,
              },
              Ionic: {
                strengthMul: 2,
                sizeMult: veryBigSize,
                connections: {

                  'Angular': {
                    strengthMul: 0.7,
                    sizeMult: veryBigSize,
                    connections: {
                      'Nx': {},
                      // NgRx: { /* does not show icon*/
                      //   strengthMul: 2,
                      // },
                    }
                  },
                  'Vue.js': {
                    strengthMul: 0.5,
                    sizeMult: bigSize
                  },
                  'React': { /*...weak*/
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
                            sizeMult: verySmallSize,
                            /* TODO could display old stuff as faded/transparent/grayed */
                            // ...small
                          }
                        }
                      },
                      Kotlin: {},
                    },
                  },
                  'Stencil': {
                    strengthMul: 2,
                    connections: {
                      'Web Components': {},
                    }
                  }
                },
              }
            }
          },
          'Node.js': {},
          Deno: {
            connections: {
              Rust: {
                sizeMult: size.veryBig,
                connections: {
                  "JetBrains RustRover": { sizeMult: size.small },
                  WebAssembly: {
                    connections: {
                      "WebAssembly System Interface (WASI)": { sizeMult: size.verySmall, strengthMul: strength.veryBig},
                      "Wasmtime": { sizeMult: size.verySmall, strengthMul: strength.veryBig },
                      "Wasmer": { sizeMult: size.verySmall, strengthMul: strength.veryBig },
                      "WebAssembly Package Manager (WAPM)": { sizeMult: size.verySmall, strengthMul: strength.veryBig },
                      AssemblyScript: { sizeMult: size.verySmall, strengthMul: strength.veryBig },
                      // Fermyon too ugly ;)
                    },
                  },
                  Tokio: {},
                  Tonic: {
                    sizeMult: smallSize,
                  },
                  Tauri: {},
                  Dioxus: {},
                  Yew: {},
                  // SurrealDB: {},
                  Turbopack: {},
                  Turborepo: {},
                },
                strengthMul: 2,
              },
            }
          },
          Jest: {},
          Redux: {},
          RxJS: {},
          Vite: {
            strengthMul: 0.5,
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
          Netlify: {},
        },
      },
      HTML5: {
        sizeMult: bigSize,
        connections: {
          SVG: {
            sizeMult: bigSize,
            strengthMul: 2,
            connections: {
              GreenSock: {},
              "Affinity Designer": { sizeMult: smallSize},
              Figma: {},
              'D3.js': {},
            }
          },
        },
      },
    }}
};

export const nodeLinks: LinkByIds[] = [
  // {source: 'Web Components', target: 'HTML5'},
  {source: 'Kotlin', target: 'Java'},
  {source: 'Turbopack', target: 'Vercel'},
  {source: 'Turborepo', target: 'Vercel'},
  // {source: 'Angular', target: 'TypeScript', strengthMul: 0.3},
  {source: 'Frontend', target: 'CSS3'},
  {source: 'Frontend', target: 'HTML5'},
  // TODO: introduce a grouping element for "Frontend" (to separate a bit from Node.js, deno)
];

export const preset1 = {
  // forceLinkStrength: 3,
  forceLinkStrength: 0.1,
  // forceManyBodyStrength: -1000,
  forceManyBodyStrength: -50,
};

export const preset = {
  // forceLinkStrength: 3,
  forceLinkStrength: 1,
  // forceManyBodyStrength: -1000,
  forceManyBodyStrength: -200,
  allowZoom: true,
  // allowZoom: false,
};
