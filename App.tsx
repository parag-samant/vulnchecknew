import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Header from './components/Header';
import TerminalOutput from './components/TerminalOutput';
import AdvisoryDisplay from './components/AdvisoryDisplay';
import { runThreatAnalysis } from './services/geminiService';
import { LogEntry, WorkflowStatus, AnalysisResult } from './types';

function App() {
  const [status, setStatus] = useState<WorkflowStatus>(WorkflowStatus.IDLE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // Automation State
  const [recipientEmail, setRecipientEmail] = useState<string>('rijul170@gmail.com');
  const [isAutoRunEnabled, setIsAutoRunEnabled] = useState<boolean>(false);
  const [nextRunTime, setNextRunTime] = useState<Date | null>(null);
  const cronIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const [timeUntilNextRun, setTimeUntilNextRun] = useState<string>('');

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message,
      type
    }]);
  }, []);

  const simulateDiscovery = async () => {
    return new Promise<void>((resolve) => {
      const steps = [
        "Initializing discovery protocols...",
        "Connecting to CISA Known Exploited Vulnerabilities (KEV) Catalog...",
        "Querying NIST National Vulnerability Database (NVD)...",
        "Scanning vendor bulletins: Microsoft, Cisco, Fortinet, Adobe...",
        "Filtering timeframe: LAST 7 DAYS...",
        "Filtering severity: CVSS >= 8.0...",
        "Analyzing vectors for Active Exploitation...",
      ];

      let i = 0;
      const interval = setInterval(() => {
        if (i >= steps.length) {
          clearInterval(interval);
          resolve();
        } else {
          addLog(steps[i], 'system');
          i++;
        }
      }, 800);
    });
  };

  const simulateEmailDispatch = async (email: string) => {
    addLog(`[SIMULATION] Initiating SMTP handshake with secure relay...`, 'system');
    await new Promise(r => setTimeout(r, 800));
    addLog(`[SIMULATION] Authenticating... Success.`, 'system');
    addLog(`[SIMULATION] Encrypting advisory payload (TLS 1.3)...`, 'system');
    await new Promise(r => setTimeout(r, 600));
    addLog(`[SIMULATION] Dispatching advisory to ${email}...`, 'warning');
    await new Promise(r => setTimeout(r, 1000));
    addLog(`[SIMULATION] Email successfully queued for delivery. (Demo Only)`, 'success');
  };

  const handleStartAnalysis = useCallback(async (isAutoTrigger = false) => {
    if (status === WorkflowStatus.SCANNING || status === WorkflowStatus.ANALYZING) return;

    if (!isAutoTrigger) {
      setLogs([]); // Clear previous logs only on manual run
      setResult(null);
    }
    
    setStatus(WorkflowStatus.SCANNING);
    addLog(isAutoTrigger ? "AUTO-CRON TRIGGERED: INITIATING SCHEDULED SCAN" : "WORKFLOW INITIATED: CRITICAL THREAT DETECTION", 'info');

    try {
      const simulationPromise = simulateDiscovery();
      const apiPromise = runThreatAnalysis();

      await simulationPromise;
      
      setStatus(WorkflowStatus.ANALYZING);
      addLog("Discovery complete. Processing intelligence...", 'warning');

      const data = await apiPromise;

      setStatus(WorkflowStatus.GENERATING);
      addLog("Generating formal advisory...", 'system');

      setResult(data);
      setStatus(WorkflowStatus.COMPLETE);
      
      if (data.foundCritical) {
        addLog("CRITICAL THREAT IDENTIFIED. ADVISORY GENERATED.", 'error');
        // Auto-send email simulation if critical
        if (isAutoRunEnabled || recipientEmail) {
           await simulateEmailDispatch(recipientEmail);
        }
      } else {
        addLog("No critical threats found in 7-day window.", 'success');
      }
      
      if (isAutoRunEnabled) {
        const next = new Date(Date.now() + 3600000); // 1 hour
        setNextRunTime(next);
        addLog(`Scan complete. Next auto-run scheduled for ${next.toLocaleTimeString()}.`, 'system');
      }

    } catch (error: any) {
      setStatus(WorkflowStatus.ERROR);
      addLog(`Analysis failed: ${error.message}`, 'error');
    }
  }, [status, recipientEmail, isAutoRunEnabled, addLog]);

  // Cron Logic
  useEffect(() => {
    if (isAutoRunEnabled) {
      if (!nextRunTime) {
         // If just enabled, schedule next run for 1 hour from now (or immediate? Usually cron waits. Let's wait.)
         // Actually, let's schedule it.
         const next = new Date(Date.now() + 3600000);
         setNextRunTime(next);
         addLog(`Auto-Run Enabled. Next scan scheduled for ${next.toLocaleTimeString()}.`, 'system');
      }

      cronIntervalRef.current = window.setInterval(() => {
        handleStartAnalysis(true);
      }, 3600000) as unknown as number;

      // Countdown updater
      countdownIntervalRef.current = window.setInterval(() => {
        if (nextRunTime) {
          const diff = nextRunTime.getTime() - Date.now();
          if (diff > 0) {
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeUntilNextRun(`${minutes}m ${seconds}s`);
          } else {
            setTimeUntilNextRun('Running...');
          }
        }
      }, 1000) as unknown as number;

    } else {
      if (cronIntervalRef.current) clearInterval(cronIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setNextRunTime(null);
      setTimeUntilNextRun('');
    }

    return () => {
      if (cronIntervalRef.current) clearInterval(cronIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isAutoRunEnabled, handleStartAnalysis, nextRunTime, addLog]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-blue-500 selection:text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        
        {/* Status Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-cisa-slate border border-gray-700 rounded-lg p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  Discovery & Analysis Engine
                </h2>
                <div className={`px-3 py-1 rounded text-xs font-bold tracking-wider ${
                  status === WorkflowStatus.IDLE ? 'bg-gray-700 text-gray-300' :
                  status === WorkflowStatus.ERROR ? 'bg-red-900 text-red-200' :
                  status === WorkflowStatus.COMPLETE ? 'bg-green-900 text-green-200' :
                  'bg-blue-900 text-blue-200 animate-pulse'
                }`}>
                  STATUS: {status}
                </div>
              </div>
              
              <p className="text-gray-400 mb-6 text-sm">
                Initiate AI-driven reconnaissance across global threat feeds. The system scans for critical vulnerabilities (CVSS 8.0+) released within the last 7 days and generates actionable CISA advisories.
              </p>

              <button
                onClick={() => handleStartAnalysis(false)}
                disabled={status === WorkflowStatus.SCANNING || status === WorkflowStatus.ANALYZING || status === WorkflowStatus.GENERATING}
                className={`
                  w-full py-4 rounded-lg font-mono font-bold text-lg tracking-wider transition-all transform flex items-center justify-center gap-3
                  ${status === WorkflowStatus.SCANNING || status === WorkflowStatus.ANALYZING || status === WorkflowStatus.GENERATING
                    ? 'bg-gray-700 cursor-not-allowed text-gray-500'
                    : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] text-white'
                  }
                `}
              >
                {status === WorkflowStatus.IDLE || status === WorkflowStatus.COMPLETE || status === WorkflowStatus.ERROR ? (
                   <>
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                     INITIATE THREAT SCAN (7 DAYS)
                   </>
                ) : (
                  <>
                     <svg className="animate-spin w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     EXECUTING WORKFLOW...
                  </>
                )}
              </button>
            </div>

            {/* Automation Settings */}
            <div className="bg-cisa-dark border border-gray-700 rounded-lg p-6 shadow-inner relative overflow-hidden">
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 Automation Configuration
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">RECIPIENT EMAIL</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded p-2 pl-8 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                        placeholder="analyst@agency.gov"
                      />
                      <svg className="w-4 h-4 text-gray-500 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-gray-800 rounded p-3 border border-gray-700">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1">HOURLY AUTO-SCAN (CRON)</label>
                      <div className="text-xs text-gray-500 font-mono">
                         {isAutoRunEnabled ? (
                           <span className="text-green-400">ACTIVE - Next run: {timeUntilNextRun}</span>
                         ) : (
                           <span>INACTIVE</span>
                         )}
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsAutoRunEnabled(!isAutoRunEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isAutoRunEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAutoRunEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
               </div>

               <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500 flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p>
                    <strong>Note:</strong> Purely browser-based applications cannot send background emails (SMTP). The automated dispatch above is a <span className="text-gray-300">simulation</span>. For real-world deployment, this module connects to a backend mail relay (e.g., SendGrid/AWS SES).
                  </p>
               </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-cisa-dark border border-gray-700 rounded-lg p-4 shadow-xl h-full flex flex-col">
               <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Live System Logs</h3>
               <TerminalOutput logs={logs} />
            </div>
          </div>
        </div>

        {/* Advisory Output Section */}
        {result && (
          <section className="animate-fade-in-up">
            <AdvisoryDisplay result={result} email={recipientEmail} />
          </section>
        )}

      </main>
    </div>
  );
}

export default App;