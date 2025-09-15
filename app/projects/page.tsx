'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { THEMES } from '@/lib/constants';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';
import { useAppContext } from '@/lib/context/AppContext';
import { useRouter } from 'next/navigation';

export default function ProjectScreenPage() {
  const { projects, handleProjectCreate, handleOpenProject } = useAppContext();
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    theme: 'corporate_blue'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProjectCreate(formData);
    setFormData({ name: '', description: '', theme: 'corporate_blue' });
    setShowCreateForm(false);
  };

  const handleBack = () => {
    router.push('/dashboard'); // Navigate back to the dashboard
  };

  return (
    <div className="">
      <main className="max-w-7xl mx-auto py-8">
        {showCreateForm ? (
          <Card className="p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Project</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Project Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {THEMES.map(theme => (
                    <option key={theme.id} value={theme.id}>{theme.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <Button type="submit">Create Project</Button>
                <Button type="button" variant="secondary" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <Card key={project.id} className="p-6" onClick={() => handleOpenProject(project)}>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{project.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{project.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status}
                  </span>
                  <span className="text-sm text-gray-500">{project.progress}%</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
