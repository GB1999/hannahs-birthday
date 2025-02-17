import { useRef, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { EffectComposer, Bloom, HueSaturation, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { useAnimations, OrbitControls, PerspectiveCamera, Environment, Points, PointMaterial } from '@react-three/drei'
import { Box3, Vector3 } from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import styled from 'styled-components'
import * as THREE from 'three'

// Add these new styled components after StarburstContainer
const SkyContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, #87CEEB, #1E90FF);
  z-index: -2;
`

const CloudLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/textures/cloud1.png');
  background-repeat: repeat-x;
  background-size: contain;
  opacity: 0.7;
  z-index: -1;
  animation: scrollClouds 60s linear infinite;

  &:nth-child(2) {
    background-image: url('/textures/cloud2.png');
    opacity: 0.5;
    animation-duration: 45s;
    animation-delay: -20s;
  }

  &:nth-child(3) {
    background-image: url('/textures/cloud3.png');
    opacity: 0.3;
    animation-duration: 75s;
    animation-delay: -40s;
  }

  @keyframes scrollClouds {
    from {
      transform: translateX(0%);
    }
    to {
      transform: translateX(100%);
    }
  }
`

// Create a styled container for the Canvas
const StarburstContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  mask-image: url('/svgs/starburst-mask.svg');
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-image: url('/svgs/starburst-mask.svg'); // For Safari support
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  background: transparent; // Change to transparent to show clouds
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/glitter-texture.png');
    mix-blend-mode: overlay;
    opacity: 0.5;
    animation: sparkle 2s linear infinite;
  }

  @keyframes sparkle {
    0% { background-position: 0 0; }
    100% { background-position: 100% 100%; }
  }
`

// Create a container for the controls that sits below the starburst
const ControlsContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 1000;
`

function Model({ cameraRef, currentAnimIndex, setCurrentAnimIndex, isFreeLook, onLoadAnimations, onAnimationNamesChange, zoom, verticalPan }) {
  const modelRef = useRef()
  const gltf = useLoader(GLTFLoader, '/models/Face4.glb')
  const { actions, names } = useAnimations(gltf.animations, modelRef)
  
  // Notify parent about available animations and their names
  useEffect(() => {
    if (names && names.length > 0) {
      onLoadAnimations(names.length)
      onAnimationNamesChange(names)
    }
  }, [names, onLoadAnimations, onAnimationNamesChange])
  
  // Center model at origin on load
  useEffect(() => {
    if (modelRef.current) {
      const boundingBox = new Box3().setFromObject(modelRef.current)
      const center = new Vector3()
      boundingBox.getCenter(center)
      
      // Move model to cancel out its center offset
      modelRef.current.position.set(-center.x, -center.y, -center.z)
    }
  }, [gltf])
  
  // Set the camera position with a fixed offset (panning, not zooming)
  useEffect(() => {
    if (!isFreeLook && modelRef.current && cameraRef.current) {
      const offset = new Vector3(0, 2 + verticalPan, zoom) // Add verticalPan to Y offset
      
      cameraRef.current.position.copy(offset)
      cameraRef.current.lookAt(0, 0, 0)
      cameraRef.current.updateProjectionMatrix()
    }
  }, [gltf, isFreeLook, cameraRef, zoom, verticalPan])
  
  // Smooth panning to keep the model in frame
  useFrame(() => {
    if (!isFreeLook && modelRef.current && cameraRef.current) {
      const center = new Vector3()
      new Box3().setFromObject(modelRef.current).getCenter(center)
      
      const offset = new Vector3(0, 2 + verticalPan, zoom) // Add verticalPan to Y offset
      const targetPosition = center.clone().add(offset)
      
      cameraRef.current.position.lerp(targetPosition, 0.05)
      cameraRef.current.lookAt(center)
    }
  })

  useEffect(() => {
    if (!actions || !names || names.length === 0) return;
    
    // Stop all animations first
    Object.values(actions).forEach(action => {
      action?.stop()
    })
    
    // Play current animation
    const currentAnim = actions[names[currentAnimIndex]]
    if (currentAnim) {
      currentAnim.reset()
      currentAnim.clampWhenFinished = false
      currentAnim.loop = true
      currentAnim.play()
      
      return () => {
        currentAnim.stop()
      }
    }
  }, [actions, names, currentAnimIndex])

  return (
    <primitive 
      ref={modelRef}
      object={gltf.scene} 
      position={[0, 0, 0]} // Model is centered at origin
      scale={1}
    />
  )
}

function ParticleSystem({ emitterRef, isEmitting }) {
  const points = useRef()
  const numParticles = 1000
  const particles = useRef(new Float32Array(numParticles * 3)).current
  const velocities = useRef(
    new Float32Array(numParticles * 3).fill(0)
  ).current

  // Initialize particles at emitter position (if available)
  useEffect(() => {
    const emitterPos = emitterRef?.current?.position || new THREE.Vector3(0, 0, 0)
    for (let i = 0; i < numParticles; i++) {
      particles[i * 3] = emitterPos.x
      particles[i * 3 + 1] = emitterPos.y
      particles[i * 3 + 2] = emitterPos.z

      // Give each particle a random velocity vector
      velocities[i * 3] = (Math.random() - 0.5) * 1.0
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 1.0
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 1.0
    }
  }, [emitterRef, particles])

  useFrame((state, delta) => {
    if (!isEmitting || !points.current) return

    const positions = points.current.geometry.attributes.position.array
    const emitterPos = emitterRef?.current?.position || new THREE.Vector3(0, 0, 0)
    for (let i = 0; i < numParticles; i++) {
      const index = i * 3

      // Update position with velocity
      positions[index] += velocities[index] * delta
      positions[index + 1] += velocities[index + 1] * delta
      positions[index + 2] += velocities[index + 2] * delta

      // Optional: Reset particle if it's too far from the emitter
      const particlePos = new THREE.Vector3(
        positions[index],
        positions[index + 1],
        positions[index + 2]
      )
      if (particlePos.distanceTo(emitterPos) > 5) {
        positions[index] = emitterPos.x
        positions[index + 1] = emitterPos.y
        positions[index + 2] = emitterPos.z
      }
    }
    points.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <Points ref={points} position={[0, 0, 0]}>
      <PointMaterial
        transparent
        size={0.2}
        sizeAttenuation={true}
        depthWrite={false}
        color="#ffff00"
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
    </Points>
  )
}

function Controls({ 
  onPrevious, 
  onNext, 
  isFreeLook, 
  onToggleFreeLook, 
  zoom, 
  onZoomChange, 
  verticalPan, 
  onVerticalPanChange,
  currentIndex,
  totalAnimations,
  animationNames,
  isEmittingParticles,
  onToggleParticles
}) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '20px',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <button onClick={onPrevious} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
        Previous
      </button>
      
      <div style={{ 
        position: 'relative', 
        width: '150px', 
        height: '24px', 
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={currentIndex}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ 
              color: 'white',
              position: 'absolute',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}
          >
            {animationNames?.[currentIndex] || `Animation ${currentIndex + 1}`}
          </motion.span>
        </AnimatePresence>
      </div>

      <button onClick={onNext} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
        Next
      </button>
      <button 
        onClick={onToggleFreeLook}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: isFreeLook ? '#ffcccc' : '#cccccc'
        }}>
        {isFreeLook ? 'Auto Camera' : 'Free Look'}
      </button>
      <button 
        onClick={onToggleParticles}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: isEmittingParticles ? '#ffcccc' : '#cccccc'
        }}>
        {isEmittingParticles ? 'Stop Particles' : 'Emit Particles'}
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ color: 'white', minWidth: '80px' }}>Zoom:</label>
          <input
            type="range"
            min="5"
            max="50"
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            style={{ width: '100px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ color: 'white', minWidth: '80px' }}>Vertical:</label>
          <input
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={verticalPan}
            onChange={(e) => onVerticalPanChange(Number(e.target.value))}
            style={{ width: '100px' }}
          />
        </div>
      </div>
    </div>
  )
}

