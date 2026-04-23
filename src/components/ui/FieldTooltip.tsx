import React from 'react';
import { HelpCircle } from 'lucide-react';

interface FieldTooltipProps {
  text: string;
}

export const FieldTooltip: React.FC<FieldTooltipProps> = ({ text }) => {
  return (
    <span 
      className="vpreq-tooltip" 
      title={text}
      aria-label={text}
    >
      <HelpCircle size={14} />
    </span>
  );
};
