import React from 'react';
import { Project } from '@/lib/types';
import { DASHBOARD_STEPS } from '@/lib/constants';
import Stepper from './Stepper';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  currentStep: number;
  project: Project | null;
}

const Header: React.FC<HeaderProps> = ({ currentStep, project }) => {
  const router = useRouter();

  const handleBackToProjects = () => {
    router.push('/projects');
  };

  const handleStepClick = (stepIndex: number) => {
    const stepRoutes = ['upload', 'cleanup', 'conversation', 'export'];
    router.push(`/workflow/${stepRoutes[stepIndex]}`);
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={handleBackToProjects} aria-label="Go back to projects" className="text-slate-500 hover:text-slate-800">
                <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center justify-center w-9 h-9 text-xl font-bold text-white bg-sky-600 rounded-full flex-shrink-0">
                O
            </div>
            <div>
                <h1 className="text-lg font-bold text-slate-900">{project?.name || 'Project'}</h1>
                <p className="text-sm text-slate-500">Project Workflow</p>
            </div>
        </div>
        <div className="flex-grow flex justify-center items-center px-8 hidden lg:flex">
             <Stepper steps={DASHBOARD_STEPS} currentStep={currentStep} onStepClick={handleStepClick} />
        </div>
        <div className="text-right">
             {/* This element is removed as the step count is now in the sticky footer */}
        </div>
      </div>
    </header>
  );
};

export default Header;
