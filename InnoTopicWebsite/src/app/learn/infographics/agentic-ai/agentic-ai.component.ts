import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  OnDestroy,
  signal,
  untracked,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { onThemeStateChange, themeState } from '@innotopic/theme-ui';
import { loadSvgText, recolorRaster, recolorSvg, RecolorOptions, svgDataUrl } from '@innotopic/topics-ui';
import {
  AdditiveBlending,
  AmbientLight,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  ConeGeometry,
  DirectionalLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Object3D,
  PerspectiveCamera,
  QuadraticBezierCurve3,
  Raycaster,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { FeatureFlagsService } from '../../../shared/feature-flags/feature-flags.service';
import { isThemeRecolorableLogo, Topic } from '../../../TopicFriendsShared3/topics-core/Topic';
import { TopicsService } from '../../../TopicFriendsShared3/topics-core/topics.service';
import { TopicTagComponent } from '../../../topics-shared/topic-tag/topic-tag.component';
import {
  AgentEdge,
  AgentEdgeKind,
  agentEdges,
  AgentNode,
  AgentNodeId,
  AgentNodeKind,
  agentNodes,
  agentWalkthrough,
} from './agentic-ai.data';

type ViewMode = '2d' | '3d';
type TooltipSide = 'right' | 'left' | 'above' | 'below' | 'right-up' | 'right-down' | 'left-up' | 'left-down';

/** Fixed accents per kind; 'primary' follows the theme. */
const KIND_COLORS: Record<AgentNodeKind, string> = {
  io: '#64748b',
  core: 'primary',
  loop: 'primary-light',
  guard: '#f59e0b',
  tools: '#10b981',
  memory: '#8b5cf6',
  agents: '#ec4899',
};
const KIND_LABELS: Record<AgentNodeKind, string> = {
  io: 'You',
  core: 'Model',
  loop: 'Agent loop',
  guard: 'Safety',
  tools: 'Environment',
  memory: 'Memory & knowledge',
  agents: 'Delegation',
};
const NODE_RADIUS: Record<AgentNodeKind, number> = {
  io: 0.5, core: 0.78, loop: 0.52, guard: 0.5, tools: 0.62, memory: 0.56, agents: 0.56,
};
const EDGE_COLOR_KIND: Record<AgentEdgeKind, AgentNodeKind> = {
  flow: 'io', loop: 'loop', memory: 'memory', delegate: 'agents',
};
/** Particles per second along an edge, as a fraction of its length. */
const EDGE_SPEED: Record<AgentEdgeKind, number> = { flow: 0.2, loop: 0.24, memory: 0.14, delegate: 0.18 };
const PARTICLES_PER_EDGE = 3;
/** Used when the theme's primary color would blend into a fixed accent (or is gray, e.g. black). */
const FALLBACK_PRIMARY = '#2563eb';

/** A label's size in world units at the diagram's nominal scale (title and summary). */
const LABEL_EXTENT = { width: 2.6, height: 1.0 };
/** Logo badges orbiting a node in 3D: its first examples that have a logo, at most this many. */
const BADGES_PER_NODE = 5;
/** Badge diameter, and the gap from a sphere's surface to its badges' orbit, in world units. */
const BADGE_SIZE = 0.56;
const BADGE_ORBIT_GAP = 0.5;
/** In radians per second. */
const BADGE_ORBIT_SPEED = 0.22;
/** Tilts each orbit (y = tilt * z): from the default angle, it reads as a ring seen from above. */
const BADGE_ORBIT_TILT = -0.36;
/** The default 3D angle (see cameraPose) and how far the user may orbit away from it. */
const VIEW_AZIMUTH_DEG = 16;
const VIEW_ELEVATION_DEG = -8;
const ORBIT_AZIMUTH_RANGE_DEG = 60;
const ORBIT_ELEVATION_RANGE_DEG = 30;
/** Below this scale the flat diagram has no room for label summaries (titles only). */
const SUMMARY_MIN_PX_PER_UNIT = 60;
/** Narrower stages have no room beside the nodes, so the tooltip docks at the bottom. */
const DOCK_BELOW_WIDTH = 900;

const MORPH_MS = 1500;
/** Walk-through steps last long enough to read their tooltip, at about 200 words per minute. */
const WALKTHROUGH_MS_PER_WORD = 300;
const WALKTHROUGH_MIN_STEP_MS = 8000;
const WALKTHROUGH_MAX_STEP_MS = 22000;
const TOKEN_TRAVEL_MS = 1100;

interface NodeView {
  node: AgentNode;
  radius: number;
  mesh: Mesh<SphereGeometry, MeshPhongMaterial>;
  halo: Sprite;
  label: CSS2DObject;
  labelEl: HTMLDivElement;
  /** 0..1, eased towards 1 while hovered or selected. */
  emphasis: number;
  /** 0..1, eased towards 1 while another, unrelated node is selected. */
  dim: number;
}

interface EdgeView {
  edge: AgentEdge;
  tube: Mesh<TubeGeometry, MeshBasicMaterial>;
  arrow: Mesh<ConeGeometry, MeshBasicMaterial>;
  particles: Sprite[];
  curve: QuadraticBezierCurve3;
  /** Visible part of the curve, between the two node spheres (arc-length parameters). */
  tStart: number;
  tEnd: number;
  dim: number;
}

interface Tween {
  start: number;
  duration: number;
  fromMorph: number;
  toMorph: number;
  fromPosition: Vector3;
  toPosition: Vector3;
  fromTarget: Vector3;
  toTarget: Vector3;
}

interface TokenTravel {
  edge: EdgeView;
  start: number;
}

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface LogoImage {
  image: HTMLImageElement;
  /** Width / height. */
  aspect: number;
}

interface BadgeView {
  nodeId: AgentNodeId;
  /** As listed in the node's examples. */
  example: string;
  topic: Topic;
  /** The logo in its original colors; above it, the logo in theme colors, which fades out on hover. */
  sprite: Sprite;
  themedSprite: Sprite;
  /** Position on its node's orbit, in radians. */
  angle: number;
  /** 0..1: how far it has faded to its original colors (while hovered). */
  hover: number;
  /** 0..1, eased towards 1 while hovered. */
  grow: number;
  original?: Promise<LogoImage>;
  themed?: Promise<LogoImage>;
  /** The recolor options `themed` was made with; '' when it is not recolored. */
  themedKey?: string;
  /** Bumped per redraw, so that an outdated one finishing late is dropped. */
  drawRequest: number;
}

/** The flat diagram's extent, spheres and labels included, so the camera can fit all of it. */
function diagramFrame(): { center: Vector3; halfWidth: number; halfHeight: number } {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const { width, height } = LABEL_EXTENT;
  for (const node of agentNodes) {
    const [x, y] = node.position;
    const r = NODE_RADIUS[node.kind];
    const side = node.label ?? 'below';
    minX = Math.min(minX, side === 'right' ? x - r : x - Math.max(r, width / 2));
    maxX = Math.max(maxX, side === 'right' ? x + r + 0.15 + width : x + Math.max(r, width / 2));
    minY = Math.min(minY, side === 'below' ? y - r - 0.15 - height : side === 'right' ? y - Math.max(r, height / 2) : y - r);
    maxY = Math.max(maxY, side === 'above' ? y + r + 0.15 + height : side === 'right' ? y + Math.max(r, height / 2) : y + r);
  }
  const margin = 0.3;
  return {
    center: new Vector3((minX + maxX) / 2, (minY + maxY) / 2, 0),
    halfWidth: (maxX - minX) / 2 + margin,
    halfHeight: (maxY - minY) / 2 + margin,
  };
}

const FRAME = diagramFrame();

/**
 * An interactive three.js diagram of how an AI agent works: the reasoning loop (plan, act, check
 * guardrails, use tools, observe, reflect) between a goal and its result, with memory, retrieval
 * from a knowledge base (RAG) and sub-agents. It morphs between a flat 2D diagram and a 3D view
 * with depth layers, where logos of example technologies orbit their parts; nodes, their labels and
 * the logos open an extended tooltip, and a walk-through tours the loop step by step.
 */
@Component({
  selector: 'app-agentic-ai',
  standalone: true,
  imports: [IonicModule, NgTemplateOutlet, TopicTagComponent],
  templateUrl: './agentic-ai.component.html',
  styleUrls: ['./agentic-ai.component.scss'],
  // The CSS2DRenderer's label elements are created outside the template.
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
    '(document:pointerdown)': 'onDocumentPointerDown($event)',
  },
})
export class AgenticAiComponent implements AfterViewInit, OnDestroy {
  // Not static: the diagram is stamped from a template (inside ion-content, or bare when embedded).
  // Both exist by ngAfterViewInit, the first place they are used.
  @ViewChild('stage') private stageRef!: ElementRef<HTMLDivElement>;
  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tooltip') private tooltipRef?: ElementRef<HTMLElement>;

