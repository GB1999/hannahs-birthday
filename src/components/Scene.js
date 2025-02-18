import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import styled from 'styled-components'

// --------------------------------------------------
// Sky & Wrapper
// --------------------------------------------------

// SkyWrapper fills the viewport. Removed negative z-index.
const SkyWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
`

// ScrollingSky is the animated sky background.
const ScrollingSky = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 300vh; /* tall enough for continuity */
  background: linear-gradient(to bottom, #87CEEB, #1E90FF);
  z-index: 0;
`

// --------------------------------------------------
// Cloud Layers
// --------------------------------------------------

const CloudLayer1 = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/textures/cloud1.png');
  background-repeat: repeat-x;
  background-size: contain;
  opacity: 0.7;
  z-index: 1; /* above sky */
  animation: scrollClouds1 60s linear infinite;
  @keyframes scrollClouds1 {
    from { transform: translateX(0%); }
    to { transform: translateX(100%); }
  }
`

const CloudLayer2 = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/textures/cloud2.png');
  background-repeat: repeat-x;
  background-size: contain;
  opacity: 0.5;
  z-index: 1;
  animation: scrollClouds2 45s linear infinite;
  animation-delay: -20s;
  @keyframes scrollClouds2 {
    from { transform: translateX(0%); }
    to { transform: translateX(100%); }
  }
`

const CloudLayer3 = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/textures/cloud3.png');
  background-repeat: repeat-x;
  background-size: contain;
  opacity: 0.3;
  z-index: 1;
  animation: scrollClouds3 75s linear infinite;
  animation-delay: -40s;
  @keyframes scrollClouds3 {
    from { transform: translateX(0%); }
    to { transform: translateX(100%); }
  }
`

// --------------------------------------------------
// Starburst & Image Sequence
// --------------------------------------------------
const StarburstContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  z-index: 2; /* above sky and clouds */
  mask-image: url('/svgs/starburst-mask.svg');
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-image: url('/svgs/starburst-mask.svg');
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  background: transparent;
  
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

const ImageSequenceContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 512px;
  height: 512px;
  z-index: 3; /* above starburst if needed */
`

const SequenceImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`

// --------------------------------------------------
// Button
// --------------------------------------------------
const Button = styled.button`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  z-index: 4; /* make sure button is clickable */
`

// --------------------------------------------------
// Scene Component
// --------------------------------------------------
export default function Scene() {
  // Mapping of sequence names to their starting frame numbers.
  const sequenceStartFrames = {
    'box-idle': 1,
    'falling': 108,
  }

  // States for active sequence, frame index (zero-based), and total frames.
  const [activeSequence, setActiveSequence] = useState("box-idle")
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
  const [totalFrames, setTotalFrames] = useState(0)
  const frameRate = 30 // Frames per second

  // Determine the starting frame number for the current sequence.
  const sequenceStart = sequenceStartFrames[activeSequence] || 1

  // Count valid frames when activeSequence changes.
  useEffect(() => {
    setCurrentFrameIndex(0)
    const countFrames = async () => {
      let count = sequenceStart
      while (count < sequenceStart + 1000) {
        const url = `/image-sequences/${activeSequence}/${count.toString().padStart(4, '0')}.png`
        try {
          const response = await fetch(url)
          const contentType = response.headers.get('content-type')
          if (!response.ok || !contentType || !contentType.startsWith('image/')) {
            console.log(`Not a valid image or error: ${url}`)
            break
          }
          console.log(`Fetched valid image: ${url}`)
          count++
        } catch (error) {
          console.error(`Error fetching ${url}:`, error)
          break
        }
      }
      const framesFound = count - sequenceStart
      console.log(`Found ${framesFound} frames for sequence "${activeSequence}"`)
      setTotalFrames(framesFound)
    }
    
    countFrames()
  }, [activeSequence, sequenceStart])

  // Update current frame index on an interval.
  useEffect(() => {
    if (totalFrames === 0) {
      console.log("No frames found")
      return
    }
    const interval = setInterval(() => {
      setCurrentFrameIndex((prevIndex) => {
        if (activeSequence === "falling") {
          if (prevIndex < totalFrames - 1) {
            return prevIndex + 1
          } else {
            clearInterval(interval)
            console.log("Falling sequence complete.")
            return prevIndex
          }
        } else {
          return (prevIndex + 1) % totalFrames
        }
      })
    }, 1000 / frameRate)
    
    return () => clearInterval(interval)
  }, [totalFrames, activeSequence, frameRate])

  // Calculate the actual frame number for the filename.
  const actualFrameNumber = sequenceStart + currentFrameIndex

  // Animate the sky background upward slightly when falling.
  const fallingDuration =
    activeSequence === "falling" && totalFrames > 0 ? totalFrames / frameRate : 0
  const scrollDistance = "-50vh" // adjust as needed

  const skyVariants = {
    idle: { y: 0 },
    falling: {
      y: scrollDistance,
      transition: { duration: fallingDuration, ease: "linear" },
    },
  }

  return (
    <>
      <SkyWrapper>
        <ScrollingSky
          variants={skyVariants}
          animate={activeSequence === "falling" ? "falling" : "idle"}
        />
        <CloudLayer1 />
        <CloudLayer2 />
        <CloudLayer3 />
      </SkyWrapper>
      <StarburstContainer>
        <ImageSequenceContainer>
          {totalFrames > 0 && (
            <SequenceImage 
              src={`/image-sequences/${activeSequence}/${actualFrameNumber
                .toString()
                .padStart(4, '0')}.png`}
              alt={`Frame ${actualFrameNumber}`}
            />
          )}
        </ImageSequenceContainer>
      </StarburstContainer>
      {activeSequence === "box-idle" && (
        <Button onClick={() => setActiveSequence("falling")}>
          Play Falling Sequence
        </Button>
      )}
    </>
  )
}
