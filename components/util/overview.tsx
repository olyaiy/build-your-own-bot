import { motion } from 'framer-motion';
import Link from 'next/link';

import { MessageIcon, VercelIcon } from './icons';
import type { AgentCustomization } from '@/lib/db/schema';

export const Overview = ({ customization }: { customization: AgentCustomization }) => {
  const { title, content, showPoints, points } = customization.overview;

  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center mx-auto max-w-xl">
        <p className="flex flex-row justify-center gap-4 items-center">
          <MessageIcon size={32} />
        </p>
        
        {title && (
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        )}
        
        {content && (
          <p className="text-base text-muted-foreground">{content}</p>
        )}
        
        {showPoints && points.length > 0 && (
          <div>
            <ul className="list-disc list-inside text-left mt-2 space-y-2 text-muted-foreground">
              {points.map((point, index) => (
                <li key={index} className="pl-1">{point}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};
