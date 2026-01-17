import { motion } from 'framer-motion';

interface Bubble {
  id: number;
  color: string;
  size: number;
  x: string;
  y: string;
  delay: number;
}

const bubbles: Bubble[] = [
  { id: 1, color: 'hsl(30, 85%, 82%)', size: 150, x: '10%', y: '20%', delay: 0 },      // Warm Orange pastel
  { id: 2, color: 'hsl(145, 45%, 78%)', size: 120, x: '80%', y: '15%', delay: 0.5 },   // Sage Green pastel
  { id: 3, color: 'hsl(25, 80%, 85%)', size: 180, x: '75%', y: '70%', delay: 1 },      // Soft Peach
  { id: 4, color: 'hsl(210, 55%, 82%)', size: 100, x: '15%', y: '75%', delay: 1.5 },   // Soft Blue pastel
  { id: 5, color: 'hsl(280, 45%, 85%)', size: 140, x: '50%', y: '10%', delay: 0.8 },   // Lavender pastel
  { id: 6, color: 'hsl(350, 55%, 85%)', size: 110, x: '90%', y: '50%', delay: 1.2 },   // Soft Pink pastel
];

interface FloatingBubblesProps {
  state: 'welcome' | 'transitioning' | 'specialists';
}

export const FloatingBubbles = ({ state }: FloatingBubblesProps) => {
  const getExitPosition = (bubble: Bubble) => {
    // All bubbles except 2 and 3 exit off-screen
    const x = parseFloat(bubble.x);
    if (x < 50) return { x: '-200%', y: bubble.y };
    return { x: '200%', y: bubble.y };
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => {
        // Bubbles 2 and 3 will become the specialist bubbles
        const isSpecialistBubble = bubble.id === 2 || bubble.id === 3;
        
        if (state === 'specialists' && !isSpecialistBubble) {
          return null;
        }

        let animateProps = {};
        
        if (state === 'welcome') {
          animateProps = {
            x: [0, 20, -10, 0],
            y: [0, -15, 10, 0],
            scale: [1, 1.05, 0.98, 1],
            opacity: 0.6,
          };
        } else if (state === 'transitioning') {
          if (isSpecialistBubble) {
            // These will animate to side positions
            animateProps = {
              opacity: 0,
            };
          } else {
            const exitPos = getExitPosition(bubble);
            animateProps = {
              x: exitPos.x,
              opacity: 0,
            };
          }
        } else if (state === 'specialists') {
          animateProps = {
            opacity: 0,
          };
        }

        return (
          <motion.div
            key={bubble.id}
            className="absolute rounded-full blur-3xl"
            style={{
              backgroundColor: bubble.color,
              width: bubble.size,
              height: bubble.size,
              left: bubble.x,
              top: bubble.y,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={animateProps}
            transition={{
              duration: state === 'welcome' ? 8 : 1,
              repeat: state === 'welcome' ? Infinity : 0,
              ease: 'easeInOut',
              delay: bubble.delay,
            }}
          />
        );
      })}
    </div>
  );
};
