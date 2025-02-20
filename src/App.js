import React, { useState, Suspense } from "react";
import { motion } from "motion/react";
import Scene from './components/Scene';
import './index.css';
import { GlobalStyle } from './GlobalStyle';
const itineraryData = [
  {
    id: 1,
    title: "Morning",
    time: "9:00 AM - 12:00 PM",
    activities: ["Breakfast at Sunrise Café", "City Museum Tour", "Local Market Visit"],
  },
  {
    id: 2,
    title: "Afternoon",
    time: "12:00 PM - 5:00 PM",
    activities: ["Lunch at Harbor View", "Beach Activities", "Shopping at Downtown"],
  },
  {
    id: 3,
    title: "Evening",
    time: "5:00 PM - 10:00 PM",
    activities: ["Sunset Walk", "Dinner at Sky Restaurant", "Night City Tour"],
  },
];

const useSwipe = ({ onSwipedUp, onSwipedDown }) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientY);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    if (isUpSwipe) onSwipedUp();
    if (isDownSwipe) onSwipedDown();
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};

function App() {
  const [activeSection, setActiveSection] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSectionChange = (newIndex) => {
    if (newIndex !== activeSection && newIndex >= 0 && newIndex < itineraryData.length) {
      setIsTransitioning(true);
      setActiveSection(newIndex);
      // Three.js animation will handle the transition timing
      setTimeout(() => setIsTransitioning(false), 1000); // Temporary timeout until Three.js is integrated
    }
  };

  const handleSwipeUp = () => {
    handleSectionChange(activeSection + 1);
  };

  const handleSwipeDown = () => {
    handleSectionChange(activeSection - 1);
  };

  const swipeHandlers = useSwipe({
    onSwipedUp: handleSwipeUp,
    onSwipedDown: handleSwipeDown,
  });

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <GlobalStyle />
      {/* Three.js canvas */}
      <div className="absolute w-full h-full">
        <Suspense fallback={<div>Loading...</div>}>
          <Scene />
        </Suspense>
        {/* Debug overlay */}
        <div className="fixed top-0 left-0 bg-black bg-opacity-50 text-white p-2 z-50 font-mono text-xs">
          <div>Section: {activeSection}</div>
          <div>Transitioning: {isTransitioning.toString()}</div>
        </div>
      </div>
      {/*<div className="absolute inset-0 overflow-hidden touch-none" {...swipeHandlers}>
        {itineraryData.map((section, index) => (
          <motion.div
            key={section.id}
            className={`absolute inset-0 flex items-center justify-center rounded-lg ${
              index === activeSection ? "z-20" : "z-10"
            }`}
            initial={false}
            animate={{
              y: `${(index - activeSection) * 100}%`,
              scale: index === activeSection ? 1 : 0.9,
              opacity: index === activeSection ? 1 : 0.5,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <div className="h-half w-full flex flex-col items-center justify-center p-6 bg-black bg-opacity-50">
              <h2 className="text-4xl font-bold text-white mb-2">{section.title}</h2>
              <h3 className="text-xl text-gray-200 mb-8">{section.time}</h3>
              <ul className="w-full max-w-md space-y-4">
                {section.activities.map((activity, idx) => (
                  <motion.li
                    key={idx}
                    className="py-3 border-b border-gray-300 last:border-b-0 text-white text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: index === activeSection ? 1 : 0,
                      y: index === activeSection ? 0 : 20,
                    }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {activity}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
        <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
          {itineraryData.map((_, index) => (
            <motion.button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === activeSection ? "bg-white" : "bg-gray-400 hover:bg-gray-300"
              }`}
              onClick={() => handleSectionChange(index)}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>*/}
    </div>
  );
}

export default App;
