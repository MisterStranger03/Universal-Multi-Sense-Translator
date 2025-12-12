
import React from 'react';
import { TimelineEvent } from '../types';
import { Clock, MessageSquare, Zap, Activity, Edit2 } from 'lucide-react';

interface TimelinePanelProps {
  events: TimelineEvent[];
}

export const TimelinePanel: React.FC<TimelinePanelProps> = ({ events }) => {
  return (
    <div className="h-full flex flex-col bg-slate-900/50 border-l border-slate-800">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Clock size={14} /> Temporal Memory
        </h2>
        <span className="text-[10px] text-slate-600 font-mono">{events.length} EVENTS</span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {events.length === 0 ? (
          <div className="text-center text-slate-600 text-xs italic mt-10">
            No events recorded yet.
          </div>
        ) : (
          events.slice().reverse().map((event) => (
            <div key={event.id} className="relative pl-4 border-l-2 border-slate-800 hover:border-cyan-500/50 transition-colors">
              <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-700 ring-2 ring-slate-900" />
              
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-slate-500">
                  {event.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded
                  ${event.type === 'orchestration' ? 'bg-cyan-900/30 text-cyan-400' : 
                    event.type === 'perception' ? 'bg-purple-900/30 text-purple-400' : 
                    event.type === 'action' ? 'bg-red-900/30 text-red-400' :
                    'bg-green-900/30 text-green-400'
                  }`}>
                  {event.type}
                </span>
              </div>
              
              <p className="text-xs text-slate-300 leading-snug">
                {event.summary}
              </p>
              
              {event.type === 'orchestration' && (
                <div className="mt-2 flex gap-2">
                  <MessageSquare size={12} className="text-slate-600" />
                  <span className="text-[10px] text-slate-500 truncate max-w-full">
                    {event.details?.message}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
