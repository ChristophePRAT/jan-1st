import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowUp } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = "Écris ton message..." }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
      onSubmit={handleSubmit}
    >
      <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-2 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent px-4 py-3 text-base outline-none placeholder:text-muted-foreground/70 disabled:opacity-50"
        />
        <motion.button
          type="submit"
          disabled={!input.trim() || disabled}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            input.trim() && !disabled
              ? 'bg-foreground text-background shadow-md'
              : 'bg-foreground/10 text-foreground/40'
          }`}
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.form>
  );
}
