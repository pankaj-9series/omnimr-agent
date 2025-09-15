'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../../lib/context/AppContext';
import WorkflowCleanupScreen from '@/components/workflow-screens/WorkflowCleanupScreen';
import WorkflowConversationScreen from '@/components/workflow-screens/WorkflowConversationScreen';
import WorkflowExportScreen from '@/components/workflow-screens/WorkflowExportScreen';
import WorkflowUploadScreen from '@/components/workflow-screens/WorkflowUploadScreen';

interface WorkflowPageProps {
  params: { step: string };
}

export default function WorkflowPage({ params }: WorkflowPageProps) {
  const { currentStep, setCurrentStep } = useAppContext();
  const router = useRouter();
  const { step } = params;

  // Map string step to numerical step for Stepper component
  React.useEffect(() => {
    switch (step) {
      case 'upload':
        setCurrentStep(0);
        break;
      case 'cleanup':
        setCurrentStep(1);
        break;
      case 'conversation':
        setCurrentStep(2);
        break;
      case 'export':
        setCurrentStep(3);
        break;
      default:
        setCurrentStep(0); // Default to upload if unknown step
    }
  }, [step, setCurrentStep]);

  const renderWorkflowScreen = () => {
    switch (step) {
      case 'upload':
        return <WorkflowUploadScreen />;
      case 'cleanup':
        return <WorkflowCleanupScreen />;
      case 'conversation':
        return <WorkflowConversationScreen />;
      case 'export':
        return <WorkflowExportScreen />;
      default:
        return <div className="text-center py-10">Workflow step not found.</div>;
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-start py-8">
      {renderWorkflowScreen()}
    </div>
  );
}
