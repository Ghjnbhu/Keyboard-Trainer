import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';

const App = () => {
  // Game settings
  const [speed, setSpeed] = useState(3);
  const [duration, setDuration] = useState(600);
  const [level, setLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [wrongPresses, setWrongPresses] = useState(0);
  const [timeOver, setTimeOver] = useState(false);
  const [voiceGender, setVoiceGender] = useState('female');
  const [currentVoiceName, setCurrentVoiceName] = useState('Loading...');
  const [availableVoices, setAvailableVoices] = useState({ female: [], male: [] });
  const [useFallback, setUseFallback] = useState(false);
  const [hasFemaleVoice, setHasFemaleVoice] = useState(false);
  const [hasMaleVoice, setHasMaleVoice] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [isSpawning, setIsSpawning] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  
  // Responsive canvas size state
  const [canvasDisplaySize, setCanvasDisplaySize] = useState(400);
  
  const isEdge = useMemo(() => typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('edg'), []);

  // Game elements
  const [currentKey, setCurrentKey] = useState(null);
  const canvasRef = useRef(null);
  const instructionRef = useRef(null);
  const animationRef = useRef(null);
  const spawnTimeoutRef = useRef(null);
  const isGameActiveRef = useRef(false);
  const isSpawningRef = useRef(false);
  const timeOverRef = useRef(false);
  const prevKeyRef = useRef(null);

  // Handle window resize for responsive canvas
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        setCanvasDisplaySize(280);
      } else if (width <= 768) {
        setCanvasDisplaySize(320);
      } else {
        setCanvasDisplaySize(400);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keys depend on level
  const keys = useMemo(() => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    if (level === 1) return letters;
    if (level === 2) {
      const digits = '0123456789'.split('');
      return [...letters, ...digits];
    }
    if (level === 3) {
      const digits = '0123456789'.split('');
      const symbols = '~!@#$%^&*()_+'.split('');
      return [...letters, ...digits, ...symbols];
    }
    // level === 4
    const symbols = '~!@#$%^&*()_+'.split('');
    return symbols;
  }, [level]);

  const symbolToWord = useMemo(() => ({
    '~': 'tilde',
    '!': 'exclamation mark',
    '@': 'at',
    '#': 'hash',
    '$': 'dollar',
    '%': 'percent',
    '^': 'caret',
    '&': 'and',
    '*': 'asterisk',
    '(': 'open parenthesis',
    ')': 'close parenthesis',
    '_': 'underscore',
    '+': 'plus'
  }), []);

  const synth = typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis : null;
  const femaleVoiceRef = useRef(null);
  const maleVoiceRef = useRef(null);

  // Detect browser and speech support
  useEffect(() => {
    if (!synth) {
      setSpeechSupported(false);
      setUseFallback(false);
      setCurrentVoiceName('Speech not available');
      setVoicesLoaded(true);
      return;
    }

    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = ua.includes('android');
    const isOpera = ua.includes('opr') || ua.includes('opera');
    const isEdgeBrowser = ua.includes('edg') || ua.includes('edge');

    // Force fallback for Edge on any OS (Windows, Mac, Android)
    if (isEdgeBrowser) {
      console.log('⚠️ Edge browser detected - using fallback TTS mode');
      setUseFallback(true);
      setCurrentVoiceName('Using device TTS (Edge fallback)');
      setVoicesLoaded(true);
      return;
    }

    if (isAndroid && (isOpera || isEdgeBrowser)) {
      console.log('⚠️ Android + Opera/Edge - using fallback mode');
      setUseFallback(true);
      setCurrentVoiceName('Using device TTS');
      setVoicesLoaded(true);
    }
  }, [synth]);

  // Pre-warm speech synthesis (only when not using fallback)
  useEffect(() => {
    if (!useFallback && synth && speechSupported) {
      try {
        const warmupUtterance = new SpeechSynthesisUtterance('');
        warmupUtterance.volume = 0;
        synth.speak(warmupUtterance);
        setTimeout(() => {
          if (synth.speaking) synth.cancel();
        }, 50);
      } catch (e) {
        console.log('⚠️ Speech warmup failed:', e);
      }
    }
  }, [synth, useFallback, speechSupported]);

  // Load voices (only if not fallback)
  useEffect(() => {
    if (useFallback || !speechSupported || !synth) {
      setVoicesLoaded(true);
      return;
    }

    const loadVoices = () => {
      try {
        const voices = synth.getVoices();
        if (voices.length === 0) {
          setUseFallback(true);
          setCurrentVoiceName('Using device TTS (fallback)');
          setVoicesLoaded(true);
          return;
        }

        const femaleList = [];
        const maleList = [];

        voices.forEach(voice => {
          const name = voice.name.toLowerCase();
          if (name.includes('samantha') || name.includes('victoria') || name.includes('zira') ||
              name.includes('hazel') || name.includes('helena') || name.includes('sara') ||
              name.includes('moira') || name.includes('tessa') || name.includes('kate') ||
              name.includes('emma') || name.includes('lucy') || name.includes('susie') ||
              name.includes('female') || name.includes('girl') || name.includes('woman')) {
            femaleList.push(voice);
          } else if (name.includes('david') || name.includes('george') || name.includes('daniel') ||
                     name.includes('alex') || name.includes('richard') || name.includes('oliver') ||
                     name.includes('harry') || name.includes('james') || name.includes('william') ||
                     name.includes('henry') || name.includes('thomas') || name.includes('charles') ||
                     name.includes('edward') || name.includes('patrick') || name.includes('michael') ||
                     name.includes('john') || name.includes('robert') || name.includes('christopher') ||
                     name.includes('matthew') || name.includes('andrew') || name.includes('joseph') ||
                     name.includes('kevin') || name.includes('brian') || name.includes('steven') ||
                     name.includes('paul') || name.includes('mark') || name.includes('peter') ||
                     name.includes('male') || name.includes('guy') || name.includes('man')) {
            maleList.push(voice);
          }
        });

        setAvailableVoices({ female: femaleList, male: maleList });

        const selectVoice = (list) => {
          if (list.length === 0) return null;
          const britishVoice = list.find(v =>
            v.lang === 'en-GB' ||
            v.name.toLowerCase().includes('uk') ||
            v.name.toLowerCase().includes('british')
          );
          return britishVoice || list[0];
        };

        femaleVoiceRef.current = selectVoice(femaleList);
        maleVoiceRef.current = selectVoice(maleList);
        setHasFemaleVoice(!!femaleVoiceRef.current);
        setHasMaleVoice(!!maleVoiceRef.current);

        if (!maleVoiceRef.current && voices.length > 0) {
          maleVoiceRef.current = voices.find(v => !femaleList.includes(v)) || voices[0];
          setHasMaleVoice(!!maleVoiceRef.current);
        }

        const updateCurrentVoiceName = () => {
          if (voiceGender === 'female' && femaleVoiceRef.current) {
            setCurrentVoiceName(femaleVoiceRef.current.name);
          } else if (voiceGender === 'male' && maleVoiceRef.current) {
            setCurrentVoiceName(maleVoiceRef.current.name);
          } else {
            setCurrentVoiceName('Voice unavailable');
          }
        };
        updateCurrentVoiceName();
        setVoicesLoaded(true);
      } catch (error) {
        console.error('Error loading voices:', error);
        setUseFallback(true);
        setCurrentVoiceName('Using device TTS');
        setVoicesLoaded(true);
      }
    };

    loadVoices();
    if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [synth, voiceGender, useFallback, speechSupported]);

  // Update voice name on gender change
  useEffect(() => {
    if (useFallback || !speechSupported) return;
    if (voiceGender === 'female' && femaleVoiceRef.current) {
      setCurrentVoiceName(femaleVoiceRef.current.name);
    } else if (voiceGender === 'male' && maleVoiceRef.current) {
      setCurrentVoiceName(maleVoiceRef.current.name);
    }
  }, [voiceGender, useFallback, speechSupported]);

  const speakWord = useCallback((word, gender) => {
    if (!speechSupported || !synth) return;
    try {
      if (synth.speaking) synth.cancel();
      const utterance = new SpeechSynthesisUtterance(word);

      // Fallback mode (Edge or other limited browsers)
      if (useFallback) {
        utterance.pitch = gender === 'female' ? 1.1 : 0.9;
        utterance.rate = 0.9;
        utterance.volume = 1;
        utterance.lang = 'en-GB';
        synth.speak(utterance);
        console.log(`🔊 Fallback TTS: "${word}" (${gender})`);
        return;
      }

      let selectedVoice = null;
      if (gender === 'female' && femaleVoiceRef.current) {
        selectedVoice = femaleVoiceRef.current;
        utterance.pitch = 1.1;
      } else if (gender === 'male' && maleVoiceRef.current) {
        selectedVoice = maleVoiceRef.current;
        utterance.pitch = 0.9;
      } else {
        utterance.pitch = gender === 'female' ? 1.1 : 0.9;
        utterance.rate = 0.9;
        utterance.volume = 1;
        utterance.lang = 'en-GB';
        synth.speak(utterance);
        return;
      }

      utterance.voice = selectedVoice;
      utterance.rate = 0.9;
      utterance.volume = 1;
      utterance.lang = 'en-GB';
      synth.speak(utterance);
    } catch (error) {
      console.error('Speech error:', error);
    }
  }, [synth, useFallback, speechSupported]);

  const getSpokenText = useCallback((char) => {
    if (char >= '0' && char <= '9') {
      const digitWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
      return digitWords[parseInt(char, 10)];
    }
    return symbolToWord[char] || char;
  }, [symbolToWord]);

  const speakLetter = useCallback((char) => {
    if (!speechSupported) return;
    const spoken = getSpokenText(char);
    speakWord(spoken, voiceGender);
  }, [speakWord, voiceGender, speechSupported, getSpokenText]);

  const handleVoiceChange = useCallback((gender) => {
    setVoiceGender(gender);
    if (voicesLoaded && speechSupported && !useFallback) {
      setTimeout(() => {
        speakWord(gender === 'female' ? 'Female voice' : 'Male voice', gender);
      }, 100);
    }
  }, [speakWord, voicesLoaded, speechSupported, useFallback]);

  const handleSpeedChange = useCallback((newSpeed) => {
    setSpeed(newSpeed);
    const speedLabel = speedOptions.find(opt => opt.value === newSpeed)?.label || '';
    if (speedLabel && voicesLoaded && speechSupported) {
      setTimeout(() => {
        speakWord(speedLabel, voiceGender);
      }, 50);
    }
  }, [voiceGender, speakWord, voicesLoaded, speechSupported]);

  const handleLevelChange = useCallback((direction) => {
    setLevel(prev => {
      const newLevel = direction === 'next' ? prev + 1 : prev - 1;
      return Math.max(1, Math.min(4, newLevel));
    });
  }, []);

  const handleDurationChange = useCallback((direction) => {
    setDuration(prev => {
      const step = 60;
      const newDuration = direction === 'increase' ? prev + step : prev - step;
      return Math.max(1, Math.min(600, newDuration));
    });
  }, []);

  const speedOptions = [
    { value: 1, label: 'Slow', pixelsPerFrame: 0.125 },
    { value: 2, label: 'Medium', pixelsPerFrame: 0.4 },
    { value: 3, label: 'Fast', pixelsPerFrame: 0.8 },
    { value: 4, label: 'Very Fast', pixelsPerFrame: 1.5 }
  ];

  const pixelsPerFrame = useMemo(() => {
    const option = speedOptions.find(opt => opt.value === speed);
    return option ? option.pixelsPerFrame : 0.125;
  }, [speed]);

  const spawnLetter = useCallback(() => {
    if (isSpawningRef.current || timeOverRef.current || !isGameActiveRef.current) return;
    isSpawningRef.current = true;
    setIsSpawning(true);

    let randomKey;
    if (keys.length === 1) {
      randomKey = keys[0];
    } else {
      do {
        randomKey = keys[Math.floor(Math.random() * keys.length)];
      } while (randomKey === prevKeyRef.current);
    }
    prevKeyRef.current = randomKey;

    if (speechSupported) speakLetter(randomKey);
    if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
    spawnTimeoutRef.current = setTimeout(() => {
      if (isGameActiveRef.current && !timeOverRef.current) {
        setCurrentKey({
          key: randomKey,
          x: Math.random() * (400 - 100) + 50,
          y: 0,
          speed: pixelsPerFrame
        });
      }
      isSpawningRef.current = false;
      setIsSpawning(false);
      spawnTimeoutRef.current = null;
    }, speechSupported ? 300 : 0);
  }, [keys, pixelsPerFrame, speakLetter, speechSupported]);

  const startGame = () => {
    if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
    isSpawningRef.current = false;
    setIsSpawning(false);
    isGameActiveRef.current = true;
    timeOverRef.current = false;
    setTimeOver(false);
    setIsPlaying(true);
    setShowGameOver(false);
    setTimeLeft(duration);
    setScore(0);
    setMisses(0);
    setWrongPresses(0);
    setCurrentKey(null);
    prevKeyRef.current = null;
    spawnLetter();
  };

  const endGame = useCallback(() => {
    isGameActiveRef.current = false;
    timeOverRef.current = false;
    if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
    isSpawningRef.current = false;
    setIsSpawning(false);
    setIsPlaying(false);
    setShowGameOver(true);
    setCurrentKey(null);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (synth && synth.speaking) synth.cancel();
  }, [synth]);

  // Timer effect
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          timeOverRef.current = true;
          setTimeOver(true);
          if (!currentKey) endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, currentKey, endGame]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const instruction = instructionRef.current;
    const update = () => {
      if (!isPlaying) return;
      const canvasRect = canvas.getBoundingClientRect();
      const textRect = instruction.getBoundingClientRect();
      const missThreshold = textRect.top - canvasRect.top;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (currentKey) {
        currentKey.y += currentKey.speed;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(currentKey.key, currentKey.x, currentKey.y);
        if (currentKey.y >= missThreshold) {
          setMisses(prev => prev + 1);
          if (timeOverRef.current) endGame();
          else spawnLetter();
          return;
        }
      }
      animationRef.current = requestAnimationFrame(update);
    };
    animationRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, currentKey, spawnLetter, endGame]);

  // Key press handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying || !currentKey) return;
      if (e.key.length > 1) return;
      const pressedKey = e.key.toUpperCase();
      if (pressedKey === currentKey.key) {
        setScore(prev => prev + 1);
        if (speechSupported) speakLetter(currentKey.key);
        if (timeOverRef.current) endGame();
        else spawnLetter();
      } else {
        setWrongPresses(prev => prev + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentKey, spawnLetter, speakLetter, speechSupported, endGame]);

  const accuracy = useMemo(() => {
    const total = score + misses + wrongPresses;
    return total === 0 ? 0 : Math.round((score / total) * 100);
  }, [score, misses, wrongPresses]);

  const animationStyle = `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    @keyframes glow {
      0% { text-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
      50% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(245, 158, 11, 0.5); }
      100% { text-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
    }
    .animate-button {
      animation: pulse 2s infinite ease-in-out, glow 3s infinite;
    }
    .level-selector, .duration-selector {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin-bottom: 0.75rem;
    }
    .level-arrow, .duration-arrow {
      background: #4B5563;
      border: none;
      color: white;
      font-size: 20px;
      font-weight: bold;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .level-arrow:hover, .duration-arrow:hover {
      background: #6B7280;
      transform: scale(1.05);
    }
    .level-arrow:active, .duration-arrow:active {
      transform: scale(0.95);
    }
    .triangle-left {
      width: 0;
      height: 0;
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
      border-right: 12px solid white;
    }
    .triangle-right {
      width: 0;
      height: 0;
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
      border-left: 12px solid white;
    }
    .level-number, .duration-number {
      font-size: 24px;
      font-weight: bold;
      color: #F59E0B;
      min-width: 80px;
      text-align: center;
    }
    .level-text, .duration-text {
      font-size: 18px;
      font-weight: bold;
      color: #D1D5DB;
      text-align: center;
    }
    
    /* FIX: Remove top padding on mobile for all screens */
    @media (max-width: 768px) {
      .setup-screen, .gameover-screen, .game-screen {
        align-items: flex-start !important;
        padding-top: 2px !important;
      }
    }
  `;

  const inputStyle = `
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button {
      opacity: 1;
      height: 3rem;
      width: 3rem;
      margin-left: 0.5rem;
    }
  `;

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-6">
      <style>{animationStyle}</style>
      <style>{inputStyle}</style>

      {/* SETUP SCREEN */}
      {!isPlaying && !showGameOver && (
        <div className="flex items-center justify-center min-h-screen setup-screen" style={{ paddingTop: '2px' }}>
          <div style={{ width: '500px', maxWidth: '90vw' }} className="bg-gray-800 rounded-lg border border-gray-700 shadow-xl">
            <div style={{ padding: '0.5rem 2.5rem 1.5rem 2.5rem' }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }} className="font-bold text-white text-center">Keyboard Trainer</h1>
              <div className="level-selector">
                <button onClick={() => handleLevelChange('prev')} className="level-arrow"><div className="triangle-left"></div></button>
                <div><div className="level-text">Level</div><div className="level-number">{level}</div></div>
                <button onClick={() => handleLevelChange('next')} className="level-arrow"><div className="triangle-right"></div></button>
              </div>
              {speechSupported ? (
                <>
                  <div style={{ marginBottom: '0.75rem' }} className="text-center">
                    <label style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }} className="block font-bold text-gray-300">Voice:</label>
                    <div className="flex flex-row gap-4 justify-center">
                      <button onClick={() => handleVoiceChange('female')} style={{ padding: '0.5rem 1.5rem', fontSize: '1.125rem', borderRadius: '0.5rem', backgroundColor: voiceGender === 'female' ? '#EC4899' : '#4B5563', color: 'white', border: voiceGender === 'female' ? '2px solid #F9A8D4' : '2px solid transparent', minWidth: '120px', opacity: (hasFemaleVoice || useFallback) ? 1 : 0.5 }} className="font-semibold transition-all hover:opacity-90 flex items-center justify-center" disabled={!hasFemaleVoice && !useFallback}>Female{!hasFemaleVoice && !useFallback && <span className="text-xs">(unavailable)</span>}</button>
                      <button onClick={() => handleVoiceChange('male')} style={{ padding: '0.5rem 1.5rem', fontSize: '1.125rem', borderRadius: '0.5rem', backgroundColor: voiceGender === 'male' ? '#3B82F6' : '#4B5563', color: 'white', border: voiceGender === 'male' ? '2px solid #93C5FD' : '2px solid transparent', minWidth: '120px', opacity: (hasMaleVoice || useFallback) ? 1 : 0.5 }} className="font-semibold transition-all hover:opacity-90 flex items-center justify-center" disabled={!hasMaleVoice && !useFallback}>Male{!hasMaleVoice && !useFallback && <span className="text-xs">(unavailable)</span>}</button>
                    </div>
                  </div>
                  <div style={{ marginBottom: '0.75rem', padding: '0.5rem 1rem', backgroundColor: '#1F2937', borderRadius: '0.5rem', border: '1px solid #374151' }}>
                    <div className="flex items-center justify-between mb-1"><span style={{ fontSize: '10px' }} className="text-gray-400">Current voice:</span><span style={{ fontSize: '10px' }} className={`font-medium ${voiceGender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>{currentVoiceName}</span></div>
                    <div className="flex items-center justify-between text-xs text-gray-500"><span>{useFallback ? '📱 Using device TTS' : `Available: ${availableVoices.female.length} female, ${availableVoices.male.length} male`}</span><span>🇬🇧 British accent</span></div>
                  </div>
                </>
              ) : (
                <div style={{ marginBottom: '0.75rem', padding: '0.5rem 1rem', backgroundColor: '#1F2937', borderRadius: '0.5rem', border: '1px solid #374151' }}>
                  <div className="text-center text-yellow-400 text-sm">ℹ️ Speech not supported on this browser</div>
                </div>
              )}
              <div style={{ marginBottom: '0.75rem' }} className="text-center">
                <label style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }} className="block font-bold text-gray-300">Speed:</label>
                <div className="flex flex-row gap-3 justify-between">
                  {speedOptions.map((option) => (
                    <button key={option.value} onClick={() => handleSpeedChange(option.value)} style={{ padding: '0.5rem 0.25rem', fontSize: '1rem', borderRadius: '0.5rem', backgroundColor: speed === option.value ? '#9333EA' : '#374151', color: 'white', border: speed === option.value ? '2px solid #C084FC' : '2px solid transparent' }} className="flex-1 font-semibold transition-all hover:bg-gray-600">{option.label}</button>
                  ))}
                </div>
              </div>
              <div className="duration-selector">
                <button onClick={() => handleDurationChange('decrease')} className="duration-arrow"><div className="triangle-left"></div></button>
                <div><div className="duration-text">Duration (seconds)</div><div className="duration-number">{duration}</div></div>
                <button onClick={() => handleDurationChange('increase')} className="duration-arrow"><div className="triangle-right"></div></button>
              </div>
              <div className="text-center">
                <button onClick={startGame} style={{ padding: '0.5rem 0', fontSize: '1.5rem', borderRadius: '0.5rem', width: '250px', maxWidth: '100%' }} className="bg-amber-500 text-black font-bold hover:bg-amber-600 transition-all animate-button">START</button>
              </div>
              <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '14px', color: '#FFFFFF' }}>Version 2.0 Build by Victor Bogatyrev for my daughter Mira</div>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {showGameOver && (
        <div className="flex items-center justify-center min-h-screen gameover-screen" style={{ paddingTop: '2px' }}>
          <div style={{ width: '500px', maxWidth: '90vw', backgroundColor: '#1f2937', borderRadius: '0.5rem', border: '1px solid #374151', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }} className="shadow-xl text-center">
            <div style={{ padding: '1rem 2rem 1.25rem 2rem' }}>
              <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }} className="font-bold text-gray-100">
                ✨ Exercise Complete! ✨
              </h1>
              <div className="grid grid-cols-2 gap-2 mb-3" style={{ maxWidth: '450px', margin: '0 auto' }}>
                <div className="p-2 bg-gray-900 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-xs font-bold uppercase mb-0.5">🏆 Score</p>
                  <p style={{ fontSize: '1.75rem' }} className="font-bold text-green-400">{score}</p>
                </div>
                <div className="p-2 bg-gray-900 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-xs font-bold uppercase mb-0.5">💔 Misses</p>
                  <p style={{ fontSize: '1.75rem' }} className="font-bold text-red-400">{misses}</p>
                </div>
                <div className="col-span-2 p-2 bg-gray-900 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-xs font-bold uppercase mb-0.5">⚠️ Wrong Presses</p>
                  <p style={{ fontSize: '1.75rem' }} className="font-bold text-red-400">{wrongPresses}</p>
                </div>
                <div className="col-span-2 p-2 bg-gray-900 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-xs font-bold uppercase mb-0.5">🎯 Accuracy</p>
                  <p style={{ fontSize: '2rem' }} className="font-bold text-blue-400">{accuracy}%</p>
                </div>
              </div>
              <button onClick={startGame} style={{ padding: '0.5rem 0', fontSize: '1.125rem', borderRadius: '0.5rem', backgroundColor: '#d97706', color: 'white', fontWeight: 'bold', border: 'none', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.3)' }} className="w-full hover:bg-amber-600 transition-all animate-button">🔁 Try Again</button>
              <button onClick={() => setShowGameOver(false)} style={{ marginTop: '0.5rem', fontSize: '0.875rem' }} className="text-gray-400 font-bold hover:text-gray-200 transition-colors">← Back to Menu</button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE GAME */}
      {isPlaying && (
        <div className="flex flex-col items-center justify-center min-h-screen game-screen" style={{ padding: '2px' }}>
          <div style={{ 
            width: '100%', 
            maxWidth: '500px', 
            marginBottom: '1rem', 
            padding: '12px 16px', 
            borderRadius: '0.5rem',
            backgroundColor: '#1f2937',
            border: '1px solid #374151'
          }} 
          className="flex justify-around flex-wrap gap-2">
            <span className="font-bold text-gray-200 text-sm md:text-base">⏱️ <span className="text-blue-400">{timeLeft}s</span></span>
            <span className="font-bold text-gray-200 text-sm md:text-base">🎯 <span className="text-green-400">{score}</span></span>
            <span className="font-bold text-gray-200 text-sm md:text-base">❌ <span className="text-red-400">{misses}</span></span>
            <span className="font-bold text-gray-200 text-sm md:text-base">⚠️ <span className="text-red-400">{wrongPresses}</span></span>
          </div>
          
          <div className="flex justify-center items-center w-full">
            <canvas 
              ref={canvasRef} 
              width={400} 
              height={400} 
              style={{ 
                border: '4px solid yellow', 
                borderRadius: '0.5rem',
                width: `${canvasDisplaySize}px`,
                height: `${canvasDisplaySize}px`,
                maxWidth: '90vw',
                maxHeight: '90vw'
              }} 
              className="bg-black" 
            />
          </div>
          
          <p 
            ref={instructionRef} 
            style={{ 
              width: '100%', 
              maxWidth: '500px', 
              padding: '1rem', 
              fontSize: 'clamp(14px, 4vw, 18px)',
              marginTop: '1rem'
            }} 
            className="text-center text-gray-300 font-bold"
          >
            Press the falling key before it reaches the bottom!
          </p>
          
          {speechSupported && (
            <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
              <span>🇬🇧</span>
              <span style={{ fontSize: '10px' }} className={voiceGender === 'female' ? 'text-pink-400' : 'text-blue-400'}>
                {useFallback ? 'Device TTS' : currentVoiceName}
              </span>
            </div>
          )}
        </div>
      )}
      <SpeedInsights />
    </div>
  );
};

export default App;
