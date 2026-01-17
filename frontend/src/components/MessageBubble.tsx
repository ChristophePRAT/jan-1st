import { motion } from 'framer-motion';
import { Message, AgentType, AGENTS } from '@/types/chat';
import { AgentAvatar } from './AgentAvatar';
import { useEffect, useState } from 'react';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const [displayedText, setDisplayedText] = useState(isUser ? message.content : '');
  const [isComplete, setIsComplete] = useState(isUser);

  useEffect(() => {
    if (isUser) {
      setDisplayedText(message.content);
      setIsComplete(true);
      return;
    }

    // Streaming effect for agent messages
    setDisplayedText('');
    setIsComplete(false);
    
    const words = message.content.split(' ');
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayedText((prev) => {
          const newText = prev ? prev + ' ' + words[currentIndex] : words[currentIndex];
          currentIndex++;
          return newText;
        });
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [message.content, isUser]);

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-end"
      >
        <div className="bg-foreground/10 backdrop-blur-sm rounded-2xl rounded-br-md px-4 py-3 max-w-[80%]">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </motion.div>
    );
  }

  const agent = AGENTS[message.sender as AgentType];
  const agentType = message.sender as AgentType;

  const bubbleClasses: Record<AgentType, string> = {
    bob: 'bubble-bob',
    dietitian: 'bubble-dietitian',
    coach: 'bubble-coach',
    mentor: 'bubble-mentor',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3"
    >
      <div className="flex-shrink-0 mt-1">
        <AgentAvatar agent={agentType} size="sm" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-semibold">{agent.name}</span>
          <span className="text-xs text-muted-foreground">{agent.title}</span>
        </div>
        <div className={bubbleClasses[agentType]}>
          <p className="text-sm leading-relaxed text-foreground/90">
            {displayedText}
            {!isComplete && (
              <motion.span
                className="inline-block w-2 h-4 ml-1 bg-foreground/60 rounded-sm"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
