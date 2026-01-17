import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Calendar, Sparkles, Download } from 'lucide-react';
import { FloatingBubbles } from '@/components/FloatingBubbles';
import { SpecialistBubble } from '@/components/SpecialistBubble';
import { CalendarView } from '@/components/CalendarView';
import { SocketStatus } from '@/components/SocketStatus';
import { useSocketIntegration } from '@/hooks/useSocketIntegration';
import { CalendarEvent, AgentType } from '@/types/chat';
import { downloadICS } from '@/utils/icsExport';

type AppState = 'welcome' | 'transitioning' | 'specialists';

// Contraintes étudiant de test (duration en minutes)
const TEST_STUDENT_CONSTRAINTS: CalendarEvent[] = [
  // Lundi
  { title: 'Cours Maths', day: 'Lun', startHour: 8, duration: 120, description: 'Algèbre linéaire - Amphi A' },
  { title: 'TD Physique', day: 'Lun', startHour: 10, duration: 90, description: 'Travaux dirigés de mécanique quantique' },
  { title: 'Déjeuner RU', day: 'Lun', startHour: 12, duration: 60, description: 'Restaurant universitaire' },
  { title: 'Cours Informatique', day: 'Lun', startHour: 14, duration: 180, description: 'Programmation orientée objet en Python' },
  // Mardi
  { title: 'Cours Anglais', day: 'Mar', startHour: 9, duration: 90, description: 'Anglais technique niveau B2' },
  { title: 'Projet Groupe', day: 'Mar', startHour: 14, duration: 120, description: 'Travail en équipe sur le projet de semestre' },
  { title: 'Soirée BDE', day: 'Mar', startHour: 21, duration: 180, description: 'Soirée organisée par le Bureau des Étudiants' },
  // Mercredi
  { title: 'TD Maths', day: 'Mer', startHour: 8, duration: 120, description: 'Exercices sur les matrices et vecteurs propres' },
  { title: 'Cours Économie', day: 'Mer', startHour: 10, duration: 120, description: 'Introduction à la microéconomie' },
  // Jeudi
  { title: 'Cours Physique', day: 'Jeu', startHour: 8, duration: 120, description: 'Électromagnétisme - cours magistral' },
  { title: 'TP Informatique', day: 'Jeu', startHour: 10, duration: 180, description: 'Travaux pratiques - bases de données SQL' },
  { title: 'Réunion Asso', day: 'Jeu', startHour: 18, duration: 90, description: 'Réunion hebdomadaire de l\'association sportive' },
  // Vendredi
  { title: 'Cours Marketing', day: 'Ven', startHour: 9, duration: 120, description: 'Stratégies marketing digital' },
  { title: 'TD Économie', day: 'Ven', startHour: 14, duration: 90, description: 'Exercices sur l\'offre et la demande' },
  { title: 'Soirée Appart', day: 'Ven', startHour: 20, duration: 240, description: 'Soirée détente avec les colocs' },
  // Samedi
  { title: 'Grasse matinée', day: 'Sam', startHour: 7, duration: 180, description: 'Repos bien mérité !' },
  // Dimanche
  { title: 'Révisions', day: 'Dim', startHour: 14, duration: 180, description: 'Préparation des examens de la semaine' },
  { title: 'Repas Famille', day: 'Dim', startHour: 12, duration: 120, description: 'Déjeuner dominical en famille' },
];

// Agent name to style and type mapping
const AGENT_STYLES: Record<string, { agentType: AgentType; color: string; gradientFrom: string; gradientTo: string }> = {
  'Coach Sportif': { agentType: 'coach', color: 'hsl(15, 80%, 55%)', gradientFrom: 'hsl(15, 85%, 95%)', gradientTo: 'hsl(25, 90%, 90%)' },
  'Nutritionniste': { agentType: 'dietitian', color: 'hsl(160, 50%, 45%)', gradientFrom: 'hsl(160, 45%, 95%)', gradientTo: 'hsl(140, 50%, 90%)' },
  'Mentor': { agentType: 'mentor', color: 'hsl(220, 60%, 55%)', gradientFrom: 'hsl(220, 55%, 95%)', gradientTo: 'hsl(230, 60%, 90%)' },
  'Psychologue': { agentType: 'bob', color: 'hsl(280, 50%, 55%)', gradientFrom: 'hsl(280, 45%, 95%)', gradientTo: 'hsl(290, 50%, 90%)' },
};

const getAgentStyle = (name: string) => {
  return AGENT_STYLES[name] || { 
    agentType: 'bob' as AgentType, 
    color: 'hsl(200, 50%, 55%)', 
    gradientFrom: 'hsl(200, 45%, 95%)', 
    gradientTo: 'hsl(210, 50%, 90%)' 
  };
};

