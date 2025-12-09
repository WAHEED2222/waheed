import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../services/audioUtils';
import { INTERVIEW_INSTRUCTION } from '../types';
import { Mic, MicOff, PhoneOff, Activity, Headphones } from 'lucide-react';

export const LiveInterview: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [volume, setVolume] = useState(0);
  
  // Refs for audio handling to avoid closures and re-renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    // We can't explicitly close the session object from the promise easily in this simplified flow, 
    // but stopping the stream handles the user side.
    setIsActive(false);
    setStatus('idle');
    setVolume(0);
  };

  const startInterview = async () => {
    try {
      setStatus('connecting');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('connected');
            setIsActive(true);
            
            // Setup Input Stream
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              
              // Visualization logic
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(rms * 10, 1)); // Scale for visual

              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then((session: any) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
               // Ensure we use the current audio context time for scheduling
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
               
               const audioBuffer = await decodeAudioData(
                 base64ToUint8Array(base64Audio),
                 outputCtx,
                 24000,
                 1
               );
               
               const source = outputCtx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputCtx.destination);
               source.addEventListener('ended', () => {
                 sourcesRef.current.delete(source);
               });
               
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
               sourcesRef.current.add(source);
            }
            
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(src => src.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            cleanup();
          },
          onerror: (err) => {
            console.error(err);
            setStatus('error');
            cleanup();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: INTERVIEW_INSTRUCTION,
        },
      });
      sessionPromiseRef.current = sessionPromise;

    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
      {/* Background Pulse Effect */}
      {status === 'connected' && (
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
           <div className="w-64 h-64 bg-blue-500 rounded-full opacity-10 animate-pulse-slow blur-3xl"></div>
        </div>
      )}

      <div className="z-10 flex flex-col items-center gap-6">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
          status === 'connected' ? 'bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.5)]' : 'bg-slate-700'
        }`}>
          {status === 'connecting' ? (
            <Activity className="w-10 h-10 animate-spin text-white" />
          ) : isActive ? (
            <div className="flex items-end gap-1 h-8">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 bg-white rounded-full transition-all duration-75"
                  style={{ 
                    height: `${Math.max(20, Math.random() * 100 * (volume + 0.2))}%`,
                    opacity: 0.8 
                  }}
                />
              ))}
            </div>
          ) : (
            <Headphones className="w-10 h-10 text-slate-300" />
          )}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">AI Interview Coach</h2>
          <p className="text-slate-400 max-w-sm">
            {status === 'idle' && "Ready to practice? Click start to begin a voice session with Alex, our AI recruiter."}
            {status === 'connecting' && "Connecting to secure line..."}
            {status === 'connected' && "Session is live. Speak naturally."}
            {status === 'error' && "Connection failed. Please refresh and try again."}
          </p>
        </div>

        <div className="flex gap-4 mt-4">
          {status === 'idle' || status === 'error' ? (
            <button
              onClick={startInterview}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors shadow-lg shadow-blue-900/20"
            >
              <Mic className="w-5 h-5" />
              Start Interview
            </button>
          ) : (
            <button
              onClick={cleanup}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-colors shadow-lg shadow-red-900/20"
            >
              <PhoneOff className="w-5 h-5" />
              End Session
            </button>
          )}
        </div>
      </div>
      
      {status === 'connected' && (
         <div className="mt-8 text-sm text-slate-500 font-medium bg-slate-800/50 px-4 py-1 rounded-full border border-slate-700">
           <span className="w-2 h-2 inline-block bg-green-500 rounded-full mr-2 animate-pulse"></span>
           Live Audio Stream Active
         </div>
      )}
    </div>
  );
};