  /** Just the diagram, for showing it inside another page (e.g. the CV); no page chrome. */
  readonly embedded = input(false);

  protected readonly nodes = agentNodes;
  protected readonly walkthroughLength = agentWalkthrough.length;
  protected readonly kindOrder = Object.keys(KIND_LABELS) as AgentNodeKind[];

  protected readonly mode = signal<ViewMode>('3d');
  protected readonly selectedId = signal<AgentNodeId | null>(null);
  protected readonly selected = computed(() => agentNodes.find(node => node.id === this.selectedId()) ?? null);
  /** Index into agentWalkthrough while the guided tour runs, else null. */
  protected readonly walkthroughStep = signal<number | null>(null);
  protected readonly neighbors = computed(() => {
    const id = this.selectedId();
    if (!id) return [];
    const ids = new Set(agentEdges.flatMap(edge =>
      edge.from === id ? [edge.to] : edge.to === id ? [edge.from] : []));
    return agentNodes.filter(node => ids.has(node.id));
  });
  /** The example whose logo badge opened the tooltip; the tooltip highlights it. */
  protected readonly highlightedExample = signal<string | null>(null);

  private readonly topicsService = inject(TopicsService);
  private readonly flags = inject(FeatureFlagsService);
  private renderer?: WebGLRenderer;
  private labelRenderer?: CSS2DRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(32, 1, 0.1, 200);
  private controls?: OrbitControls;
  private controlsConnected = true;
  private readonly raycaster = new Raycaster();
  private readonly pointer = new Vector2();
  private glowTexture?: CanvasTexture;
  private nodeViews = new Map<AgentNodeId, NodeView>();
  private edgeViews: EdgeView[] = [];
  private token?: Sprite;
  private tokenTravel?: TokenTravel;
  private badges: BadgeView[] = [];
  private badgeNodes = new Set<AgentNodeId>();
  private hoveredBadge?: BadgeView;
  /** The hovered badge's technology name. */
  private badgeLabel?: CSS2DObject;
  private badgeRedrawTimer?: ReturnType<typeof setTimeout>;
  private destroyed = false;
  private readonly scratch = new Vector3();
  private kindColors = new Map<AgentNodeKind, Color>();
  /** Bumped when theme colors change, so the template's color dots re-render. */
  private readonly colorRevision = signal(0);

  /** 0 = flat diagram, 1 = full depth. */
  private morph = 0;
  private builtMorph = -1;
  private tween?: Tween;
  private hoveredId: AgentNodeId | null = null;
  /** Current upward shift of the rendered view, in CSS pixels (see easeViewShift). */
  private viewShift = 0;
  private tooltipSide?: TooltipSide;
  private tooltipSideFor?: AgentNodeId;
  private userMovedCamera = false;
  private dragStartPosition?: Vector3;
  private pointerDown?: { x: number; y: number };
  /** The pointer's last position over the stage. Hover is hit-tested every frame, as badges move. */
  private hoverPointer?: { x: number; y: number; overCanvas: boolean };
  private animationFrame?: number;
  private visible = true;
  private lastFrame = 0;
  private elapsed = 0;
  private walkthroughTimer?: ReturnType<typeof setTimeout>;
  /** When the current walk-through step advances, and how long it had left when paused. */
  private stepEndsAt = 0;
  private stepRemaining?: number;
  private introTimer?: ReturnType<typeof setTimeout>;
  /** The parts-list button that opened the tooltip, to return keyboard focus to on close. */
  private returnFocusTo?: HTMLElement;
  private readonly reducedMotion = typeof matchMedia === 'function'
    && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /** Touch screens start flat: orbiting would capture the swipes meant to scroll the page. */
  private readonly coarsePointer = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private readonly stopThemeSubscriptions: Array<() => void> = [];

