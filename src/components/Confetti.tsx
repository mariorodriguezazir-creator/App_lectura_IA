import { useEffect, useState } from 'react';

export default function Confetti() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0'];
    const newParticles = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + 'vw',
      animationDuration: Math.random() * 2 + 2 + 's',
      animationDelay: Math.random() * 0.5 + 's',
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute top-[-20px] w-3 h-3 rounded-full"
          style={{
            left: p.left,
            backgroundColor: p.backgroundColor,
            animation: `fall ${p.animationDuration} linear ${p.animationDelay} forwards`
          }}
        />
      ))}
    </div>
  );
}
