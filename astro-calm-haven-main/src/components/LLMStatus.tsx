'use client';

import { Loader2, CheckCircle, AlertCircle, Cpu } from 'lucide-react';

interface LLMStatusProps {
  status: 'idle' | 'loading' | 'ready' | 'error';
  progress?: number;
}

export function LLMStatus({ status, progress }: LLMStatusProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      {status === 'loading' && (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading AI brain... {progress ? `${Math.round(progress * 100)}%` : ''}</span>
        </>
      )}
      {status === 'ready' && (
        <>
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>AI ready (offline mode)</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>AI offline - using basic mode</span>
        </>
      )}
      {status === 'idle' && (
        <>
          <Cpu className="w-4 h-4" />
          <span>AI initializing...</span>
        </>
      )}
    </div>
  );
}