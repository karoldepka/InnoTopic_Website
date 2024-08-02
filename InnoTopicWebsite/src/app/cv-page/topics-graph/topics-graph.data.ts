import {GraphConnections, LinkByIds} from "./topics-graph.types";

export const size = {
  verySmall: 0.35,
  small: 0.7,
  mid: 1.15,
  medium: 1.15 /* duplicate */,
  big: 1.56,
  veryBig: 2.5,
};

export const sizes = size;

export const strength = {
  ...size,
  veryBig: 4,
};

export const strengths = strength;


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
        sizeMult: size.big,
        connections: {
          Sass: {},
          Stylus: { sizeMult: size.verySmall},
          Less: { sizeMult: size.verySmall},
        }
      },
      JavaScript: {
        sizeMult: size.big,
        connections: {
          'TypeScript': { /*type: 'writtenIn'*/ /* dependsOn / uses */
            sizeMult: size.veryBig,
            strengthMul: 0.4,
          },

          // backend, cloud

          'Frontend': { /*type: 'writtenIn'*/ /* dependsOn / uses */
            strengthMul: 1.5,
            sizeMult: size.veryBig,
            // strengthMul: 0.4,
            connections: {
              Backend: {
                sizeMult: size.veryBig,
                strengthMul: 1.5,
                connections: {
                  Docker: {
                    sizeMult: size.medium,
                  },
                  "Apollo Studio": {},
                  "OpenAPI": {
                    connections: {
                      "Swagger": {},
                    }
                  },
                  // TODO: monitoring, devops,
                  Datadog: {},
                  Ansible: {},


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
              Svelte: {sizeMult: size.medium},
              Qwik: {sizeMult: size.verySmall},
              // Astro: {},
              SolidJS: {
                sizeMult: size.verySmall,
              },
              Ionic: {
                strengthMul: 2,
                sizeMult: size.veryBig,
                connections: {

                  'Angular': {
                    strengthMul: 0.7,
                    sizeMult: size.veryBig,
                    connections: {
                      'Nx': {},
                      // NgRx: { /* does not show icon*/
                      //   strengthMul: 2,
                      // },
                    }
                  },
                  'Vue.js': {
                    strengthMul: 0.5,
                    sizeMult: size.big
                  },
                  'React': { /*...weak*/
                    strengthMul: 0.5,
                    sizeMult: size.veryBig
                  },
                  Mobile: {
                    strengthMul: 1.5,
                    sizeMult: size.big,
                    connections: {
                      Flutter: {},
                      "React Native": {},
                      "NativeScript": {},
                      "Compose Multiplatform": {},
                      iOS: {
                        strengthMul: strength.medium,
                        sizeMult: strength.big,
                        connections: {
                          Swift: {
                            strengthMul: strength.medium,
                            sizeMult: strength.big,
                          }
                        },
                      },
                      Android: {
                        strengthMul: strength.medium,
                        sizeMult: strength.big,
                        connections: {
                          Java: {
                            strengthMul: strength.big,
                            sizeMult: size.big,
                            connections: {
                              "OpenShift": { sizeMult: size.small, strengthMul: strength.veryBig },
                              "Hazelcast": { sizeMult: size.small, strengthMul: strength.veryBig },
                              "Kafka": { sizeMult: size.small, strengthMul: strength.veryBig, },
                              "Spring Boot": {
                                strengthMul: strength.veryBig,
                                sizeMult: size.medium,
                                /* TODO could display old stuff as faded/transparent/grayed */
                                // ...small
                              }
                            }
                          },
                          Kotlin: {},
                        },
                      },
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
                      // "Wasmtime": { sizeMult: size.verySmall, strengthMul: strength.veryBig }, // OFF: does not colorize
                      "Wasmer": { sizeMult: size.verySmall, strengthMul: strength.veryBig },
                      "WebAssembly Package Manager (WAPM)": { sizeMult: size.verySmall, strengthMul: strength.veryBig },
                      AssemblyScript: { sizeMult: size.verySmall, strengthMul: strength.veryBig },
                      // Fermyon too ugly ;)
                    },
                  },
                  Tokio: {},
                  Tonic: {
                    sizeMult: size.verySmall,
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
        sizeMult: size.big,
        connections: {
          SVG: {
            sizeMult: size.big,
            strengthMul: 2,
            connections: {
              GreenSock: {},
              "Affinity Designer": { sizeMult: size.verySmall},
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