  constructor(private readonly zone: NgZone) {
    this.updateKindColors();
    // Like topic logos elsewhere, the badges follow the logo colorization setting.
    effect(() => {
      this.flags.dynamicLogoColorization();
      untracked(() => this.scheduleBadgeRedraw());
    });
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      this.buildScene();
      this.observeStage();
      if (this.coarsePointer) {
        this.placeCamera('2d');
      } else if (this.reducedMotion) {
        this.placeCamera('3d');
      } else {
        // Start flat, then unfold into 3D - showing what the 2D/3D toggle does. The mode is 3D from
        // the start, so the flat intro already shows the titles-only labels of the 3D view.
        this.placeCamera('3d');
        this.morph = 0;
        const flat = this.cameraPose('2d');
        this.camera.position.copy(flat.position);
        this.camera.lookAt(flat.target);
        this.enableControls(false);
        this.introTimer = setTimeout(() => this.animateTo('3d'), 900);
      }
      this.startLoop();
    });
  }

  /**
   * Ionic detaches a page from the document before destroying it. OrbitControls attaches a key
   * listener to its canvas' root node - the document only while attached - so connect and
   * disconnect it while the page is still in the document.
   */
  ionViewWillLeave() {
    this.controls?.disconnect();
    this.controlsConnected = false;
  }

  ionViewWillEnter() {
    if (this.controls && !this.controlsConnected) {
      this.controls.connect(this.canvasRef.nativeElement);
      this.controlsConnected = true;
      this.enableControls(this.controls.enabled);
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.stopLoop();
    clearTimeout(this.walkthroughTimer);
    clearTimeout(this.introTimer);
    clearTimeout(this.badgeRedrawTimer);
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.stopThemeSubscriptions.forEach(stop => stop());
    if (this.controls) {
      this.controls.removeEventListener('start', this.onControlsStart);
      this.controls.removeEventListener('end', this.onControlsEnd);
      this.controls.dispose();
      // In case the page was destroyed without ionViewWillLeave: dispose() removes this listener
      // from the canvas' root node, which is no longer the document once the page is detached.
      const interceptControlDown = (this.controls as unknown as { _interceptControlDown?: EventListener })._interceptControlDown;
      if (interceptControlDown) document.removeEventListener('keydown', interceptControlDown, { capture: true });
    }
    this.scene.traverse(object => {
      const { geometry, material } = object as Partial<Mesh>;
      geometry?.dispose();
      for (const item of Array.isArray(material) ? material : material ? [material] : []) item.dispose();
    });
    this.glowTexture?.dispose();
    for (const badge of this.badges) {
      badge.sprite.material.map?.dispose();
      badge.themedSprite.material.map?.dispose();
    }
    // Release the GPU context now; browsers cap live WebGL contexts per page.
    this.renderer?.forceContextLoss();
    this.renderer?.dispose();
    // Anything three.js keeps (e.g. its WebGL context) holds the canvas; detached, the canvas no
    // longer leads to the page's DOM and, through it, to this component.
    this.canvasRef.nativeElement.remove();
    this.labelRenderer?.domElement.remove();
    // Ionic's router outlet can keep a destroyed page instance reachable for a while; drop the
    // scene graph and three.js objects so such an instance holds next to nothing.
    this.scene.clear();
    this.nodeViews.clear();
    this.edgeViews = [];
    this.badges = [];
    this.hoveredBadge = this.badgeLabel = undefined;
    this.token = this.tokenTravel = this.glowTexture = undefined;
    this.renderer = this.labelRenderer = this.controls = undefined;
  }

  // ---- UI actions (template) ---------------------------------------------------------------

  protected setMode(mode: ViewMode) {
    clearTimeout(this.introTimer);
    this.animateTo(mode);
  }

  protected resetView() {
    clearTimeout(this.introTimer);
    this.select(null);
    this.animateTo(this.mode());
  }

  /**
   * User selection; ends a running walk-through. Choosing the node the tour is showing just ends
   * the tour and keeps its tooltip open; choosing the open node again closes it.
   */
  protected select(id: AgentNodeId | null) {
    const touring = this.walkthroughStep() !== null;
    this.stopWalkthrough();
    if (touring && id && id === this.selectedId()) return;
    this.show(id);
  }

  /** The parts list sits below the diagram: bring the diagram, with the opened tooltip, into view. */
  protected selectFromList(id: AgentNodeId, event: Event) {
    this.select(id);
    if (!this.selectedId()) return;
    this.returnFocusTo = event.currentTarget as HTMLElement;
    this.stageRef.nativeElement.scrollIntoView({ behavior: this.reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
    this.focusTooltip();
  }

  /** Navigation from inside the tooltip (its "connects to" chips) keeps focus in the tooltip. */
  protected selectFromTooltip(id: AgentNodeId) {
    this.select(id);
    this.focusTooltip();
  }

  protected close() {
    this.select(null);
    this.restoreFocus();
  }

  protected toggleWalkthrough() {
    if (this.walkthroughStep() === null) {
      this.goToStep(0);
    } else {
      this.stopWalkthrough();
    }
  }

  protected stepWalkthrough(delta: number) {
    const step = (this.walkthroughStep() ?? -1) + delta;
    if (step < 0 || step >= agentWalkthrough.length) {
      this.stopWalkthrough();
      return;
    }
    this.goToStep(step);
  }

  /** Reading the tooltip (pointer over it, or focus in it) pauses the walk-through's countdown. */
  protected pauseWalkthrough() {
    if (this.walkthroughStep() === null || this.stepRemaining !== undefined) return;
    clearTimeout(this.walkthroughTimer);
    this.stepRemaining = Math.max(0, this.stepEndsAt - performance.now());
  }

  protected resumeWalkthrough() {
    if (this.walkthroughStep() === null || this.stepRemaining === undefined) return;
    this.scheduleNextStep(this.stepRemaining);
  }

  protected onEscape() {
    if (this.walkthroughStep() !== null) this.stopWalkthrough();
    if (this.selectedId()) this.close();
  }

  /** Clicking anywhere outside the diagram and its controls closes the tooltip. */
  protected onDocumentPointerDown(event: PointerEvent) {
    if (!this.selectedId()) return;
    if ((event.target as Element).closest?.('.agentic-stage, .agentic-parts, .agentic-controls')) return;
    this.select(null);
  }

  protected kindColor(kind: AgentNodeKind): string {
    this.colorRevision();
    return '#' + this.kindColors.get(kind)!.getHexString();
  }

  protected kindLabel(kind: AgentNodeKind): string {
    return KIND_LABELS[kind];
  }

  // ---- Selection and walk-through --------------------------------------------------------

  private show(id: AgentNodeId | null) {
    const previous = this.selectedId();
    this.highlightedExample.set(null);
    this.selectedId.set(id === previous ? null : id);
    if (id && previous && id !== previous) this.sendToken(previous, id);
  }

  /** A logo badge opens its node - or keeps it open - with the badge's technology highlighted. */
  private selectBadge(badge: BadgeView) {
    if (badge.nodeId === this.selectedId()) {
      this.stopWalkthrough();
    } else {
      this.select(badge.nodeId);
    }
    this.highlightedExample.set(badge.example);
  }

  private goToStep(step: number) {
    this.highlightedExample.set(null);
    this.walkthroughStep.set(step);
    const id = agentWalkthrough[step];
    const previous = this.selectedId();
    this.selectedId.set(id);
    if (previous && previous !== id) this.sendToken(previous, id);
    const node = agentNodes.find(candidate => candidate.id === id)!;
    const words = [node.summary, ...node.details].join(' ').split(/\s+/).length;
    this.scheduleNextStep(MathUtils.clamp(words * WALKTHROUGH_MS_PER_WORD, WALKTHROUGH_MIN_STEP_MS, WALKTHROUGH_MAX_STEP_MS));
  }

  private scheduleNextStep(delay: number) {
    clearTimeout(this.walkthroughTimer);
    this.stepRemaining = undefined;
    this.stepEndsAt = performance.now() + delay;
    this.walkthroughTimer = setTimeout(() => this.zone.run(() => this.stepWalkthrough(1)), delay);
  }

  private stopWalkthrough() {
    clearTimeout(this.walkthroughTimer);
    this.stepRemaining = undefined;
    this.walkthroughStep.set(null);
  }

  /** Sends a glowing token along the edge between two consecutively shown nodes, if there is one. */
  private sendToken(from: AgentNodeId, to: AgentNodeId) {
    if (this.reducedMotion) return;
    const edge = this.edgeViews.find(view => view.edge.from === from && view.edge.to === to);
    if (edge && this.token) {
      this.tokenTravel = { edge, start: performance.now() };
    }
  }

  /** Moves keyboard focus to the tooltip's heading once it has rendered (or re-rendered). */
  private focusTooltip() {
    setTimeout(() => this.tooltipRef?.nativeElement.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true }));
  }

  private restoreFocus() {
    this.returnFocusTo?.focus({ preventScroll: true });
    this.returnFocusTo = undefined;
  }

  // ---- Scene ------------------------------------------------------------------------------

  private buildScene() {
    const canvas = this.canvasRef.nativeElement;
    const stage = this.stageRef.nativeElement;
    // preserveDrawingBuffer keeps the last frame readable, so printing (and screenshots) include
    // the diagram instead of a blank canvas.
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.domElement.classList.add('agentic-labels');
    stage.appendChild(this.labelRenderer.domElement);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    // The mouse wheel keeps scrolling the page; zoom adds little to a diagram that fits the stage.
    this.controls.enableZoom = false;
    // Orbit within readable angles around the default view, so the flow never reads mirrored.
    this.controls.minAzimuthAngle = MathUtils.degToRad(VIEW_AZIMUTH_DEG - ORBIT_AZIMUTH_RANGE_DEG);
    this.controls.maxAzimuthAngle = MathUtils.degToRad(VIEW_AZIMUTH_DEG + ORBIT_AZIMUTH_RANGE_DEG);
    this.controls.minPolarAngle = MathUtils.degToRad(90 - ORBIT_ELEVATION_RANGE_DEG);
    this.controls.maxPolarAngle = MathUtils.degToRad(90 + ORBIT_ELEVATION_RANGE_DEG);
    this.controls.addEventListener('start', this.onControlsStart);
    this.controls.addEventListener('end', this.onControlsEnd);
    this.enableControls(false);

    this.scene.add(new AmbientLight(0xffffff, 1.6));
    const key = new DirectionalLight(0xffffff, 1.4);
    key.position.set(6, 8, 10);
    this.scene.add(key);

    this.glowTexture = createGlowTexture();

    for (const node of agentNodes) {
      this.nodeViews.set(node.id, this.createNodeView(node));
    }
    this.createBadges();
    for (const edge of agentEdges) {
      this.edgeViews.push(this.createEdgeView(edge));
    }
    this.token = new Sprite(new SpriteMaterial({
      map: this.glowTexture, color: 0xffffff, blending: AdditiveBlending, transparent: true, depthWrite: false, opacity: 0,
    }));
    this.token.scale.setScalar(0.9);
    this.scene.add(this.token);

    this.rebuildEdges();
    this.applyColors();
    this.resize();

    stage.addEventListener('pointermove', this.onPointerMove);
    stage.addEventListener('pointerdown', this.onPointerDown);
    stage.addEventListener('pointerup', this.onPointerUp);
    stage.addEventListener('pointerleave', this.onPointerLeave);

    for (const key of ['ion_color_primary', 'ion_color_secondary'] as const) {
      this.stopThemeSubscriptions.push(onThemeStateChange(key, () => {
        this.updateKindColors();
        this.applyColors();
        this.zone.run(() => this.colorRevision.update(revision => revision + 1));
      }));
    }
    // Badges are drawn in the page's and the nodes' colors, with their logos recolored to the theme.
    for (const key of ['ion_color_primary', 'ion_color_secondary', 'ion_background_color', 'brightness_percent',
      'icon_color_mode', 'icon_contrast', 'icon_brightness'] as const) {
      this.stopThemeSubscriptions.push(onThemeStateChange(key, () => this.scheduleBadgeRedraw()));
    }
  }

  private createNodeView(node: AgentNode): NodeView {
    const radius = NODE_RADIUS[node.kind];
    const mesh = new Mesh(
      new SphereGeometry(radius, 40, 28),
      // Not MeshStandardMaterial: three.js gives it a module-wide lookup texture that keeps a
      // dispose listener into every renderer that used it, so this page could never be freed.
      new MeshPhongMaterial({ shininess: 60, specular: 0x555555, transparent: true }),
    );
    mesh.userData['id'] = node.id;
    this.scene.add(mesh);

    const halo = new Sprite(new SpriteMaterial({
      map: this.glowTexture, blending: AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.45,
    }));
    halo.scale.setScalar(radius * 4);
    this.scene.add(halo);

    const side = node.label ?? 'below';
    const labelEl = document.createElement('div');
    labelEl.className = `agentic-label agentic-label--${node.kind}${side === 'right' ? ' agentic-label--right' : ''}`;
    labelEl.innerHTML = '<span class="agentic-label-title"></span><span class="agentic-label-summary"></span>';
    labelEl.querySelector('.agentic-label-title')!.textContent = node.title;
    labelEl.querySelector('.agentic-label-summary')!.textContent = node.summary;
    labelEl.addEventListener('click', event => {
      event.stopPropagation();
      this.zone.run(() => this.select(node.id));
    });
    const label = new CSS2DObject(labelEl);
    // Anchor the label's edge nearest the sphere at its point: it sits above, below or to the right.
    label.center.set(side === 'right' ? 0 : 0.5, side === 'above' ? 1 : side === 'right' ? 0.5 : 0);
    this.scene.add(label);

    return { node, radius, mesh, halo, label, labelEl, emphasis: 0, dim: 0 };
  }

  private createEdgeView(edge: AgentEdge): EdgeView {
    const material = new MeshBasicMaterial({ transparent: true, opacity: 0.5, depthWrite: false });
    const tube = new Mesh(new TubeGeometry(), material);
    const arrow = new Mesh(new ConeGeometry(0.13, 0.34, 16), new MeshBasicMaterial({ transparent: true }));
    this.scene.add(tube, arrow);
    const particles = Array.from({ length: PARTICLES_PER_EDGE }, () => {
      const particle = new Sprite(new SpriteMaterial({
        map: this.glowTexture, blending: AdditiveBlending, transparent: true, depthWrite: false,
      }));
      particle.scale.setScalar(0.42);
      this.scene.add(particle);
      return particle;
    });
    return { edge, tube, arrow, particles, curve: new QuadraticBezierCurve3(), tStart: 0, tEnd: 1, dim: 0 };
  }

  /** Logos of each node's example technologies, as round badges that orbit it in 3D. */
  private createBadges() {
    agentNodes.forEach((node, nodeIndex) => {
      const examples = (node.examples ?? [])
        .map(example => ({ example, topic: this.topicsService.getTopicByIdIfExisting(example) }))
        .filter(({ topic }) => !!topic?.logo)
        .slice(0, BADGES_PER_NODE);
      examples.forEach(({ example, topic }, index) => {
        // Created in this order, the themed sprite (at the same depth) is drawn over the original.
        const [sprite, themedSprite] = [0, 1].map(() => {
          const badgeSprite = new Sprite(new SpriteMaterial({ transparent: true, depthWrite: false }));
          badgeSprite.visible = false;
          this.scene.add(badgeSprite);
          return badgeSprite;
        });
        this.badges.push({
          nodeId: node.id, example, topic, sprite, themedSprite, hover: 0, grow: 0, drawRequest: 0,
          // Evenly spaced, each node's ring at its own phase. Without motion they stay put, so they
          // spread over the near half of the ring, where the sphere can't hide them.
          angle: this.reducedMotion ? Math.PI * (index + 0.5) / examples.length
            : index / examples.length * Math.PI * 2 + nodeIndex * 0.9,
        });
        this.badgeNodes.add(node.id);
      });
    });
    const labelEl = document.createElement('div');
    labelEl.className = 'agentic-badge-label';
    this.badgeLabel = new CSS2DObject(labelEl);
    this.badgeLabel.center.set(0.5, 1);
    this.badgeLabel.visible = false;
    // Above the node labels, whatever their depth.
    this.badgeLabel.renderOrder = 1;
    this.scene.add(this.badgeLabel);
    this.scheduleBadgeRedraw();
  }

  private scheduleBadgeRedraw() {
    this.zone.runOutsideAngular(() => {
      clearTimeout(this.badgeRedrawTimer);
      // Theme changes reach the page's CSS variables a moment later.
      this.badgeRedrawTimer = setTimeout(() => this.drawBadges(), 50);
    });
  }

  /**
   * Draws each badge's logo on a disc ringed in its node's color: in its original colors on white,
   * as brands design their logos for light backgrounds (a black logo would vanish on a dark theme),
   * and - with dynamic logo colorization on - in the theme's colors on the page's background color.
   */
  private drawBadges() {
    if (this.destroyed || !this.badges.length) return;
    const options: RecolorOptions = {
      primaryColor: themeState.ion_color_primary,
      colorMode: themeState.icon_color_mode,
      secondaryColor: themeState.ion_color_secondary,
      contrast: themeState.icon_contrast,
      brightness: themeState.icon_brightness,
      primaryContrast: themeState.icon_contrast,
    };
    const optionsKey = JSON.stringify(options);
    const colorize = this.flags.dynamicLogoColorization();
    const disc = getComputedStyle(this.stageRef.nativeElement).getPropertyValue('--ion-background-color').trim() || '#ffffff';
    for (const badge of this.badges) {
      const url = badge.topic.logo!;
      const isSvg = /\.svg$/i.test(url);
      // From the SVG text the recolorer downloads anyway, so each logo is fetched once.
      badge.original ??= loadLogo(url, isSvg ? loadSvgText(url).catch(() => undefined) : undefined);
      const themedKey = colorize && isThemeRecolorableLogo(url) ? optionsKey : '';
      if (badge.themedKey !== themedKey) {
        badge.themedKey = themedKey;
        badge.themed = !themedKey ? undefined
          : isSvg ? loadLogo(url, recolorSvg(url, options))
            : recolorRaster(url, options).then(recolored => loadLogo(recolored));
      }
      const request = ++badge.drawRequest;
      const ring = '#' + this.kindColors.get(this.nodeViews.get(badge.nodeId)!.node.kind)!.getHexString();
      Promise.all([badge.original, badge.themed?.catch(() => undefined)]).then(([original, themed]) => {
        if (this.destroyed || request !== badge.drawRequest) return;
        setSpriteMap(badge.sprite, createBadgeTexture(original, '#ffffff', ring));
        setSpriteMap(badge.themedSprite, themed ? createBadgeTexture(themed, disc, ring) : null);
      }, error => console.warn(`agentic-ai: the ${badge.topic.name} logo failed to load`, error));
    }
  }

  private updateKindColors() {
    let primary = new Color(themeState.ion_color_primary || FALLBACK_PRIMARY);
    // Keep the model and the loop distinct from the fixed accents (e.g. a yellow or black primary).
    const fixedAccents = Object.values(KIND_COLORS).filter(value => value.startsWith('#')).map(value => new Color(value));
    const tooClose = fixedAccents.some(accent =>
      Math.hypot(primary.r - accent.r, primary.g - accent.g, primary.b - accent.b) < 0.3);
    if (tooClose || primary.getHSL({ h: 0, s: 0, l: 0 }).s < 0.25) primary = new Color(FALLBACK_PRIMARY);
    for (const kind of Object.keys(KIND_COLORS) as AgentNodeKind[]) {
      const value = KIND_COLORS[kind];
      this.kindColors.set(kind, value === 'primary' ? primary.clone()
        : value === 'primary-light' ? primary.clone().lerp(new Color(0xffffff), 0.3)
          : new Color(value));
    }
  }

  private applyColors() {
    for (const view of this.nodeViews.values()) {
      const color = this.kindColors.get(view.node.kind)!;
      view.mesh.material.color.copy(color);
      view.mesh.material.emissive.copy(color);
      view.halo.material.color.copy(color);
      view.labelEl.style.setProperty('--agentic-kind-color', '#' + color.getHexString());
    }
    for (const view of this.edgeViews) {
      const color = this.kindColors.get(EDGE_COLOR_KIND[view.edge.kind])!;
      view.tube.material.color.copy(color);
      view.arrow.material.color.copy(color);
      view.particles.forEach(particle => particle.material.color.copy(color));
    }
  }

  private positionOf(id: AgentNodeId, target = new Vector3()): Vector3 {
    const [x, y, z] = this.nodeViews.get(id)!.node.position;
    return target.set(x, y, z * this.morph);
  }

  /** Curves, tubes and arrowheads depend on node depths, so they follow the 2D/3D morph. */
  private rebuildEdges() {
    if (this.builtMorph === this.morph) return;
    this.builtMorph = this.morph;
    for (const view of this.nodeViews.values()) {
      const position = this.positionOf(view.node.id);
      view.mesh.position.copy(position);
      view.halo.position.copy(position);
      const side = view.node.label ?? 'below';
      if (side === 'right') {
        // In 3D, clear of the logo badges orbiting the node, too.
        const badges = this.badgeNodes.has(view.node.id) ? this.morph * (BADGE_ORBIT_GAP + BADGE_SIZE * 0.65) : 0;
        view.label.position.set(position.x + view.radius + 0.15 + badges, position.y, position.z);
      } else {
        const offset = (view.radius + 0.15) * (side === 'above' ? 1 : -1);
        view.label.position.set(position.x, position.y + offset, position.z);
      }
    }
    for (const view of this.edgeViews) {
      const from = this.positionOf(view.edge.from);
      const to = this.positionOf(view.edge.to);
      const direction = to.clone().sub(from).normalize();
      const side = new Vector3(-direction.y, direction.x, 0);
      if (side.lengthSq() < 1e-6) side.set(0, 1, 0);
      side.normalize();
      // A quadratic Bezier peaks halfway to its control point, so this bends the curve by `bend`.
      const control = from.clone().add(to).multiplyScalar(0.5).addScaledVector(side, (view.edge.bend ?? 0) * 2);
      view.curve = new QuadraticBezierCurve3(from, control, to);
      const length = view.curve.getLength();
      view.tStart = Math.min(0.45, (this.nodeViews.get(view.edge.from)!.radius + 0.1) / length);
      view.tEnd = Math.max(0.55, 1 - (this.nodeViews.get(view.edge.to)!.radius + 0.12) / length);

      const points = Array.from({ length: 25 }, (_, i) =>
        view.curve.getPointAt(view.tStart + (view.tEnd - view.tStart) * (i / 24)));
      view.tube.geometry.dispose();
      view.tube.geometry = new TubeGeometry(new CatmullRomCurve3(points), 40, 0.035, 6, false);

      const tangent = view.curve.getTangentAt(view.tEnd);
      view.arrow.position.copy(view.curve.getPointAt(view.tEnd)).addScaledVector(tangent, -0.17);
      view.arrow.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), tangent);
    }
  }

  // ---- Camera -----------------------------------------------------------------------------

  private fitDistance(): number {
    const halfFov = MathUtils.degToRad(this.camera.fov / 2);
    const byWidth = FRAME.halfWidth / (Math.tan(halfFov) * this.camera.aspect);
    const byHeight = FRAME.halfHeight / Math.tan(halfFov);
    return Math.max(byWidth, byHeight) * 1.04;
  }

  private cameraPose(mode: ViewMode, sway = 0): { position: Vector3; target: Vector3 } {
    const target = FRAME.center.clone();
    const distance = this.fitDistance();
    if (mode === '2d') {
      return { position: target.clone().add(new Vector3(0, 0, distance)), target };
    }
    // To the side and slightly below: of the angles that show the depth layers, this one (with
    // the node layout) keeps every sphere and label clear of the others while it sways.
    const elevation = MathUtils.degToRad(VIEW_ELEVATION_DEG);
    const azimuth = MathUtils.degToRad(VIEW_AZIMUTH_DEG + sway);
    const radius = distance * 1.08;
    return {
      position: target.clone().add(new Vector3(
        radius * Math.cos(elevation) * Math.sin(azimuth),
        radius * Math.sin(elevation),
        radius * Math.cos(elevation) * Math.cos(azimuth),
      )),
      target,
    };
  }

  private placeCamera(mode: ViewMode) {
    this.morph = mode === '3d' ? 1 : 0;
    const pose = this.cameraPose(mode);
    this.camera.position.copy(pose.position);
    this.controls!.target.copy(pose.target);
    this.camera.lookAt(pose.target);
    this.enableControls(mode === '3d');
    this.zone.run(() => this.mode.set(mode));
  }

  /** Orbiting needs every touch; the flat diagram lets touches scroll the page instead. */
  private enableControls(enabled: boolean) {
    this.controls!.enabled = enabled;
    this.canvasRef.nativeElement.style.touchAction = enabled ? 'none' : 'pan-y';
  }

  private animateTo(mode: ViewMode) {
    this.zone.run(() => this.mode.set(mode));
    this.userMovedCamera = false;
    this.enableControls(false);
    const pose = this.cameraPose(mode);
    this.tween = {
      start: performance.now(),
      duration: this.reducedMotion ? 0 : MORPH_MS,
      fromMorph: this.morph,
      toMorph: mode === '3d' ? 1 : 0,
      fromPosition: this.camera.position.clone(),
      toPosition: pose.position,
      fromTarget: this.controls!.target.clone(),
      toTarget: pose.target,
    };
  }

  /** OrbitControls reports 'start' on any press, so only a real drag ends the idle sway. */
  private readonly onControlsStart = () => {
    this.dragStartPosition = this.camera.position.clone();
    this.canvasRef.nativeElement.style.cursor = 'grabbing';
  };

  /** The next frame's updateHover() sets the cursor again. */
  private readonly onControlsEnd = () => {
    if (this.dragStartPosition && this.camera.position.distanceTo(this.dragStartPosition) > 1e-3) {
      this.userMovedCamera = true;
    }
    this.dragStartPosition = undefined;
  };

  // ---- Frame loop -------------------------------------------------------------------------

  private startLoop() {
    if (this.animationFrame !== undefined) return;
    this.lastFrame = performance.now();
    const frame = (now: number) => {
      this.animationFrame = requestAnimationFrame(frame);
      const delta = Math.min(0.1, (now - this.lastFrame) / 1000);
      this.lastFrame = now;
      this.elapsed += delta;
      this.update(now, delta);
      this.renderer!.render(this.scene, this.camera);
      this.labelRenderer!.render(this.scene, this.camera);
      this.positionTooltip();
      this.updateHover();
    };
    this.animationFrame = requestAnimationFrame(frame);
  }

  private stopLoop() {
    if (this.animationFrame !== undefined) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = undefined;
  }

  private update(now: number, delta: number) {
    if (this.tween) {
      const progress = this.tween.duration ? Math.min(1, (now - this.tween.start) / this.tween.duration) : 1;
      const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      this.morph = MathUtils.lerp(this.tween.fromMorph, this.tween.toMorph, eased);
      this.camera.position.lerpVectors(this.tween.fromPosition, this.tween.toPosition, eased);
      this.controls!.target.lerpVectors(this.tween.fromTarget, this.tween.toTarget, eased);
      this.camera.lookAt(this.controls!.target);
      if (progress >= 1) {
        this.tween = undefined;
        this.enableControls(this.mode() === '3d');
      }
    } else if (this.mode() === '3d') {
      // Sway gently until the user takes over, so the depth reads without spinning the labels away.
      if (!this.userMovedCamera && !this.reducedMotion && !this.dragStartPosition) {
        const pose = this.cameraPose('3d', 8 * Math.sin(this.elapsed * 0.25));
        this.camera.position.copy(pose.position);
        this.controls!.target.copy(pose.target);
      }
      this.controls!.update();
    }
    this.rebuildEdges();

    const selected = this.selectedId();
    const related = new Set<AgentNodeId>(selected ? [selected, ...this.neighbors().map(node => node.id)] : []);
    const ease = 1 - Math.exp(-delta * 10);
    const pulse = this.reducedMotion ? 0 : Math.sin(this.elapsed * 2.4);

    for (const view of this.nodeViews.values()) {
      const id = view.node.id;
      view.emphasis += ((id === this.hoveredId || id === selected ? 1 : 0) - view.emphasis) * ease;
      view.dim += ((selected && !related.has(id) ? 1 : 0) - view.dim) * ease;
      view.mesh.scale.setScalar(1 + 0.2 * view.emphasis);
      view.mesh.material.emissiveIntensity = 0.28 + 0.55 * view.emphasis;
      view.mesh.material.opacity = 1 - 0.65 * view.dim;
      view.halo.material.opacity = (0.32 + 0.06 * pulse + 0.35 * view.emphasis) * (1 - 0.8 * view.dim);
      view.halo.scale.setScalar(view.radius * (3.6 + 0.25 * pulse + 1.2 * view.emphasis));
      view.labelEl.classList.toggle('agentic-label--active', id === selected);
      view.labelEl.style.opacity = String(1 - 0.6 * view.dim);
    }

    for (const view of this.edgeViews) {
      const touchesSelection = !!selected && (view.edge.from === selected || view.edge.to === selected);
      view.dim += ((selected && !touchesSelection ? 1 : 0) - view.dim) * ease;
      view.tube.material.opacity = (touchesSelection ? 0.85 : 0.45) * (1 - 0.75 * view.dim);
      view.arrow.material.opacity = view.tube.material.opacity;
      const speed = EDGE_SPEED[view.edge.kind] * (touchesSelection ? 1.8 : 1);
      view.particles.forEach((particle, index) => {
        // Reduced motion: keep the particles as static markers spread along the edge.
        const offset = index / PARTICLES_PER_EDGE;
        const u = this.reducedMotion ? offset + 0.15 : (this.elapsed * speed + offset) % 1;
        particle.position.copy(view.curve.getPointAt(view.tStart + (view.tEnd - view.tStart) * u));
        particle.material.opacity = Math.sin(Math.PI * u) * (touchesSelection ? 1 : 0.75) * (1 - 0.85 * view.dim);
        particle.scale.setScalar(touchesSelection ? 0.6 : 0.42);
      });
    }

    // Logo badges orbit their node in 3D on a tilted ring, passing in front of it and behind it.
    const fadeMs = this.reducedMotion ? 0 : Number(this.flags.logoHoverFadeMs()) || 0;
    for (const badge of this.badges) {
      const view = this.nodeViews.get(badge.nodeId)!;
      // A hovered badge stops its ring, so it holds still to be clicked.
      if (!this.reducedMotion && this.hoveredBadge?.nodeId !== badge.nodeId) badge.angle += delta * BADGE_ORBIT_SPEED;
      const hovered = badge === this.hoveredBadge ? 1 : 0;
      badge.hover = fadeMs ? MathUtils.clamp(badge.hover + (hovered ? 1 : -1) * delta * 1000 / fadeMs, 0, 1) : hovered;
      badge.grow += (hovered - badge.grow) * ease;
      const orbit = view.radius + BADGE_ORBIT_GAP;
      const cos = Math.cos(badge.angle), sin = Math.sin(badge.angle);
      const { sprite, themedSprite } = badge;
      sprite.position.copy(view.mesh.position).add(this.scratch.set(cos * orbit, BADGE_ORBIT_TILT * sin * orbit, sin * orbit));
      sprite.scale.setScalar(BADGE_SIZE * (1 + 0.25 * badge.grow));
      sprite.material.opacity = this.morph * (1 - 0.75 * view.dim);
      sprite.visible = !!sprite.material.map && sprite.material.opacity > 0.01;
      // Fading the theme-colored copy out reveals the original colors beneath.
      themedSprite.position.copy(sprite.position);
      themedSprite.scale.copy(sprite.scale);
      themedSprite.material.opacity = sprite.material.opacity * (1 - badge.hover);
      themedSprite.visible = sprite.visible && !!themedSprite.material.map && badge.hover < 1;
    }
    if (this.badgeLabel) {
      const badge = this.hoveredBadge;
      this.badgeLabel.visible = !!badge;
      if (badge) {
        const element = this.badgeLabel.element;
        if (element.textContent !== badge.topic.name) element.textContent = badge.topic.name;
        const up = this.scratch.setFromMatrixColumn(this.camera.matrixWorld, 1);
        this.badgeLabel.position.copy(badge.sprite.position).addScaledVector(up, badge.sprite.scale.y / 2 + 0.06);
      }
    }

    if (this.tokenTravel && this.token) {
      const { edge, start } = this.tokenTravel;
      const progress = Math.min(1, (now - start) / TOKEN_TRAVEL_MS);
      this.token.position.copy(edge.curve.getPointAt(edge.tStart + (edge.tEnd - edge.tStart) * progress));
      this.token.material.color.copy(edge.tube.material.color).lerp(new Color(0xffffff), 0.5);
      this.token.material.opacity = Math.sin(Math.PI * progress);
      if (progress >= 1) this.tokenTravel = undefined;
    } else if (this.token) {
      this.token.material.opacity = 0;
    }
  }

  /**
   * Keeps the extended tooltip next to its node, on the side where it covers least of the node,
   * its label and the neighbours its selection highlights. Narrow stages dock it at the bottom.
   */
  private positionTooltip() {
    const tooltip = this.tooltipRef?.nativeElement;
    const id = this.selectedId();
    const stage = this.stageRef.nativeElement;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const docked = width < DOCK_BELOW_WIDTH;
    // A docked tooltip covers the bottom of the stage, so lift the diagram into the space above it.
    this.easeViewShift(tooltip && id && docked ? Math.min(tooltip.offsetHeight, height * 0.55) / 2 : 0, width, height);
    if (!tooltip || !id) return;
    tooltip.classList.toggle('agentic-tooltip--docked', docked);
    // Hidden by CSS until placed here, so it never flashes at its unpositioned origin.
    tooltip.style.visibility = 'visible';
    if (docked) {
      tooltip.style.transform = '';
      return;
    }

    const sphereRect = (nodeId: AgentNodeId): Rect => {
      const view = this.nodeViews.get(nodeId)!;
      const center = view.mesh.getWorldPosition(new Vector3());
      const edge = center.clone()
        .add(new Vector3().setFromMatrixColumn(this.camera.matrixWorld, 0).multiplyScalar(view.radius * view.mesh.scale.x))
        .project(this.camera);
      center.project(this.camera);
      const x = (center.x + 1) / 2 * width;
      const y = (1 - center.y) / 2 * height;
      const r = Math.abs((edge.x + 1) / 2 * width - x);
      return { left: x - r, top: y - r, right: x + r, bottom: y + r };
    };
    const stageBox = stage.getBoundingClientRect();
    const labelRect = (nodeId: AgentNodeId): Rect => {
      const box = this.nodeViews.get(nodeId)!.labelEl.getBoundingClientRect();
      return { left: box.left - stageBox.left, top: box.top - stageBox.top, right: box.right - stageBox.left, bottom: box.bottom - stageBox.top };
    };
    // The selected node reads as its sphere plus its label, so place the tooltip beside both.
    const sphere = sphereRect(id);
    const label = labelRect(id);
    const nodeBox: Rect = {
      left: Math.min(sphere.left, label.left), top: Math.min(sphere.top, label.top),
      right: Math.max(sphere.right, label.right), bottom: Math.max(sphere.bottom, label.bottom),
    };
    const neighborIds = new Set(this.neighbors().map(neighbor => neighbor.id));
    // What the tooltip should not cover, by importance: the node, the neighbours its selection
    // highlights, then everything else.
    const avoid: Array<[Rect, number]> = [[nodeBox, 10]];
    for (const otherId of this.nodeViews.keys()) {
      if (otherId === id) continue;
      const weight = neighborIds.has(otherId) ? 3 : 0.5;
      avoid.push([sphereRect(otherId), weight], [labelRect(otherId), weight * 0.7]);
    }
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    const gap = 14;
    const cx = (sphere.left + sphere.right) / 2;
    const cy = (sphere.top + sphere.bottom) / 2;
    const place = (side: TooltipSide): Rect => {
      const toRight = side.startsWith('right'), toLeft = side.startsWith('left');
      let left = toRight ? nodeBox.right + gap : toLeft ? nodeBox.left - gap - tooltipWidth : cx - tooltipWidth / 2;
      let top = side === 'above' ? nodeBox.top - gap - tooltipHeight
        : side === 'below' ? nodeBox.bottom + gap
          : side.endsWith('-up') ? nodeBox.bottom - tooltipHeight
            : side.endsWith('-down') ? nodeBox.top
              : cy - tooltipHeight / 2;
      left = MathUtils.clamp(left, 8, Math.max(8, width - tooltipWidth - 8));
      top = MathUtils.clamp(top, 8, Math.max(8, height - tooltipHeight - 8));
      return { left, top, right: left + tooltipWidth, bottom: top + tooltipHeight };
    };
    const cost = (rect: Rect) => avoid.reduce((sum, [box, weight]) => sum + weight * overlapArea(rect, box), 0);
    const sides: TooltipSide[] = ['right', 'left', 'right-down', 'right-up', 'left-down', 'left-up', 'below', 'above'];
    const best = sides.reduce((a, b) => cost(place(b)) < cost(place(a)) ? b : a);
    // Stick with the current side unless another is clearly better, so it doesn't flip while swaying.
    if (this.tooltipSideFor !== id || !this.tooltipSide || cost(place(best)) < cost(place(this.tooltipSide)) * 0.7 - 1) {
      this.tooltipSide = best;
      this.tooltipSideFor = id;
    }
    const rect = place(this.tooltipSide);
    tooltip.style.transform = `translate(${Math.round(rect.left)}px, ${Math.round(rect.top)}px)`;
  }

  /** Shifts the rendered view up by `target` pixels, easing there over a few frames. */
  private easeViewShift(target: number, width: number, height: number) {
    const shift = Math.abs(target - this.viewShift) < 0.5 ? target : this.viewShift + (target - this.viewShift) * 0.2;
    if (shift === this.viewShift) return;
    this.viewShift = shift;
    if (shift) this.camera.setViewOffset(width, height, 0, shift, width, height);
    else this.camera.clearViewOffset();
  }

  // ---- Sizing and visibility --------------------------------------------------------------

  private observeStage() {
    const stage = this.stageRef.nativeElement;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(stage);
    // No point rendering frames nobody can see.
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      if (this.visible) this.startLoop();
      else this.stopLoop();
    });
    this.intersectionObserver.observe(stage);
  }

  private resize() {
    const stage = this.stageRef.nativeElement;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height || !this.renderer) return;
    this.renderer.setSize(width, height, false);
    this.labelRenderer!.setSize(width, height);
    this.camera.aspect = width / height;
    // The view offset is sized to the stage; the next frame re-applies it at the new size.
    this.viewShift = 0;
    this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
    // Label summaries need room: show them only where the fitted diagram is drawn large enough.
    const pixelsPerUnit = height / (2 * Math.tan(MathUtils.degToRad(this.camera.fov / 2)) * this.fitDistance());
    stage.classList.toggle('agentic-stage--compact', pixelsPerUnit < SUMMARY_MIN_PX_PER_UNIT);
    if (!this.tween && !this.userMovedCamera) {
      const pose = this.cameraPose(this.mode());
      this.camera.position.copy(pose.position);
      this.controls!.target.copy(pose.target);
      this.camera.lookAt(pose.target);
    }
  }

  // ---- Pointer ----------------------------------------------------------------------------

  /** The node sphere or logo badge at a point in the page, nearest first. */
  private hitTest(clientX: number, clientY: number): { id: AgentNodeId; badge?: BadgeView } | null {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.pointer.set((clientX - rect.left) / rect.width * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const targets: Object3D[] = [...this.nodeViews.values()].map(view => view.mesh);
    // Badges fade in with depth; dimmed, they still open their node, like its sphere.
    if (this.morph > 0.5) {
      for (const badge of this.badges) if (badge.sprite.visible) targets.push(badge.sprite);
    }
    const hit = this.raycaster.intersectObjects(targets, false)[0];
    if (!hit) return null;
    const badge = this.badges.find(candidate => candidate.sprite === hit.object);
    return badge ? { id: badge.nodeId, badge } : { id: hit.object.userData['id'] as AgentNodeId };
  }

  /** Runs every frame: badges move under the pointer even while it rests. */
  private updateHover() {
    if (this.dragStartPosition) return;
    const pointer = this.hoverPointer;
    const hit = pointer?.overCanvas ? this.hitTest(pointer.x, pointer.y) : null;
    this.hoveredId = hit && !hit.badge ? hit.id : null;
    this.hoveredBadge = hit?.badge;
    // On the canvas, not the stage, so the tooltip and labels keep their own cursors.
    const canvas = this.canvasRef.nativeElement;
    const cursor = hit ? 'pointer' : this.mode() === '3d' ? 'grab' : '';
    if (canvas.style.cursor !== cursor) canvas.style.cursor = cursor;
  }

  private readonly onPointerMove = (event: PointerEvent) => {
    const overCanvas = !(event.target as Element).closest('.agentic-tooltip, .agentic-label');
    this.hoverPointer = { x: event.clientX, y: event.clientY, overCanvas };
  };

  private readonly onPointerDown = (event: PointerEvent) => {
    this.pointerDown = { x: event.clientX, y: event.clientY };
  };

  /** A click (not a camera drag) selects the node or badge under the pointer, or clears the selection. */
  private readonly onPointerUp = (event: PointerEvent) => {
    const start = this.pointerDown;
    this.pointerDown = undefined;
    if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) return;
    if ((event.target as Element).closest('.agentic-tooltip, .agentic-label')) return;
    const hit = this.hitTest(event.clientX, event.clientY);
    this.zone.run(() => hit?.badge ? this.selectBadge(hit.badge) : this.select(hit?.id ?? null));
  };

  private readonly onPointerLeave = () => {
    this.hoverPointer = undefined;
  };
}

