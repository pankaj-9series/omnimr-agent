import React from 'react';

const DatabaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 12.75V18m0-5.25v-1.5a1.5 1.5 0 011.5-1.5h13.5a1.5 1.5 0 011.5 1.5v1.5m-16.5 0v5.25c0 .828.672 1.5 1.5 1.5h13.5a1.5 1.5 0 001.5-1.5V12.75m-16.5 0h16.5" />
    </svg>
);

export default DatabaseIcon;
