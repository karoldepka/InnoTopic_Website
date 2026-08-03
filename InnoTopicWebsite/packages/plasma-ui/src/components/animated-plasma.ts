import { LitElement, css, html } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'

const VERTEX_SRC = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

// Classic demoscene plasma: sum four sine waves (horizontal, vertical, diagonal, radial) and
// map the result through phase-shifted sine curves per RGB channel for a smooth, cycling palette.
const FRAGMENT_SRC = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_scale;

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

  float v = sin(p.x * u_scale + u_time)
          + sin(p.y * u_scale + u_time * 1.2)
          + sin((p.x + p.y) * u_scale + u_time * 0.7)
          + sin(sqrt(p.x * p.x + p.y * p.y) * u_scale * 1.5 - u_time);

  const float pi = 3.14159265;
  vec3 color = 0.5 + 0.5 * vec3(
    sin(v * pi + 0.0),
    sin(v * pi + 2.094395),
    sin(v * pi + 4.18879)
  );

  gl_FragColor = vec4(color, 1.0);
}
`

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) {
    throw new Error('animated-plasma: failed to create shader')
  }
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`animated-plasma: shader compile error: ${info}`)
  }
  return shader
}

/**
 * Renders an animated demoscene-style plasma effect into a full-size WebGL canvas. Fills its
 * host element - size it via CSS (e.g. `width`/`height` or a wrapper with `position: relative`).
 */
@customElement('animated-plasma')
export class AnimatedPlasma extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `

  /** Spatial frequency of the pattern - higher values mean smaller, busier swirls. */
  @property({ type: Number }) scale = 6

  /** Playback speed multiplier. Ignored (treated as 0) when prefers-reduced-motion is set. */
  @property({ type: Number }) speed = 1

  @query('canvas') private canvasEl!: HTMLCanvasElement

  private gl?: WebGLRenderingContext
  private rafId?: number
  private startTime = 0
  private resizeObserver?: ResizeObserver
  private uResolution: WebGLUniformLocation | null = null
  private uTime: WebGLUniformLocation | null = null
  private uScale: WebGLUniformLocation | null = null
  private readonly reducedMotion =
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  protected firstUpdated() {
    this.initGL()
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(this)
    this.resize()
    this.startTime = performance.now()
    this.tick()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this.rafId !== undefined) {
      cancelAnimationFrame(this.rafId)
    }
    this.resizeObserver?.disconnect()
  }

  private initGL() {
    const gl = this.canvasEl.getContext('webgl')
    if (!gl) {
      console.error('animated-plasma: WebGL is not supported in this browser')
      return
    }
    this.gl = gl

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC)
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC)
    const program = gl.createProgram()
    if (!program) {
      throw new Error('animated-plasma: failed to create program')
    }
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`animated-plasma: program link error: ${gl.getProgramInfoLog(program)}`)
    }
    gl.useProgram(program)

    // Full-viewport quad; the shader does all the work per-pixel via gl_FragCoord.
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const positionLoc = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    this.uResolution = gl.getUniformLocation(program, 'u_resolution')
    this.uTime = gl.getUniformLocation(program, 'u_time')
    this.uScale = gl.getUniformLocation(program, 'u_scale')
  }

  private resize() {
    const gl = this.gl
    if (!gl) {
      return
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = Math.max(1, Math.round(this.clientWidth * dpr))
    const height = Math.max(1, Math.round(this.clientHeight * dpr))
    if (this.canvasEl.width !== width || this.canvasEl.height !== height) {
      this.canvasEl.width = width
      this.canvasEl.height = height
      gl.viewport(0, 0, width, height)
    }
  }

  private readonly tick = () => {
    this.rafId = requestAnimationFrame(this.tick)
    const gl = this.gl
    if (!gl) {
      return
    }

    const elapsedSeconds = (performance.now() - this.startTime) / 1000
    const t = elapsedSeconds * (this.reducedMotion ? 0 : this.speed)

    gl.uniform2f(this.uResolution, this.canvasEl.width, this.canvasEl.height)
    gl.uniform1f(this.uTime, t)
    gl.uniform1f(this.uScale, this.scale)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  protected render() {
    return html`<canvas></canvas>`
  }
}
