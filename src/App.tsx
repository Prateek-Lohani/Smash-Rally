/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useEffect, createContext, useContext } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import { 
  Trophy, 
  Zap, 
  ShieldAlert, 
  Maximize, 
  ChevronDown, 
  Target, 
  Info,
  ArrowRight,
  Activity,
  Volume2,
  VolumeX
} from 'lucide-react';

// Sound Context
const SoundContext = createContext<{
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (type: 'click' | 'whoosh' | 'serve') => void;
}>({
  isMuted: false,
  toggleMute: () => {},
  playSound: () => {},
});

const SoundProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMuted, setIsMuted] = useState(false);
  
  const sounds = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    sounds.current = {
      click: new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a73456.mp3'),
      whoosh: new Audio('https://cdn.pixabay.com/audio/2022/03/10/audio_783d4a0231.mp3'),
      serve: new Audio('https://cdn.pixabay.com/audio/2022/03/10/audio_c3508a2895.mp3'),
    };

    // Preload and set volumes
    Object.values(sounds.current).forEach(audio => {
      audio.volume = 0.2;
      audio.load();
    });
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    haptic('light');
  }, []);

  const playSound = useCallback((type: 'click' | 'whoosh' | 'serve') => {
    if (isMuted) return;
    const audio = sounds.current[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, [isMuted]);

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, playSound }}>
      {children}
    </SoundContext.Provider>
  );
};

const useSound = () => useContext(SoundContext);

const haptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    switch (type) {
      case 'light':
        window.navigator.vibrate(10);
        break;
      case 'medium':
        window.navigator.vibrate(20);
        break;
      case 'heavy':
        window.navigator.vibrate(50);
        break;
      case 'success':
        window.navigator.vibrate([10, 30, 10]);
        break;
      case 'error':
        window.navigator.vibrate([50, 50, 50]);
        break;
    }
  }
};

const SectionTitle = ({ children, subtitle, number }: { children: React.ReactNode, subtitle?: string, number: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  return (
    <div ref={ref} className="mb-12 md:mb-24 relative">
      <motion.span 
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 0.5, x: 0 } : {}}
        className="font-mono text-xs md:text-sm tracking-widest uppercase mb-2 block text-[#ccff00]"
      >
        {number} // {subtitle}
      </motion.span>
      <motion.h2 
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-4xl sm:text-5xl md:text-8xl font-display uppercase leading-none tracking-tighter"
      >
        {children}
      </motion.h2>
    </div>
  );
};

const RuleCard = ({ title, description, icon: Icon, delay = 0 }: { title: string, description: string, icon: any, delay?: number }) => {
  const { playSound } = useSound();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
      onClick={() => {
        haptic('light');
        playSound('click');
      }}
      className="p-6 md:p-8 glass rounded-2xl flex flex-col gap-4 group transition-all duration-300 cursor-pointer"
    >
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#ccff00] flex items-center justify-center text-black group-hover:rotate-12 transition-transform">
        <Icon size={20} className="md:w-6 md:h-6" />
      </div>
      <h3 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h3>
      <p className="text-gray-400 text-sm md:text-base leading-relaxed">{description}</p>
    </motion.div>
  );
};

