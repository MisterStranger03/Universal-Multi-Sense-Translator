
import React, { useState, useEffect } from 'react';
import { SensorPanel } from './components/SensorPanel';
import { PerceptionLog } from './components/PerceptionLog';
import { OrchestratorView } from './components/OrchestratorView';
import { TimelinePanel } from './components/TimelinePanel';
import { CorrectionModal } from './components/CorrectionModal';
import { runOrchestrator, runPerceptionSimulation } from './services/geminiService';
import { PerceptionModuleOutput, OrchestratorOutput, AppState, TimelineEvent, UserSettings } from './types';
import { Cpu, Activity, ShieldCheck, Info, Settings as SettingsIcon, Globe, Bell } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [perceptionData, setPerceptionData] = useState<PerceptionModuleOutput | null>(null);
  const [orchestratorResult, setOrchestratorResult] = useState<OrchestratorOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Advanced Features State
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [editingSign, setEditingSign] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    targetLanguage: 'English',
    culturalContext: 'General/Western',
    autoEmergency: true
  });

  const addToTimeline = (type: TimelineEvent['type'], summary: string, details?: any) => {
    const newEvent: TimelineEvent = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      type,
      summary,
      details
    };
    setTimeline(prev => [...prev, newEvent]);
  };

  const handleFrameCapture = async (base64Frame: string) => {
    setError(null);
    setAppState(AppState.PERCEIVING);
    
    try {
      // 1. Run Perception (Simulated via Gemini Vision)
      const pData = await runPerceptionSimulation(base64Frame);
      setPerceptionData(pData);
      
      // Log perception to timeline if significant
      if (pData.sign_translation || pData.emotion || (pData.object_detections && pData.object_detections.length > 0)) {
         addToTimeline('perception', 
           `Detected: ${pData.sign_translation?.text || 'No Sign'} | ${pData.emotion?.label || 'Neutral'}`, 
           pData
         );
      }

      // 2. Run Orchestration (Gemini Reasoning) with User Settings
      setAppState(AppState.ORCHESTRATING);
      const oResult = await runOrchestrator(pData, userSettings);
      setOrchestratorResult(oResult);
      
      // Log orchestration
      addToTimeline('orchestration', `Intent: ${oResult.intent}`, oResult);

      setAppState(AppState.IDLE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Pipeline Failed");
      setAppState(AppState.ERROR);
    }
  };

  const handleSaveCorrection = (newText: string) => {
    // In a real app, this would update the on-device model weights/adapter.
    addToTimeline('correction', `User corrected sign to: "${newText}"`);
    setEditingSign(null);
    // Optimistically update display
    if (perceptionData && perceptionData.sign_translation) {
      setPerceptionData({
        ...perceptionData,
        sign_translation: { ...perceptionData.sign_translation, text: newText }
      });
    }
    // Show Toast (simulated)
    alert("Correction saved to local adapter layer. Model updated.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      
      {/* Modals */}
      {editingSign && (
        <CorrectionModal 
          originalText={editingSign} 
          onClose={() => setEditingSign(null)} 
          onSave={handleSaveCorrection} 
        />
      )}

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
              <Cpu className="text-cyan-400" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white">UMST <span className="text-slate-500 font-light">Pro</span></h1>
              <div className="flex items-center gap-2 text-[10px] text-cyan-500 font-mono uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                Universal Multi-Sense Translator
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1.5"><Activity size={12}/> 12ms</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={12}/> LOCAL-FIRST</span>
            </div>

            {/* Settings Toggle */}
            <div className="relative">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-cyan-900/50 text-cyan-400' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                <SettingsIcon size={20} />
              </button>
              
              {showSettings && (
                <div className="absolute right-0 top-12 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-4 z-50">
                  <h3 className="text-xs font-bold uppercase text-slate-500 mb-3">Orchestrator Settings</h3>
                  
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-xs text-slate-300 mb-1">
                      <Globe size={12} /> Target Language
                    </label>
                    <select 
                      value={userSettings.targetLanguage}
                      onChange={(e) => setUserSettings({...userSettings, targetLanguage: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm text-white"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Japanese</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-xs text-slate-300 mb-1">
                      <SettingsIcon size={12} /> Cultural Context
                    </label>
                    <select 
                      value={userSettings.culturalContext}
                      onChange={(e) => setUserSettings({...userSettings, culturalContext: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm text-white"
                    >
                      <option>General/Western</option>
                      <option>East Asian (High Context)</option>
                      <option>Latin American</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <Bell size={12} /> Auto-Emergency
                    </label>
                    <input 
                      type="checkbox" 
                      checked={userSettings.autoEmergency}
                      onChange={(e) => setUserSettings({...userSettings, autoEmergency: e.target.checked})}
                      className="accent-cyan-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors"
            >
              <Info size={20} className="text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto p-6 h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Info Modal/Banner */}
        {showInfo && (
           <div className="mb-6 bg-cyan-900/20 border border-cyan-500/30 p-4 rounded-lg text-sm text-cyan-100 flex gap-4">
             <Info className="shrink-0 text-cyan-400" />
             <div>
               <p className="font-bold mb-1">Architecture Note</p>
               <p className="opacity-80">
                 This demo simulates the <span className="font-mono text-cyan-300">Perception Layer</span> (Edge Models) using Gemini Vision, 
                 then feeds that structured data into the <span className="font-mono text-cyan-300">Orchestrator</span> (Gemini Reasoning).
                 It now features <strong>Multilingual support</strong>, <strong>Safety Countdowns</strong>, and <strong>Temporal Memory</strong>.
               </p>
             </div>
             <button onClick={() => setShowInfo(false)} className="ml-auto text-cyan-400 hover:text-white">✕</button>
           </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 p-4 rounded-lg text-sm text-red-200 flex items-center justify-between">
            <span className="flex items-center gap-2">⚠️ Error: {error}</span>
            <button onClick={() => setError(null)} className="hover:text-white">Dismiss</button>
          </div>
        )}

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full pb-6">
          
          {/* Left: Sensors (3 cols) */}
          <div className="lg:col-span-3 h-full flex flex-col gap-4 min-h-[400px]">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Input Stream</h2>
            <SensorPanel 
              onCaptureFrame={handleFrameCapture} 
              isProcessing={appState !== AppState.IDLE && appState !== AppState.ERROR} 
            />
          </div>

          {/* Center Left: Perception (3 cols) */}
          <div className="lg:col-span-3 h-full flex flex-col gap-4 min-h-[300px]">
            <div className="flex justify-between items-center pl-1">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Perception Layer</h2>
              {appState === AppState.PERCEIVING && <span className="text-[10px] text-cyan-400 animate-pulse">EXTRACTING FEATURES...</span>}
            </div>
            <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded-xl p-2 relative">
               <PerceptionLog 
                 data={perceptionData} 
                 onCorrectSign={(text) => setEditingSign(text)} 
               />
            </div>
          </div>

          {/* Center Right: Orchestrator (4 cols) */}
          <div className="lg:col-span-4 h-full flex flex-col gap-4 min-h-[400px]">
            <div className="flex justify-between items-center pl-1">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Orchestrator Agent</h2>
              <span className="text-[10px] font-mono text-slate-600">GEMINI-2.5-FLASH</span>
            </div>
            <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl relative overflow-hidden">
               <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.3)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
               <div className="relative z-10 h-full p-2">
                 <OrchestratorView 
                   result={orchestratorResult} 
                   isProcessing={appState === AppState.ORCHESTRATING} 
                   autoEmergency={userSettings.autoEmergency}
                 />
               </div>
            </div>
          </div>

          {/* Right: Timeline (2 cols) */}
          <div className="lg:col-span-2 h-full hidden xl:flex flex-col gap-4">
             <div className="h-full bg-slate-950/30 rounded-xl overflow-hidden border border-slate-800">
                <TimelinePanel events={timeline} />
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