function setSpriteMap(sprite: Sprite, map: CanvasTexture | null) {
  sprite.material.map?.dispose();
  sprite.material.map = map;
  sprite.material.needsUpdate = true;
}

/** Loads a logo and its aspect ratio; from its SVG markup, when given (falling back to `url`). */
async function loadLogo(url: string, markup?: Promise<string | undefined>): Promise<LogoImage> {
  const svg = await markup;
  const image = new Image();
  image.decoding = 'async';
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Image failed to load: ${url.slice(0, 120)}`));
    image.src = svg ? svgDataUrl(svg) : url;
  });
  const natural = image.naturalWidth && image.naturalHeight ? image.naturalWidth / image.naturalHeight : 1;
  return { image, aspect: (svg && svgAspect(svg)) || natural };
}

/**
 * An SVG's aspect ratio (width / height), from its root's width and height, else its viewBox - an
 * SVG without a size of its own has none an image could report.
 */
function svgAspect(markup: string): number | undefined {
  const root = /<svg\b[^>]*>/i.exec(markup)?.[0] ?? '';
  const size = (name: string) => new RegExp(`\\s${name}\\s*=\\s*["']?\\s*([\\d.]+)(%?)`, 'i').exec(root);
  const width = size('width'), height = size('height');
  if (width && height && !width[2] && !height[2] && +width[1] > 0 && +height[1] > 0) return +width[1] / +height[1];
  const viewBox = /\sviewBox\s*=\s*["']([^"']+)["']/i.exec(root)?.[1].trim().split(/[\s,]+/).map(Number);
  return viewBox?.length === 4 && viewBox[2] > 0 && viewBox[3] > 0 ? viewBox[2] / viewBox[3] : undefined;
}

/** A round badge: the logo on a disc, ringed in its node's color. */
function createBadgeTexture({ image, aspect }: LogoImage, disc: string, ring: string): CanvasTexture {
  const size = 128;
  const line = 6;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d')!;
  context.beginPath();
  context.arc(size / 2, size / 2, size / 2 - line / 2 - 1, 0, Math.PI * 2);
  context.fillStyle = disc;
  context.fill();
  context.lineWidth = line;
  context.strokeStyle = ring;
  context.stroke();
  // The largest box of the logo's aspect ratio that fits inside the ring, less some padding.
  const inner = (size - 2 * line) * 0.78;
  const diagonal = Math.hypot(aspect, 1);
  const width = inner * aspect / diagonal;
  const height = inner / diagonal;
  context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function overlapArea(a: Rect, b: Rect): number {
  const width = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return width > 0 && height > 0 ? width * height : 0;
}

/** A soft white radial glow, tinted per sprite via its material color. */
function createGlowTexture(): CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d')!;
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.25, 'rgba(255,255,255,0.6)');
  gradient.addColorStop(0.6, 'rgba(255,255,255,0.15)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}
