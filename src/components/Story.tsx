import { useState, useEffect } from 'react';
import { getStory } from '../services/gemini';
import { speak } from '../services/audio';
import { Star, Volume2, Home as HomeIcon, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import Confetti from './Confetti';

interface StoryProps {
  words: any[];
  onFinish: () => void;
  addStars: (amount: number) => void;
}

export default function Story({ words, onFinish, addStars }: StoryProps) {
  const [storyLines, setStoryLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    loadStory();
  }, []);

  const loadStory = async () => {
    setLoading(true);
    try {
      const text = await getStory(words.map(w => w.palabra));
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      setStoryLines(lines);
      setLoading(false);
      
      // Typewriter effect
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setVisibleLines(count);
        if (count >= lines.length) {
          clearInterval(interval);
          setIsDone(true);
          addStars(3); // Reward for finishing lesson
          speak("¡Felicidades! Has ganado 3 estrellas.");
        }
      }, 2500);
    } catch (e) {
      console.error(e);
      // Retry or show error
      setTimeout(loadStory, 2000);
    }
  };

  const readFullStory = () => {
    speak(storyLines.join('. '));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 w-full p-6 text-center">
        <Loader2 className="w-16 h-16 text-[#FF6B6B] animate-spin mb-6" />
        <p className="text-2xl font-bold text-slate-600">El osito está escribiendo un cuento...</p>
        <div className="text-6xl mt-6 animate-bounce">🐻</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center flex-1 w-full max-w-md p-6 mx-auto">
      {isDone && <Confetti />}
      
      <div className="flex items-center justify-between w-full mb-8">
        <h2 className="text-3xl font-bold text-slate-700">Tu Cuento</h2>
        <button 
          onClick={readFullStory}
          className="p-3 bg-[#4ECDC4] text-white rounded-full shadow-sm"
        >
          <Volume2 className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 w-full space-y-6 mb-8">
        {storyLines.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: i < visibleLines ? 1 : 0, y: i < visibleLines ? 0 : 10 }}
            className="text-2xl font-medium text-slate-700 leading-relaxed"
          >
            {line}
          </motion.p>
        ))}
      </div>

      {isDone && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full"
        >
          <div className="flex items-center justify-center gap-2 mb-8 text-3xl font-bold text-yellow-500">
            <span>+3</span>
            <Star className="w-8 h-8 fill-yellow-400" />
            <span>¡Ganaste!</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onFinish}
            className="flex items-center justify-center gap-2 w-full py-4 bg-[#FF6B6B] text-white rounded-2xl text-2xl font-bold shadow-[0_6px_0_#e05252] active:shadow-[0_0px_0_#e05252] active:translate-y-2 transition-all"
          >
            <HomeIcon className="w-6 h-6" />
            Volver al inicio
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
