'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import { easing } from 'maath'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  useGLTF,
  Center,
  Caustics,
  Environment,
  Float,
  Lightformer,
  RandomizedLight,
  PerformanceMonitor,
  AccumulativeShadows,
  MeshTransmissionMaterial,
} from '@react-three/drei'
import styles from './FloralExperience3D.module.css'

/* ── Matériau hack face arrière ── */
const innerMaterial = new THREE.MeshStandardMaterial({
  transparent: true,
  opacity: 0.92,
  color: '#0e0d0b',
  roughness: 0,
  side: THREE.FrontSide,
  blending: THREE.AdditiveBlending,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  envMapIntensity: 1.8,
})

export default function FloralExperience3D() {
  const [perfSucks, degrade] = useState(false)
  const sectionRef = useRef(null)
  const containerRef = useRef(null)
  const scrollProgress = useRef(0)
  const ctxRef = useRef(null)

  useEffect(() => {
    const initGSAP = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const section = sectionRef.current
      if (!section) return

      gsap.set('[data-fe3="eyebrow"]', { opacity: 1, y: 0 })
      gsap.set('[data-fe3="line1"]', { opacity: 1, y: 0 })
      gsap.set('[data-fe3="line2"]', { opacity: 1, y: 0 })
      gsap.set('[data-fe3="tag"]', { opacity: 1, y: 0 })
      gsap.set('[data-fe3="text-group"]', { opacity: 1, y: 0 })

      ctxRef.current = gsap.context(() => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: '+=200%',
          pin: true,
          pinSpacing: true,
          scrub: 1.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            scrollProgress.current = self.progress
          },
        })

        const textTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=200%',
            scrub: 1.4,
          }
        })

        textTimeline
          .fromTo('[data-fe3="eyebrow"]', 
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.25 }, 0.10)
          .fromTo('[data-fe3="line1"]', 
            { opacity: 0, y: 36 },
            { opacity: 1, y: 0, duration: 0.30 }, 0.18)
          .fromTo('[data-fe3="line2"]', 
            { opacity: 0, y: 36 },
            { opacity: 1, y: 0, duration: 0.30 }, 0.28)
          .fromTo('[data-fe3="tag"]', 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, stagger: 0.10, duration: 0.25 }, 0.38)
          .to('[data-fe3="text-group"]', 
            { opacity: 0, y: -24, duration: 0.25 }, 0.72)
      }, section)
    }

    initGSAP()

    return () => {
      if (ctxRef.current) ctxRef.current.revert()
    }
  }, [])

  return (
    <div ref={containerRef} className={styles.container}>
      <section
        ref={sectionRef}
        className={styles.section}
        aria-label="Notre artisanat floral — Préservé dans le verre"
      >
        <Canvas
          className={styles.canvas}
          shadows
          dpr={[1, perfSucks ? 1.5 : 2]}
          camera={{ position: [0, 1.2, 8], fov: 28 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          eventPrefix="client"
          frameloop={typeof window !== 'undefined' && !document.hidden ? 'always' : 'demand'}
        >
          <PerformanceMonitor onDecline={() => degrade(true)} />
          <color attach="background" args={['#0c0c0a']} />

          <group position={[0, -0.9, 0]} rotation={[0, -0.2, 0]}>
            <FloralScene />
            <AccumulativeShadows
              frames={80}
              alphaTest={0.82}
              opacity={0.5}
              color="#0e0c07"
              scale={14}
              position={[0, -0.003, 0]}
            >
              <RandomizedLight
                amount={6}
                radius={4}
                ambient={0.35}
                intensity={0.9}
                position={[-1.5, 3, -1.5]}
                bias={0.001}
              />
            </AccumulativeShadows>
          </group>

          <Env perfSucks={perfSucks} />
          <CameraRig scrollProgress={scrollProgress} perfSucks={perfSucks} />
        </Canvas>

        <div className={styles.overlay}>
          <div data-fe3="text-group" className={styles.textGroup}>
            <p data-fe3="eyebrow" className={styles.eyebrow}>
              Artisanat floral
            </p>
            <h2 className={styles.headline} aria-label="Préservée dans le verre.">
              <span data-fe3="line1" className={styles.headLine1}>
                <em>Préservée</em>
              </span>
              <span data-fe3="line2" className={styles.headLine2}>
                dans le verre.
              </span>
            </h2>
            <div className={styles.tags}>
              {['Qualité premium', 'Fraîcheur garantie', 'Préparation jour J'].map(t => (
                <span data-fe3="tag" key={t} className={styles.tag}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ── SCÈNE FLORALE ── */
function FloralScene() {
  return (
    <group>
      <Center top>
        {/* <GlassVase /> */}
        <GlassVase02 />
        {/* Rose existante */}
        {/* <RoseAssembly /> */}
        {/* Fleur séchée du GLB - positionnée à côté */}
        <DriedFlower position={[-0.4, 1.2, 2]} scale={0.8} rotation ={[1, 2, 2]} />
      </Center>
      <FloatingPetals count={10} />
    </group>
  )
}

/* ========== FLEUR SÉCHÉE IMPORTÉE DU GLB ========== */
function DriedFlower({ position = [0, 0, 0], scale = 1 }) {
  const { nodes, materials } = useGLTF('/glass-transformed.glb')
  
  return (
    <group position={position} scale={scale}>
      <Center rotation={[2, -4, -2.6]} top>
        <mesh castShadow geometry={nodes.flowers.geometry} material={materials['draifrawer_u1_v1.001']} />
      </Center>
    </group>
  )
}
/* ================================================= */

function GlassVase() {
  const { outerGeo, innerGeo } = useMemo(() => {
    const buildPoints = (offset = 0) => {
      const pts = []
      for (let i = 0; i <= 28; i++) {
        const t = i / 28
        const body = Math.pow(Math.sin(t * Math.PI), 1.6) * 0.34
        const foot = t < 0.10 ? (0.10 - t) * 0.6 : 0
        const neck = t > 0.88 ? (t - 0.88) * 0.4 : 0
        const radius = 0.09 + body + foot + neck + offset
        const y = t * 2.4 - 0.12
        pts.push(new THREE.Vector2(radius, y))
      }
      return pts
    }
    return {
      outerGeo: new THREE.LatheGeometry(buildPoints(0), 96),
      innerGeo: new THREE.LatheGeometry(buildPoints(-0.022), 96),
    }
  }, [])

  return (
    <>
      <Caustics
        backfaces
        color={[1.0, 0.92, 0.72]}
        focus={[0, -1.1, 0]}
        lightSource={[-1.2, 3.8, -1.8]}
        frustum={1.8}
        intensity={0.005}
        worldRadius={0.085}
        ior={1.04}
        backfaceIor={1.28}
      >
        <mesh castShadow receiveShadow geometry={outerGeo}>
          <MeshTransmissionMaterial
            backside
            backsideThickness={0.14}
            thickness={0.06}
            chromaticAberration={0.025}
            anisotropicBlur={0.85}
            clearcoat={0.75}
            clearcoatRoughness={0.65}
            envMapIntensity={2.2}
            color="#f8efe0"
            samples={8}
          />
        </mesh>
      </Caustics>

      <mesh
        scale={[0.94, 1, 0.94]}
        geometry={outerGeo}
        material={innerMaterial}
      />
      <mesh geometry={innerGeo} material={innerMaterial} />
    </>
  )
}
function GlassVase02() {
  const { outerGeo, innerGeo } = useMemo(() => {
    const buildPoints = (offset = 0) => {
      const pts = []
      const segments = 32 // Augmenté pour plus de précision sur la courbe
      
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        
        // --- PARAMÈTRES DE FORME ---
        
        // 1. La Base : Très large au départ (t=0)
        const beforeBaseFlare = Math.pow(-0.14, 1) * 0.082 
        const baseFlare = Math.pow(1.1 - t, 3) * 0.3 
        
        // 2. Le Milieu : On utilise une courbe en cloche inversée pour serrer
        // Plus le multiplicateur est bas (ex: 0.1), plus la taille est fine
        const middleTight = Math.pow(Math.sin(t * Math.PI), 2) * 0.0515
        
        // 3. La Tête : Large ouverture en haut (t=1)
        // Augmente le 0.8 pour une tête encore plus large
        const topOpen = Math.pow(t, 4) * 0.20 
        
        // Rayon minimal constant pour éviter que le milieu ne soit à zéro
        const minRadius = 0.08 
        
        const radius = minRadius + beforeBaseFlare + baseFlare + middleTight + topOpen + offset
        
        // Hauteur (y)
        const y = t * 2.4 - 0.12
        
        pts.push(new THREE.Vector2(radius, y))
      }
      return pts
    }

    return {
      // 96 segments radiaux assurent un cercle parfaitement lisse
      outerGeo: new THREE.LatheGeometry(buildPoints(0), 96),
      innerGeo: new THREE.LatheGeometry(buildPoints(-0.022), 96),
    }
  }, [])

  return (
    <>
      <Caustics
        backfaces
        color={[1.0, 0.92, 0.72]}
        focus={[0, -1.1, 0]}
        lightSource={[-1.2, 3.8, -1.8]}
        frustum={1.8}
        intensity={0.005}
        worldRadius={0.085}
        ior={1.04}
        backfaceIor={1.28}
      >
        <mesh 
          castShadow 
          receiveShadow 
          geometry={outerGeo} 
          position={[-0.9, 0.2, 1]} 
          scale={[0.56, 0.81, 0.56]} 
          rotation={[0, -1, -0.71]}
        >
          <MeshTransmissionMaterial
            backside
            backsideThickness={0.14}
            thickness={0.06}
            chromaticAberration={0.025}
            anisotropicBlur={0.85}
            clearcoat={0.75}
            clearcoatRoughness={0.65}
            envMapIntensity={2.2}
            color="#f8efe0"
            samples={8}
          />
        </mesh>
      </Caustics>

      {/* Reste du groupe conservant tes positions exactes */}
      <mesh
        geometry={outerGeo}
        material={innerMaterial} 
        position={[-0.9, 0.2, 1]} 
        rotation={[0, -1, -0.71]} 
        scale={[0.61, 0.81, 0.61]}
      />
      <mesh 
        geometry={innerGeo} 
        material={innerMaterial} 
        position={[-0.9, 0.2, 1]} 
        rotation={[0, -1, -0.71]} 
        scale={[0.55, 0.81, 0.55]} 
      />
    </>
  )
}
function RoseAssembly() {
  const stemGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.06, 0.00),
      new THREE.Vector3(0.05, 0.55, 0.03),
      new THREE.Vector3(-0.03, 1.05, -0.02),
      new THREE.Vector3(0.01, 1.48, 0.00),
    ])
    return new THREE.TubeGeometry(curve, 24, 0.013, 7, false)
  }, [])

  const stemMat = useMemo(() =>
    new THREE.MeshStandardMaterial({ color: '#2e4020', roughness: 0.85 }), [])

  return (
    <group>
      <mesh geometry={stemGeo} material={stemMat} castShadow scale={[1,1.8,1]} />
      <Leaf
        position={[-0.09, 2.468, 0.05]}
        rotation={[0.1, 10.4, -0.55]}
        scale={0.85}
      />
      <Leaf
        position={[0.07, 2.494, -0.04]}
        rotation={[-0.1, -10.3, 0.45]}
        scale={0.75}
      />
      <RoseHead position={[0, 2.550, 0]} />
    </group>
  )
}

