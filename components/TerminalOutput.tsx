import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface TerminalOutputProps {
  logs: LogEntry[];
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-cisa-dark border border-cisa-slate rounded-lg p-4 font-mono text-xs sm:text-sm h-64 overflow-y-auto shadow-inner" ref={scrollRef}>
      {logs.map((log, index) => (
        <div key={index} className="mb-1 break-words">
          <span className="text-gray-500 mr-2">[{log.timestamp}]</span>
          <span className={`
            ${log.type === 'info' ? 'text-blue-400' : ''}
            ${log.type === 'success' ? 'text-green-400' : ''}
            ${log.type === 'warning' ? 'text-yellow-400' : ''}
            ${log.type === 'error' ? 'text-red-500' : ''}
            ${log.type === 'system' ? 'text-gray-300' : ''}
          `}>
            {log.type === 'system' ? '> ' : ''}{log.message}
          </span>
        </div>
      ))}
      {logs.length === 0 && (
        <div className="text-gray-600 italic">System ready. Waiting for initiation...</div>
      )}
    </div>
  );
};

export default TerminalOutput;