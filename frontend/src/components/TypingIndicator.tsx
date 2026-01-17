import { motion } from 'framer-motion';
import { AgentType } from '@/types/chat';
import { AgentAvatar } from './AgentAvatar';

interface TypingIndicatorProps {
  agent: AgentType;
}

export function TypingIndicator({ agent }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-3 items-start"
    >
      <AgentAvatar agent={agent} size="sm" />
      <div className="flex items-center gap-1 px-4 py-3 bg-muted rounded-2xl">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-muted-foreground"
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
