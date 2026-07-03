// Some files under test transitively import real @Component-decorated Angular classes (e.g.
// OrYoL's TreeModel/TreeListener graph, via type-only-looking imports that esbuild's per-file
// transform can't prove are type-only, so it keeps them as real runtime imports - see
// SupabaseTreeService.spec.ts). Evaluating those classes' decorators can trigger Angular's JIT
// compiler for injectables like PlatformLocation, which isn't loaded by default outside a real
// Angular bootstrap. Load it eagerly so that succeeds instead of throwing on import.
import '@angular/compiler'
