import { motion } from 'framer-motion';
import { Wifi, WifiOff, Users } from 'lucide-react';

interface SocketStatusProps {
  isConnected: boolean;
  error: string | null;
  agentsCount?: number;
}

export const SocketStatus = ({ isConnected, error, agentsCount = 0 }: SocketStatusProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 px-4 py-2 z-50 flex items-center gap-3"
    >
      {/* Connection status */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
          {isConnected ? 'Connecté' : error || 'Déconnecté'}
        </span>
      </div>

      {/* Agents count */}
      {agentsCount > 0 && (
        <div className="flex items-center gap-1 pl-3 border-l border-gray-200">
          <Users className="w-4 h-4 text-amber-500" />
          <span className="text-sm text-gray-600">{agentsCount} agent{agentsCount > 1 ? 's' : ''}</span>
        </div>
      )}
    </motion.div>
  );
};