function RoseHead({ position }) {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.10
  })

  const petalGeo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.bezierCurveTo(0.22, 0.06, 0.26, 0.40, 0, 0.76)
    s.bezierCurveTo(-0.26, 0.40, -0.22, 0.06, 0, 0)
    return new THREE.ShapeGeometry(s, 18)
  }, [])

  const LAYERS = [
    { r: 0.10, n: 5, tilt: 0.60, sc: 0.85 },
    { r: 0.20, n: 6, tilt: 0.44, sc: 1.05 },
    { r: 0.30, n: 7, tilt: 0.30, sc: 1.20 },
    { r: 0.40, n: 8, tilt: 0.18, sc: 1.35 },
  ]

  const mats = useMemo(() =>
    ['#c27858', '#c87f60', '#d08868', '#d89070'].map(color =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.62,
        metalness: 0.0,
        side: THREE.DoubleSide,
      })
    ), [])

  return (
    <group ref={groupRef} position={position}>
      {LAYERS.map(({ r, n, tilt, sc }, li) =>
        Array.from({ length: n }, (_, i) => {
          const angle = (i / n) * Math.PI * 2 + li * 0.42
          return (
            <mesh
              key={`${li}-${i}`}
              geometry={petalGeo}
              material={mats[li]}
              position={[
                Math.sin(angle) * r,
                0,
                Math.cos(angle) * r,
              ]}
              rotation={[Math.PI / 2 - tilt, angle, Math.PI / 2]}
              scale={[sc, sc, 1]}
              castShadow
            />
          )
        })
      )}
      <mesh position={[0, 0.06, 0]}>
        <sphereGeometry args={[0.08, 14, 14]} />
        <meshStandardMaterial color="#a05840" roughness={0.72} />
      </mesh>
    </group>
  )
}

