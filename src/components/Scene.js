import React, { useState, useEffect, useRef } from 'react';
import Carousel from 'react-spring-3d-carousel';
import { config } from 'react-spring';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import StarburstItem from './StarburstItem'; // Updetailsd to receive a frames prop
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

// --------------------------------------------------
// Background & Cloud Layers (unchanged)
// --------------------------------------------------
const SkyWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
`;

const AnimatedBackground = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 300vh;
`;

const ScrollingSky = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 200vh;
  background: linear-gradient(to bottom, #1E90FF, rgb(255, 255, 255));
  z-index: 0;
`;

const CloudLayer1 = styled.div`
  position: absolute;
  top: 10vh;
  left: 0;
  width: 100%;
  height: 150vh;
  background-image: url('/textures/cloud1.png');
  background-repeat: repeat-x;
  background-size: contain;
  opacity: 0;
  z-index: 1;
  animation: scrollClouds1 60s linear infinite, fadeIn 5s forwards;
  animation-delay: -20s;
  @keyframes scrollClouds1 {
    from { transform: translateX(0%); }
    to { transform: translateX(100%); }
  }
  @keyframes fadeIn {
    to { opacity: 1; }
  }
`;

const CloudLayer2 = styled.div`
  position: absolute;
  top: 20vh;
  left: 10px;
  width: 100%;
  height: 150vh;
  background-image: url('/textures/cloud2.png');
  background-repeat: repeat-x;
  background-size: contain;
  opacity: 0;
  z-index: 1;
  animation: scrollClouds2 40s linear infinite, fadeIn 5s forwards;
  animation-delay: -20s;
  @keyframes scrollClouds2 {
    from { transform: translateX(0%); }
    to { transform: translateX(100%); }
  }
  @keyframes fadeIn {
    to { opacity: 1; }
  }
`;

const CloudLayer3 = styled.div`
  position: absolute;
  top: 45vh;
  left: 15px;
  width: 100%;
  height: 150vh;
  background-image: url('/textures/cloud3.png');
  background-repeat: repeat-x;
  background-size: contain;
  opacity: 0;
  z-index: 1;
  animation: scrollClouds3 75s linear infinite, fadeIn 5s forwards;
  animation-delay: -40s;
  @keyframes scrollClouds3 {
    from { transform: translateX(0%); }
    to { transform: translateX(100%); }
  }
  @keyframes fadeIn {
    to { opacity: 1; }
  }
`;

const CloudLayer4 = styled.div`
  position: absolute;
  top: 60vh;
  left: 0;
  width: 100%;
  height: 150vh;
  background-image: url('/textures/cloud4.png');
  background-repeat: repeat-x;
  background-size: contain;
  opacity: 0;
  z-index: 10;
  animation: scrollClouds4 55s linear infinite, fadeIn 5s forwards;
  animation-delay: -40s;
  @keyframes scrollClouds4 {
    from { transform: translateX(0%); }
    to { transform: translateX(100%); }
  }
  @keyframes fadeIn {
    to { opacity: 1; }
  }
`;

const CloudLayer5 = styled.div`
  position: absolute;
  top: 80vh;
  left: 20px;
  width: 100%;
  height: 150vh;
  background-image: url('/textures/cloud5.png');
  background-repeat: repeat-x;
  background-size: contain;
  opacity: 0;
  z-index: 1;
  animation: scrollClouds5 70s linear infinite, fadeIn 5s forwards;
  animation-delay: -40s;
  @keyframes scrollClouds5 {
    from { transform: translateX(0%); }
    to { transform: translateX(100%); }
  }
  @keyframes fadeIn {
    to { opacity: 1; }
  }
`;

const CloudLayer6 = styled.div`
  position: absolute;
  top: 100vh;
  left: 50px;
  width: 100%;
  height: 150vh;
  background-image: url('/textures/cloud6.png');
  background-repeat: repeat-x;
  background-size: contain;
  opacity: 0;
  z-index: 1;
  animation: scrollClouds6 90s linear infinite, fadeIn 5s forwards;
  animation-delay: -40s;
  @keyframes scrollClouds6 {
    from { transform: translateX(0%); }
    to { transform: translateX(100%); }
  }
  @keyframes fadeIn {
    to { opacity: 1; }
  }
`;



// --------------------------------------------------
// Intro Section Components
// --------------------------------------------------
const IntroContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center; /* vertical centering */
  align-items: center;     /* horizontal centering */
  width: 100%;
  height: 100vh;
  position: relative;
  z-index: 3;
`;

const ImageSequenceContainer = styled.div`
  width: 512px;
  height: 512px;
`;

const SequenceImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const Button = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  z-index: 4;
`;

// --------------------------------------------------
// Carousel Containers
// --------------------------------------------------
// FullContainer: takes full viewport height.
const FullContainer = styled.div`
  position: relative;
  height: 100vh;
  width: 100%;
  z-index: 2;
`;

// CarouselContainer: absolutely centered.
const CarouselContainer = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 600px; /* or use max-width: 600px; */
  height: 512px; /* Matches StarburstItem height */
  transform: translate(-50%, -50%);
`;

// NavContainer: positioned directly below the carousel.
const NavContainer = styled.div`
  position: absolute;
  top: calc(55% + 256px + 20px); /* 256px is half of 512px; add 20px margin */
  left: 50%;
  transform: translateX(-50%);
  width: 100vw;
  display: flex;
  justify-content: center;
  gap: 1rem;
  z-index: 4;
`;
const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 15px 30px;
  border: 0;
  position: relative;
  overflow: hidden;
  border-radius: 10rem;
  transition: all 0.02s;
  font-weight: bold;
  cursor: pointer;
  color: rgb(255, 255, 255);
  z-index: 5;
  box-shadow: 0 0px 7px -5px rgba(0, 0, 0, 0.5);
  background: linear-gradient(45deg,rgb(247, 154, 255),rgb(244, 196, 250));

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* Position text above the hover effect */
  .buttonText {
    font-family: 'CaviarDreams_Bold', sans-serif;
    font-size: 2rem;
    position: relative;
    z-index: 2;
  }

  &:active {
    transform: scale(0.97);
  }

  .hoverEffect {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1; /* Lower than the .buttonText */
  }

  .hoverEffect div {
    background: linear-gradient(
      90deg,
      rgb(214, 135, 165) 0%,
      rgba(255, 105, 180, 1) 50%,
      rgba(255, 20, 147, 1) 100%
    );
    border-radius: 40rem;
    width: 10rem;
    height: 10rem;
    transition: 0.4s;
    filter: blur(20px);
    animation: effect infinite 10s linear;
    opacity: 0.5;
  }

  &:hover .hoverEffect div {
    width: 8rem;
    height: 8rem;
  }

  @keyframes effect {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;



// --------------------------------------------------
// Helper: Preload Images & Sequences
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
    } catch (error) {
      console.log(`Preloading stopped for ${seqName} at frame ${count}`);
      break;
    }
  }
  return urls;
}

