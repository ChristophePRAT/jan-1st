import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Brain, Apple, Dumbbell, GraduationCap, LucideIcon } from 'lucide-react';
import { AgentType } from '@/types/chat';

interface SpecialistBubbleProps {
  title: string;
  content: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  side: 'left' | 'right';
  agentType: AgentType;
  onSendMessage?: (message: string) => void;
}

const agentIcons: Record<AgentType, LucideIcon> = {
  bob: Brain,
  dietitian: Apple,
  coach: Dumbbell,
  mentor: GraduationCap,
};

export const SpecialistBubble = ({
  title,
  content,
  color,
  gradientFrom,
  gradientTo,
  side,
  agentType,
  onSendMessage,
}: SpecialistBubbleProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [inputValue, setInputValue] = useState('');
  const IconComponent = agentIcons[agentType];
  
  const truncatedText = content.length > 120 
    ? content.substring(0, 120).trim() + '…' 
    : content;

  // Initialize with truncated text immediately
  useEffect(() => {
    setDisplayedText(truncatedText);
  }, [truncatedText]);

  useEffect(() => {
    // Instant text switch - no typing animation
    if (isExpanded) {
      setDisplayedText(content);
    } else {
      setDisplayedText(truncatedText);
    }
  }, [isExpanded, content, truncatedText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <motion.div
      initial={{ 
        x: side === 'left' ? -200 : 200, 
        opacity: 0,
        scale: 0.8
      }}
      animate={{ 
        x: 0, 
        opacity: 1,
        scale: 1
      }}
      transition={{ 
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay: 0.3
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="relative cursor-pointer"
    >
      <motion.div
        className="rounded-3xl shadow-2xl backdrop-blur-sm border border-white/20 overflow-hidden flex flex-col"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        }}
        animate={{
          width: isExpanded ? 420 : 280,
          height: isExpanded ? 'auto' : 'auto',
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 35,
        }}
      >
        {/* Header */}
        <div className="p-6 pb-0">
          <motion.div 
            className="flex items-center gap-3 mb-4"
          >
            <motion.div
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ backgroundColor: color }}
              animate={{ rotate: isExpanded ? [0, 5, -5, 0] : 0 }}
              transition={{ duration: 0.5 }}
            >
              <IconComponent size={24} className="text-white" strokeWidth={2} />
            </motion.div>
            <div className="min-w-0">
              <h3 className="font-bold text-lg text-gray-800">{title}</h3>
              <p className="text-xs text-gray-600">Spécialiste</p>
            </div>
          </motion.div>
        </div>

        {/* Content - Scrollable area */}
        <div 
          className="px-6 text-gray-700 text-sm leading-relaxed overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          style={{ 
            height: isExpanded ? '280px' : '80px',
            transition: 'height 0.3s ease-out'
          }}
        >
          <p className="whitespace-pre-wrap">
            {displayedText}
          </p>
        </div>

        {/* Fixed prompt bar at bottom - only visible when expanded */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="p-4 pt-2 border-t border-white/30 bg-white/20 backdrop-blur-sm"
            >
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Demander à ${title}...`}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white/80 border border-white/50 focus:border-gray-300 focus:ring-2 focus:ring-white/50 outline-none text-gray-700 placeholder:text-gray-400 text-sm shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                <motion.button
                  type="submit"
                  disabled={!inputValue.trim()}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-40 transition-all"
                  style={{ backgroundColor: color }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand indicator - only visible when collapsed */}
        <AnimatePresence>
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-6 pb-4 pt-2 text-xs text-gray-500 flex items-center gap-1"
            >
              <span>Survoler pour lire</span>
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