function Leaf({ position, rotation, scale = 1 }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.bezierCurveTo(0.14, 0.05, 0.16, 0.28, 0, 0.52)
    s.bezierCurveTo(-0.16, 0.28, -0.14, 0.05, 0, 0)
    return new THREE.ShapeGeometry(s, 14)
  }, [])

  const mat = useMemo(() =>
    new THREE.MeshStandardMaterial({
      color: '#243818',
      roughness: 0.82,
      side: THREE.DoubleSide,
    }), [])

  return (
    <mesh
      geometry={geo}
      material={mat}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
    />
  )
}

function FloatingPetals({ count = 10 }) {
  const data = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 4.5,
      baseY: Math.random() * 3.2,
      z: (Math.random() - 0.5) * 2.8,
      rx: Math.random() * Math.PI,
      ry: Math.random() * Math.PI * 2,
      speed: 0.08 + Math.random() * 0.14,
      amp: 0.14 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
      sc: 0.45 + Math.random() * 0.55,
    }))
  , [count])

  const petalGeo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.bezierCurveTo(0.09, 0.02, 0.11, 0.18, 0, 0.38)
    s.bezierCurveTo(-0.11, 0.18, -0.09, 0.02, 0, 0)
    return new THREE.ShapeGeometry(s, 10)
  }, [])

  const petalMat = useMemo(() =>
    new THREE.MeshStandardMaterial({
      color: '#cc8060',
      roughness: 0.70,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.70,
    }), [])

  const meshRefs = useRef([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    data.forEach((p, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh) return
      mesh.position.y = p.baseY + Math.sin(t * p.speed + p.phase) * p.amp
      mesh.rotation.x = p.rx + t * p.speed * 0.4
      mesh.rotation.z = Math.sin(t * p.speed * 0.6 + p.phase) * 0.45
    })
  })

  return (
    <group>
      {data.map((p, i) => (
        <mesh
          key={i}
          ref={el => (meshRefs.current[i] = el)}
          geometry={petalGeo}
          material={petalMat}
          position={[p.x, p.baseY, p.z]}
          rotation={[p.rx, p.ry, 0]}
          scale={p.sc}
        />
      ))}
    </group>
  )
}

