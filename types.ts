export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface AnalysisResult {
  advisoryContent: string;
  foundCritical: boolean;
  sources: GroundingSource[];
}

export enum WorkflowStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  ANALYZING = 'ANALYZING',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}