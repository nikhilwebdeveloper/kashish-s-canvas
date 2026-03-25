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
  Palette,
  Flower,
  Leaf
} from 'lucide-react';

// --- Constants ---
const FLOWERS_TO_FINISH = 40;

// --- Main Component ---
export default function App() {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'letter' | 'letter2' | 'bouquet'>('intro');
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
                  I hope this adds a little color to your day.
                </p>
              </div>

              <div className="mt-12 pt-8 border-t border-pink-50 flex justify-between items-center">
                <p className="text-gray-400 text-xs italic">Bas yunhi...</p>
                <button 
                  onClick={() => setGameState('letter2')}
                  className="px-6 py-3 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-all shadow-lg hover:shadow-pink-200/50 flex items-center gap-2 pointer-events-auto group"
                >
                  <span>Read more...</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Mail size={18} />
                  </motion.div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {gameState === 'letter2' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-rose-50/95 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto"
          >
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white p-8 md:p-12 rounded-[3rem] max-w-xl w-full shadow-2xl relative border border-rose-100 my-8"
            >
              <div className="absolute top-8 right-8 text-rose-100/50">
                <Sparkles size={60} />
              </div>
              
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-[1px] bg-rose-200"></div>
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-rose-400">Honesty</span>
              </div>

              <h2 className="text-3xl font-light text-gray-900 mb-6">Hey Kashish,</h2>
              
              <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base font-light overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
                <p>
                  I've been thinking about this for a while, and I felt like I owed you something more than just moving on quietly — I owe you honesty.
                </p>
                <p>
                  I want you to know that I've accepted everything that happened between us. And the more I've thought about it, the more I've realized how right you were. You deserved effort. You deserved to feel special, to be surprised, to feel like someone was genuinely showing up for you — and I didn't do that. Not because I didn't care, but because I was oblivious to what you were silently hoping for.
                </p>
                <p className="font-medium text-rose-500">
                  That's on me. Fully.
                </p>
                <p>
                  I never wanted you to feel like you weren't enough, or that you weren't worth the effort — because the truth is, you were worth all of it. I just didn't show it the way I should have, and by the time I understood what you needed, the thing was already done.
                </p>
                <p>
                  I'm genuinely sorry. Not as an excuse, not to change anything — just because you deserve to hear it.
                </p>
                <p>
                  This little game I made it for you. It's not much, but it's probably the effort I should have shown a lot sooner. Consider this my very late, very honest attempt at doing something just for you.
                </p>
                <p>
                  And I'm glad you're okay. Seeing you move forward with a smile means a lot, even from where I'm standing now.
                </p>
                <p className="text-xs italic text-gray-400">
                  I know Meri English itni achhi nahi hai But I hope tu samjhe,
                </p>
                <p>
                  Take care of yourself always.
                </p>
              </div>

              <div className="mt-10 pt-6 border-t border-rose-50 flex justify-between items-center">
                <p className="text-gray-400 text-xs italic">Warmly, Nikhil</p>
                <button 
                  onClick={() => setGameState('bouquet')}
                  className="px-8 py-3 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-lg hover:shadow-rose-200/50 flex items-center gap-2 pointer-events-auto group"
                >
                  <span>Open your gift</span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Heart size={18} fill="currentColor" />
                  </motion.div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {gameState === 'bouquet' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[60] bg-rose-50/90 backdrop-blur-3xl flex flex-col items-center justify-center p-6 overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative flex flex-col items-center"
            >
              {/* The New Bouquet Design */}
              <div className="relative w-80 h-[32rem] flex flex-col items-center">
                
                {/* 1. The Flower Bunch (Top) */}
                <div className="relative z-30 w-72 h-72 -mb-20">
                  {[...Array(24)].map((_, i) => {
                    // Create a dense dome of flowers
                    const angle = (i / 24) * Math.PI * 2;
                    const radius = (i % 3 === 0 ? 30 : i % 3 === 1 ? 60 : 90) * (0.8 + Math.random() * 0.4);
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * (radius * 0.6) + 20;
                    
                    const colors = [
                      'text-rose-500', 'text-pink-500', 'text-red-400', 
                      'text-rose-300', 'text-pink-200', 'text-white'
                    ];
                    const size = 50 + Math.random() * 30;
                    
                    return (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, x: 0, y: 0 }}
                        animate={{ scale: 1, x, y }}
                        transition={{ 
                          delay: 0.5 + i * 0.03, 
                          type: 'spring',
                          stiffness: 100
                        }}
                        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${colors[i % colors.length]} drop-shadow-md`}
                        style={{ zIndex: 50 - i }}
                      >
                        <Flower 
                          size={size} 
                          fill="currentColor" 
                          fillOpacity={0.5} 
                          className="filter drop-shadow-sm"
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400/60 rounded-full blur-[2px]" />
                      </motion.div>
                    );
                  })}

                  {/* Leaves peeking through */}
                  {[...Array(10)].map((_, i) => {
                    const angle = (i / 10) * Math.PI * 2;
                    const radius = 100;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * (radius * 0.6) + 20;
                    return (
                      <motion.div
                        key={`leaf-${i}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.4, scale: 1 }}
                        transition={{ delay: 1 + i * 0.1 }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-green-700"
                        style={{ x, y, rotate: angle * (180/Math.PI) + 90 }}
                      >
                        <Leaf size={30} fill="currentColor" />
                      </motion.div>
                    );
                  })}
                </div>

                {/* 2. The Wrapping (Middle/Bottom) */}
                <div className="relative z-20 w-64 h-64 flex justify-center">
                  {/* Back Paper Layer */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: 256 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="absolute top-0 w-full bg-pink-100 rounded-t-lg shadow-inner"
                    style={{ clipPath: 'polygon(0% 0%, 100% 0%, 60% 100%, 40% 100%)' }}
                  />
                  
                  {/* Front Paper Layer (Folded) */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: 240 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="absolute top-0 w-[90%] bg-white border-x border-pink-50 shadow-lg"
                    style={{ clipPath: 'polygon(0% 0%, 100% 0%, 55% 100%, 45% 100%)' }}
                  />

                  {/* Stems peeking out bottom */}
                  <div className="absolute bottom-[-40px] w-12 h-20 flex justify-center overflow-hidden">
                    {[...Array(8)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1 h-full bg-green-900/40 rounded-full mx-0.5 transform origin-top"
                        style={{ rotate: `${(i - 3.5) * 5}deg` }}
                      />
                    ))}
                  </div>
                </div>

                {/* 3. The Ribbon (The "Tie") */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5, type: 'spring' }}
                  className="absolute bottom-24 z-40 flex flex-col items-center"
                >
                  <div className="relative">
                    {/* Compact Bow */}
                    <div className="flex -space-x-2">
                      <div className="w-10 h-8 border-[5px] border-rose-500 rounded-full bg-rose-50/30" />
                      <div className="w-10 h-8 border-[5px] border-rose-500 rounded-full bg-rose-50/30" />
                    </div>
                    {/* Knot */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-6 bg-rose-600 rounded-md shadow-md z-10" />
                    {/* Small subtle tails */}
                    <div className="flex gap-4 mt-[-2px]">
                      <div className="w-1.5 h-4 bg-rose-500 rounded-full rotate-[-15deg] origin-top" />
                      <div className="w-1.5 h-4 bg-rose-500 rounded-full rotate-[15deg] origin-top" />
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 }}
                className="text-center mt-16"
              >
                <h3 className="text-5xl font-serif italic text-rose-900 mb-2 tracking-tight">For you, Kashish</h3>
                <p className="text-2xl font-serif italic text-rose-400/80">Sorry</p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.5 }}
                onClick={() => {
                  setGameState('playing');
                  setFlowerCount(0);
                  elementsRef.current = [];
                }}
                className="mt-12 px-12 py-4 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-all flex items-center gap-3 group shadow-xl shadow-rose-200/50"
              >
                <span className="text-sm font-bold tracking-widest uppercase">Create more magic</span>
                <RotateCcw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
              </motion.button>
            </motion.div>

            {/* Immersive background petals */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-rose-200/40 pointer-events-none"
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: -100,
                  rotate: Math.random() * 360,
                  scale: 0.2 + Math.random() * 0.8
                }}
                animate={{ 
                  y: window.innerHeight + 100,
                  rotate: 1440,
                  x: `+=${Math.sin(i) * 300}`
                }}
                transition={{ 
                  duration: 20 + Math.random() * 20,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 20
                }}
              >
                <Flower size={15 + Math.random() * 20} fill="currentColor" />
              </motion.div>
            ))}
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
