import React from 'react';

type TutorialStep = string | { title: string; content?: string; description?: string; targetId?: string; icon?: React.ReactNode };

interface PageFooterTutorialProps {
  steps: TutorialStep[];
}

export const PageFooterTutorial: React.FC<PageFooterTutorialProps> = ({ steps }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-surface-card border-t border-surface-border p-3 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="bg-brand text-white text-xs font-bold px-2 py-0.5 rounded">TUTORIAL</span>
          <p className="text-text-secondary text-sm font-medium">Siga estes passos para completar sua requisição:</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {steps.map((step, index) => {
            const label = typeof step === 'string' ? step : step.title;
            return (
              <div key={index} className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-700 text-slate-300 text-[10px] font-bold">
                  {index + 1}
                </span>
                <span className="text-text-muted text-xs whitespace-nowrap">{label}</span>
                {index < steps.length - 1 && (
                  <span className="hidden md:inline text-slate-600">→</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </footer>
  );
};
