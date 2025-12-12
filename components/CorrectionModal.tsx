
import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface CorrectionModalProps {
  originalText: string;
  onClose: () => void;
  onSave: (newText: string) => void;
}

export const CorrectionModal: React.FC<CorrectionModalProps> = ({ originalText, onClose, onSave }) => {
  const [text, setText] = useState(originalText);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Teach / Correct Sign
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-xs text-slate-400 mb-2">Original Recognition:</p>
          <div className="bg-red-900/10 border border-red-500/20 text-red-200 p-2 rounded mb-4 text-sm line-through opacity-70">
            {originalText}
          </div>

          <label className="text-xs text-cyan-400 font-bold uppercase mb-2 block">Correct Translation</label>
          <input 
            type="text" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-cyan-500 outline-none"
            autoFocus
          />
          <p className="text-[10px] text-slate-500 mt-2">
            This correction will be saved to your local on-device adapter to improve future accuracy for this sign.
          </p>
        </div>

        <div className="p-4 bg-slate-950/30 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">CANCEL</button>
          <button 
            onClick={() => onSave(text)}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded flex items-center gap-2"
          >
            <Save size={14} />
            SAVE & TRAIN
          </button>
        </div>
      </div>
    </div>
  );
};