const TechniqueShowcase = ({ type }: { type: 'clear' | 'drop' | 'smash' | 'drive' }) => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.5 });
  const { playSound } = useSound();
  const prevInView = useRef(false);

  useEffect(() => {
    if (isInView && !prevInView.current) {
      playSound('whoosh');
    }
    prevInView.current = isInView;
  }, [isInView, playSound]);

  const trajectories = {
    clear: "M 10 50 Q 50 -20 90 50",
    drop: "M 10 50 Q 40 0 60 55",
    smash: "M 10 10 L 70 55",
    drive: "M 10 35 L 90 35"
  };

  return (
    <div 
      ref={containerRef} 
      onClick={() => {
        haptic('medium');
        playSound('click');
      }}
      className="relative w-full aspect-[16/9] glass rounded-3xl overflow-hidden bg-black/40 border border-white/5 cursor-pointer"
    >
      <svg viewBox="0 0 100 60" className="w-full h-full">
        {/* Net Line */}
        <line x1="50" y1="20" x2="50" y2="60" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
        
        {/* Trajectory Path */}
        <motion.path
          d={trajectories[type]}
          fill="transparent"
          stroke="#ccff00"
          strokeWidth="1"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 0.4 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Shuttlecock */}
        <motion.g
          initial={{ offsetDistance: "0%", opacity: 0 }}
          animate={isInView ? { 
            offsetDistance: ["0%", "100%"],
            opacity: [0, 1, 1, 0]
          } : { offsetDistance: "0%", opacity: 0 }}
          transition={{ 
            duration: 1.5, 
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 1
          }}
          style={{ 
            offsetPath: `path('${trajectories[type]}')`,
            offsetRotate: "auto 90deg"
          }}
        >
          <path d="M -2 -2 L 2 -2 L 0 3 Z" fill="#ccff00" />
          <circle cx="0" cy="-2" r="1.5" fill="white" />
        </motion.g>
      </svg>
      
      <div className="absolute top-4 left-4 md:top-6 md:left-6">
        <div className="font-mono text-[8px] md:text-[10px] uppercase tracking-widest text-[#ccff00] mb-1">Shot Type</div>
        <h4 className="text-xl md:text-2xl font-display uppercase">{type}</h4>
      </div>
      
      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 text-right max-w-[150px] md:max-w-[200px]">
        <p className="text-[8px] md:text-[10px] text-gray-400 leading-tight uppercase font-mono">
          {type === 'clear' && "High and deep to push the opponent back."}
          {type === 'drop' && "Soft hit landing just over the net."}
          {type === 'smash' && "The ultimate offensive weapon. Steep and fast."}
          {type === 'drive' && "A flat, fast shot to pressure the opponent."}
        </p>
      </div>
    </div>
  );
};

const StaggeredListItem = ({ children, index }: { children: React.ReactNode, index: number }) => (
  <motion.li 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
    className="flex gap-3 items-start"
  >
    <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] mt-2 shrink-0" />
    <span>{children}</span>
  </motion.li>
);

