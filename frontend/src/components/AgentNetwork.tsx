import { motion } from 'framer-motion';
import { AgentType, AGENTS } from '@/types/chat';
import { AgentAvatar } from './AgentAvatar';

interface AgentNetworkProps {
  activeAgent: AgentType | null;
  isThinking: boolean;
}

const agentPositions = {
  bob: { x: 0, y: 0 },
  dietitian: { x: -90, y: -70 },
  coach: { x: 90, y: -70 },
  mentor: { x: 0, y: -100 },
};

export function AgentNetwork({ activeAgent, isThinking }: AgentNetworkProps) {
  const specialists: AgentType[] = ['dietitian', 'coach', 'mentor'];

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">
        Agent Neural Network
      </h3>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-64 h-52">
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="-130 -120 260 180">
            {specialists.map((specialist) => {
              const isActive = activeAgent === specialist && isThinking;
              return (
                <g key={specialist}>
                  {/* Base line */}
                  <line
                    x1={agentPositions.bob.x}
                    y1={agentPositions.bob.y}
                    x2={agentPositions[specialist].x}
                    y2={agentPositions[specialist].y}
                    stroke="hsl(var(--border))"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  {/* Animated pulse line */}
                  {isActive && (
                    <motion.line
                      x1={agentPositions.bob.x}
                      y1={agentPositions.bob.y}
                      x2={agentPositions[specialist].x}
                      y2={agentPositions[specialist].y}
                      stroke={
                        specialist === 'dietitian'
                          ? 'hsl(var(--agent-dietitian))'
                          : specialist === 'coach'
                          ? 'hsl(var(--agent-coach))'
                          : 'hsl(var(--agent-mentor))'
                      }
                      strokeWidth="3"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Specialist Nodes */}
          {specialists.map((specialist) => (
            <motion.div
              key={specialist}
              className="absolute"
              style={{
                left: `calc(50% + ${agentPositions[specialist].x}px)`,
                top: `calc(50% + ${agentPositions[specialist].y}px)`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={
                activeAgent === specialist
                  ? { scale: [1, 1.1, 1], y: [0, -5, 0] }
                  : { y: [0, -3, 0] }
              }
              transition={{
                duration: activeAgent === specialist ? 1 : 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: specialist === 'dietitian' ? 0 : specialist === 'coach' ? 0.5 : 1,
              }}
            >
              <AgentAvatar
                agent={specialist}
                size="lg"
                isActive={activeAgent === specialist && isThinking}
              />
              <p className="text-xs text-center mt-2 font-medium text-muted-foreground">
                {AGENTS[specialist].name}
              </p>
            </motion.div>
          ))}

          {/* Bob Node (Center) */}
          <motion.div
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={
              isThinking && activeAgent === 'bob'
                ? { scale: [1, 1.15, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 1, repeat: isThinking && activeAgent === 'bob' ? Infinity : 0 }}
          >
            <AgentAvatar agent="bob" size="lg" isActive={isThinking && activeAgent === 'bob'} />
            <p className="text-xs text-center mt-2 font-medium">Bob</p>
          </motion.div>
        </div>
      </div>

      {/* Status */}
      <div className="text-center">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary"
          animate={isThinking ? { opacity: [0.7, 1, 0.7] } : { opacity: 1 }}
          transition={{ duration: 1.5, repeat: isThinking ? Infinity : 0 }}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isThinking ? 'bg-primary animate-pulse' : 'bg-muted-foreground'
            }`}
          />
          <span className="text-xs font-medium text-muted-foreground">
            {isThinking
              ? activeAgent === 'bob'
                ? 'Bob is analyzing...'
                : `${AGENTS[activeAgent || 'bob'].name} is responding...`
              : 'Ready to help'}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
