import React from 'react';

const FolderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h1.5m0 0V9a2.25 2.25 0 012.25-2.25h2.25a2.25 2.25 0 012.25 2.25v.75m-6 0h6m-6 0l-3 3m3-3l3 3m-3-3v6a2.25 2.25 0 002.25 2.25h2.25A2.25 2.25 0 0018 18v-3m-6 0V9a2.25 2.25 0 012.25-2.25h2.25A2.25 2.25 0 0118 9v6a2.25 2.25 0 01-2.25 2.25h-2.25A2.25 2.25 0 0112 15z" />
    </svg>
);

export default FolderIcon;