const ServiceDiagram = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });
  const { playSound } = useSound();
  const prevInView = useRef(false);

  useEffect(() => {
    if (isInView && !prevInView.current) {
      playSound('serve');
    }
    prevInView.current = isInView;
  }, [isInView, playSound]);

  return (
    <div ref={ref} className="relative aspect-square glass rounded-3xl overflow-hidden group bg-black/20">
      <div className="absolute inset-0 bg-gradient-to-br from-[#ccff00]/5 to-transparent" />
      <svg viewBox="0 0 100 100" className="w-full h-full p-8">
        {/* Court Grid */}
        <rect x="10" y="10" width="80" height="80" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
        <line x1="50" y1="10" x2="50" y2="90" stroke="white" strokeWidth="0.5" opacity="0.2" />
        <line x1="10" y1="50" x2="90" y2="50" stroke="white" strokeWidth="0.5" opacity="0.2" />
        
        {/* Service Path */}
        <motion.path
          d="M 30 70 L 70 30"
          fill="none"
          stroke="#ccff00"
          strokeWidth="2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />

        {/* Server and Receiver Indicators */}
        <motion.circle
          cx="30" cy="70" r="4"
          fill="#ccff00"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : { scale: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
        />
        <motion.circle
          cx="70" cy="30" r="4"
          fill="white"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : { scale: 0 }}
          transition={{ delay: 0.8, type: "spring" }}
        />

        {/* Labels */}
        <motion.text 
          x="15" y="85" fill="white" fontSize="5" fontFamily="monospace" opacity="0.5"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 0.5 } : {}}
        >SERVER</motion.text>
        <motion.text 
          x="55" y="18" fill="white" fontSize="5" fontFamily="monospace" opacity="0.5"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 0.5 } : {}}
        >RECEIVER</motion.text>
      </svg>
      
      <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8">
        <div className="font-mono text-[8px] md:text-[10px] uppercase tracking-widest text-[#ccff00] mb-2">Visual Guide</div>
        <p className="text-xs md:text-sm font-light text-gray-400">Diagonal service is mandatory. Even scores serve from the right, odd from the left.</p>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <SoundProvider>
      <AppContent />
    </SoundProvider>
  );
}

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const { isMuted, toggleMute, playSound } = useSound();
  
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  return (
    <div className="min-h-screen selection:bg-[#ccff00] selection:text-black">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, -500]) }}
          className="absolute top-[20%] left-[10%] w-64 h-64 bg-[#ccff00] rounded-full blur-[150px] opacity-[0.03]"
        />
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, 300]) }}
          className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-blue-600 rounded-full blur-[180px] opacity-[0.03]"
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 p-4 md:p-6 flex justify-between items-center mix-blend-difference">
        <div className="font-display text-xl md:text-2xl tracking-tighter uppercase">Smash.</div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 font-mono text-xs uppercase tracking-widest items-center">
          {['scoring', 'service', 'techniques', 'faults', 'court'].map((item) => (
            <a 
              key={item} 
              href={`#${item}`} 
              onClick={() => {
                haptic('light');
                playSound('click');
              }}
              className="hover:text-[#ccff00] transition-colors"
            >
              {item}
            </a>
          ))}
          
          <button 
            onClick={toggleMute}
            className="p-2 hover:text-[#ccff00] transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              haptic('success');
              playSound('click');
            }}
            className="hidden sm:block bg-white text-black px-4 py-2 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-[#ccff00] transition-colors"
          >
            Join Club
          </button>
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              haptic('medium');
              playSound('click');
            }}
            className="md:hidden text-white p-2"
          >
            <div className="w-6 h-0.5 bg-white mb-1.5 transition-all" style={{ transform: isMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <div className="w-6 h-0.5 bg-white mb-1.5 transition-all" style={{ opacity: isMenuOpen ? 0 : 1 }} />
            <div className="w-6 h-0.5 bg-white transition-all" style={{ transform: isMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <motion.div 
          initial={false}
          animate={{ x: isMenuOpen ? 0 : '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center gap-8 md:hidden"
        >
          <button 
            onClick={() => {
              setIsMenuOpen(false);
              haptic('light');
              playSound('click');
            }}
            className="absolute top-6 right-6 text-white p-2"
          >
            <Zap size={32} className="text-[#ccff00]" />
          </button>
          <button 
            onClick={toggleMute}
            className="absolute top-6 left-6 text-white p-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            <span>{isMuted ? "Muted" : "Sound On"}</span>
          </button>
          {['scoring', 'service', 'techniques', 'faults', 'court'].map((item) => (
            <a 
              key={item}
              href={`#${item}`} 
              onClick={() => {
                setIsMenuOpen(false);
                haptic('light');
                playSound('click');
              }}
              className="text-4xl font-display uppercase tracking-tighter hover:text-[#ccff00] transition-colors"
            >
              {item}
            </a>
          ))}
          <button 
            onClick={() => {
              haptic('success');
              playSound('click');
            }}
            className="mt-8 bg-[#ccff00] text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest"
          >
            Join Club
          </button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="h-screen flex flex-col items-center justify-center relative overflow-hidden px-6">
        <motion.div 
          style={{ opacity, scale }}
          className="z-10 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-[18vw] sm:text-[15vw] md:text-[12vw] font-display uppercase leading-[0.8] sm:leading-[0.85] tracking-tighter mb-4">
              The Art of <br />
              <span className="text-stroke">Badminton</span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="max-w-xl mx-auto text-gray-400 text-lg md:text-xl font-light"
          >
            Master the rules, perfect your swing, and dominate the court. 
            A comprehensive guide to the fastest racket sport in the world.
          </motion.p>
        </motion.div>

        {/* Floating Decor Elements */}
        <motion.div 
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 15, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 opacity-10 pointer-events-none hidden lg:block"
        >
          <Zap size={120} className="text-[#ccff00]" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-50">Scroll to Explore</span>
          <ChevronDown className="animate-bounce opacity-50" />
        </motion.div>

        {/* Background Text Marquee */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] select-none">
          <div className="text-[40vw] font-display uppercase whitespace-nowrap">
            RALLY RALLY RALLY
          </div>
        </div>
      </section>

      {/* Content Container */}
      <main className="max-w-7xl mx-auto px-6 pb-32">
        
        {/* Scoring Section */}
        <section id="scoring" className="py-24">
          <SectionTitle number="01" subtitle="The Point System">Victory Conditions</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RuleCard 
              icon={Trophy}
              title="21 Points"
              description="A match consists of the best of 3 games of 21 points. Every time there is a serve, there is a point scored."
            />
            <RuleCard 
              icon={Zap}
              title="Rally Point"
              description="The side winning a rally adds a point to its score. You don't need to be serving to score a point."
              delay={0.1}
            />
            <RuleCard 
              icon={ArrowRight}
              title="Deuce"
              description="At 20-all, the side which gains a 2 point lead first, wins that game. At 29-all, the side scoring the 30th point wins."
              delay={0.2}
            />
          </div>
        </section>

        {/* Service Section */}
        <section id="service" className="py-24 relative z-10">
          <SectionTitle number="02" subtitle="Starting the Play">Service Rules</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex gap-6 items-start"
              >
                <div className="text-4xl font-display text-[#ccff00] opacity-50">01</div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Diagonal Delivery</h4>
                  <p className="text-gray-400">The server and receiver stand in diagonally opposite service courts. The shuttle must land in the receiver's service court.</p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="text-4xl font-display text-[#ccff00] opacity-50">02</div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Below the Waist</h4>
                  <p className="text-gray-400">At the instant of being hit, the whole shuttle must be below the server's waist (specifically the lowest rib).</p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex gap-6 items-start"
              >
                <div className="text-4xl font-display text-[#ccff00] opacity-50">03</div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Stationary Feet</h4>
                  <p className="text-gray-400">Both the server and the receiver must remain stationary with both feet in contact with the ground until the service is delivered.</p>
                </div>
              </motion.div>
            </div>
            
            <ServiceDiagram />
          </div>
        </section>

        {/* Techniques Section */}
        <section id="techniques" className="py-24">
          <SectionTitle number="03" subtitle="Master the Game">Shot Techniques</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <TechniqueShowcase type="clear" />
              <div className="p-6 glass rounded-2xl">
                <h4 className="text-xl font-bold mb-2">The Clear</h4>
                <p className="text-sm text-gray-400">The most basic shot, used to buy time or push your opponent to the back of the court. Hit high and deep.</p>
              </div>
            </div>
            <div className="space-y-4">
              <TechniqueShowcase type="drop" />
              <div className="p-6 glass rounded-2xl">
                <h4 className="text-xl font-bold mb-2">The Drop Shot</h4>
                <p className="text-sm text-gray-400">A deceptive shot that starts like a clear but drops just over the net. Forces the opponent to move forward.</p>
              </div>
            </div>
            <div className="space-y-4">
              <TechniqueShowcase type="smash" />
              <div className="p-6 glass rounded-2xl">
                <h4 className="text-xl font-bold mb-2">The Smash</h4>
                <p className="text-sm text-gray-400">The primary attacking shot. Hit with maximum power at a steep downward angle to end the rally.</p>
              </div>
            </div>
            <div className="space-y-4">
              <TechniqueShowcase type="drive" />
              <div className="p-6 glass rounded-2xl">
                <h4 className="text-xl font-bold mb-2">The Drive</h4>
                <p className="text-sm text-gray-400">A flat, fast shot played from mid-court to mid-court. Used to keep the pressure on and force errors.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Faults Section */}
        <section id="faults" className="py-24 relative z-10">
          <SectionTitle number="04" subtitle="Common Violations">Illegal Actions</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 border border-white/10 rounded-3xl hover:border-[#ccff00]/30 transition-colors bg-black/10"
            >
              <ShieldAlert className="text-red-500 mb-6" size={40} />
              <h3 className="text-3xl font-display uppercase mb-4">Net Faults</h3>
              <ul className="space-y-4 text-gray-400">
                <StaggeredListItem index={0}>Touching the net or its supports with racket, person, or dress.</StaggeredListItem>
                <StaggeredListItem index={1}>Invading an opponent's court over the net (except follow-through).</StaggeredListItem>
                <StaggeredListItem index={2}>Obstructing an opponent or distracting them by shouting/gesturing.</StaggeredListItem>
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 border border-white/10 rounded-3xl hover:border-[#ccff00]/30 transition-colors bg-black/10"
            >
              <Activity className="text-blue-500 mb-6" size={40} />
              <h3 className="text-3xl font-display uppercase mb-4">Shuttle Faults</h3>
              <ul className="space-y-4 text-gray-400">
                <StaggeredListItem index={0}>Shuttle caught and held on the racket and then slung during a stroke.</StaggeredListItem>
                <StaggeredListItem index={1}>Shuttle hit twice in succession by the same player.</StaggeredListItem>
                <StaggeredListItem index={2}>Shuttle touches the ceiling or any surrounding objects.</StaggeredListItem>
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Court Section */}
        <section id="court" className="py-24">
          <SectionTitle number="05" subtitle="The Arena">Court Dimensions</SectionTitle>
          <div className="glass rounded-3xl md:rounded-[40px] p-6 md:p-16 overflow-hidden relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
              <div>
                <h3 className="text-3xl md:text-4xl font-display uppercase mb-6">Singles vs Doubles</h3>
                <p className="text-gray-400 mb-8 leading-relaxed text-sm md:text-base">
                  The court is a rectangle 13.4m long and 6.1m wide. 
                  In singles, the court is narrower (5.18m). The "long and thin" 
                  service area is for singles, while doubles uses the "short and wide" area.
                </p>
                <div className="flex flex-wrap gap-3 md:gap-4">
                  <div className="px-4 md:px-6 py-2 md:py-3 rounded-full border border-white/10 text-[10px] md:text-sm font-mono uppercase">Length: 13.4m</div>
                  <div className="px-4 md:px-6 py-2 md:py-3 rounded-full border border-white/10 text-[10px] md:text-sm font-mono uppercase">Width: 6.1m</div>
                  <div className="px-4 md:px-6 py-2 md:py-3 rounded-full border border-white/10 text-[10px] md:text-sm font-mono uppercase">Net Height: 1.55m</div>
                </div>
              </div>
              <div className="relative aspect-[4/3] bg-[#1e40af] rounded-xl border-2 md:border-4 border-white/20 shadow-2xl overflow-hidden">
                {/* Simplified Court SVG */}
                <svg viewBox="0 0 100 60" className="w-full h-full opacity-80">
                  <rect x="0" y="0" width="100" height="60" fill="none" stroke="white" strokeWidth="0.5" />
                  <line x1="50" y1="0" x2="50" y2="60" stroke="white" strokeWidth="1" /> {/* Net */}
                  <line x1="0" y1="5" x2="100" y2="5" stroke="white" strokeWidth="0.5" /> {/* Side Alley */}
                  <line x1="0" y1="55" x2="100" y2="55" stroke="white" strokeWidth="0.5" /> {/* Side Alley */}
                  <line x1="15" y1="0" x2="15" y2="60" stroke="white" strokeWidth="0.5" /> {/* Service Line */}
                  <line x1="85" y1="0" x2="85" y2="60" stroke="white" strokeWidth="0.5" /> {/* Service Line */}
                  <line x1="0" y1="30" x2="15" y2="30" stroke="white" strokeWidth="0.5" /> {/* Center Line */}
                  <line x1="85" y1="30" x2="100" y2="30" stroke="white" strokeWidth="0.5" /> {/* Center Line */}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg text-[10px] uppercase font-mono tracking-tighter">Interactive Map Coming Soon</div>
                </div>
              </div>
            </div>
            
            {/* Decorative Background Element */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#ccff00] rounded-full blur-[120px] opacity-10" />
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 md:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-6 md:space-y-8"
          >
            <h2 className="text-5xl md:text-9xl font-display uppercase tracking-tighter leading-none">Ready to <br /> <span className="text-[#ccff00]">Smash?</span></h2>
            <p className="text-gray-400 max-w-lg mx-auto text-sm md:text-base px-4">Now that you know the rules, it's time to hit the court. Find a local club and start your journey.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 px-6">
              <button className="bg-[#ccff00] text-black px-8 md:px-10 py-4 md:py-5 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform text-xs md:text-sm">
                Find a Court
              </button>
              <button className="border border-white/20 px-8 md:px-10 py-4 md:py-5 rounded-full font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all text-xs md:text-sm">
                Learn Techniques
              </button>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="font-display text-2xl uppercase tracking-tighter">Smash.</div>
          <div className="flex gap-8 text-gray-500 text-xs font-mono uppercase">
            <span>© 2026 Smash Guide</span>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#ccff00] hover:text-black transition-colors cursor-pointer">
              <Info size={14} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

