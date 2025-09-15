import React from 'react';

const DocumentCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v2.25c0 .414-.336.75-.75.75h-9.75a.75.75 0 01-.75-.75V4.5c0-.414.336-.75.75-.75H15M15.75 17.25h2.25c.414 0 .75-.336.75-.75V9.75M15.75 17.25L18 15" />
    </svg>
);

export default DocumentCheckIcon;
