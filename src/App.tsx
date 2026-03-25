/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Mail, 
  RotateCcw,
  Palette
} from 'lucide-react';

// --- Constants ---
const FLOWERS_TO_FINISH = 40;

// --- Main Component ---
export default function App() {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'letter'>('intro');
  const [flowerCount, setFlowerCount] = useState(0);
  const [annoyanceLevel, setAnnoyanceLevel] = useState(0);
  const [showAnnoyanceMsg, setShowAnnoyanceMsg] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elementsRef = useRef<{x: number, y: number, size: number, color: string, rotation: number, opacity: number, type: 'flower' | 'heart'}[]>([]);
  const frameRef = useRef<number>(null);

  // --- Game Logic ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Elements with a dreamy glow
      elementsRef.current.forEach((f) => {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation);
        ctx.globalAlpha = f.opacity;
        
        if (f.type === 'flower') {
          // Flower petals
          ctx.fillStyle = f.color;
          for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.rotate(Math.PI / 3);
            ctx.ellipse(0, f.size / 2, f.size / 3, f.size / 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          // Center of flower
          ctx.beginPath();
          ctx.fillStyle = '#fff';
          ctx.arc(0, 0, f.size / 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Heart shape
          ctx.fillStyle = f.color;
          ctx.beginPath();
          const s = f.size / 2;
          ctx.moveTo(0, s / 2);
          ctx.bezierCurveTo(s / 2, -s / 2, s * 1.5, s / 2, 0, s * 1.5);
          ctx.bezierCurveTo(-s * 1.5, s / 2, -s / 2, -s / 2, 0, s / 2);
          ctx.fill();
        }
        
        ctx.restore();
      });

      frameRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handleInteraction = (e: React.PointerEvent) => {
    if (gameState !== 'playing') return;

    // Gussa/Annoyance logic
    setAnnoyanceLevel(prev => {
      const next = prev + 1;
      if (next > 12) {
        setShowAnnoyanceMsg(true);
        setTimeout(() => {
          setShowAnnoyanceMsg(false);
          setAnnoyanceLevel(0);
        }, 1500);
        return 0;
      }
      return next;
    });

    // Create a new element (flower or heart)
    const colors = ['#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be123c', '#9f1239'];
    const newElement = {
      x: e.clientX,
      y: e.clientY,
      size: Math.random() * 20 + 15,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      opacity: 0.8,
      type: Math.random() > 0.5 ? 'flower' : ('heart' as 'flower' | 'heart')
    };

    elementsRef.current.push(newElement);
    setFlowerCount(prev => {
      const next = prev + 1;
      if (next >= FLOWERS_TO_FINISH) {
        setTimeout(() => setGameState('letter'), 1000);
      }
      return next;
    });
  };

  // Background color based on progress
  const progress = Math.min(flowerCount / FLOWERS_TO_FINISH, 1);
  const bgStyle = {
    background: `linear-gradient(to bottom, 
      ${progress > 0.5 ? '#fff1f2' : '#0f172a'}, 
      ${progress > 0.5 ? '#ffe4e6' : '#1e1b4b'})`,
    transition: 'background 2s ease'
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden select-none font-sans"
      style={bgStyle}
      onPointerDown={handleInteraction}
    >
      {/* Heartbeat Pulse Effect */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
      >
        <Heart size={600} className="text-pink-300 fill-current" />
      </motion.div>
      {/* Canvas for effects */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none" />

      {/* UI Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none p-8 flex flex-col justify-between">
        
        {/* Top Bar */}
        <div className="flex justify-between items-start pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col"
          >
            <h1 className={`text-2xl md:text-4xl font-light tracking-widest uppercase ${progress > 0.5 ? 'text-gray-800' : 'text-white'}`}>
              Kashish's <span className="font-bold italic">Canvas</span>
            </h1>
            <p className={`text-[10px] tracking-[0.4em] uppercase mt-1 ${progress > 0.5 ? 'text-gray-400' : 'text-gray-500'}`}>
              Every touch is an effort
            </p>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className={`px-4 py-1 rounded-full border text-[10px] font-bold tracking-widest uppercase ${progress > 0.5 ? 'bg-white/40 border-gray-200 text-gray-600' : 'bg-black/20 border-white/10 text-gray-400'}`}>
              Progress: {Math.round(progress * 100)}%
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <AnimatePresence mode="wait">
            {gameState === 'intro' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="max-w-xl pointer-events-auto"
              >
                <motion.div 
                  animate={{ y: [0, -10, 0] }} 
                  transition={{ duration: 4, repeat: Infinity }}
                  className="mb-8 inline-block"
                >
                  <Palette size={48} className="text-pink-400" />
                </motion.div>
                <h2 className="text-3xl md:text-5xl font-light text-white mb-6 leading-tight tracking-tight">
                  I didn't fill your world with <br />
                  the <span className="italic font-normal text-pink-400">colors</span> you deserved.
                </h2>
                <p className="text-gray-400 mb-10 leading-relaxed text-sm md:text-base max-w-md mx-auto">
                  Kashish, this canvas is empty, just like the efforts I missed. Use your magic to bring it back to life.
                </p>
                <div className="flex justify-center">
                  <button 
                    onClick={() => {
                      setGameState('playing');
                    }}
                    className="px-10 py-4 bg-white text-gray-900 rounded-full font-bold tracking-[0.2em] uppercase text-[10px] hover:scale-105 transition-transform shadow-2xl w-full md:w-auto"
                  >
                    Start Painting
                  </button>
                </div>
              </motion.div>
            )}

            {gameState === 'playing' && flowerCount < 5 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none"
              >
                <p className={`text-lg italic font-light ${progress > 0.5 ? 'text-gray-400' : 'text-gray-500'}`}>
                  "Touch the screen to bloom..."
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Bar */}
        <div className="flex justify-center">
          <motion.div 
            animate={showAnnoyanceMsg ? { x: [-3, 3, -3, 3, 0] } : {}}
            className={`px-6 py-2 rounded-full border backdrop-blur-sm transition-colors ${progress > 0.5 ? 'bg-white/20 border-gray-200' : 'bg-black/10 border-white/5'}`}
          >
            <p className={`text-[9px] font-bold tracking-[0.4em] uppercase ${progress > 0.5 ? 'text-gray-500' : 'text-gray-600'}`}>
              {showAnnoyanceMsg ? "Oye! Kashish ko gussa mat dilao! 😤" : "Bloom the world, one touch at a time"}
            </p>
          </motion.div>
        </div>
      </div>

      {/* The Natural Letter */}
      <AnimatePresence>
        {gameState === 'letter' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white p-8 md:p-14 rounded-[3rem] max-w-lg w-full shadow-2xl relative border border-pink-50"
            >
              <div className="absolute top-8 right-8 text-pink-100">
                <Heart size={80} fill="currentColor" />
              </div>
              
              <div className="flex items-center gap-2 mb-10">
                <div className="w-8 h-[1px] bg-pink-200"></div>
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-pink-400">Just for you</span>
              </div>

              <h2 className="text-3xl font-light text-gray-900 mb-8">Shona,</h2>
              
              <div className="space-y-6 text-gray-600 leading-relaxed text-base md:text-lg font-light">
                <p>
                  I know I haven't always been perfect at showing you how much you mean to me. I've missed moments to surprise you and make you feel as special as you truly are, and for that, I'm truly sorry.
                </p>
                <p>
                  I wanted to create this unique little world just for you—a place where every touch brings life and color, just like you do for me. You are the most beautiful part of my life, the one who makes everything feel magical just by being there.
                </p>
                <p>
                  I want to cherish you, be there for you, and fill your world with all the happiness you deserve.
                </p>
                <p className="font-medium text-gray-800">
                  Bas itna hi kehna tha, ki tumhare saath bitaya har pal mere liye bohot keemti hai.
                </p>
              </div>

              <div className="mt-12 pt-8 border-t border-pink-50 flex justify-between items-center">
                <p className="text-gray-400 text-xs italic">Bas yunhi...</p>
                <button 
                  onClick={() => {
                    setGameState('playing');
                    setFlowerCount(0);
                    elementsRef.current = [];
                  }}
                  className="p-3 rounded-full bg-pink-50 text-pink-500 hover:bg-pink-100 transition-colors pointer-events-auto"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-300/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
            }}
          >
            <Sparkles size={10} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