// Placeholder content when websocket is not connected
const PLACEHOLDER_COACH = `Votre programme sportif adapté à vos contraintes étudiantes :

💪 Lundi 6h30 - Jogging matinal (avant les maths):
• Course légère 30 min en zone 2
• Réveil en douceur, douche au RU
• Retour avant 8h pour le cours

🏋️ Mardi 7h - HIIT Express (avant l'anglais):
• 45 min intenses pour bien démarrer
• Timing serré : fin à 7h45
• Douche rapide avant le cours de 9h

🧘 Mercredi 18h - Yoga détente:
• Après-midi libre = récupération
• 1h de stretching et respiration
• Parfait après les TD du matin

💪 Jeudi 14h - Musculation (créneau libre):
• 1h30 de renforcement complet
• Entre le TP (13h) et la réunion asso (18h)
• Snack récupération prévu à 15h30

🏃 Vendredi 7h - Running léger:
• 45 min avant le cours de marketing
• Intensité modérée (soirée le soir!)

🏃 Samedi 10h30 - Course longue:
• Après la grasse mat' bien méritée
• 1h30 d'endurance
• Brunch healthy à 12h

🧘 Dimanche 10h - Stretching doux:
• Récupération avant les révisions
• 45 min de mobilité

📊 Compatible avec vos soirées du mardi et vendredi !`;

const PLACEHOLDER_NUTRITIONIST = `Votre programme nutritionnel adapté à votre emploi du temps étudiant :

🌅 Petits-déjeuners (adaptés à vos cours):
• Lundi 7h30 : Porridge protéiné avant les maths (énergie longue durée)
• Mardi : Smoothie express avant le HIIT
• Mercredi : Œufs brouillés et avocat (pas de cours avant 8h)
• Jeudi : Yaourt grec avec granola
• Vendredi : Pancakes rapides avant marketing

🥗 Déjeuners (hors RU):
• Mercredi 12h30 : Salade composée entre les cours
• Samedi 12h : Brunch healthy post-entraînement
• Meal prep le mardi et dimanche pour les jours chargés

🍽️ Dîners (avant/après vos soirées):
• Vendredi 18h : Dîner léger avant la soirée
• Dimanche 17h30 : Préparation des repas de la semaine

💡 Conseils soirées : Bien manger avant, s'hydrater pendant, brunch réparateur le lendemain !`;

// Default placeholder agents when not connected
const PLACEHOLDER_AGENTS = [
  { name: 'Coach Sportif', response: PLACEHOLDER_COACH },
  { name: 'Nutritionniste', response: PLACEHOLDER_NUTRITIONIST },
];

