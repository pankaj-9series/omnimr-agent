'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FolderIcon from '@/components/icons/FolderIcon';
import TrendingUpIcon from '@/components/icons/TrendingUpIcon';
import BarChartIcon from '@/components/icons/BarChartIcon';
import DocumentReportIcon from '@/components/icons/DocumentReportIcon';
import PlusIcon from '@/components/icons/PlusIcon';
import CogIcon from '@/components/icons/CogIcon';
import SparklesIcon from '@/components/icons/SparklesIcon';
import PresentationChartBarIcon from '@/components/icons/PresentationChartBarIcon';
import { useAppContext } from '@/lib/context/AppContext';
import { useRouter } from 'next/navigation';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number | string; }> = ({ icon, title, value }) => (
    <Card className="p-4 flex items-center">
        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-blue-50 text-blue-600">
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
    </Card>
);

const statusStyles: { [key: string]: string } = {
  'In Progress': 'bg-blue-100 text-blue-800',
  'Completed': 'bg-green-100 text-green-800',
  'Draft': 'bg-yellow-100 text-yellow-800',
};


export default function DashboardScreenPage() {
    const { projects, handleOpenProject } = useAppContext();
    const router = useRouter();
    const recentProjects = projects.slice(0, 4);
    
    const handleNewProjectClick = () => {
        router.push('/projects');
    }

    const handleManageProjectsClick = () => {
        router.push('/projects');
    }

    return (
        <div className="">
            <main className="max-w-7xl mx-auto py-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Welcome back!</h2>
                    <p className="mt-1 text-gray-600">Here&apos;s an overview of your market research projects and activities.</p>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={<FolderIcon className="w-6 h-6" />} title="Total Projects" value={projects.length} />
                    <StatCard icon={<TrendingUpIcon className="w-6 h-6" />} title="Active Studies" value={projects.filter(p => p.status === 'In Progress').length} />
                    <StatCard icon={<BarChartIcon className="w-6 h-6" />} title="Completed Analysis" value={projects.filter(p => p.status === 'Completed').length} />
                    <StatCard icon={<DocumentReportIcon className="w-6 h-6" />} title="Generated Reports" value={24} />
                </div>
                
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Recent Projects */}
                    <div className="lg:col-span-2">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-slate-900">Recent Projects</h3>
                            <Button variant="secondary" size="sm" onClick={handleManageProjectsClick}>View All Projects</Button>
                        </div>
                        <div className="space-y-4">
                            {recentProjects.map(project => (
                                <Card key={project.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-bold text-slate-900">{project.name}</h4>
                                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusStyles[project.status]}`}>{project.status}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Last modified: {project.endDate}</p>
                                        <div className="mt-3 flex items-center gap-3">
                                            <div className="w-full bg-gray-200 rounded-full h-2 flex-grow">
                                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">{project.progress}% Complete</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0">
                                        <Button onClick={() => handleOpenProject(project)}>Open Project</Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1 space-y-6">
                        <Card className="p-5">
                             <h3 className="font-semibold text-lg">Quick Actions</h3>
                             <div className="mt-4 space-y-2">
                                <Button onClick={handleNewProjectClick} className="w-full justify-center flex items-center gap-2"><PlusIcon className="w-5 h-5"/> Create New Project</Button>
                                <Button onClick={handleManageProjectsClick} variant="secondary" className="w-full justify-center flex items-center gap-2"><CogIcon className="w-5 h-5"/> Manage Projects</Button>
                             </div>
                        </Card>
                         <Card className="p-5">
                             <h3 className="font-semibold text-lg">Platform Features</h3>
                              <ul className="mt-4 space-y-4 text-sm">
                                <li className="flex items-start gap-3">
                                    <BarChartIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div><span className="font-semibold text-gray-800">Custom Charts</span><br/><span className="text-gray-500">Bar, Line, Scatter, and more</span></div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <SparklesIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div><span className="font-semibold text-gray-800">AI-Powered Analysis</span><br/><span className="text-gray-500">Automated insights</span></div>
                                </li>
                                 <li className="flex items-start gap-3">
                                    <PresentationChartBarIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div><span className="font-semibold text-gray-800">PPT Export</span><br/><span className="text-gray-500">Professional reports</span></div>
                                </li>
                             </ul>
                        </Card>
                    </aside>
                </div>
            </main>
        </div>
    );
}
