import { motion } from 'framer-motion';
import Link from 'next/link';

import { MessageIcon, VercelIcon } from './icons';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <p className="flex flex-row justify-center gap-4 items-center">
          <MessageIcon size={32} />
        </p>
        <p>
          Welcome to your AI assistant! I'm here to help answer your questions
          and provide information on a wide range of topics. Feel free to ask me
          anything - I'll do my best to give you clear, helpful responses.
        </p>
        <p>
          Start typing your question in the chat box below. You can ask about:
          {/* <ul className="list-disc list-inside text-left mt-2 space-y-1 text-muted-foreground">
            <li>General knowledge topics</li>
            <li>Practical how-to guides</li>
            <li>Creative ideas and suggestions</li>
            <li>Problem-solving strategies</li>
          </ul> */}
        </p>
      </div>
    </motion.div>
  );
};
