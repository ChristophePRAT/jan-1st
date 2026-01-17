export type AgentType = 'bob' | 'dietitian' | 'coach' | 'mentor';

export interface Agent {
  id: AgentType;
  name: string;
  title: string;
  icon: string; // Lucide icon name
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | AgentType;
  timestamp: Date;
}

export interface CalendarEvent {
  title: string;
  description?: string;
  day: string;
  startHour: number;
  duration: number; // in minutes
}

export const AGENTS: Record<AgentType, Agent> = {
  bob: {
    id: 'bob',
    name: 'Bob',
    title: "L'Orchestrateur",
    icon: 'brain',
  },
  dietitian: {
    id: 'dietitian',
    name: 'Maya',
    title: 'Spécialiste Nutrition',
    icon: 'apple',
  },
  coach: {
    id: 'coach',
    name: 'Marcus',
    title: 'Coach Sportif',
    icon: 'dumbbell',
  },
  mentor: {
    id: 'mentor',
    name: 'Dr. Chen',
    title: 'Mentor Académique',
    icon: 'graduation-cap',
  },
};
