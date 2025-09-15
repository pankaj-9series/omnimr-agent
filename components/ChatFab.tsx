import React from 'react';
import { Project } from '../lib/types';
import ConversationIcon from './icons/ConversationIcon';

interface ChatFabProps {
    project: Project | null;
}

const ChatFab: React.FC<ChatFabProps> = ({ project }) => {
    const colorClasses = {
        blue: 'bg-brand-accent-blue hover:bg-blue-700',
        green: 'bg-brand-accent-green hover:bg-green-700',
        purple: 'bg-brand-accent-purple hover:bg-purple-700',
        red: 'bg-brand-accent-red hover:bg-red-700',
    };

    // Correctly derive themeColor from project.theme, as themeColor property does not exist on Project type.
    const themeName = project?.theme || 'corporate_blue';
    const themeColorMap: Record<string, keyof typeof colorClasses> = {
        corporate_blue: 'blue',
        research_green: 'green',
        consulting_gray: 'purple',
        healthcare_teal: 'red',
    };
    const themeColor = themeColorMap[themeName] ?? 'blue';
    

    // This component is a placeholder for a full chat modal implementation.
    // For now, it's just a visual element.
    const handleClick = () => {
        alert("Full chat functionality would open in a modal here.");
    };

    return (
        <button
            onClick={handleClick}
            className={`fixed bottom-8 right-8 w-14 h-14 rounded-full text-white shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg-light focus:ring-brand-accent-${themeColor} ${colorClasses[themeColor]}`}
            aria-label="Open Chat"
        >
            <div className="flex items-center justify-center h-full w-full">
                <ConversationIcon />
            </div>
        </button>
    );
};

export default ChatFab;
