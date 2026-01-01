import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-cisa-slate border-b border-gray-700 p-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cisa-blue rounded flex items-center justify-center shadow-lg border border-blue-400">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">CISA <span className="text-blue-400">AUTO-ANALYST</span></h1>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Cyber Threat Intelligence Automation</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             <span>SYSTEM ONLINE</span>
           </div>
           <div>TLP:CLEAR</div>
        </div>
      </div>
    </header>
  );
};

export default Header;