'use client';

import React from 'react';
import LoginScreen from '@/components/screens/LoginScreen';
import DashboardScreen from '@/components/screens/DashboardScreen';
import ProjectScreen from '@/components/screens/ProjectScreen';
import UploadScreen from '@/components/screens/UploadScreen';
import CleanupScreen from '@/components/screens/CleanupScreen';
import ConversationScreen from '@/components/screens/ConversationScreen';
import ExportScreen from '@/components/screens/ExportScreen';
import { useAppContext } from '../lib/context/AppContext';

export default function Home() {
  const {
    appState,
    handleLogin,
    projects,
    handleOpenProject,
    handleNavigateToProjects,
    setAppState,
    handleProjectCreate,
    handleBackToDashboard,
    currentStep,
    handleUploadSuccess,
    setIsSuggestionsLoading,
    setSuggestions,
    csvData,
    handleDataCleaned,
    currentProject,
    addSlide,
    removeSlide,
    slides,
    requestId,
    suggestions,
    isSuggestionsLoading,
  } = useAppContext();

  const renderWorkflowScreen = () => {
    const screens: { [key: number]: React.ReactNode } = {
        0: <UploadScreen 
            onUploadSuccess={handleUploadSuccess} 
            setIsSuggestionsLoading={setIsSuggestionsLoading} 
            setSuggestions={setSuggestions}
          />,
        1: <CleanupScreen uploadedData={csvData} onDataCleaned={handleDataCleaned} />,
        2: <ConversationScreen 
            project={currentProject} 
            addSlide={addSlide} 
            removeSlide={removeSlide} 
            slides={slides} 
            csvData={csvData} 
            requestId={requestId} 
            suggestions={suggestions} 
            setSuggestions={setSuggestions} 
            isSuggestionsLoading={isSuggestionsLoading}
            setIsSuggestionsLoading={setIsSuggestionsLoading}
          />,
        3: <ExportScreen slides={slides} project={currentProject} />
    };
    return screens[currentStep];
  };

  if (appState === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }
  
  if (appState === 'dashboard') {
      return <DashboardScreen 
          projects={projects} 
          onOpenProject={handleOpenProject}
          onNavigateToProjects={handleNavigateToProjects}
          // onNavigateToGitHub={handleNavigateToGitHub} // Removed as GitHubScreen is not yet implemented
          onNewProject={() => setAppState('projectManagement')}
          // onLogout={handleLogout} // Handled by layout for now
      />;
  }

  if (appState === 'projectManagement') {
    return <ProjectScreen 
      projects={projects} 
      onProjectCreate={handleProjectCreate} 
      onOpenProject={handleOpenProject}
      onBack={handleBackToDashboard}
    />;
  }

  if (appState === 'workflow') {
    return renderWorkflowScreen();
  }

  // Default case or loading
  return <div>Loading...</div>;
}
