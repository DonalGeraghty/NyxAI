import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle } from 'ogl'
import './Lightfall.css'

const MAX_COLORS = 8

const hexToRGB = (hex) => {
  const color = hex.replace('#', '').padEnd(6, '0')
  return [
    parseInt(color.slice(0, 2), 16) / 255,
    parseInt(color.slice(2, 4), 16) / 255,
    parseInt(color.slice(4, 6), 16) / 255,
  ]
}

const prepColors = (input) => {
  const base = (input?.length ? input : ['#A6C8FF', '#5227FF', '#FF9FFC']).slice(0, MAX_COLORS)
  const colors = Array.from({ length: MAX_COLORS }, (_, index) => hexToRGB(base[Math.min(index, base.length - 1)]))
  const average = [0, 0, 0]
  for (let index = 0; index < base.length; index += 1) {
    average[0] += colors[index][0]
    average[1] += colors[index][1]
    average[2] += colors[index][2]
  }
  average[0] /= base.length
  average[1] /= base.length
  average[2] /= base.length
  return { colors, count: base.length, average }
}

const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragment = `
precision highp float;

uniform vec3 iResolution;
uniform vec2 iMouse;
uniform float iTime;
uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec3 uColor5;
uniform vec3 uColor6;
uniform vec3 uColor7;
uniform int uColorCount;
uniform vec3 uBgColor;
uniform vec3 uMouseColor;
uniform float uSpeed;
uniform int uStreakCount;
uniform float uStreakWidth;
uniform float uStreakLength;
uniform float uGlow;
uniform float uDensity;
uniform float uTwinkle;
uniform float uZoom;
uniform float uBgGlow;
uniform float uOpacity;
uniform float uMouseEnabled;
uniform float uMouseStrength;
uniform float uMouseRadius;

varying vec2 vUv;

vec3 palette(float h) {
  int count = uColorCount;
  if (count < 1) count = 1;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if (idx <= 0) return uColor0;
  if (idx == 1) return uColor1;
  if (idx == 2) return uColor2;
  if (idx == 3) return uColor3;
  if (idx == 4) return uColor4;
  if (idx == 5) return uColor5;
  if (idx == 6) return uColor6;
  return uColor7;
}

vec3 tanhv(vec3 x) {
  vec3 e = exp(-2.0 * x);
  return (1.0 - e) / (1.0 + e);
}

vec2 sceneC(vec2 frag, vec2 resolution) {
  vec2 point = (frag + frag - resolution) / resolution.x;
  float z = 0.0;
  float distance = 1e3;
  vec4 origin = vec4(0.0);
  for (int index = 0; index < 39; index++) {
    if (distance <= 1e-4) break;
    origin = z * normalize(vec4(point, uZoom, 0.0)) - vec4(0.0, 4.0, 1.0, 0.0) / 4.5;
    distance = 1.0 - sqrt(length(origin * origin));
    z += distance;
  }
  return vec2(origin.x, atan(origin.z, origin.y));
}

void mainImage(out vec4 outputColor, vec2 coordinate) {
  vec2 resolution = iResolution.xy;
  vec2 initialUv = (coordinate + coordinate - resolution) / resolution.x;
  float time = 0.1 * iTime * uSpeed + 9.0;
  float rings = max(1.0, floor(6.28318530718 * max(uDensity, 0.05) + 0.5));
  vec2 cell = vec2(5e-3, 6.28318530718 / rings);

  vec2 center = sceneC(coordinate, resolution);
  vec2 dx = sceneC(coordinate + vec2(1.0, 0.0), resolution) - center;
  vec2 dy = sceneC(coordinate + vec2(0.0, 1.0), resolution) - center;
  dx.y -= 6.28318530718 * floor(dx.y / 6.28318530718 + 0.5);
  dy.y -= 6.28318530718 * floor(dy.y / 6.28318530718 + 0.5);
  vec2 width = abs(dx) + abs(dy);
  coordinate = center;

  vec2 point = vec2(2.0, 1.0) * initialUv - (resolution / resolution.x) * vec2(0.0, 1.0);
  vec4 light = vec4(uBgColor * 90.0 * uBgGlow / (1e3 * dot(point, point) + 6.0), 0.0);

  float mouseGlow = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mouse = (iMouse + iMouse - resolution) / resolution.x;
    float mouseDistance = length(initialUv - mouse);
    mouseGlow = exp(-mouseDistance * mouseDistance / max(uMouseRadius * uMouseRadius, 1e-4)) * uMouseStrength;
    light.rgb += uMouseColor * mouseGlow * 0.25;
  }

  float radius = 5e-4 * uStreakWidth;
  vec2 antialias = vec2(max(length(width), 1e-5));
  float tail = 19.0 / max(uStreakLength, 0.05);

  for (int layer = 0; layer < 16; layer++) {
    if (layer >= uStreakCount) break;
    float layerNumber = float(layer) + 1.0;
    float randomValue = fract(sin(dot(vec2(layerNumber, floor(coordinate.x / cell.x + 0.5)), vec2(7.0, 11.0)) * 73.0));
    vec2 streak = coordinate - (time + time * randomValue) * vec2(0.0, 1.0);
    streak -= floor(streak / cell + 0.5) * cell;
    float hue = fract(8663.0 * randomValue);
    vec3 color = palette(hue);
    float weight = mix(1.5, 1.0 + sin(time + 7.0 * hue + 4.0), uTwinkle);
    weight *= 1.0 + mouseGlow * 2.0;
    vec2 inner = vec2(length(max(streak, vec2(-1.0, 0.0))), length(streak) - radius) - radius;
    vec2 smoothValue = vec2(1.0) - smoothstep(-antialias, antialias, inner);
    light.rgb += dot(smoothValue, vec2(exp(tail * streak.y), 3.0)) * color * weight;
    coordinate.x += cell.x / 8.0;
  }

  vec3 color = sqrt(tanhv(max(light.rgb * uGlow - vec3(0.04, 0.08, 0.02), 0.0)));
  outputColor = vec4(color, uOpacity);
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`

