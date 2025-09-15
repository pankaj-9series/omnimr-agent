'use client';

import React, { useState } from 'react';
import Button from '../components/ui/Button';
import ArrowRightIcon from '../components/icons/ArrowRightIcon';
import { useAppContext } from '../lib/context/AppContext';

const AnimatedBackground = () => (
    <div className="relative w-full h-full overflow-hidden bg-slate-900">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-sky-500 rounded-full mix-blend-lighten filter blur-2xl opacity-60 animate-blob"></div>
        <div style={{ animationDelay: '2s' }} className="absolute top-1/2 right-1/4 w-48 h-48 bg-emerald-500 rounded-full mix-blend-lighten filter blur-2xl opacity-60 animate-blob"></div>
        <div style={{ animationDelay: '4s' }} className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-indigo-500 rounded-full mix-blend-lighten filter blur-2xl opacity-60 animate-blob"></div>
        
        <div className="relative z-10 flex flex-col justify-center h-full p-12 text-white">
            <div className="flex items-center justify-start w-16 h-16 text-3xl font-bold text-white bg-white/20 rounded-full mb-6">
                <span className="w-full text-center">O</span>
            </div>
            <h1 className="text-4xl font-bold">Unlock Your Market Insights</h1>
            <p className="mt-4 text-lg text-slate-300">Transform raw data into strategic reports with the power of AI.</p>
        </div>
    </div>
);


export default function Home() {
  const { handleLogin } = useAppContext();
  const [email, setEmail] = useState('demo@omnimr.com');
  const [password, setPassword] = useState('••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="min-h-screen w-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column: Form */}
        <div className="flex flex-col justify-center items-center p-8 bg-slate-50">
            <div className="w-full max-w-sm mx-auto">
                <div className="text-center lg:text-left mb-10">
                    <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
                    <p className="mt-2 text-slate-500">Sign in to continue to your dashboard.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"/>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"/>
                    </div>
                    <div className="flex items-center justify-between">
                        <a href="#" className="text-sm text-sky-600 hover:underline">Forgot password?</a>
                    </div>
                    <Button type="submit" size="lg" className="w-full flex items-center justify-center gap-2">
                        <span>Continue to Platform</span>
                        <ArrowRightIcon className="w-5 h-5" />
                    </Button>
                </form>
                
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500 bg-slate-100 p-3 rounded-lg border border-slate-200">
                        Demo credentials are pre-filled for quick access.
                    </p>
                </div>
            </div>
        </div>

        {/* Right Column: Animated background */}
        <div className="hidden lg:block">
            <AnimatedBackground />
        </div>
    </div>
  );
}
