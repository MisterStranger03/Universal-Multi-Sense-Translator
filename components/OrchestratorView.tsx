
import React, { useState, useEffect } from 'react';
import { OrchestratorOutput } from '../types';
import { AlertTriangle, CheckCircle, MessageSquare, Zap, HelpCircle, Eye, ShieldAlert, XCircle } from 'lucide-react';

interface OrchestratorViewProps {
  result: OrchestratorOutput | null;
  isProcessing: boolean;
  autoEmergency: boolean;
}

export const OrchestratorView: React.FC<OrchestratorViewProps> = ({ result, isProcessing, autoEmergency }) => {
  const [showExplain, setShowExplain] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Emergency Countdown Logic
  useEffect(() => {
    if (result?.intent === 'medical_emergency' && autoEmergency) {
      setCountdown(10);
    } else {
      setCountdown(null);
    }
  }, [result, autoEmergency]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (isProcessing) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 border border-slate-700 rounded-xl bg-slate-900/50">
        <div className="flex gap-1 mb-4">
            <div className="w-2 h-8 bg-cyan-500 animate-[bounce_1s_infinite_0ms]"></div>
            <div className="w-2 h-8 bg-cyan-500 animate-[bounce_1s_infinite_200ms]"></div>
            <div className="w-2 h-8 bg-cyan-500 animate-[bounce_1s_infinite_400ms]"></div>
        </div>
        <p className="font-mono text-cyan-400 text-sm animate-pulse">ORCHESTRATING INTENT...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 border border-slate-700 rounded-xl bg-slate-900/50">
        <p className="font-mono text-sm">System Ready.</p>
        <p className="text-xs opacity-50 mt-2">Waiting for perception input.</p>
      </div>
    );
  }

  const isEmergency = result.intent.includes('emergency') || result.intent.includes('danger');
  const borderColor = isEmergency ? 'border-red-500' : 'border-cyan-500';
  const glowColor = isEmergency ? 'shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'shadow-[0_0_30px_rgba(6,182,212,0.1)]';

  return (
    <div className={`h-full flex flex-col gap-4 overflow-y-auto custom-scrollbar ${glowColor} relative`}>
      
      {/* Emergency Overlay */}
      {countdown !== null && countdown > 0 && (
        <div className="absolute inset-x-0 top-0 z-20 bg-red-600 text-white p-4 rounded-t-xl animate-pulse flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
             <ShieldAlert size={24} />
             <div>
               <p className="font-bold uppercase tracking-wider">Auto-Action Triggered</p>
               <p className="text-xs opacity-90">Executing emergency protocol in {countdown}s...</p>
             </div>
          </div>
          <button 
            onClick={() => setCountdown(null)}
            className="bg-white text-red-600 px-4 py-2 rounded font-bold hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <XCircle size={16} /> CANCEL
          </button>
        </div>
      )}

      {/* Main Message Bubble */}
      <div className={`bg-slate-900 border-l-4 ${borderColor} p-6 rounded-r-xl shadow-lg relative mt-${countdown ? '16' : '0'} transition-all`}>
        <h2 className="text-slate-400 text-xs font-mono uppercase mb-2 tracking-widest flex items-center justify-between">
            <span>Fused Output</span>
            <span className="text-slate-600">{new Date(result.timestamp_utc || Date.now()).toLocaleTimeString()}</span>
        </h2>
        <p className="text-2xl text-white font-light leading-relaxed">
          {result.message}
        </p>
        
        {/* Confidence Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
           <button 
             onClick={() => setShowExplain(!showExplain)}
             className="text-xs text-slate-500 hover:text-cyan-400 flex items-center gap-1 transition-colors"
           >
             <Eye size={12} /> Why?
           </button>
           <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold font-mono ${result.overall_confidence > 0.8 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
             {result.overall_confidence > 0.8 ? <CheckCircle size={12}/> : <AlertTriangle size={12}/>}
             {(result.overall_confidence * 100).toFixed(0)}%
           </div>
        </div>
      </div>

      {/* Explainability Panel */}
      {showExplain && (
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
          <h3 className="text-xs font-mono text-cyan-400 mb-2 uppercase flex items-center gap-2">
            <Eye size={14} /> Decision Logic Trace
          </h3>
          <p className="text-sm text-slate-300 mb-2">{result.explanations}</p>
          {result.logic_trace && (
            <div className="text-[10px] font-mono text-slate-500 bg-black/30 p-2 rounded border-l-2 border-slate-700">
              TRACE: {result.logic_trace}
            </div>
          )}
        </div>
      )}

      {/* Clarifying Question */}
      {result.clarifying_question && (
        <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-xl flex gap-3 items-start">
          <HelpCircle className="text-yellow-500 shrink-0 mt-1" size={20} />
          <div>
            <h3 className="text-yellow-500 text-sm font-bold uppercase mb-1">Clarification Needed</h3>
            <p className="text-yellow-100/80 italic">"{result.clarifying_question}"</p>
          </div>
        </div>
      )}

      {/* Intent & Actions Grid */}
      <div className="grid grid-cols-1 gap-4">
        
        {/* Intent Card */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="text-xs text-slate-400 font-mono uppercase mb-2 flex items-center gap-2">
            <Zap size={14} /> Detected Intent
          </h3>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold px-3 py-1 rounded bg-slate-900 border ${isEmergency ? 'border-red-500 text-red-400' : 'border-cyan-500 text-cyan-400'}`}>
              {result.intent.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Actions List */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
           <h3 className="text-xs text-slate-400 font-mono uppercase mb-3 flex items-center gap-2">
            <MessageSquare size={14} /> Suggested Actions
          </h3>
          <div className="flex flex-col gap-2">
            {result.actions.map((action) => (
              <button 
                key={action.id}
                className={`text-left px-4 py-3 rounded-lg flex justify-between items-center transition-all ${
                  isEmergency 
                  ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-100' 
                  : 'bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-100'
                }`}
              >
                <span className="font-medium text-sm">{action.label}</span>
                <span className="text-xs opacity-60 font-mono">{(action.confidence * 100).toFixed(0)}%</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