export default function Lightfall({
  className = '',
  dpr,
  paused = false,
  colors = ['#A6C8FF', '#5227FF', '#FF9FFC'],
  backgroundColor = '#0A29FF',
  speed = 0.5,
  streakCount = 2,
  streakWidth = 1,
  streakLength = 1,
  glow = 1,
  density = 0.6,
  twinkle = 1,
  zoom = 3,
  backgroundGlow = 0.5,
  opacity = 1,
  mouseInteraction = true,
  mouseStrength = 0.5,
  mouseRadius = 1,
  mouseDampening = 0.15,
  mixBlendMode,
}) {
  const containerRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const renderer = new Renderer({
      dpr: dpr ?? Math.min(window.devicePixelRatio || 1, 2),
      alpha: true,
      antialias: true,
    })
    const gl = renderer.gl
    const canvas = gl.canvas
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    container.appendChild(canvas)

    const prepared = prepColors(colors)
    const uniforms = {
      iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] },
      iMouse: { value: [0, 0] },
      iTime: { value: 0 },
      uColor0: { value: prepared.colors[0] },
      uColor1: { value: prepared.colors[1] },
      uColor2: { value: prepared.colors[2] },
      uColor3: { value: prepared.colors[3] },
      uColor4: { value: prepared.colors[4] },
      uColor5: { value: prepared.colors[5] },
      uColor6: { value: prepared.colors[6] },
      uColor7: { value: prepared.colors[7] },
      uColorCount: { value: prepared.count },
      uBgColor: { value: hexToRGB(backgroundColor) },
      uMouseColor: { value: prepared.average },
      uSpeed: { value: speed },
      uStreakCount: { value: Math.max(1, Math.min(16, Math.round(streakCount))) },
      uStreakWidth: { value: streakWidth },
      uStreakLength: { value: streakLength },
      uGlow: { value: glow },
      uDensity: { value: density },
      uTwinkle: { value: twinkle },
      uZoom: { value: zoom },
      uBgGlow: { value: backgroundGlow },
      uOpacity: { value: opacity },
      uMouseEnabled: { value: mouseInteraction ? 1 : 0 },
      uMouseStrength: { value: mouseStrength },
      uMouseRadius: { value: mouseRadius },
    }

    const program = new Program(gl, { vertex, fragment, uniforms })
    const geometry = new Triangle(gl)
    const mesh = new Mesh(gl, { geometry, program })

    const resize = () => {
      const bounds = container.getBoundingClientRect()
      renderer.setSize(bounds.width, bounds.height)
      uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1]
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)

    let mouseTarget = [0, 0]
    let lastTime = 0
    const handlePointerMove = (event) => {
      const bounds = canvas.getBoundingClientRect()
      const scale = renderer.dpr || 1
      mouseTarget = [
        (event.clientX - bounds.left) * scale,
        (bounds.height - (event.clientY - bounds.top)) * scale,
      ]
      if (mouseDampening <= 0) uniforms.iMouse.value = mouseTarget
    }
    if (mouseInteraction) canvas.addEventListener('pointermove', handlePointerMove)

    const loop = (time) => {
      animationRef.current = requestAnimationFrame(loop)
      uniforms.iTime.value = time * 0.001
      if (mouseDampening > 0) {
        const delta = lastTime ? (time - lastTime) / 1000 : 0
        const factor = 1 - Math.exp(-delta / Math.max(0.0001, mouseDampening))
        uniforms.iMouse.value[0] += (mouseTarget[0] - uniforms.iMouse.value[0]) * factor
        uniforms.iMouse.value[1] += (mouseTarget[1] - uniforms.iMouse.value[1]) * factor
      }
      lastTime = time
      if (!paused) renderer.render({ scene: mesh })
    }
    animationRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animationRef.current)
      canvas.removeEventListener('pointermove', handlePointerMove)
      observer.disconnect()
      if (container.contains(canvas)) container.removeChild(canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [dpr, paused, colors, backgroundColor, speed, streakCount, streakWidth, streakLength, glow, density, twinkle, zoom, backgroundGlow, opacity, mouseInteraction, mouseStrength, mouseRadius, mouseDampening])

  return (
    <div
      ref={containerRef}
      className={`lightfall-container ${className}`}
      style={mixBlendMode ? { mixBlendMode } : undefined}
      aria-hidden="true"
    />
  )
}