function CameraRig({ scrollProgress, perfSucks }) {
  useFrame((state, delta) => {
    if (perfSucks) return
    const p = scrollProgress.current

    const angle = p * Math.PI * 0.55
    const dist = 8 - p * 1.2
    const camX = Math.sin(angle) * dist + state.pointer.x * 0.5
    const camY = 1.25 + p * 0.7 + state.pointer.y * 0.25
    const camZ = Math.cos(angle) * dist

    easing.damp3(state.camera.position, [camX, camY, camZ], 0.35, delta)
    state.camera.lookAt(0, 0.8, 0)
  })
  return null
}

function Env({ perfSucks }) {
  const ringRef = useRef()

  useFrame((state, delta) => {
    if (!perfSucks && ringRef.current) {
      easing.damp3(
        ringRef.current.rotation,
        [
          Math.PI / 2,
          0,
          state.clock.elapsedTime / 9 + state.pointer.x * 0.25,
        ],
        0.28,
        delta
      )
    }
  })

  return (
    <Environment
      frames={perfSucks ? 1 : Infinity}
      preset="night"
      resolution={256}
      background={false}
      blur={0.6}
    >
      <Lightformer
        intensity={3.5}
        rotation-x={Math.PI / 2}
        position={[-1, 6, -5]}
        scale={[10, 8, 1]}
        color="#f5e6c0"
      />
      <Lightformer
        intensity={1.8}
        rotation-x={Math.PI / 3}
        position={[3, 4, 2]}
        scale={[5, 4, 1]}
        color="#ffe4b0"
      />
      <group rotation={[Math.PI / 2, 0.9, 0]}>
        {[-2.5, 1.5, 4.5].map((x, i) => (
          <Lightformer
            key={i}
            intensity={0.6}
            rotation={[Math.PI / 4, 0, 0]}
            position={[x, 4, i * 3.5]}
            scale={[3.5, 1, 1]}
            color="#c9a96e"
          />
        ))}
        <Lightformer
          intensity={0.35}
          rotation-y={Math.PI / 2}
          position={[-5, 1, 0]}
          scale={[40, 2, 1]}
          color="#f0e8d0"
        />
      </group>

      <group ref={ringRef}>
        <Lightformer
          intensity={4}
          form="ring"
          color="#c9a96e"
          rotation-y={Math.PI / 2}
          position={[-5, 2, -1]}
          scale={[9, 9, 1]}
        />
      </group>
    </Environment>
  )
}