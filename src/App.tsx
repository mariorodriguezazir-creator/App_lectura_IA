import { useState, useEffect } from 'react';
import Home from './components/Home';
import Lesson from './components/Lesson';
import Story from './components/Story';

const SYLLABLES = ['MA', 'PA', 'SA', 'CA', 'LA', 'TA', 'MI', 'LO', 'RE', 'FI'];

export default function App() {
  const [screen, setScreen] = useState<'home' | 'lesson' | 'story'>('home');
  const [stars, setStars] = useState(0);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [lessonWords, setLessonWords] = useState<any[]>([]);

  useEffect(() => {
    const savedStars = localStorage.getItem('lectokids_stars');
    if (savedStars) setStars(parseInt(savedStars));
    const savedIndex = localStorage.getItem('lectokids_index');
    if (savedIndex) setSessionIndex(parseInt(savedIndex));
  }, []);

  const addStars = (amount: number) => {
    setStars(prev => {
      const newStars = prev + amount;
      localStorage.setItem('lectokids_stars', newStars.toString());
      return newStars;
    });
  };

  const currentSyllable = SYLLABLES[sessionIndex % SYLLABLES.length];

  const startLesson = () => {
    setScreen('lesson');
  };

  const finishLesson = (words: any[]) => {
    setLessonWords(words);
    setScreen('story');
  };

  const finishStory = () => {
    const nextIndex = sessionIndex + 1;
    setSessionIndex(nextIndex);
    localStorage.setItem('lectokids_index', nextIndex.toString());
    setScreen('home');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-nunito text-slate-800 flex flex-col items-center overflow-x-hidden">
      {screen === 'home' && <Home stars={stars} onStart={startLesson} />}
      {screen === 'lesson' && <Lesson syllable={currentSyllable} onFinish={finishLesson} addStars={addStars} />}
      {screen === 'story' && <Story words={lessonWords} onFinish={finishStory} addStars={addStars} />}
    </div>
  );
}