const Index = () => {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [inputValue, setInputValue] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  
  const { 
    isConnected, 
    specializedAgents, 
    calendarEvents, 
    sendMessage, 
    error 
  } = useSocketIntegration();

  // Use socket calendar events if available, otherwise show test data
  const displayCalendarEvents = useMemo(() => {
    return calendarEvents.length > 0 ? calendarEvents : TEST_STUDENT_CONSTRAINTS;
  }, [calendarEvents]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || appState !== 'welcome') return;

    // Send message via socket
    sendMessage(inputValue.trim());
    
    setAppState('transitioning');
    
    setTimeout(() => {
      setAppState('specialists');
    }, 800);
  }, [inputValue, appState, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100 overflow-hidden relative">
      {/* Floating background bubbles */}
      <FloatingBubbles state={appState} />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {/* Welcome State */}
          {appState === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ 
                opacity: 0, 
                scale: 0.8,
                y: -50,
                transition: { duration: 0.5, ease: 'easeInOut' }
              }}
              className="w-full max-w-2xl"
            >
              {/* Central bubble */}
              <motion.div
                className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl border border-white/50"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Logo */}
                <motion.div
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>

                {/* Title */}
                <motion.h1
                  className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Fini les fausses résolutions.
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  className="text-lg text-gray-600 text-center mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Entrez vos objectifs de la semaine. Notre équipe s'occupe du reste.
                </motion.p>

                {/* Input */}
                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Je veux manger mieux et faire du sport..."
                    className="w-full px-6 py-4 pr-14 rounded-2xl bg-white/90 border-2 border-gray-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none text-gray-700 placeholder:text-gray-400 transition-all text-lg shadow-sm"
                  />
                  <motion.button
                    type="submit"
                    disabled={!inputValue.trim()}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </motion.form>

                {/* Hint */}
                <motion.p
                  className="text-sm text-gray-500 text-center mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  Appuyez sur Entrée pour commencer ✨
                </motion.p>
              </motion.div>
            </motion.div>
          )}

          {/* Specialists State */}
          {appState === 'specialists' && (
            <motion.div
              key="specialists"
              className="w-full max-w-6xl flex items-center justify-between gap-8 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* Use socket agents if connected AND we have agents, otherwise use placeholders */}
              {/* Show placeholders only if NOT connected */}
              {!isConnected ? (
                <>
                  {/* Left Placeholder Agent */}
                  <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 80 }}
                  >
                    <SpecialistBubble
                      title="Coach Sportif"
                      content={PLACEHOLDER_COACH}
                      color={getAgentStyle('Coach Sportif').color}
                      gradientFrom={getAgentStyle('Coach Sportif').gradientFrom}
                      gradientTo={getAgentStyle('Coach Sportif').gradientTo}
                      side="left"
                      agentType={getAgentStyle('Coach Sportif').agentType}
                    />
                  </motion.div>

                  {/* Center - Calendar Button */}
                  <motion.div
                    className="flex flex-col items-center gap-4"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                  >
                    <motion.button
                      onClick={() => setShowCalendar(true)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-2xl"
                      animate={{
                        boxShadow: [
                          '0 10px 30px -10px rgba(251, 146, 60, 0.5)',
                          '0 20px 50px -15px rgba(251, 146, 60, 0.7)',
                          '0 10px 30px -10px rgba(251, 146, 60, 0.5)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Calendar className="w-10 h-10" />
                    </motion.button>
                    <motion.p
                      className="text-sm font-medium text-gray-700 text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      Voir le planning
                    </motion.p>
                  </motion.div>

                  {/* Right Placeholder Agent */}
                  <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 80 }}
                  >
                    <SpecialistBubble
                      title="Nutritionniste"
                      content={PLACEHOLDER_NUTRITIONIST}
                      color={getAgentStyle('Nutritionniste').color}
                      gradientFrom={getAgentStyle('Nutritionniste').gradientFrom}
                      gradientTo={getAgentStyle('Nutritionniste').gradientTo}
                      side="right"
                      agentType={getAgentStyle('Nutritionniste').agentType}
                    />
                  </motion.div>
                </>
              ) : (
                <>
                  {/* Dynamic agents from socket - render with staggered animation */}
                  {specializedAgents.map((agent, index) => {
                    // Calculate position: alternate left/right, with calendar in center
                    const isLeftSide = index % 2 === 0;
                    const agentDelay = 0.2 + index * 0.4; // 400ms between each agent appearance
                    
                    return (
                      <motion.div
                        key={agent.name}
                        initial={{ 
                          x: isLeftSide ? -150 : 150, 
                          opacity: 0,
                          scale: 0.8
                        }}
                        animate={{ 
                          x: 0, 
                          opacity: 1,
                          scale: 1
                        }}
                        transition={{ 
                          delay: agentDelay, 
                          type: 'spring', 
                          stiffness: 100,
                          damping: 15
                        }}
                      >
                        <SpecialistBubble
                          title={agent.name}
                          content={agent.response || 'En attente de la réponse...'}
                          color={getAgentStyle(agent.name).color}
                          gradientFrom={getAgentStyle(agent.name).gradientFrom}
                          gradientTo={getAgentStyle(agent.name).gradientTo}
                          side={isLeftSide ? 'left' : 'right'}
                          agentType={getAgentStyle(agent.name).agentType}
                        />
                      </motion.div>
                    );
                  })}

                  {/* Show loading state if connected but no agents yet */}
                  {specializedAgents.length === 0 && (
                    <motion.div
                      className="fixed inset-0 flex flex-col items-center justify-center gap-4 z-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="w-16 h-16 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
                      <p className="text-gray-600 font-medium">Appel aux spécialistes...</p>
                    </motion.div>
                  )}

                  {/* Center - Calendar Button (only show when we have agents) */}
                  {specializedAgents.length > 0 && (
                    <motion.div
                      className="flex flex-col items-center gap-4"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + specializedAgents.length * 0.4, type: 'spring' }}
                    >
                      <motion.button
                        onClick={() => setShowCalendar(true)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-2xl"
                        animate={{
                          boxShadow: [
                            '0 10px 30px -10px rgba(251, 146, 60, 0.5)',
                            '0 20px 50px -15px rgba(251, 146, 60, 0.7)',
                            '0 10px 30px -10px rgba(251, 146, 60, 0.5)',
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Calendar className="w-10 h-10" />
                      </motion.button>
                      <motion.p
                        className="text-sm font-medium text-gray-700 text-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + specializedAgents.length * 0.4 }}
                      >
                        Voir le planning
                      </motion.p>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Calendar Modal */}
      <AnimatePresence>
        {showCalendar && (
          <CalendarView 
            events={displayCalendarEvents} 
            onClose={() => setShowCalendar(false)} 
          />
        )}
      </AnimatePresence>
      
      {/* Socket Status */}
      <SocketStatus 
        isConnected={isConnected} 
        error={error} 
        agentsCount={specializedAgents.length}
      />

      {/* Test ICS Download Button */}
      <motion.button
        onClick={() => downloadICS(TEST_STUDENT_CONSTRAINTS, 'test-calendrier.ics')}
        className="fixed bottom-4 left-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Download className="w-4 h-4" />
        <span className="text-sm font-medium">Test ICS</span>
      </motion.button>
    </div>
  );
};

export default Index;
