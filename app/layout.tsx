'use client';
import './globals.css'
import Header from '../components/Header'
import { AppContextProvider, useAppContext } from '../lib/context/AppContext'
import React from 'react'
import { usePathname } from 'next/navigation'
import Head from 'next/head';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppContextProvider>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <LayoutContent>{children}</LayoutContent>
    </AppContextProvider>
  )
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { currentStep, currentProject, csvData, slides, backActions, continueActions, backLabels, continueLabels, continueDisabled } = useAppContext();
  const pathname = usePathname();
  const isWorkflowRoute = pathname.startsWith('/workflow');

  return (
    <html lang="en">
      <body className="h-screen w-screen flex bg-slate-100 font-sans text-slate-800 overflow-hidden">
        <div className="flex flex-col flex-1">
          <Header currentStep={currentStep} project={currentProject} />
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
            {children}
          </main>
          {isWorkflowRoute && (
             <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-t border-slate-200 px-8 py-4 flex justify-between items-center sticky bottom-0">
             <div>
               {currentStep > 0 && (
                 <button className="btn btn-secondary" onClick={backActions[currentStep]}>
                   {backLabels[currentStep]}
                 </button>
               )}
             </div>
             <div className="flex items-center gap-4">
                 <p className="text-sm text-slate-500">
                     Step <span className="font-bold text-slate-700">{currentStep + 1}</span> of <span className="font-bold text-slate-700">{4}</span>
                 </p>
                 <button className="btn btn-primary" onClick={continueActions[currentStep]} disabled={continueDisabled[currentStep]}>
                     {continueLabels[currentStep]}
                 </button>
             </div>
           </div>
          )}
          <footer className="bg-white text-center text-xs text-slate-500 py-3 border-t border-slate-200">
            © 2025 OmniMR, Professional Market Research Platform.
          </footer>
        </div>
      </body>
    </html>
  )
}
