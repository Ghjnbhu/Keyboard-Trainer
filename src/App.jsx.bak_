import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const App = () => {
  // Game settings
  const [speed, setSpeed] = useState(1);
  const [duration, setDuration] = useState(600);
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

  // Game elements
  const [currentKey, setCurrentKey] = useState(null);
  const canvasRef = useRef(null);
  const instructionRef = useRef(null);
  const animationRef = useRef(null);
  const spawnTimeoutRef = useRef(null);
  const isGameActiveRef = useRef(false);
  const isSpawningRef = useRef(false);
  const timeOverRef = useRef(false);
  // Combined set: letters A-Z and digits 0-9
  const keys = useMemo(() => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const digits = '0123456789'.split('');
    return [...letters, ...digits];
  }, []);

  // Speech synthesis
  const synth = typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis : null;
  const femaleVoiceRef = useRef(null);
  const maleVoiceRef = useRef(null);

  // Detect browser and check speech support
  useEffect(() => {
    if (!synth) {
      console.log('⚠️ Speech synthesis not supported');
      setSpeechSupported(false);
      setUseFallback(false);
      setCurrentVoiceName('Speech not available');
      setVoicesLoaded(true);
      return;
    }

    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = ua.includes('android');
    const isOpera = ua.includes('opr') || ua.includes('opera');
    const isEdge = ua.includes('edg') || ua.includes('edge');
    
    if (isAndroid && (isOpera || isEdge)) {
      console.log('⚠️ Detected Android browser with limited speech support - using fallback mode');
      setUseFallback(true);
      setCurrentVoiceName('Using device TTS');
      setVoicesLoaded(true);
    }
  }, [synth]);

  // Pre-warm speech synthesis
  useEffect(() => {
    if (!useFallback && synth && speechSupported) {
      try {
        const warmupUtterance = new SpeechSynthesisUtterance('');
        warmupUtterance.volume = 0;
        synth.speak(warmupUtterance);
        setTimeout(() => {
          if (synth.speaking) {
            synth.cancel();
          }
        }, 50);
      } catch (e) {
        console.log('⚠️ Speech warmup failed:', e);
      }
    }
  }, [synth, useFallback, speechSupported]);

  // Load available voices
  useEffect(() => {
    if (useFallback || !speechSupported || !synth) {
      setVoicesLoaded(true);
      return;
    }

    const loadVoices = () => {
      try {
        const voices = synth.getVoices();
        
        console.log('=== ALL AVAILABLE VOICES ===');
        voices.forEach((voice, index) => {
          console.log(`${index + 1}. Name: "${voice.name}", Lang: ${voice.lang}`);
        });

        if (voices.length === 0) {
          console.log('⚠️ No voices found - switching to fallback mode');
          setUseFallback(true);
          setCurrentVoiceName('Using device TTS (fallback)');
          setVoicesLoaded(true);
          return;
        }

        const femaleList = [];
        const maleList = [];

        voices.forEach(voice => {
          const name = voice.name.toLowerCase();
          
          if (name.includes('samantha') ||
              name.includes('victoria') ||
              name.includes('zira') || 
              name.includes('hazel') ||
              name.includes('helena') ||
              name.includes('sara') ||
              name.includes('moira') ||
              name.includes('tessa') ||
              name.includes('kate') ||
              name.includes('emma') ||
              name.includes('lucy') ||
              name.includes('susie') ||
              name.includes('female') ||
              name.includes('girl') ||
              name.includes('woman')) {
            femaleList.push(voice);
          }
          else if (name.includes('david') || 
                   name.includes('george') ||
                   name.includes('daniel') ||
                   name.includes('alex') ||
                   name.includes('richard') ||
                   name.includes('oliver') ||
                   name.includes('harry') ||
                   name.includes('james') ||
                   name.includes('william') ||
                   name.includes('henry') ||
                   name.includes('thomas') ||
                   name.includes('charles') ||
                   name.includes('edward') ||
                   name.includes('patrick') ||
                   name.includes('michael') ||
                   name.includes('john') ||
                   name.includes('robert') ||
                   name.includes('christopher') ||
                   name.includes('matthew') ||
                   name.includes('andrew') ||
                   name.includes('joseph') ||
                   name.includes('kevin') ||
                   name.includes('brian') ||
                   name.includes('steven') ||
                   name.includes('paul') ||
                   name.includes('mark') ||
                   name.includes('peter') ||
                   name.includes('male') ||
                   name.includes('guy') ||
                   name.includes('man')) {
            maleList.push(voice);
          }
        });

        console.log('🎯 Female voices found:', femaleList.length);
        console.log('🎯 Male voices found:', maleList.length);

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
          console.log('⚠️ No male voice found, using first available voice as fallback');
          maleVoiceRef.current = voices.find(v => !femaleList.includes(v)) || voices[0];
          setHasMaleVoice(!!maleVoiceRef.current);
        }

        const updateCurrentVoiceName = () => {
          if (voiceGender === 'female' && femaleVoiceRef.current) {
            setCurrentVoiceName(femaleVoiceRef.current.name);
          } else if (voiceGender === 'male' && maleVoiceRef.current) {
            setCurrentVoiceName(maleVoiceRef.current.name);
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

  // Update voice name when gender changes
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
      if (synth.speaking) {
        synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(word);
      
      if (useFallback) {
        console.log(`🔊 Speaking with default device TTS: "${word}"`);
        utterance.pitch = gender === 'female' ? 1.1 : 0.9;
        utterance.rate = 0.9;
        utterance.volume = 1;
        utterance.lang = 'en-GB';
        synth.speak(utterance);
        return;
      }
      
      if (gender === 'female' && femaleVoiceRef.current) {
        utterance.voice = femaleVoiceRef.current;
        utterance.pitch = 1.1;
        console.log(`🔊 Speaking with FEMALE voice: ${femaleVoiceRef.current.name}`);
      } else if (gender === 'male' && maleVoiceRef.current) {
        utterance.voice = maleVoiceRef.current;
        utterance.pitch = 0.9;
        console.log(`🔊 Speaking with MALE voice: ${maleVoiceRef.current.name}`);
      } else {
        utterance.rate = 0.9;
        utterance.volume = 1;
        utterance.lang = 'en-GB';
      }

      utterance.rate = 0.9;
      utterance.volume = 1;
      utterance.lang = 'en-GB';

      synth.speak(utterance);

    } catch (error) {
      console.error('Speech error:', error);
    }
  }, [synth, useFallback, speechSupported]);

  // Convert digit to word for speech, otherwise keep letter
  const getSpokenText = useCallback((char) => {
    if (char >= '0' && char <= '9') {
      const digitWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
      return digitWords[parseInt(char, 10)];
    }
    return char;
  }, []);

  const speakLetter = useCallback((char) => {
    if (!speechSupported) return;
    const spoken = getSpokenText(char);
    speakWord(spoken, voiceGender);
  }, [speakWord, voiceGender, speechSupported, getSpokenText]);

  const handleVoiceChange = useCallback((gender) => {
    setVoiceGender(gender);
    if (voicesLoaded && speechSupported) {
      setTimeout(() => {
        speakWord(gender === 'female' ? 'Female' : 'Male', gender);
      }, 50);
    }
  }, [speakWord, voicesLoaded, speechSupported]);

  const handleSpeedChange = useCallback((newSpeed) => {
    setSpeed(newSpeed);
    const speedLabel = speedOptions.find(opt => opt.value === newSpeed)?.label || '';
    if (speedLabel && voicesLoaded && speechSupported) {
      setTimeout(() => {
        speakWord(speedLabel, voiceGender);
      }, 50);
    }
  }, [voiceGender, speakWord, voicesLoaded, speechSupported]);

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
    const randomKey = keys[Math.floor(Math.random() * keys.length)];

    if (speechSupported) {
      speakLetter(randomKey);
    }
    
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
    if (spawnTimeoutRef.current) {
      clearTimeout(spawnTimeoutRef.current);
      spawnTimeoutRef.current = null;
    }
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
    spawnLetter();
  };

  const endGame = useCallback(() => {
    isGameActiveRef.current = false;
    timeOverRef.current = false;
    if (spawnTimeoutRef.current) {
      clearTimeout(spawnTimeoutRef.current);
      spawnTimeoutRef.current = null;
    }
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
          if (!currentKey) {
            endGame();
          }
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
          if (timeOverRef.current) {
            endGame();
          } else {
            spawnLetter();
          }
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
      const pressedKey = e.key.toUpperCase();
      if (pressedKey === currentKey.key) {
        setScore(prev => prev + 1);
        if (speechSupported) {
          speakLetter(currentKey.key);
        }
        if (timeOverRef.current) {
          endGame();
        } else {
          spawnLetter();
        }
      } else {
        setWrongPresses(prev => prev + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentKey, spawnLetter, speakLetter, speechSupported, endGame]);

  // Accuracy includes wrong presses
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
        <div className="flex items-center justify-center min-h-screen">
          <div style={{ width: '500px' }} className="bg-gray-800 rounded-lg border border-gray-700 shadow-xl">
            <div style={{ padding: '2rem 2.5rem 3rem 2.5rem' }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }} className="font-bold text-white text-center">Keyboard Trainer</h1>
              
              {speechSupported ? (
                <>
                  <div style={{ marginBottom: '2rem' }} className="text-center">
                    <label style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }} className="block font-bold text-gray-300">
                      Voice:
                    </label>
                    <div className="flex flex-row gap-4 justify-center">
                      <button
                        onClick={() => handleVoiceChange('female')}
                        style={{
                          padding: '0.75rem 1.5rem',
                          fontSize: '1.125rem', 
                          borderRadius: '0.5rem',
                          backgroundColor: voiceGender === 'female' ? '#EC4899' : '#4B5563',
                          color: 'white',
                          border: voiceGender === 'female' ? '2px solid #F9A8D4' : '2px solid transparent',
                          minWidth: '120px',
                          opacity: (hasFemaleVoice || useFallback) ? 1 : 0.5
                        }}
                        className="font-semibold transition-all hover:opacity-90 flex items-center justify-center"
                        disabled={!hasFemaleVoice && !useFallback}
                      >
                        Female
                        {!hasFemaleVoice && !useFallback && <span className="text-xs">(unavailable)</span>}
                      </button>
                      <button
                        onClick={() => handleVoiceChange('male')}
                        style={{
                          padding: '0.75rem 1.5rem',
                          fontSize: '1.125rem',
                          borderRadius: '0.5rem',
                          backgroundColor: voiceGender === 'male' ? '#3B82F6' : '#4B5563',
                          color: 'white',
                          border: voiceGender === 'male' ? '2px solid #93C5FD' : '2px solid transparent',
                          minWidth: '120px',
                          opacity: (hasMaleVoice || useFallback) ? 1 : 0.5
                        }}
                        className="font-semibold transition-all hover:opacity-90 flex items-center justify-center"
                        disabled={!hasMaleVoice && !useFallback}
                      >
                        Male
                        {!hasMaleVoice && !useFallback && <span className="text-xs">(unavailable)</span>}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem', padding: '0.75rem 1rem', backgroundColor: '#1F2937', borderRadius: '0.5rem', border: '1px solid #374151' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontSize: '10px' }} className="text-gray-400">Current voice:</span>
                      <span style={{ fontSize: '10px' }} className={`font-medium ${voiceGender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
                        {currentVoiceName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {useFallback 
                          ? '📱 Using device TTS' 
                          : `Available: ${availableVoices.female.length} female, ${availableVoices.male.length} male`}
                      </span>
                      <span>🇬🇧 British accent</span>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ marginBottom: '2rem', padding: '0.75rem 1rem', backgroundColor: '#1F2937', borderRadius: '0.5rem', border: '1px solid #374151' }}>
                  <div className="text-center text-yellow-400 text-sm">
                    ℹ️ Speech not supported on this browser
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '2rem' }} className="text-center">
                <label style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }} className="block font-bold text-gray-300">
                  Speed:
                </label>
                <div className="flex flex-row gap-3 justify-between">
                  {speedOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSpeedChange(option.value)}
                      style={{
                        padding: '0.75rem 0.25rem',
                        fontSize: '1rem', 
                        borderRadius: '0.5rem',
                        backgroundColor: speed === option.value ? '#9333EA' : '#374151',
                        color: 'white',
                        border: speed === option.value ? '2px solid #C084FC' : '2px solid transparent'
                      }}
                      className="flex-1 font-semibold transition-all hover:bg-gray-600"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }} className="text-center">
                <label style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }} className="block font-bold text-gray-300">
                  Duration (seconds):
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  style={{
                    padding: '0.75rem',
                    fontSize: '1.125rem', 
                    width: '125px',
                    borderRadius: '0.5rem',
                  }}
                  className="border bg-gray-700 text-white border-gray-600 outline-none text-center"
                  min="1"
                  max="600"
                />
              </div>

              <div className="text-center">
                <button
                  onClick={startGame}
                  style={{ padding: '0.75rem 0', fontSize: '1.5rem', borderRadius: '0.5rem', width: '250px' }}
                  className="bg-amber-500 text-black font-bold hover:bg-amber-600 transition-all animate-button"
                >
                  START
                </button>
              </div>

              <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '14px', color: '#FFFFFF' }}>
                Version 2.0 Build by Victor Bogatyrev for my daughter Mira
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN (compact) */}
      {showGameOver && (
        <div className="flex items-center justify-center min-h-screen">
          <div style={{ width: '500px' }} className="bg-gray-800 rounded-lg border border-gray-700 shadow-xl text-center">
            <div style={{ padding: '1.5rem 2rem 2rem 2rem' }}>
              <h1 style={{ fontSize: '2rem', marginBottom: '1.25rem' }} className="font-bold text-white">Exercise Complete!</h1>

              <div className="grid grid-cols-2 gap-3 mb-6" style={{ maxWidth: '450px', margin: '0 auto' }}>
                <div className="p-3 bg-gray-900 rounded border border-gray-700">
                  <p className="text-gray-400 text-xs font-bold uppercase mb-1">Score</p>
                  <p style={{ fontSize: '2rem' }} className="font-bold text-green-400">{score}</p>
                </div>
                <div className="p-3 bg-gray-900 rounded border border-gray-700">
                  <p className="text-gray-400 text-xs font-bold uppercase mb-1">Misses</p>
                  <p style={{ fontSize: '2rem' }} className="font-bold text-red-400">{misses}</p>
                </div>
                <div className="col-span-2 p-3 bg-gray-900 rounded border border-gray-700">
                  <p className="text-gray-400 text-xs font-bold uppercase mb-1">Wrong Presses</p>
                  <p style={{ fontSize: '2rem' }} className="font-bold text-red-400">{wrongPresses}</p>
                </div>
                <div className="col-span-2 p-3 bg-gray-900 rounded border border-gray-700">
                  <p className="text-gray-400 text-xs font-bold uppercase mb-1">Accuracy</p>
                  <p style={{ fontSize: '2.5rem' }} className="font-bold text-blue-400">{accuracy}%</p>
                </div>
              </div>

              <button
                onClick={startGame}
                style={{ padding: '0.75rem 0', fontSize: '1.25rem', borderRadius: '0.5rem' }}
                className="w-full bg-amber-500 text-black font-bold hover:bg-amber-600 transition-all animate-button"
              >
                Try Again
              </button>
              
              <button
                onClick={() => setShowGameOver(false)}
                style={{ marginTop: '1rem', fontSize: '1rem' }}
                className="text-gray-400 font-bold hover:text-white transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE GAME with wrong presses counter in bar */}
      {isPlaying && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div style={{ width: '500px', marginBottom: '1.5rem', padding: '1.25rem', borderRadius: '0.5rem' }}
               className="bg-gray-800 border border-gray-700 flex justify-around">
            <span className="font-bold text-gray-200">⏱️ <span className="text-blue-400">{timeLeft}s</span></span>
            <span className="font-bold text-gray-200">🎯 <span className="text-green-400">{score}</span></span>
            <span className="font-bold text-gray-200">❌ <span className="text-red-400">{misses}</span></span>
            <span className="font-bold text-gray-200">⚠️ <span className="text-red-400">{wrongPresses}</span></span>
          </div>

          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            style={{ border: '4px solid yellow', borderRadius: '0.5rem' }}
            className="bg-black"
          />

          <p
            ref={instructionRef}
            style={{ width: '500px', padding: '2rem 0', fontSize: '1.125rem' }}
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
    </div>
  );
};

export default App;