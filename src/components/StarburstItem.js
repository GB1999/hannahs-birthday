import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

// --------------------------------------------------
// Masked Container (Starburst Shape)
// --------------------------------------------------
const StarburstContainer = styled(motion.div)`
  position: relative;
  width: 512px;
  height: 512px;
  margin: 0 auto;
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
    inset: 0;
    background: url('/glitter-texture.png');
    mix-blend-mode: overlay;
    opacity: 0.5;
    animation: sparkle 2s linear infinite;
  }

  @keyframes sparkle {
    0% { background-position: 0 0; }
    100% { background-position: 100% 100%; }
  }
`;

const StarburstWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

// --------------------------------------------------
// Image Sequence Container
// --------------------------------------------------
const ImageSequenceContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 512px;
  height: 512px;
  z-index: 1;
`;

const SequenceImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

// --------------------------------------------------
// Text Layer
// --------------------------------------------------
const TextGroup = styled(motion.div)`
  position: absolute;
  inset: 0; /* fill the entire starburst area */
  z-index: 2;
  pointer-events: none; /* text won't block clicks on the starburst if that's desired */
  font-family: sans-serif;
  color: #fff;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.7);
`;

/** 
 * Title: Centered (horizontally & vertically)
 */
const Title = styled.p`
  font-family: 'Bartex', sans-serif;
  font-size: 2rem;
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0;
  font-size: 5rem;
 line-height: 5rem;
 transform:  translateX(-50%) translateY(-50%) rotate(-10deg);


`;

/** 
 * Description: Top-right corner, but text is left-aligned 
 */
const Description = styled.p`
  font-family: 'CaviarDreams_Bold', sans-serif;
  position: absolute;
  top: 10%;
  right: 10%;
  margin: 0;
  text-align: left; 
  font-size: 1.2rem;
  max-width: 40%; /* limit width if you want to avoid wrapping too far */
`;

/** 
 * Date: Bottom center
 */
const Date = styled.p`
  position: absolute;
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  font-size: 1rem;
`;

// --------------------------------------------------
// Image Preloading
// --------------------------------------------------
const preloadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(url);
    img.onerror = () => reject(url);
  });

async function preloadSequence(seqName, start) {
  const urls = [];
  let count = start;
  const safetyLimit = start + 1000;
  while (count < safetyLimit) {
    const url = `/image-sequences/${seqName}/${String(count).padStart(4, '0')}.png`;
    try {
      await preloadImage(url);
      urls.push(url);
      count++;
    } catch {
      break;
    }
  }
  return urls;
}

// --------------------------------------------------
// StarburstItem Component
// --------------------------------------------------
const StarburstItem = ({
 frames,
  title,
  description,
  date,
  isActive,
}) => {
  
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const frameRate = 12;

  // Only preload + animate if active in the carousel
  useEffect(() => {
    if (!isActive || !frames || frames.length === 0) return;

    let animationFrameId;
    let startTime = null;
    const totalFrames = frames.length;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const newIndex = Math.floor((elapsed / 1000) * frameRate);
      setCurrentFrameIndex(newIndex % totalFrames);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      setCurrentFrameIndex(0);
    };
  }, [isActive, frames]);

  const textVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <StarburstContainer
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.8 }}
    >
      <StarburstWrapper>
        <ImageSequenceContainer>
          {frames && frames.length > 0 && (
            <SequenceImage
              src={frames[currentFrameIndex]}
              alt={`Frame ${currentFrameIndex}`}
            />
          )}
        </ImageSequenceContainer>

        <TextGroup
          variants={textVariants}
          initial="hidden"
          animate={isActive ? 'visible' : 'hidden'}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Title>{title}</Title>
          <Description>{description}</Description>
          <Date>{date}</Date>
        </TextGroup>
      </StarburstWrapper>
    </StarburstContainer>
  );
};

export default StarburstItem;
