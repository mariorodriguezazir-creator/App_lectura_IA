import { Star, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  stars: number;
  onStart: () => void;
}

export default function Home({ stars, onStart }: HomeProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full max-w-md p-6 mx-auto text-center">
      {/* Barra de estrellas */}
      <div className="absolute top-6 right-6 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
        <span className="text-xl font-bold text-slate-700">{stars}</span>
      </div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-5xl font-extrabold text-[#FF6B6B] mb-2 tracking-tight">LectoKids</h1>
        <p className="text-lg text-slate-500 font-medium">¡Aprende a leer jugando!</p>
      </motion.div>

      <motion.div 
        animate={{ y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="text-9xl mb-12 drop-shadow-xl"
      >
        🐻
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="flex items-center justify-center gap-3 w-full py-5 bg-[#4ECDC4] text-white rounded-3xl text-3xl font-bold shadow-[0_8px_0_#3db5ac] active:shadow-[0_0px_0_#3db5ac] active:translate-y-2 transition-all"
      >
        <Play className="w-8 h-8 fill-white" />
        ¡A jugar!
      </motion.button>
    </div>
  );
}
