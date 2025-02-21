import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

// --------------------------------------------------
// Outer Wrapper: 312x512 total
// --------------------------------------------------
const StarburstItemWrapper = styled.div`
  position: relative;
  width: 312px;
  height: 512px;
  margin: 0 auto;
  bottom: 0;
`;

// --------------------------------------------------
// BackgroundLayer: star mask (312x512 if you want the entire area masked)
// --------------------------------------------------
const BackgroundLayer = styled(motion.div)`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 312px;
  height: 512px;
  z-index: 0;

  /* Full star mask for the entire 312x512 area */
  mask-image: url('/svgs/starburst-mask.svg');
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-image: url('/svgs/starburst-mask.svg');
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;

  /* Background behind star shape */
  background: ${({ backgroundImage }) =>
    backgroundImage
      ? `url(${backgroundImage}) center/cover no-repeat`
      : 'transparent'};

  /* Optional glitter overlay */
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

// --------------------------------------------------
// PartialMaskLayer: uses your 312x512 partial mask
// (top portion unmasked, bottom portion star-shaped)
// --------------------------------------------------
const PartialMaskLayer = styled(motion.div)`
  position: absolute;
  bottom: 100px;
  left: 0;
  width: 312px;
  height: 512px;
  z-index: 1;

  /* Now 312x512 partial mask */
  mask-image: url('/svgs/starburst-mask-half.svg');
  mask-size: cover;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-image: url('/svgs/starburst-mask-half.svg');
  -webkit-mask-size: cover;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
`;

// The image container & image both fill 312x512
const SequenceContainer = styled.div`
  position: absolute;
  top: 100px;
  left: 0;
  width: 312px;
  height: 512px;
`;

const SequenceImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

// --------------------------------------------------
// Text Layer: unmasked
// --------------------------------------------------
const TextGroup = styled(motion.div)`
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  font-family: sans-serif;
  color: #fff;
`;

const Title = styled.p`
  font-family: 'Bartex', sans-serif;
  font-size: 4rem;
  line-height: 3.5rem;
  position: absolute;
  top: 60%;
  left: 50%;
  margin: 0;
  transform: translate(-50%, -50%) rotate(-10deg);
  text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
`;

const Description = styled.p`
  font-family: 'CaviarDreams_Bold', sans-serif;
  position: absolute;
  top: 30%;
  right: -10%;
  margin: 0;
  text-align: left;
  font-size: 1.2rem;
  max-width: 40%;
`;

const Details = styled.p`
  position: absolute;
  top: 85%;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  font-size: 1.6rem;
  line-height: 1.5rem;
  text-align: center;
  color: #F462AF;
  font-family: 'Bartex', sans-serif;
`;

// --------------------------------------------------
// StarburstItem Component
// --------------------------------------------------
const StarburstItem = ({
  frames,
  title,
  description,
  details,
  isActive,
  backgroundImage
}) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const frameRate = 12;

  // Animate frames if active
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
    <StarburstItemWrapper>
      {/* Star mask for background (312x512) */}
      <BackgroundLayer
        backgroundImage={backgroundImage}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.8 }}
      />

      {/* Partial star mask for the image (312x512) */}
      <PartialMaskLayer
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <SequenceContainer>
          {frames && frames.length > 0 && (
            <SequenceImage
              src={frames[currentFrameIndex]}
              alt={`Frame ${currentFrameIndex}`}
            />
          )}
        </SequenceContainer>
      </PartialMaskLayer>

      {/* Unmasked text */}
      <TextGroup
        variants={textVariants}
        initial="hidden"
        animate={isActive ? 'visible' : 'hidden'}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Title>{title}</Title>
        <Description>{description}</Description>
        <Details>{details}</Details>
      </TextGroup>
    </StarburstItemWrapper>
  );
};

export default StarburstItem;
