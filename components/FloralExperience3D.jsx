'use client'

import { useEffect, useRef, useState, useMemo, Suspense } from 'react'
import * as THREE from 'three'
import { easing } from 'maath'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  useGLTF,
  Center,
  Html,
  Caustics,
  Environment,
  Lightformer,
  RandomizedLight,
  PerformanceMonitor,
  AccumulativeShadows,
  MeshTransmissionMaterial,
} from '@react-three/drei'
import styles from './FloralExperience3D.module.css'

/* ── Matériau hack face arrière (Fidèle à l'original) ── */
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
  const scrollProgress = useRef(0)
  const ctxRef = useRef(null)

  useEffect(() => {
    const initGSAP = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const section = sectionRef.current
      if (!section) return

      ctxRef.current = gsap.context(() => {
        // VITESSE : +=120% pour un scroll plus court/rapide
        const scrollDistance = '+=120%'

        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: scrollDistance,
          pin: true,
          pinSpacing: true,
          scrub: 0.8, // Plus réactif
          onUpdate: (self) => {
            // scrollProgress.current = self.progress
          },
        })

        // NOUVEAU : Un deuxième trigger pour la caméra uniquement
        ScrollTrigger.create({
          trigger: section,
          // Commence quand le BAS de la section entre par le BAS de l'écran
          start: 'top bottom', 
          // Se termine quand la section est totalement sortie par le haut
          end: 'bottom top',
          onUpdate: (self) => {
            // Cette valeur passera de 0 à 1 pendant que l'utilisateur 
            // fait défiler la page pour ARRIVER à la section.
            scrollProgress.current = self.progress 
          }
        })

        const textTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: scrollDistance,
            scrub: 0.6,
          },
        })

        textTimeline
          .fromTo('[data-fe3="eyebrow"]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.25 }, 0.10)
          .fromTo('[data-fe3="line1"]', { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.30 }, 0.18)
          .fromTo('[data-fe3="line2"]', { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.30 }, 0.28)
          .fromTo('[data-fe3="tag"]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.10, duration: 0.25 }, 0.38)
          // Sortie décalée à 0.85 pour que la caméra continue de tourner avec le texte présent
          .to('[data-fe3="text-group"]', { opacity: 0, y: -24, duration: 0.25 }, 0.85)
      }, section)
    }

    initGSAP()
    return () => { if (ctxRef.current) ctxRef.current.revert() }
  }, [])

  return (
    <div className={styles.container}>
      <section ref={sectionRef} className={styles.section}>
        <Canvas
          className={styles.canvas}
          shadows
          dpr={[1, perfSucks ? 1.5 : 2]}
          camera={{ position: [0, 1.2, 8], fov: 28 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <PerformanceMonitor onDecline={() => degrade(true)} />
          <color attach="background" args={['#0c0c0a']} />

          <Suspense fallback={<LoaderSustain />}>
          <group position={[0, -0.9, 0]} rotation={[0, -0.2, 0]}>
            <FloralScene />
            <AccumulativeShadows frames={80} alphaTest={0.82} opacity={0.5} color="#0e0c07" scale={14} position={[0, -0.003, 0]}>
              <RandomizedLight amount={6} radius={4} intensity={0.9} position={[-1.5, 3, -1.5]} bias={0.001} />
            </AccumulativeShadows>
          </group>
          </Suspense>

          <Env perfSucks={perfSucks} />
          <CameraRig scrollProgress={scrollProgress} />
        </Canvas>

        <div className={styles.overlay}>
          <div data-fe3="text-group" className={styles.textGroup}>
            <p data-fe3="eyebrow" className={styles.eyebrow}>Artisanat floral</p>
            <h2 className={styles.headline}>
              <span data-fe3="line1" className={styles.headLine1}><em>Préservée</em></span>
              <span data-fe3="line2" className={styles.headLine2}>dans le verre.</span>
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

function FloralScene() {
  return (
    <group>
      <Center top>
        <GlassVase02 />
        <DriedFlower position={[-0.4, 1.2, 2]} scale={0.8} rotation={[1, 2, 2]} />
      </Center>
      <FloatingPetals count={10} />
    </group>
  )
}

function DriedFlower({ position, scale, rotation }) {
  const { nodes, materials } = useGLTF('/glass-transformed.glb')
  return (
    <group position={position} scale={scale}>
      <Center rotation={[2, -4, -2.6]} top>
        <mesh castShadow geometry={nodes.flowers.geometry} material={materials['draifrawer_u1_v1.001']} />
      </Center>
    </group>
  )
}

function GlassVase02() {
  const { outerGeo, innerGeo } = useMemo(() => {
    const buildPoints = (offset = 0) => {
      const pts = []
      const segments = 32
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const beforeBaseFlare = Math.pow(-0.14, 1) * 0.082 
        const baseFlare = Math.pow(1.1 - t, 3) * 0.3 
        const middleTight = Math.pow(Math.sin(t * Math.PI), 2) * 0.0515
        const topOpen = Math.pow(t, 4) * 0.20 
        const minRadius = 0.08 
        const radius = minRadius + beforeBaseFlare + baseFlare + middleTight + topOpen + offset
        pts.push(new THREE.Vector2(radius, t * 2.4 - 0.12))
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
      <Caustics backfaces color={[1.0, 0.92, 0.72]} focus={[0, -1.1, 0]} lightSource={[-1.2, 3.8, -1.8]} frustum={1.8} intensity={0.005} worldRadius={0.085} ior={1.04} backfaceIor={1.28}>
        <mesh castShadow receiveShadow geometry={outerGeo} position={[-0.9, 0.2, 1]} scale={[0.56, 0.81, 0.56]} rotation={[0, -1, -0.71]}>
          <MeshTransmissionMaterial backside backsideThickness={0.14} thickness={0.06} chromaticAberration={0.025} anisotropicBlur={0.85} clearcoat={0.75} clearcoatRoughness={0.65} envMapIntensity={2.2} color="#f8efe0" samples={8} />
        </mesh>
      </Caustics>
      <mesh geometry={outerGeo} material={innerMaterial} position={[-0.9, 0.2, 1]} rotation={[0, -1, -0.71]} scale={[0.61, 0.81, 0.61]} />
      <mesh geometry={innerGeo} material={innerMaterial} position={[-0.9, 0.2, 1]} rotation={[0, -1, -0.71]} scale={[0.55, 0.81, 0.55]} />
    </>
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
        <mesh key={i} ref={el => (meshRefs.current[i] = el)} geometry={petalGeo} material={petalMat} position={[p.x, p.baseY, p.z]} rotation={[p.rx, p.ry, 0]} scale={p.sc} />
      ))}
    </group>
  )
}

function CameraRig({ scrollProgress }) {
  useFrame((state, delta) => {
    const p = scrollProgress.current
    const angle = p * Math.PI * 0.55
    const dist = 8 - p * 1.2
    const camX = Math.sin(angle) * dist + state.pointer.x * 0.5
    const camY = 1.25 + p * 0.7 + state.pointer.y * 0.25
    const camZ = Math.cos(angle) * dist

    easing.damp3(state.camera.position, [camX, camY, camZ], 0.70, delta)
    state.camera.lookAt(0, 0.8, 0)
  })
  return null
}

function Env({ perfSucks }) {
  const ringRef = useRef()
  useFrame((state, delta) => {
    if (!perfSucks && ringRef.current) {
      easing.damp3(ringRef.current.rotation, [Math.PI / 2, 0, state.clock.elapsedTime / 9 + state.pointer.x * 0.25], 0.28, delta)
    }
  })

  return (
    <Environment frames={perfSucks ? 1 : Infinity} resolution={256} background={false} blur={0.6}>
      <Lightformer intensity={3.5} rotation-x={Math.PI / 2} position={[-1, 6, -5]} scale={[10, 8, 1]} color="#f5e6c0" />
      <Lightformer intensity={1.8} rotation-x={Math.PI / 3} position={[3, 4, 2]} scale={[5, 4, 1]} color="#ffe4b0" />
      <group rotation={[Math.PI / 2, 0.9, 0]}>
        {[-2.5, 1.5, 4.5].map((x, i) => (
          <Lightformer key={i} intensity={0.6} rotation={[Math.PI / 4, 0, 0]} position={[x, 4, i * 3.5]} scale={[3.5, 1, 1]} color="#c9a96e" />
        ))}
        <Lightformer intensity={0.35} rotation-y={Math.PI / 2} position={[-5, 1, 0]} scale={[40, 2, 1]} color="#f0e8d0" />
      </group>
      <group ref={ringRef}>
        <Lightformer intensity={4} form="ring" color="#c9a96e" rotation-y={Math.PI / 2} position={[-5, 2, -1]} scale={[9, 9, 1]} />
      </group>
    </Environment>
  )
}

function LoaderSustain() {
  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0c0c0a', // Fond pour masquer la scène qui charge
      }}>
        {/* Ligne de croissance */}
        <div style={{
          width: '1px',
          height: '40px',
          background: 'linear-gradient(to bottom, transparent, #c9a96e, transparent)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#0c0c0a',
            animation: 'grow 1.5s ease-in-out infinite'
          }} />
        </div>

        <span style={{
          marginTop: '16px',
          fontFamily: 'serif',
          fontStyle: 'italic',
          fontSize: '0.7rem',
          letterSpacing: '0.15em',
          color: '#c9a96e',
          opacity: 0.5,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap'
        }}>
          Éclosion...
        </span>

        <style>{`
          @keyframes grow {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
        `}</style>
      </div>
    </Html>
  )
}