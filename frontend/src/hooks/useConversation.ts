import { useState, useCallback } from "react";
import { Message, AgentType, CalendarEvent } from "@/types/chat";

interface ConversationState {
  messages: Message[];
  activeAgent: AgentType | null;
  isThinking: boolean;
  showCalendar: boolean;
  calendarEvents: CalendarEvent[];
}

const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  { title: "Course matinale", day: "Lun", startHour: 6, duration: 60 },
  { title: "Préparation repas", day: "Lun", startHour: 10, duration: 60 },
  { title: "Session étude", day: "Lun", startHour: 14, duration: 120 },
  { title: "Yoga", day: "Mar", startHour: 7, duration: 60 },
  { title: "Déjeuner sain", day: "Mar", startHour: 12, duration: 60 },
  { title: "Lecture", day: "Mar", startHour: 19, duration: 120 },
  { title: "HIIT", day: "Mer", startHour: 6, duration: 60 },
  { title: "Planification repas", day: "Mer", startHour: 11, duration: 60 },
  { title: "Cours en ligne", day: "Mer", startHour: 15, duration: 120 },
  { title: "Musculation", day: "Jeu", startHour: 17, duration: 60 },
  { title: "Préparation smoothies", day: "Jeu", startHour: 8, duration: 60 },
  { title: "Course matinale", day: "Ven", startHour: 6, duration: 60 },
  { title: "Groupe étude", day: "Ven", startHour: 14, duration: 120 },
  { title: "Longue course", day: "Sam", startHour: 8, duration: 120 },
  { title: "Meal prep dimanche", day: "Dim", startHour: 10, duration: 120 },
  { title: "Bilan de la semaine", day: "Dim", startHour: 18, duration: 60 },
];

const CONVERSATION_FLOW = [
  {
    trigger: 0,
    response: {
      content:
        "Salut ! 👋 Je suis Bob, ton orchestrateur de résolutions personnelles. Je travaille avec une équipe de spécialistes pour t'aider à atteindre tes objectifs cette année. Dis-moi, quelle est ta plus grande résolution pour 2025 ?",
      sender: "bob" as AgentType,
    },
  },
  {
    trigger: 1,
    thinkingAgent: "bob" as AgentType,
    response: {
      content:
        "Super objectif ! Je vois que tu es vraiment motivé pour faire des changements positifs. Laisse-moi faire appel à Marcus, notre expert fitness, pour approfondir l'aspect physique de tes objectifs.",
      sender: "bob" as AgentType,
    },
    followUp: {
      delay: 1500,
      thinkingAgent: "coach" as AgentType,
      response: {
        content:
          "Hey ! Marcus ici 💪 Enchanté ! J'adore aider les gens à démarrer leur parcours fitness. Petite question : quel est ton niveau d'activité actuel ? Tu fais du sport régulièrement, occasionnellement, ou tu repars de zéro ?",
        sender: "coach" as AgentType,
      },
    },
  },
  {
    trigger: 2,
    thinkingAgent: "coach" as AgentType,
    response: {
      content:
        "Parfait, ça me donne une bonne base ! Je vais m'assurer qu'on progresse graduellement pour éviter l'épuisement. Je te passe Maya, notre spécialiste nutrition.",
      sender: "coach" as AgentType,
    },
    followUp: {
      delay: 1500,
      thinkingAgent: "dietitian" as AgentType,
      response: {
        content:
          "Coucou ! 🥗 Moi c'est Maya. La nutrition est vraiment la clé de tout objectif santé. Petite question : as-tu des préférences alimentaires ou des restrictions ? Végétarien, allergies, ou autre chose ?",
        sender: "dietitian" as AgentType,
      },
    },
  },
  {
    trigger: 3,
    thinkingAgent: "dietitian" as AgentType,
    response: {
      content: "Super ! Je vais en tenir compte pour la planification de tes repas. Je te repasse Bob pour conclure.",
      sender: "dietitian" as AgentType,
    },
    followUp: {
      delay: 1500,
      thinkingAgent: "bob" as AgentType,
      response: {
        content:
          "Excellent travail d'équipe ! 🎉 J'ai rassemblé toutes les infos de Marcus et Maya. En fonction de tes objectifs et préférences, j'ai créé un planning hebdomadaire personnalisé qui équilibre fitness, nutrition et repos. Prêt à voir ton plan ?",
        sender: "bob" as AgentType,
      },
      showCalendarButton: true,
    },
  },
];

export function useConversation() {
  const [state, setState] = useState<ConversationState>({
    messages: [],
    activeAgent: "bob",
    isThinking: false,
    showCalendar: false,
    calendarEvents: MOCK_CALENDAR_EVENTS,
  });

  const [messageCount, setMessageCount] = useState(0);
  const [showCalendarButton, setShowCalendarButton] = useState(false);

  const addMessage = useCallback((message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      activeAgent: message.sender === "user" ? prev.activeAgent : (message.sender as AgentType),
    }));
  }, []);

  const setThinking = useCallback((isThinking: boolean, agent: AgentType | null = null) => {
    setState((prev) => ({
      ...prev,
      isThinking,
      activeAgent: agent || prev.activeAgent,
    }));
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      addMessage({ content, sender: "user" });

      const currentStep = CONVERSATION_FLOW[messageCount];
      if (!currentStep) {
        setShowCalendarButton(true);
        return;
      }

      setThinking(true, currentStep.thinkingAgent || "bob");

      await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

      addMessage(currentStep.response);
      setThinking(false);

      if (currentStep.followUp) {
        await new Promise((resolve) => setTimeout(resolve, currentStep.followUp.delay));
        setThinking(true, currentStep.followUp.thinkingAgent);
        await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));
        addMessage(currentStep.followUp.response);
        setThinking(false);

        if (currentStep.followUp.showCalendarButton) {
          setShowCalendarButton(true);
        }
      }

      setMessageCount((prev) => prev + 1);
    },
    [messageCount, addMessage, setThinking],
  );

  const startConversation = useCallback(async () => {
    const welcomeStep = CONVERSATION_FLOW[0];
    setThinking(true, "bob");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    addMessage(welcomeStep.response);
    setThinking(false);
  }, [addMessage, setThinking]);

  const toggleCalendar = useCallback(() => {
    setState((prev) => ({ ...prev, showCalendar: !prev.showCalendar }));
  }, []);

  return {
    ...state,
    sendMessage,
    startConversation,
    toggleCalendar,
    showCalendarButton,
  };
}
