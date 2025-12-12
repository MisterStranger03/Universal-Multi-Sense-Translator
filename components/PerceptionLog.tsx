
import React from 'react';
import { PerceptionModuleOutput } from '../types';
import { BrainCircuit, Ear, Eye, Hand, Edit2 } from 'lucide-react';

interface PerceptionLogProps {
  data: PerceptionModuleOutput | null;
  onCorrectSign: (text: string) => void;
}

export const PerceptionLog: React.FC<PerceptionLogProps> = ({ data, onCorrectSign }) => {
  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 border border-dashed border-slate-700 rounded-xl bg-slate-900/20">
        <BrainCircuit size={48} className="mb-4 opacity-50" />
        <p className="font-mono text-sm text-center">Waiting for sensor fusion...</p>
      </div>
    );
  }

  const ConfidenceBar = ({ value }: { value: number }) => (
    <div className="h-1.5 w-full bg-slate-800 rounded-full mt-1 overflow-hidden">
      <div 
        className={`h-full rounded-full ${value > 0.8 ? 'bg-green-500' : value > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`} 
        style={{ width: `${value * 100}%` }} 
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
      
      {/* Sign Module */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
          <Hand size={64} />
        </div>
        <div className="flex justify-between items-start mb-2">
            <h4 className="text-xs font-mono uppercase text-slate-400 flex items-center gap-2">
                <Hand size={14} /> Sign Language Recognition
            </h4>
            {data.sign_translation && (
                <button 
                  onClick={() => onCorrectSign(data.sign_translation?.text || "")}
                  className="text-[10px] flex items-center gap-1 text-cyan-500 hover:text-cyan-300 transition-colors"
                >
                    <Edit2 size={10} /> TEACH
                </button>
            )}
        </div>
        
        {data.sign_translation ? (
          <div>
            <p className="text-xl font-medium text-white">"{data.sign_translation.text}"</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>CONF: {(data.sign_translation.confidence * 100).toFixed(0)}%</span>
              <div className="flex-1 max-w-[100px]">
                <ConfidenceBar value={data.sign_translation.confidence} />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-600 italic text-sm">No signs detected</p>
        )}
      </div>

      {/* Emotion Module */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
          <Eye size={64} />
        </div>
        <h4 className="text-xs font-mono uppercase text-slate-400 mb-2 flex items-center gap-2">
          <Eye size={14} /> Emotion / Intent
        </h4>
        {data.emotion ? (
          <div>
            <p className="text-xl font-medium text-cyan-300 capitalize">{data.emotion.label}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>CONF: {(data.emotion.confidence * 100).toFixed(0)}%</span>
              <div className="flex-1 max-w-[100px]">
                <ConfidenceBar value={data.emotion.confidence} />
              </div>
            </div>
          </div>
        ) : (
           <p className="text-slate-600 italic text-sm">Neutral / Undetected</p>
        )}
      </div>

      {/* Environment Module */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
          <Ear size={64} />
        </div>
        <h4 className="text-xs font-mono uppercase text-slate-400 mb-2 flex items-center gap-2">
          <Ear size={14} /> Environmental Cues
        </h4>
        <div className="space-y-2">
          {data.object_detections && data.object_detections.length > 0 ? (
            data.object_detections.map((obj, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-slate-200">{obj.label}</span>
                <span className="text-xs font-mono text-slate-500">{(obj.confidence * 100).toFixed(0)}%</span>
              </div>
            ))
          ) : (
            <span className="text-slate-600 text-sm italic">No relevant objects</span>
          )}
          {data.sound_events && data.sound_events.length > 0 && (
             <div className="pt-2 border-t border-slate-800 mt-2">
               {data.sound_events.map((snd, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-orange-300">{snd.label}</span>
                   <span className="text-xs font-mono text-slate-500">{(snd.confidence * 100).toFixed(0)}%</span>
                </div>
               ))}
             </div>
          )}
        </div>
      </div>

    </div>
  );
};
