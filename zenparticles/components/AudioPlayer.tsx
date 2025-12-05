import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

const AudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => {
        console.warn("Audio playback failed (user interaction required):", e);
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-3">
      <button 
        onClick={togglePlay}
        className="group relative flex items-center justify-center w-10 h-10 bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95 shadow-lg overflow-hidden"
        title={isPlaying ? "Mute Music" : "Play Music"}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
      
      {isPlaying && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-xs text-white/50 animate-fade-in">
          <Music size={12} className="animate-pulse" />
          <span className="font-light tracking-wide">Japanese Zen</span>
        </div>
      )}

      {/* Relaxing Japanese Koto/Flute ambient music */}
      <audio 
        ref={audioRef} 
        loop 
        src="https://cdn.pixabay.com/audio/2021/09/06/audio_39436d4007.mp3" 
      />
    </div>
  );
};

export default AudioPlayer;