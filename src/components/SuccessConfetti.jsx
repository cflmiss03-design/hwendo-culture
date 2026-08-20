export default function SuccessConfetti() {
  const pieces = Array.from({ length: 30 });

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {pieces.map((_, i) => {
        const colors = [
          "#5568ff",
          "#ffb833",
          "#10b981",
          "#f59e0b",
          "#ef4444",
        ];
        
        return (
          <span
            key={i}
            className="absolute w-3 h-3 rounded-full animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: "-10px",
              backgroundColor: colors[Math.floor(Math.random() * colors.length)],
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${2 + Math.random() * 1}s`,
            }}
          />
        );
      })}
    </div>
  );
}
