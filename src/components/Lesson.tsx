import { useState, useEffect } from 'react';
import { getWordsForSyllable } from '../services/gemini';
import { speak, listen } from '../services/audio';
import { Mic, ArrowRight, Volume2, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface LessonProps {
  syllable: string;
  onFinish: (words: any[]) => void;
  addStars: (amount: number) => void;
}

const ALL_SYLLABLES = ['MA', 'PA', 'SA', 'CA', 'LA', 'TA', 'MI', 'LO', 'RE', 'FI'];

export default function Lesson({ syllable, onFinish, addStars }: LessonProps) {
  const [step, setStep] = useState(0); // 0: loading, 1: cards, 2: voice, 3: drag
  const [words, setWords] = useState<any[]>([]);
  const [loadingMsg, setLoadingMsg] = useState('El osito está pensando...');
  
  // Voice game state
  const [voiceAttempts, setVoiceAttempts] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  // Syllable game state
  const [syllableOptions, setSyllableOptions] = useState<string[]>([]);
  const [filledSyllables, setFilledSyllables] = useState<string[]>([]);

  useEffect(() => {
    loadWords();
  }, [syllable]);

  const loadWords = async () => {
    setStep(0);
    setLoadingMsg('El osito está pensando...');
    try {
      const w = await getWordsForSyllable(syllable);
      setWords(w);
      setStep(1);
      speak(`Hoy vamos a aprender la sílaba ${syllable}`);
    } catch (e) {
      console.error(e);
      setLoadingMsg('¡Ups! Hubo un error. Reintentando...');
      setTimeout(loadWords, 2000);
    }
  };

  const handleCardClick = (word: any) => {
    speak(word.palabra);
  };

  const startVoiceGame = () => {
    setStep(2);
    setFeedback('Toca el micrófono y lee la palabra');
    speak('Toca el micrófono y lee la palabra');
  };

  const handleListen = () => {
    const targetWord = words[0].palabra;
    setIsListening(true);
    setFeedback('Escuchando...');
    
    listen(
      (text) => {
        setIsListening(false);
        // Si el reconocimiento no está soportado, text será "simulated_success"
        if (text === "simulated_success" || text.toLowerCase().includes(targetWord.toLowerCase())) {
          setFeedback('¡Muy bien!');
          speak('¡Muy bien!');
          addStars(1);
          setTimeout(startDragGame, 2000);
        } else {
          handleVoiceFail(targetWord, text);
        }
      },
      () => {
        setIsListening(false);
        handleVoiceFail(targetWord, "");
      }
    );
  };

  const handleVoiceFail = (targetWord: string, recognizedText: string) => {
    const attempts = voiceAttempts + 1;
    setVoiceAttempts(attempts);
    if (attempts >= 2) {
      setFeedback(`Casi... es ${targetWord}`);
      speak(`Casi... es ${targetWord}`);
      setTimeout(startDragGame, 3000);
    } else {
      let msg = '¡Uy! Di lo otra vez.';
      if (recognizedText && recognizedText !== "simulated_success") {
        const targetSyllables = words[0].silabas.map((s: string) => s.toLowerCase());
        const spoken = recognizedText.toLowerCase();
        const hasFirst = spoken.includes(targetSyllables[0]);
        const hasSecond = targetSyllables.length > 1 && spoken.includes(targetSyllables[1]);
        
        if (hasFirst && !hasSecond) {
          msg = `¡Bien! Suena ${targetSyllables[0]}, falta ${targetSyllables[1]}.`;
        } else if (!hasFirst && hasSecond) {
          msg = `¡Casi! Suena ${targetSyllables[1]}, falta ${targetSyllables[0]}.`;
        } else {
          const firstWord = spoken.split(' ')[0] || 'eso';
          msg = `Dije ${targetWord}, no ${firstWord}. ¡Tú puedes!`;
        }
      }
      setFeedback(msg);
      speak(msg);
    }
  };

  const startDragGame = () => {
    const targetWord = words[1];
    // Preparar opciones: 2 correctas + 2 distractoras
    const correctSyllables = targetWord.silabas.map((s: string) => s.toUpperCase());
    const distractors = ALL_SYLLABLES.filter(s => !correctSyllables.includes(s)).sort(() => 0.5 - Math.random()).slice(0, 2);
    const options = [...correctSyllables, ...distractors].sort(() => 0.5 - Math.random());
    
    setSyllableOptions(options);
    setFilledSyllables([]);
    setStep(3);
    speak('Completa la palabra con las sílabas correctas');
  };

  const handleSyllableSelect = (syl: string) => {
    const targetWord = words[1];
    const correctSyllables = targetWord.silabas.map((s: string) => s.toUpperCase());
    
    if (filledSyllables.length < correctSyllables.length) {
      const newFilled = [...filledSyllables, syl];
      setFilledSyllables(newFilled);
      speak(syl);
      
      if (newFilled.length === correctSyllables.length) {
        // Check if correct
        if (newFilled.join('') === correctSyllables.join('')) {
          speak(`¡Muy bien! ${targetWord.palabra}`);
          addStars(1);
          setTimeout(() => onFinish(words), 2000);
        } else {
          speak('¡Ups! Intenta de nuevo');
          setTimeout(() => setFilledSyllables([]), 1000);
        }
      }
    }
  };

  if (step === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 w-full p-6 text-center">
        <Loader2 className="w-16 h-16 text-[#4ECDC4] animate-spin mb-6" />
        <p className="text-2xl font-bold text-slate-600">{loadingMsg}</p>
        <div className="text-6xl mt-6 animate-bounce">🐻</div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="flex flex-col items-center flex-1 w-full max-w-md p-6 mx-auto">
        <h2 className="text-3xl font-bold text-slate-700 mb-6">Sílaba del día</h2>
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-8xl font-extrabold text-[#FF6B6B] mb-8 bg-white px-8 py-4 rounded-3xl shadow-sm border-4 border-slate-100"
        >
          {syllable}
        </motion.div>
        
        <div className="w-full space-y-4 mb-8">
          {words.map((w, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick(w)}
              className="flex items-center w-full p-4 bg-white rounded-2xl shadow-sm border-2 border-slate-100 gap-4"
            >
              <span className="text-5xl">{w.emoji}</span>
              <span className="text-3xl font-bold text-slate-700 flex-1 text-left uppercase">{w.palabra}</span>
              <Volume2 className="w-8 h-8 text-[#4ECDC4]" />
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startVoiceGame}
          className="flex items-center justify-center gap-2 w-full py-4 bg-[#4ECDC4] text-white rounded-2xl text-2xl font-bold shadow-[0_6px_0_#3db5ac] active:shadow-[0_0px_0_#3db5ac] active:translate-y-2 transition-all mt-auto"
        >
          Siguiente <ArrowRight className="w-6 h-6" />
        </motion.button>
      </div>
    );
  }

  if (step === 2) {
    const targetWord = words[0];
    return (
      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-md p-6 mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-700 mb-8">¡Dilo en voz alta!</h2>
        
        <div className="text-8xl mb-6">{targetWord.emoji}</div>
        <div className="text-6xl font-extrabold text-[#FF6B6B] mb-12 uppercase tracking-widest">
          {targetWord.palabra}
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleListen}
          disabled={isListening}
          className={`p-8 rounded-full shadow-lg mb-8 transition-colors ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-[#4ECDC4]'
          }`}
        >
          <Mic className="w-16 h-16 text-white" />
        </motion.button>

        <p className="text-2xl font-bold text-slate-600 h-10">{feedback}</p>
      </div>
    );
  }

  if (step === 3) {
    const targetWord = words[1];
    const correctSyllables = targetWord.silabas.map((s: string) => s.toUpperCase());

    return (
      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-md p-6 mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-700 mb-8">Completa la palabra</h2>
        
        <div className="text-8xl mb-8">{targetWord.emoji}</div>
        
        <div className="flex gap-4 mb-12">
          {correctSyllables.map((_: any, i: number) => (
            <div 
              key={i} 
              className="w-24 h-24 border-4 border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-4xl font-bold text-[#FF6B6B] bg-white"
            >
              {filledSyllables[i] || ''}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          {syllableOptions.map((syl, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSyllableSelect(syl)}
              className="py-6 bg-white border-4 border-slate-100 rounded-2xl text-4xl font-bold text-slate-700 shadow-sm"
            >
              {syl}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
