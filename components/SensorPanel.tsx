
import React, { useRef, useEffect, useState } from 'react';
import { Camera, Mic, Activity, Power, VideoOff } from 'lucide-react';

interface SensorPanelProps {
  onCaptureFrame: (base64: string) => void;
  isProcessing: boolean;
}

export const SensorPanel: React.FC<SensorPanelProps> = ({ onCaptureFrame, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSensorsActive, setIsSensorsActive] = useState(true);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>();

  const stopSensors = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
    setStream(null);
    setAudioLevel(0);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startSensors = async () => {
    try {
      stopSensors(); // Ensure clean slate

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, 
        audio: true 
      });
      
      streamRef.current = mediaStream;
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Setup Audio Analysis
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      
      const source = audioCtx.createMediaStreamSource(mediaStream);
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateAudio = () => {
        if (!analyser) return;
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(avg);
        rafRef.current = requestAnimationFrame(updateAudio);
      };
      updateAudio();

    } catch (err) {
      console.error("Error accessing sensors:", err);
      setIsSensorsActive(false); // Turn switch off if failed
    }
  };

  useEffect(() => {
    if (isSensorsActive) {
      startSensors();
    } else {
      stopSensors();
    }

    return () => {
      stopSensors();
    };
  }, [isSensorsActive]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && !isProcessing && isSensorsActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        onCaptureFrame(base64);
      }
    }
  };

  return (
    <div className="relative flex flex-col gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700 h-full">
      <div className="flex items-center justify-between text-cyan-400 mb-2">
        <h3 className="flex items-center gap-2 font-mono text-sm tracking-wider uppercase">
          <Camera size={16} /> Sensor Feed
        </h3>
        
        <div className="flex items-center gap-3">
          {isSensorsActive ? (
            <span className="flex items-center gap-2 text-xs text-green-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              LIVE
            </span>
          ) : (
             <span className="text-xs text-slate-500 font-mono">OFFLINE</span>
          )}
          
          <button 
            onClick={() => setIsSensorsActive(!isSensorsActive)}
            className={`p-1.5 rounded-full transition-all ${
              isSensorsActive 
                ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' 
                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            }`}
            title={isSensorsActive ? "Turn Off Sensors" : "Turn On Sensors"}
          >
            <Power size={14} />
          </button>
        </div>
      </div>

      <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-700 shadow-inner group">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover transition-opacity duration-500 ${isSensorsActive ? 'opacity-80' : 'opacity-0'}`}
        />
        
        {/* Placeholder for Disabled State */}
        {!isSensorsActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
             <VideoOff size={48} className="mb-2 opacity-50" />
             <p className="font-mono text-xs uppercase tracking-widest">Sensors Disabled</p>
          </div>
        )}

        {/* HUD Overlay */}
        <div className={`absolute inset-0 pointer-events-none p-4 flex flex-col justify-between transition-opacity ${isSensorsActive ? 'opacity-100' : 'opacity-20'}`}>
           <div className="flex justify-between">
             <div className="border-l-2 border-t-2 border-cyan-500/50 w-8 h-8" />
             <div className="border-r-2 border-t-2 border-cyan-500/50 w-8 h-8" />
           </div>
           <div className="flex justify-center items-center">
             {isProcessing && <div className="text-cyan-400 font-mono text-sm bg-black/50 px-3 py-1 animate-pulse">ANALYZING...</div>}
           </div>
           <div className="flex justify-between">
             <div className="border-l-2 border-b-2 border-cyan-500/50 w-8 h-8" />
             <div className="border-r-2 border-b-2 border-cyan-500/50 w-8 h-8" />
           </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Audio Visualizer */}
      <div className={`flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800 transition-opacity ${isSensorsActive ? 'opacity-100' : 'opacity-50'}`}>
        <Mic size={16} className={isSensorsActive ? "text-slate-400" : "text-slate-700"} />
        <div className="flex-1 flex items-end gap-[2px] h-8">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className="w-full bg-cyan-500/40 rounded-sm transition-all duration-75"
              style={{ 
                height: isSensorsActive ? `${Math.min(100, Math.max(10, audioLevel * (Math.random() * 1.5 + 0.5)))}%` : '10%',
                opacity: isSensorsActive && audioLevel > 5 ? 1 : 0.2
              }}
            />
          ))}
        </div>
        <Activity size={16} className={isSensorsActive && audioLevel > 20 ? "text-green-400" : "text-slate-700"} />
      </div>

      <button
        onClick={handleCapture}
        disabled={isProcessing || !isSensorsActive}
        className={`mt-auto w-full py-3 font-mono font-bold uppercase tracking-widest text-sm rounded transition-all
          ${isProcessing || !isSensorsActive
            ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
            : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)]'
          }`}
      >
        {isProcessing ? 'Processing Loop...' : !isSensorsActive ? 'Sensors Off' : 'Process Frame'}
      </button>
    </div>
  );
};
