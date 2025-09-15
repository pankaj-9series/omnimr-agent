import React from 'react';
import { Step } from '@/lib/types';
import CheckIcon from './icons/CheckIcon';

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center justify-center space-x-2 sm:space-x-6">
        {steps.map((step, stepIdx) => {
          const isCompleted = stepIdx < currentStep;
          const isActive = stepIdx === currentStep;
          const isClickable = isCompleted && onStepClick;

          const stepWrapperClasses = [
            'flex items-center p-2 rounded-lg transition-all duration-300 ease-in-out',
            isClickable ? 'cursor-pointer group hover:bg-slate-100' : 'cursor-default',
            isActive ? 'bg-sky-50' : ''
          ].join(' ');

          const circleClasses = [
            'relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-in-out',
            isCompleted && 'bg-sky-600 text-white shadow-md',
            isActive && 'border-2 border-sky-600 bg-white',
            !isCompleted && !isActive && 'border-2 border-slate-300 bg-white group-hover:border-slate-400'
          ].join(' ');

          const textNameClasses = [
            'text-sm font-bold transition-colors duration-300',
            isActive ? 'text-sky-600' : 'text-slate-700',
            !isCompleted && !isActive && 'text-slate-500',
             isClickable && 'group-hover:text-slate-900'
          ].join(' ');

          const textDescriptionClasses = [
             'text-xs transition-colors duration-300',
             isActive ? 'text-slate-600' : 'text-slate-500',
             !isCompleted && !isActive && 'text-slate-400',
             isClickable && 'group-hover:text-slate-600'
          ].join(' ');


          const stepContent = (
            <>
              {/* Step Icon */}
              <div className={circleClasses}>
                {isActive && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                )}
                 <span className="relative">
                    {isCompleted ? (
                      <CheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    ) : (
                      <span className={`font-semibold ${isActive ? 'text-sky-600' : 'text-slate-500 group-hover:text-slate-700'}`}>
                        {stepIdx + 1}
                      </span>
                    )}
                 </span>
              </div>

              {/* Step Text */}
              <div className="ml-4 hidden flex-col pt-0.5 md:flex">
                <span className={textNameClasses}>
                  {step.name}
                </span>
                <span className={textDescriptionClasses}>{step.description}</span>
              </div>
            </>
          );

          return (
            <li key={step.name}>
              {isClickable ? (
                <button
                  onClick={() => onStepClick(stepIdx)}
                  className={stepWrapperClasses}
                  aria-label={`Go to ${step.name} step`}
                >
                  {stepContent}
                </button>
              ) : (
                <div className={stepWrapperClasses}>
                    {stepContent}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;
