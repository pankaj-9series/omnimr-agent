'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project, Slide, ParsedCSVData, Suggestion } from '../types';
import { MOCK_PROJECTS, DASHBOARD_STEPS } from '../constants';
import { useRouter } from 'next/navigation';

interface AppContextType {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  currentProject: Project | null;
  setCurrentProject: React.Dispatch<React.SetStateAction<Project | null>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  slides: Slide[];
  setSlides: React.Dispatch<React.SetStateAction<Slide[]>>;
  csvData: ParsedCSVData | null;
  setCsvData: React.Dispatch<React.SetStateAction<ParsedCSVData | null>>;
  requestId: string | null;
  setRequestId: React.Dispatch<React.SetStateAction<string | null>>;
  suggestions: Suggestion[];
  setSuggestions: React.Dispatch<React.SetStateAction<Suggestion[]>>;
  isSuggestionsLoading: boolean;
  setIsSuggestionsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Handlers - updated to use router for navigation
  handleLogin: () => void;
  handleLogout: () => void;
  handleBackToDashboard: () => void; // Removed, navigation via router.back() or router.push('/dashboard')
  handleNavigateToGitHub: () => void;
  handleProjectCreate: (projectData: Pick<Project, 'name' | 'description' | 'theme'>) => void;
  handleOpenProject: (projectToOpen: Project) => void;
  handleBackToProjects: () => void;
  handleUploadSuccess: (data: ParsedCSVData, newRequestId: string) => void;
  handleDataCleaned: (cleanedData: ParsedCSVData) => void;
  handleCleanupComplete: () => void;
  addSlide: (newSlide: Slide) => void;
  removeSlide: (slideNumber: number) => void;
  handleGoToStep: (step: number) => void;
  handleCompleteProject: () => void;
  
  // Workflow actions and labels
  backActions: { [key: number]: () => void };
  continueActions: { [key: number]: () => void };
  backLabels: { [key: number]: string };
  continueLabels: { [key: number]: string };
  continueDisabled: { [key: number]: boolean };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentStep, setCurrentStep] = useState(0); 
  const [slides, setSlides] = useState<Slide[]>([]);
  const [csvData, setCsvData] = useState<ParsedCSVData | null>(null);
  const [requestId, setRequestId] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('omnimr_request_id') : null
  );
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  
  const router = useRouter();

  const handleLogin = () => {
    router.push('/dashboard'); // Navigate using router
  };
  const handleLogout = () => {
    router.push('/login'); // Navigate using router
  };
  // const handleNavigateToProjects = () => router.push('/projects'); // Replaced by direct router calls
  const handleBackToDashboard = () => {
    router.push('/dashboard'); // Navigate using router
  };
  const handleNavigateToGitHub = () => {
    router.push('/github'); // Navigate using router
  };
  
  const handleProjectCreate = (projectData: Pick<Project, 'name' | 'description' | 'theme'>) => {
    const newProject: Project = {
      ...projectData,
      id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0],
      fileCount: 0,
      status: 'Draft',
    };
    setProjects(prev => [newProject, ...prev]);
  };
  
  const handleOpenProject = (projectToOpen: Project) => {
    setCurrentProject(projectToOpen);
    setSlides([]);
    setCsvData(null);
    setCurrentStep(0);
    router.push('/workflow/upload'); // Navigate to workflow
    setRequestId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('omnimr_request_id');
    }
    setSuggestions([]);
  };
  
  const handleBackToProjects = () => {
    setCurrentProject(null);
    router.push('/projects'); // Navigate to projects
  }

  const handleUploadSuccess = (data: ParsedCSVData, newRequestId: string) => {
    setCsvData(data);
    setRequestId(newRequestId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('omnimr_request_id', newRequestId);
    }
    setCurrentStep(1); // Move to next workflow step
    router.push('/workflow/cleanup');
  };

  const handleDataCleaned = (cleanedData: ParsedCSVData) => {
    setCsvData(cleanedData);
    setCurrentStep(2); // Move to next workflow step
    router.push('/workflow/conversation');
  };

  const handleCleanupComplete = () => {
    setCurrentStep(2); // Already at 2, but just in case, no navigation here yet
    router.push('/workflow/conversation');
  };
  
  const addSlide = (newSlide: Slide) => {
    setSlides(prevSlides => [...prevSlides, newSlide]);
  };
  
  const removeSlide = (slideNumber: number) => {
    setSlides(prevSlides => 
      prevSlides
        .filter(s => s.slideNumber !== slideNumber)
        .map((s, index) => ({ ...s, slideNumber: index + 1 }))
    );
  };

  const handleGoToStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
      const stepRouteMap: { [key: number]: string } = {
        0: '/workflow/upload',
        1: '/workflow/cleanup',
        2: '/workflow/conversation',
        3: '/workflow/export',
      };
      router.push(stepRouteMap[step]);
    }
  };

  const handleCompleteProject = () => {
    if (currentProject) {
      setProjects(prevProjects =>
        prevProjects.map(p =>
          p.id === currentProject.id
            ? { ...p, status: 'Completed', progress: 100 }
            : p
        )
      );
      setCurrentProject(null);
    }
    router.push('/dashboard'); // Navigate to dashboard
    setRequestId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('omnimr_request_id');
    }
  };

  const backActions: { [key: number]: () => void } = {
    1: () => router.push('/workflow/upload'),
    2: () => router.push('/workflow/cleanup'),
    3: () => router.push('/workflow/conversation')
  };

  const continueActions: { [key: number]: () => void } = {
    0: () => { if(csvData) router.push('/workflow/cleanup') },
    1: () => { if(csvData) router.push('/workflow/conversation') },
    2: () => router.push('/workflow/export'),
    3: handleCompleteProject
  };

  const backLabels: { [key: number]: string } = {
    1: 'Previous Step',
    2: 'Previous Step',
    3: 'Previous Step',
  };

  const continueLabels: { [key: number]: string } = {
    0: 'Next: Cleanup',
    1: 'Next: Conversation',
    2: 'Next: Export',
    3: 'Complete Project'
  };

  const continueDisabled: { [key: number]: boolean } = {
    0: !csvData,
    1: false,
    2: slides.length === 0,
    3: false
  };

  return (
    <AppContext.Provider
      value={{
        projects,
        setProjects,
        currentProject,
        setCurrentProject,
        currentStep,
        setCurrentStep,
        slides,
        setSlides,
        csvData,
        setCsvData,
        requestId,
        setRequestId,
        suggestions,
        setSuggestions,
        isSuggestionsLoading,
        setIsSuggestionsLoading,
        handleLogin,
        handleLogout,
        handleBackToDashboard,
        handleNavigateToGitHub,
        handleProjectCreate,
        handleOpenProject,
        handleBackToProjects,
        handleUploadSuccess,
        handleDataCleaned,
        handleCleanupComplete,
        addSlide,
        removeSlide,
        handleGoToStep,
        handleCompleteProject,
        backActions,
        continueActions,
        backLabels,
        continueLabels,
        continueDisabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
