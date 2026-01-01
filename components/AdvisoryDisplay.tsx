import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AnalysisResult } from '../types';

interface AdvisoryDisplayProps {
  result: AnalysisResult | null;
  email?: string;
}

const AdvisoryDisplay: React.FC<AdvisoryDisplayProps> = ({ result, email }) => {
  if (!result) return null;

  const handleSendEmail = () => {
    if (!result || !email) return;
    
    const subject = encodeURIComponent(`CISA Cybersecurity Advisory - ${new Date().toLocaleDateString()}`);
    
    // Browsers impose limits on mailto URL lengths (often around 2000 chars).
    // We must truncate the advisory content to ensure the window opens.
    const maxBodyLength = 1500;
    let cleanBody = result.advisoryContent.replace(/[#*`]/g, ''); // Basic markdown cleanup for plain text email
    
    if (cleanBody.length > maxBodyLength) {
      cleanBody = cleanBody.substring(0, maxBodyLength) + "\n\n...[Content Truncated due to email link limits. See dashboard for full report]...";
    }

    const body = encodeURIComponent(`Please find the attached Critical Security Advisory.\n\n${cleanBody}`);
    
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="bg-white text-gray-900 rounded-lg shadow-2xl overflow-hidden border-t-4 border-cisa-blue min-h-[500px]">
      {!result.foundCritical ? (
        <div className="p-12 flex flex-col items-center justify-center h-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Critical Threats Found</h2>
          <p className="text-gray-600 max-w-md">{result.advisoryContent}</p>
        </div>
      ) : (
        <div className="p-8">
           <div className="flex justify-between items-start mb-6 border-b pb-4">
             <div>
               <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Generated Advisory</h3>
               <div className="flex gap-2 mt-2">
                 <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">CRITICAL</span>
                 <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">TLP:CLEAR</span>
               </div>
             </div>
             
             <div className="flex gap-3">
               <button 
                  onClick={handleSendEmail}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors border border-blue-200 hover:border-blue-400 rounded px-3 py-1.5"
                  title="Open Default Email Client"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <span className="text-xs font-bold">DRAFT EMAIL</span>
               </button>

               <button 
                 onClick={() => window.print()}
                 className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 rounded px-3 py-1.5"
                 title="Print Advisory"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                 </svg>
                 <span className="text-xs font-bold">PRINT PDF</span>
               </button>
             </div>
           </div>
           
           <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-cisa-blue prose-h2:border-b prose-h2:pb-2 prose-h2:text-gray-800 prose-strong:text-gray-900">
             <ReactMarkdown>{result.advisoryContent}</ReactMarkdown>
           </div>

           {result.sources.length > 0 && (
             <div className="mt-8 pt-6 border-t border-gray-200">
               <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Verified Sources</h4>
               <ul className="space-y-2">
                 {result.sources.map((source, idx) => (
                   <li key={idx}>
                     <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                       {source.title}
                     </a>
                   </li>
                 ))}
               </ul>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default AdvisoryDisplay;