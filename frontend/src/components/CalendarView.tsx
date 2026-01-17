import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarEvent } from '@/types/chat';
import { Calendar, Clock, Download, X } from 'lucide-react';
import { downloadICS } from '@/utils/icsExport';

interface CalendarViewProps {
  events: CalendarEvent[];
  onClose: () => void;
}

const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

const eventClass = 'bg-primary/20 text-primary-foreground border border-primary/30 cursor-pointer hover:bg-primary/30 transition-colors';

export function CalendarView({ events, onClose }: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const formatHour = (hour: number) => {
    return `${hour}h`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="glass-card-elevated w-full max-w-5xl max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="node-bob w-10 h-10 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Ton Planning Personnalisé</h2>
              <p className="text-sm text-muted-foreground">Créé par Bob & l'équipe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Legend */}
        <div className="px-6 py-3 border-b border-border flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary/50" />
            <span className="text-xs text-muted-foreground">Événements (cliquez pour les détails)</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-auto max-h-[60vh]">
          <div className="min-w-[800px]">
            {/* Day Headers */}
            <div className="grid grid-cols-8 border-b border-border sticky top-0 bg-card z-10">
              <div className="p-3 text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
              </div>
              {days.map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-sm font-medium border-l border-border"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Time Slots */}
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-border/50">
                <div className="p-2 text-xs text-muted-foreground text-right pr-3">
                  {formatHour(hour)}
                </div>
                {days.map((day) => {
                  const event = events.find(
                    (e) => e.day === day && e.startHour === hour
                  );
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="border-l border-border/50 min-h-[48px] relative p-1"
                    >
                      {event && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: Math.random() * 0.3 }}
                          className={`absolute inset-1 rounded-lg p-2 ${eventClass}`}
                          style={{ height: `${(event.duration / 60) * 48 - 8}px` }}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <p className="text-xs font-medium truncate">{event.title}</p>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium"
            onClick={onClose}
          >
            Fermer
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 rounded-xl node-bob text-primary-foreground text-sm font-medium flex items-center gap-2"
            onClick={() => downloadICS(events.length > 0 ? events : [])}
          >
            <Download className="w-4 h-4" />
            Télécharger .ics
          </motion.button>
        </div>
      </motion.div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-card rounded-2xl shadow-2xl border border-border p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedEvent.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.day} • {selectedEvent.startHour}h - {selectedEvent.startHour + Math.floor(selectedEvent.duration / 60)}h{selectedEvent.duration % 60 > 0 ? `${selectedEvent.duration % 60}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {selectedEvent.description ? (
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                  {selectedEvent.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Aucune description disponible.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
