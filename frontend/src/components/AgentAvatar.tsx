import { motion } from 'framer-motion';
import { AgentType, AGENTS } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Brain, Apple, Dumbbell, GraduationCap, LucideIcon } from 'lucide-react';

interface AgentAvatarProps {
  agent: AgentType;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  isActive?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 28,
};

const nodeClasses: Record<AgentType, string> = {
  bob: 'node-bob',
  dietitian: 'node-dietitian',
  coach: 'node-coach',
  mentor: 'node-mentor',
};

const agentIcons: Record<AgentType, LucideIcon> = {
  bob: Brain,
  dietitian: Apple,
  coach: Dumbbell,
  mentor: GraduationCap,
};

export function AgentAvatar({ agent, size = 'md', showName = false, isActive = false }: AgentAvatarProps) {
  const agentInfo = AGENTS[agent];
  const IconComponent = agentIcons[agent];

  return (
    <div className="flex items-center gap-2">
      <motion.div
        className={cn(
          'rounded-full flex items-center justify-center text-primary-foreground',
          sizeClasses[size],
          nodeClasses[agent]
        )}
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
      >
        <IconComponent size={iconSizes[size]} strokeWidth={2} />
      </motion.div>
      {showName && (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{agentInfo.name}</span>
          <span className="text-xs text-muted-foreground">{agentInfo.title}</span>
        </div>
      )}
    </div>
  );
}