export default function Scene() {
  const cameraRef = useRef()
  const [currentAnimIndex, setCurrentAnimIndex] = useState(0)
  const [isFreeLook, setIsFreeLook] = useState(false)
  const [totalAnimations, setTotalAnimations] = useState(0)
  const [zoom, setZoom] = useState(10)
  const [verticalPan, setVerticalPan] = useState(0) // Default vertical pan
  const [animationNames, setAnimationNames] = useState([])
  const [isEmittingParticles, setIsEmittingParticles] = useState(false)
  
  const handleLoadAnimations = useCallback((count) => {
    setTotalAnimations(count)
  }, [])

  const handleAnimationNamesChange = useCallback((names) => {
    setAnimationNames(names)
  }, [])

  const handlePrevious = () => {
    if (totalAnimations > 0) {
      setCurrentAnimIndex(prev => (prev - 1 + totalAnimations) % totalAnimations)
    }
  }

  const handleNext = () => {
    if (totalAnimations > 0) {
      setCurrentAnimIndex(prev => (prev + 1) % totalAnimations)
    }
  }

  const handleToggleFreeLook = () => {
    setIsFreeLook(prev => !prev)
  }

  const handleZoomChange = (newZoom) => {
    setZoom(newZoom)
  }

  const handleVerticalPanChange = (newPan) => {
    setVerticalPan(newPan)
  }

  return (
    <>
      <SkyContainer>
        <CloudLayer />
        <CloudLayer />
        <CloudLayer />
      </SkyContainer>
      <StarburstContainer>
        <Canvas 
          style={{ 
            background: 'transparent',
            width: '100%',
            height: '100%'
          }} 
          gl={{ 
            preserveDrawingBuffer: true,
            alpha: true 
          }}
        >
          <PerspectiveCamera 
            ref={cameraRef}
            makeDefault 
            position={[0, 2 + verticalPan, zoom]} // Include vertical pan in initial position
            fov={45}
            near={0.1}
            far={1000}
          />
          
          {/* Remove direct lights since we're using HDRI */}
          {/* <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-5, -5, -5]} intensity={0.5} /> */}

          <axesHelper args={[5]} />
          <gridHelper args={[10, 10]} />
          
          <Environment 
            files="/hdris/kloofendal_48d_partly_cloudy_puresky_1k.exr"
            background={false}  // Change to false to allow transparency
            blur={0}
            preset={null}
            scene={null}
            ground={{ height: 15, radius: 60, scale: 100 }}
          />
          
          <Model 
            cameraRef={cameraRef} 
            currentAnimIndex={currentAnimIndex}
            setCurrentAnimIndex={setCurrentAnimIndex}
            isFreeLook={isFreeLook}
            onLoadAnimations={handleLoadAnimations}
            onAnimationNamesChange={handleAnimationNamesChange}
            zoom={zoom}
            verticalPan={verticalPan}
          />
          
          <ParticleSystem 
            position={[0, 0, 0]}
            isEmitting={isEmittingParticles}
          />
          
          <OrbitControls 
            camera={cameraRef.current}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            enabled={isFreeLook}
            minDistance={-10}  // Add min/max zoom constraints
            maxDistance={50}
          />
           <EffectComposer>
            <Bloom 
              luminanceThreshold={0}
              luminanceSmoothing={0.9}
              intensity={.5}  // Increase for a more pronounced glow
            />
            <HueSaturation 
              hue={-0.05}         // Shift hue slightly (experiment with values)
              saturation={0.5}   // Boost saturation for pastel vibes
            />

            <Vignette 
              eskil={false} 
              offset={0.1} 
              darkness={0.3}   // Increase for a stronger vignette effect
            />
          </EffectComposer>
        </Canvas>
      </StarburstContainer>
      
      <ControlsContainer>
        <Controls 
          onPrevious={handlePrevious}
          onNext={handleNext}
          isFreeLook={isFreeLook}
          onToggleFreeLook={handleToggleFreeLook}
          zoom={zoom}
          onZoomChange={handleZoomChange}
          verticalPan={verticalPan}
          onVerticalPanChange={handleVerticalPanChange}
          currentIndex={currentAnimIndex}
          totalAnimations={totalAnimations}
          animationNames={animationNames}
          isEmittingParticles={isEmittingParticles}
          onToggleParticles={() => setIsEmittingParticles(prev => !prev)}
        />
      </ControlsContainer>
    </>
  )
}
