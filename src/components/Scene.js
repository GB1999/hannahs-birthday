// Scene.js
import React, { useState, useEffect } from 'react';
import Carousel from 'react-spring-3d-carousel';
import { config } from 'react-spring';
import styled from 'styled-components';
import StarburstItem from './StarburstItem'; // your StarburstItem component

// --------------------------------------------------
// Background (Sky & Clouds)
// --------------------------------------------------

const CloudLayer1 = styled.div`
  position: absolute;
  top: 10vh;
  left: 0;
  width: 100%;
  height: 150vh;
  background-image: url('/textures/cloud1.png');
  background-repeat: repeat-x;
  background-size: contain;
  opacity: 1.0;
  z-index: 1;
  animation: scrollClouds1 60s linear infinite;
  @keyframes scrollClouds1 {
    from { transform: translateX(0%); }
    to { transform: translateX(100%); }
  }
`;

// CloudLayer2 positioned lower than CloudLayer1.
const CloudLayer2 = styled.div`
  position: absolute;
  top: 40vh;
  left: 0;
  width: 100%;
  height: 150vh;
  background-image: url('/textures/cloud2.png');
  background-repeat: repeat-x;
  background-size: contain;
  opacity: 1.0;
  z-index: 1;
  animation: scrollClouds2 45s linear infinite;
  animation-delay: -20s;
  @keyframes scrollClouds2 {
    from { transform: translateX(0%); }
    to { transform: translateX(100%); }
  }`
;

// CloudLayer3 positioned even lower.
const CloudLayer3 = styled.div`
  position: absolute;
  top: 70vh;
  left: 0;
  width: 100%;
  height: 150vh;
  background-image: url('/textures/cloud3.png');
  background-repeat: repeat-x;
  background-size: contain;
  opacity: 1.0;
  z-index: 1;
  animation: scrollClouds3 75s linear infinite;
  animation-delay: -40s;
  @keyframes scrollClouds3 {
    from { transform: translateX(0%); }
    to { transform: translateX(100%); }
  }`
;

const CloudLayer4 = styled.div `
  position: absolute;
  top: 100vh;
  left: 0;
  width: 100%;
  height: 150vh;
  background-image: url('/textures/cloud4.png');
  background-repeat: repeat-x;
  background-size: contain;
  opacity: 1.0;
  z-index: 1;
  animation: scrollClouds4 75s linear infinite;
  animation-delay: -40s;
  @keyframes scrollClouds4 {
    from { transform: translateX(0%); }
    to { transform: translateX(100%); }
  }`
;
const SkyWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
`;

const AnimatedBackground = styled.div`
  position: absolute;
  width: 100%;
  height: 300vh;
  top: 0;
  left: 0;
  background: linear-gradient(to bottom, #87ceeb, #1e90ff);
  /* Add cloud layers here if desired */
`;

// --------------------------------------------------
// Main Content Containers
// --------------------------------------------------
const MainContainer = styled.div`
  position: relative;
  z-index: 1; /* Place above background */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Center content vertically */
  padding: 1rem;
  background: transparent;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem; /* Space between carousel and nav buttons */
`;

// Fixed height for the carousel (matching StarburstItem's 512px)
const CarouselContainer = styled.div`
  width: 100%;
  max-width: 600px; /* Optional max width */
  height: 512px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// Navigation container directly below the carousel
const NavContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const NavButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
`;

// --------------------------------------------------
// Scene Component
// --------------------------------------------------
// 1) Sample data for each starburst
const starburstsData = [
  {
    id: '1',
    seqName: 'box-idle',
    startFrame: 1,
    title: 'Barbie',
    description: 'Nicola Coughlan',
    date: 'July 21',
  },
  {
    id: '2',
    seqName: 'falling',
    startFrame: 122,
    title: 'Coffee & Spin',
    description: 'Some Other Description',
    date: 'July 22',
  },
  {
    id: '3',
    seqName: 'box-idle',
    startFrame: 1,
    title: 'Third Starburst',
    description: 'Yet Another Person',
    date: 'July 23',
  },
];

// 2) Preloading function (similar to your original)
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

function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(url);
    img.onerror = () => reject(url);
  });
}

const Scene = () => {
  const [goToSlide, setGoToSlide] = useState(0);
  const [preloadedSequences, setPreloadedSequences] = useState({});
  const [loading, setLoading] = useState(true);

  // 3) Preload all sequences once, store in preloadedSequences
  useEffect(() => {
    async function loadAllSequences() {
      // We’ll create a temporary object to hold frames for each seqName
      const sequencesMap = {};

      // For each starburst, load if not already loaded
      for (const item of starburstsData) {
        const { seqName, startFrame } = item;

        // Only load if we haven't loaded that seqName yet
        if (!sequencesMap[seqName]) {
          const frames = await preloadSequence(seqName, startFrame);
          sequencesMap[seqName] = frames;
        }
      }

      setPreloadedSequences(sequencesMap);
      setLoading(false);
    }

    loadAllSequences();
  }, []);

  // 4) If still loading, show a simple spinner or message
  if (loading) {
    return <div>Loading sequences...</div>;
  }


  // Map starburst data to the slides for the carousel
  const slides = starburstsData.map((item, index) => {
    const frames = preloadedSequences[item.seqName] || [];

    return {
      key: item.id,
      content: (
        <StarburstItem
          frames={frames}
          title={item.title}
          description={item.description}
          date={item.date}
          isActive={index === goToSlide}
        />
      ),
    };
  });

  const handleNext = () => {
    setGoToSlide((prev) => (prev + 1) % starburstsData.length);
  };

  const handlePrev = () => {
    setGoToSlide((prev) =>
      prev === 0 ? starburstsData.length - 1 : prev - 1
    );
  };

    return (
    <>
      {/* Background */}
      <SkyWrapper>
        <AnimatedBackground>
          {/* Optional: add cloud layers here */}
          <CloudLayer1 />
          <CloudLayer2 />
          <CloudLayer3 />
          <CloudLayer4 />
        </AnimatedBackground>
      </SkyWrapper>

      {/* Main content including carousel and navigation */}
      <MainContainer>
        <ContentWrapper>
          <CarouselContainer>
            <Carousel
              slides={slides}
              goToSlide={goToSlide}
              offsetRadius={2}
              showNavigation={false} // We use custom nav buttons
              animationConfig={config.gentle}
            />
          </CarouselContainer>
          <NavContainer>
            <NavButton onClick={handlePrev}>Previous</NavButton>
            <NavButton onClick={handleNext}>Next</NavButton>
          </NavContainer>
        </ContentWrapper>
      </MainContainer>
    </>
  );
};

export default Scene;
