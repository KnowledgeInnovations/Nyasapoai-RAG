'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function Hero3D() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const w = mount.clientWidth
    const h = mount.clientHeight

    // ── Renderer ─────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Scene / Camera ────────────────────────────────────────
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 200)
    camera.position.set(12, 11, 12)
    camera.lookAt(0, 4, 0)

    // ── Lights ────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x6080cc, 0.5))

    const goldLight = new THREE.PointLight(0xc8a951, 2.5, 40)
    goldLight.position.set(0, 18, 0)
    scene.add(goldLight)

    const blueLight = new THREE.PointLight(0x4a6fa5, 1.2, 35)
    blueLight.position.set(-10, 6, 10)
    scene.add(blueLight)

    // ── Building helper ───────────────────────────────────────
    function makeBuilding(bw: number, bh: number, bd: number, x: number, z: number, color: number, opacity = 0.85) {
      const geo = new THREE.BoxGeometry(bw, bh, bd)
      const edges = new THREE.EdgesGeometry(geo)
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity })
      const mesh = new THREE.LineSegments(edges, mat)
      mesh.position.set(x, bh / 2, z)
      return mesh
    }

    function makeFloorLine(y: number, color: number, opacity: number) {
      const pts = [
        new THREE.Vector3(-1, y, -1), new THREE.Vector3(1, y, -1),
        new THREE.Vector3(1, y, -1), new THREE.Vector3(1, y, 1),
        new THREE.Vector3(1, y, 1),  new THREE.Vector3(-1, y, 1),
        new THREE.Vector3(-1, y, 1), new THREE.Vector3(-1, y, -1),
      ]
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      return new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity }))
    }

    // ── City group ────────────────────────────────────────────
    const city = new THREE.Group()

    // Main tower — gold
    city.add(makeBuilding(2, 13, 2, 0, 0, 0xc8a951, 0.95))
    // Floor markers on main tower
    for (let fy = 2; fy < 13; fy += 2) {
      city.add(makeFloorLine(fy, 0xc8a951, 0.3))
    }
    // Antenna
    const antGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 13, 0), new THREE.Vector3(0, 16.5, 0),
    ])
    city.add(new THREE.Line(antGeo, new THREE.LineBasicMaterial({ color: 0xc8a951, transparent: true, opacity: 0.5 })))

    // Medium buildings — brand blue
    city.add(makeBuilding(1.6, 8, 1.6,  4.5, 0,    0x003087, 0.75))
    city.add(makeBuilding(1.6, 5.5, 1.6, -4.5, 0,  0x003087, 0.75))
    city.add(makeBuilding(1.6, 7, 1.6,   0, 4.5,   0x003087, 0.75))
    city.add(makeBuilding(1.6, 4.5, 1.6, 0, -4.5,  0x003087, 0.75))

    // Small buildings — dim
    city.add(makeBuilding(1.1, 4, 1.1,   3.5,  3.5, 0x1a2442, 0.65))
    city.add(makeBuilding(1.1, 2.8, 1.1, -3.5, -3.5, 0x1a2442, 0.65))
    city.add(makeBuilding(1.1, 3.2, 1.1, -3.5,  3.5, 0x1a2442, 0.55))
    city.add(makeBuilding(1.1, 3.8, 1.1,  3.5, -3.5, 0x1a2442, 0.55))
    city.add(makeBuilding(0.8, 2,  0.8,   6,   2,   0x0f1629, 0.5))
    city.add(makeBuilding(0.8, 1.5, 0.8, -6,  -2,   0x0f1629, 0.5))

    // Ground grid
    const grid = new THREE.GridHelper(26, 26, 0x1a2442, 0x0d1220)
    city.add(grid)

    scene.add(city)

    // ── Floating particles ────────────────────────────────────
    const COUNT = 160
    const pos = new Float32Array(COUNT * 3)
    const vel = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 24
      pos[i * 3 + 1] = Math.random() * 17
      pos[i * 3 + 2] = (Math.random() - 0.5) * 24
      vel[i] = 0.006 + Math.random() * 0.014
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const pMat = new THREE.PointsMaterial({ size: 0.07, color: 0xc8a951, transparent: true, opacity: 0.65 })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    // ── Resize ────────────────────────────────────────────────
    const onResize = () => {
      const nw = mount.clientWidth
      const nh = mount.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    // ── Animation loop ────────────────────────────────────────
    let animId: number
    let t = 0

    const animate = () => {
      animId = requestAnimationFrame(animate)
      t += 0.01

      city.rotation.y = t * 0.07

      // Float particles up, reset at top
      const arr = pGeo.attributes.position.array as Float32Array
      for (let i = 0; i < COUNT; i++) {
        arr[i * 3 + 1] += vel[i]
        if (arr[i * 3 + 1] > 17) arr[i * 3 + 1] = 0
      }
      pGeo.attributes.position.needsUpdate = true

      // Pulse gold light
      goldLight.intensity = 2 + Math.sin(t * 1.2) * 0.6

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="h-full w-full" />
}
