

import React, { useState } from "react";
import { motion } from "motion/react";
import './index.css';

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

  const handleSwipeUp = () => {
    if (activeSection < itineraryData.length - 1) {
      setActiveSection((prev) => prev + 1);
    }
  };

  const handleSwipeDown = () => {
    if (activeSection > 0) {
      setActiveSection((prev) => prev - 1);
    }
  };

  const swipeHandlers = useSwipe({
    onSwipedUp: handleSwipeUp,
    onSwipedDown: handleSwipeDown,
  });

  return (
    <div className="fixed inset-0 w-screen h-screen bg-pink-50">
      <div className="absolute inset-0 overflow-hidden touch-none" {...swipeHandlers}>
        {itineraryData.map((section, index) => (
          <motion.div
            key={section.id}
            className={`absolute inset-0 flex items-center justify-center bg-pink-200 rounded-lg ${
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
            <div className="h-full w-full flex flex-col items-center justify-center p-6">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">{section.title}</h2>
              <h3 className="text-xl text-gray-600 mb-8">{section.time}</h3>
              <ul className="w-full max-w-md space-y-4">
                {section.activities.map((activity, idx) => (
                  <motion.li
                    key={idx}
                    className="py-3 border-b border-gray-200 last:border-b-0 text-gray-700 text-center"
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
                index === activeSection ? "bg-gray-800" : "bg-gray-300 hover:bg-gray-400"
              }`}
              onClick={() => setActiveSection(index)}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
