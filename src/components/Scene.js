import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { useAnimations, OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei'
import { Box3, Vector3 } from 'three'

function Model({ cameraRef, currentAnimIndex, setCurrentAnimIndex, isFreeLook }) {
  const modelRef = useRef()
  const gltf = useLoader(GLTFLoader, '/models/Face4.glb')
  const { actions, names } = useAnimations(gltf.animations, modelRef)
  
  // Center model at origin on load
  useEffect(() => {
    if (modelRef.current) {
      const boundingBox = new Box3().setFromObject(modelRef.current)
      const center = new Vector3()
      boundingBox.getCenter(center)
      
      // Move model to cancel out its center offset
      modelRef.current.position.set(
        -center.x,
        -center.y,
        -center.z
      )
      
      // Update bounding box after centering
      boundingBox.setFromObject(modelRef.current)
    }
  }, [gltf])
  
  // Camera positioning effect (now using centered model)
  useEffect(() => {
    if (!isFreeLook && modelRef.current && cameraRef.current) {
      const boundingBox = new Box3().setFromObject(modelRef.current)
      const size = new Vector3()
      boundingBox.getSize(size)
      
      // Add padding to ensure visibility
      const padding = 1.2
      const maxDimension = Math.max(size.x, size.y, size.z) * padding
      
      // Calculate optimal camera distance using FOV
      const fov = cameraRef.current.fov * (Math.PI / 180)
      const cameraDistance = (maxDimension / 2) / Math.tan(fov / 2)
      
      // Position camera (now relative to centered model)
      cameraRef.current.position.set(
        0, // Model is centered, so camera can be at 0
        maxDimension * 0.2, // Still slightly above
        cameraDistance // Back far enough to see everything
      )
      
      // Look at origin where model is centered
      cameraRef.current.lookAt(0, 0, 0)
      cameraRef.current.updateProjectionMatrix()
    }
  }, [gltf, isFreeLook])
  
  // Update camera during animations
  useFrame(() => {
    if (!isFreeLook && modelRef.current && cameraRef.current) {
      const boundingBox = new Box3().setFromObject(modelRef.current)
      const size = new Vector3()
      boundingBox.getSize(size)
      
      const padding = 1.2
      const maxDimension = Math.max(size.x, size.y, size.z) * padding
      const fov = cameraRef.current.fov * (Math.PI / 180)
      const cameraDistance = (maxDimension / 2) / Math.tan(fov / 2)
      
      // Smoothly move camera (relative to centered model)
      cameraRef.current.position.lerp(
        new Vector3(
          0,
          maxDimension * 0.2,
          cameraDistance
        ),
        0.05
      )
      
      cameraRef.current.lookAt(0, 0, 0)
    }
  })

  useEffect(() => {
    if (!actions || !names || names.length === 0) return;
    
    console.log('Available animations:', names)
    
    // Stop all animations first
    Object.values(actions).forEach(action => {
      if (action && action.stop) {
        action.stop()
      }
    })
    
    // Play current animation
    const currentAnim = actions[names[currentAnimIndex]]
    if (currentAnim && currentAnim.play) {
      const startTime = Date.now()
      console.log(`Starting animation: ${names[currentAnimIndex]}, Duration: ${currentAnim.getClip().duration}s`)
      
      currentAnim.reset()
      currentAnim.clampWhenFinished = true
      currentAnim.loop = false
      currentAnim.play()
      
      // Get the actual duration from the animation clip
      const duration = currentAnim.getClip().duration * 1000
      console.log(`Setting timeout for: ${duration}ms`)
      
      // Add a small buffer to ensure animation completes
      const timeoutDuration = duration + 100
      setTimeout(() => {
        currentAnim.stop()
      }, timeoutDuration)
    }
    
    return () => {
      if (currentAnim && currentAnim.stop) {
        currentAnim.stop()
      }
    }
  }, [actions, names, currentAnimIndex])

  // Log when animation changes
  useEffect(() => {
    if (names && names.length > 0) {
      console.log('Current animation index:', currentAnimIndex, 'Animation:', names[currentAnimIndex])
    }
  }, [currentAnimIndex, names])

  return (
    <primitive 
      ref={modelRef}
      object={gltf.scene} 
      position={[0, 0, 0]} // Initial position at origin
      scale={1}
    />
  )
}

function Controls({ onPrevious, onNext, isFreeLook, onToggleFreeLook }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '20px',
      zIndex: 1000
    }}>
      <button 
        onClick={onPrevious}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Previous
      </button>
      <button 
        onClick={onNext}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Next
      </button>
      <button 
        onClick={onToggleFreeLook}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: isFreeLook ? '#ffcccc' : '#cccccc'
        }}
      >
        {isFreeLook ? 'Auto Camera' : 'Free Look'}
      </button>
    </div>
  )
}

export default function Scene() {
  const cameraRef = useRef()
  const [currentAnimIndex, setCurrentAnimIndex] = useState(0)
  const [isFreeLook, setIsFreeLook] = useState(false)
  
  const handlePrevious = () => {
    setCurrentAnimIndex((prev) => {
      const gltf = new GLTFLoader().parse('/models/Face4.glb')
      const totalAnimations = gltf.animations?.length || 0
      return (prev - 1 + totalAnimations) % totalAnimations
    })
  }

  const handleNext = () => {
    setCurrentAnimIndex((prev) => {
      const gltf = new GLTFLoader().parse('/models/Face4.glb')
      const totalAnimations = gltf.animations?.length || 0
      return (prev + 1) % totalAnimations
    })
  }

  const handleToggleFreeLook = () => {
    setIsFreeLook(prev => !prev)
  }

  return (
    <>
      <Canvas 
        style={{ background: '#000' }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <PerspectiveCamera 
          ref={cameraRef}
          makeDefault 
          position={[0, 0, 10]}
          fov={45}
          near={0.1}
          far={1000}
        />
        
        {/* Remove direct lights since we're using HDRI */}
        {/* <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} /> */}

        {/* Debug helpers */}
        <axesHelper args={[5]} />
        <gridHelper args={[10, 10]} />
        
        <Environment 
          files="/hdris/kloofendal_48d_partly_cloudy_puresky_1k.exr"
          background
          blur={0}
          preset={null}
          scene={null}
          ground={{
            height: 15,
            radius: 60,
            scale: 100
          }}
        />
        
        <Model 
          cameraRef={cameraRef} 
          currentAnimIndex={currentAnimIndex}
          setCurrentAnimIndex={setCurrentAnimIndex}
          isFreeLook={isFreeLook}
        />
        <OrbitControls 
          camera={cameraRef.current}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          enabled={isFreeLook}
        />
      </Canvas>
      <Controls 
        onPrevious={handlePrevious}
        onNext={handleNext}
        isFreeLook={isFreeLook}
        onToggleFreeLook={handleToggleFreeLook}
      />
    </>
  )
} 