// --------------------------------------------------
// Scene Component
// --------------------------------------------------
const Scene = () => {
  const sequenceStartFrames = { falling: 134, "box-idle": 13, "second-idle": 201, "djing": 195, "painting": 195 };
  const [preloadedSequences, setPreloadedSequences] = useState({});
  const [preloaded, setPreloaded] = useState(false);
  // viewMode: "intro" or "carousel"
  const [viewMode, setViewMode] = useState("intro");
  // activeSequence: during intro, initially "box-idle" then switch to "falling"
  const [activeSequence, setActiveSequence] = useState("box-idle");
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const frameRate = 12;
  const animationFrameId = useRef();
  const startTimeRef = useRef();

  // Carousel state.
  const [goToSlide, setGoToSlide] = useState(0);
  const starburstsData = [
    {
      id: '1',
      seqName: 'second-idle',
      startFrame: 1,
      title: 'Weekend Itinerary',
      description: 'Nicola Coughlan',
      details: 'Checkout The Plan For The Weekend',
      backgroundImage: '/backgrounds/yellow.png',
    },
    {
      id: '2',
      seqName: 'box-idle',
      startFrame: 1,
      title: 'Another Starburst',
      description: 'Some Description',
      details: 'July 22',
    },
    {
      id: '3',
      seqName: 'djing',
      startFrame: 1,
      title: 'Spin & Coffee',
      description: 'Yet Another Detail',
      details: 'Enjoy a dope DJ set with an oat latte.',
      backgroundImage: '/backgrounds/green.png',
    },
    {
      id: '4',
      seqName: 'painting',
      startFrame: 1,
      title: 'Tipsy Canvas',
      description: 'Yet Another Detail',
      details: 'The more you drink, the better you paint!',
      backgroundImage: '/backgrounds/pink.jpeg',
    },
  ];

  // Ref for the carousel container.
  const carouselRef = useRef();

  // Preload sequences on mount.
  useEffect(() => {
    async function preloadAll() {
      const boxIdleUrls = await preloadSequence("box-idle", sequenceStartFrames["box-idle"]);
      const fallingUrls = await preloadSequence("falling", sequenceStartFrames["falling"]);
      const secondIdleUrls = await preloadSequence("second-idle", sequenceStartFrames["second-idle"]);
      const djingUrls = await preloadSequence("djing", sequenceStartFrames["djing"]);
      const paintingUrls = await preloadSequence("painting", sequenceStartFrames["painting"]);
      setPreloadedSequences({
        "box-idle": boxIdleUrls,
        "falling": fallingUrls,
        "second-idle": secondIdleUrls,
        "djing": djingUrls,
        "painting": paintingUrls,
      });
      setPreloaded(true);
    }
    preloadAll();
  }, []);

  const totalFrames = preloadedSequences[activeSequence]
    ? preloadedSequences[activeSequence].length
    : 0;

  // When activeSequence is "falling", run the falling animation.
  useEffect(() => {
    if (!preloaded || totalFrames === 0 || viewMode !== "intro" || activeSequence !== "falling") return;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const newIndex = Math.floor((elapsed / 1000) * frameRate);

      if (newIndex < totalFrames) {
        setCurrentFrameIndex(newIndex);
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        setCurrentFrameIndex(totalFrames - 1);
        console.log("Falling sequence complete.");
        setViewMode("carousel");
        setActiveSequence("box-idle");
        startTimeRef.current = null;
        if (carouselRef.current) {
          carouselRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    animationFrameId.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrameId.current);
      startTimeRef.current = null;
    };
  }, [preloaded, totalFrames, activeSequence, viewMode, frameRate]);

  // Background animation variants.
  const backgroundOffsetFrames = 30;
  const backgroundSpeedModifier = 1.5;
  const backgroundOffsetSeconds = backgroundOffsetFrames / frameRate;
  const fallingDuration = activeSequence === "falling" && totalFrames > 0 ? totalFrames / frameRate : 0;
  const effectiveFallingDuration = fallingDuration / backgroundSpeedModifier;
  const scrollDistance = "-50vh";
  const bgVariants = {
    idle: { y: 0 },
    falling: {
      y: scrollDistance,
      transition: {
        delay: backgroundOffsetSeconds,
        duration: effectiveFallingDuration,
        ease: "easeInOut",
      },
    },
  };

  if (!preloaded) {
    return <div>Loading sequences...</div>;
  }

  return (
    <>
      {/* Background */}
      <SkyWrapper>
        <AnimatedBackground
          variants={bgVariants}
          animate={viewMode === "intro" ? (activeSequence === "falling" ? "falling" : "idle") : "falling"}
        >
          <ScrollingSky />
          <CloudLayer1 />
          <CloudLayer2 />
          <CloudLayer3 />
          <CloudLayer4 />
          <CloudLayer5 />
          <CloudLayer6 />
        </AnimatedBackground>
      </SkyWrapper>

      {/* Intro Section */}
      {viewMode === "intro" && (
        <FullContainer>
        <IntroContainer>
          <ImageSequenceContainer>
            {totalFrames > 0 && (
              <SequenceImage
                src={preloadedSequences[activeSequence][currentFrameIndex]}
                alt={`Frame ${currentFrameIndex}`}
              />
            )}
          </ImageSequenceContainer>
          
        </IntroContainer>

        <NavContainer>
        {activeSequence === "box-idle" && (
            <StyledButton 
  onClick={() => {
    setActiveSequence("falling");
    setCurrentFrameIndex(0);
    startTimeRef.current = null;
  }}
>
  <span className="buttonText">ENTER BARBIE LAND</span>
  <div className="hoverEffect">
    <div />
  </div>
</StyledButton>

          )}
        </NavContainer>
        </FullContainer>
        
      )}

      {/* Carousel Section - rendered but hidden until viewMode is "carousel" */}
      <div ref={carouselRef} style={{ display: viewMode === "carousel" ? "block" : "none" }}>
  <FullContainer>
    <CarouselContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: viewMode === "carousel" ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      <Carousel
        slides={starburstsData.map((item) => {
          const frames = preloadedSequences[item.seqName] || [];
          return {
            key: item.id,
            content: (
              <StarburstItem
                frames={frames}
                title={item.title}
                description={item.description}
                details={item.details}
                isActive={starburstsData.indexOf(item) === goToSlide}
                backgroundImage={item.backgroundImage}
              />
            ),
          };
        })}
        goToSlide={goToSlide}
        offsetRadius={2}
        showNavigation={false}
        animationConfig={config.gentle}
      />
    </CarouselContainer>
    <NavContainer>
      <StyledButton
        onClick={() => setGoToSlide((prev) => (prev === 0 ? starburstsData.length - 1 : prev - 1))}
        disabled={goToSlide === 0}
      >
        <span className="buttonText"> <FaArrowLeft /></span>
        <div className="hoverEffect">
          <div />
        </div>
      </StyledButton>
      <StyledButton
        onClick={() => setGoToSlide((prev) => (prev + 1) % starburstsData.length)}
        disabled={goToSlide === starburstsData.length - 1}
      >
        <span className="buttonText"> <FaArrowRight /></span>
        <div className="hoverEffect">
          <div />
        </div>
      </StyledButton>
    </NavContainer>
  </FullContainer>
</div>
    </>
  );
};

export default Scene;
