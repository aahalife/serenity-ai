
import React, { useState, useEffect, useRef } from 'react';
import { ShapeType, SavedShape } from '../types';
import { Heart, Flower, Globe, Sparkles, User, Palette, Wand2, Plus, Star, ChevronRight, Menu, Image as ImageIcon, Upload } from 'lucide-react';
import clsx from 'clsx';
import { generateShapePoints } from '../services/gemini';

interface ControlsProps {
  currentShape: ShapeType;
  currentColor: string;
  savedShapes: SavedShape[];
  activeSavedShapeId?: string;
  onShapeChange: (s: ShapeType) => void;
  onColorChange: (c: string) => void;
  onCustomPoints: (points: [number, number, number][]) => void;
  onAddSavedShape: (shape: SavedShape) => void;
  onSelectSavedShape: (id: string) => void;
  onTextureChange: (url: string | null) => void;
}

const PRESETS = [
  { id: ShapeType.HEART, icon: Heart, label: 'Heart' },
  { id: ShapeType.FLOWER, icon: Flower, label: 'Flower' },
  { id: ShapeType.SATURN, icon: Globe, label: 'Saturn' },
  { id: ShapeType.BUDDHA, icon: User, label: 'Buddha' },
  { id: ShapeType.FIREWORKS, icon: Sparkles, label: 'Fireworks' },
];

const COLORS = [
  '#ef4444', // Red
  '#e879f9', // Pink
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#22d3ee', // Cyan
  '#34d399', // Emerald
  '#facc15', // Yellow
  '#ffffff', // White
];

const Controls: React.FC<ControlsProps> = ({ 
  currentShape, 
  currentColor, 
  savedShapes,
  activeSavedShapeId,
  onShapeChange, 
  onColorChange, 
  onCustomPoints,
  onAddSavedShape,
  onSelectSavedShape,
  onTextureChange
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [magicPrompt, setMagicPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, []);

  const handleMagicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    const points = await generateShapePoints(magicPrompt);
    
    if (points && points.length > 0) {
      const newShape: SavedShape = {
        id: `custom-${Date.now()}`,
        label: magicPrompt.charAt(0).toUpperCase() + magicPrompt.slice(1),
        points: points
      };

      onAddSavedShape(newShape);
      onCustomPoints(points);
      onShapeChange(ShapeType.CUSTOM);
      onSelectSavedShape(newShape.id);
      onTextureChange(null); 
    }
    
    setIsGenerating(false);
    setMagicPrompt('');
  };

  const handlePresetClick = (type: ShapeType) => {
    onShapeChange(type);
    onSelectSavedShape(''); 
    onCustomPoints([]); 
    onTextureChange(null); 
  };

  const handleSavedShapeClick = (shape: SavedShape) => {
    onCustomPoints(shape.points);
    onShapeChange(ShapeType.CUSTOM);
    onSelectSavedShape(shape.id);
    onTextureChange(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    onTextureChange(url);
    
    onShapeChange(ShapeType.CUSTOM);
    onSelectSavedShape('photo-mode');
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed top-0 right-0 h-full z-40 flex flex-row justify-end pointer-events-none">
      
      <div className={clsx(
        "relative h-full pointer-events-auto transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute top-6 left-0 -translate-x-full bg-black/40 backdrop-blur-md border-l border-t border-b border-white/10 text-white/80 hover:text-white p-3 rounded-l-xl shadow-xl transition-all hover:bg-black/60 active:scale-95 flex items-center justify-center w-12 h-12"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <ChevronRight size={20} /> : <Menu size={20} />}
        </button>

        <div className="h-full w-80 bg-black/70 backdrop-blur-xl border-l border-white/10 p-6 overflow-y-auto custom-scrollbar shadow-2xl flex flex-col">
          
          <div className="mb-8 flex-shrink-0">
            <h2 className="text-white text-xl font-light mb-2 flex items-center gap-2 select-none">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">Zen</span>Particles
            </h2>
            <p className="text-white/50 text-[11px] leading-relaxed">
              Use gestures to control the flow. <br/>
              <span className="text-white/30">Open palm to expand, fist to squeeze.</span>
            </p>
          </div>

          <div className="flex-grow space-y-8">
            
            {/* AI Generator */}
            <div>
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Wand2 size={10} className="text-purple-400" />
                AI Generator
              </label>
              <form onSubmit={handleMagicSubmit} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                <input 
                  type="text"
                  value={magicPrompt}
                  onChange={(e) => setMagicPrompt(e.target.value)}
                  placeholder={isGenerating ? "Dreaming..." : "Type a shape..."}
                  disabled={isGenerating}
                  className="relative w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
                <button 
                  type="submit" 
                  disabled={isGenerating || !magicPrompt}
                  className="absolute right-2 top-2 p-1.5 bg-white/5 hover:bg-white/20 text-purple-300 rounded-lg transition-colors disabled:opacity-0"
                >
                  {isGenerating ? <Wand2 size={16} className="animate-spin" /> : <Plus size={16} />}
                </button>
              </form>
            </div>

            {/* Photo Upload (Stress Ball Mode) */}
            <div>
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 flex items-center gap-2">
                <ImageIcon size={10} className="text-blue-400" />
                Stress Ball Mode
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={clsx(
                  "cursor-pointer relative w-full border border-dashed border-white/20 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all hover:bg-white/5 group"
                )}
              >
                 <input 
                   ref={fileInputRef}
                   type="file" 
                   accept="image/*" 
                   className="hidden" 
                   onChange={handlePhotoUpload}
                 />
                 <div className="p-2 bg-blue-500/10 rounded-full mb-2 group-hover:scale-110 transition-transform">
                   <Upload size={16} className="text-blue-400" />
                 </div>
                 <span className="text-xs text-white/60">Upload Photo</span>
                 <span className="text-[10px] text-white/30 mt-1">Stamps your photo onto a 3D ball</span>
              </div>
            </div>

            {/* Shape Selectors */}
            <div>
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 block">Library</label>
              <div className="grid grid-cols-2 gap-3">
                {PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isActive = currentShape === preset.id && activeSavedShapeId !== 'photo-mode';
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetClick(preset.id)}
                      className={clsx(
                        "flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 relative overflow-hidden group",
                        isActive 
                          ? "bg-white/10 border border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-[1.02]" 
                          : "bg-white/5 border border-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon size={20} className={clsx("mb-2 transition-transform duration-500", isActive && "scale-110")} />
                      <span className="text-[11px] font-medium">{preset.label}</span>
                      {isActive && <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />}
                    </button>
                  );
                })}

                {savedShapes.map((shape) => {
                  const isActive = currentShape === ShapeType.CUSTOM && activeSavedShapeId === shape.id;
                  return (
                    <button
                      key={shape.id}
                      onClick={() => handleSavedShapeClick(shape)}
                      className={clsx(
                        "flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                        isActive 
                          ? "bg-purple-500/20 border border-purple-500/50 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)] scale-[1.02]" 
                          : "bg-white/5 border border-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Star size={20} className={clsx("mb-2", isActive ? "text-purple-400 fill-purple-400/20" : "text-white/40")} />
                      <span className="text-[11px] font-medium truncate w-full text-center px-1" title={shape.label}>{shape.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Palette size={10} />
                Theme
              </label>
              <div className="flex flex-wrap gap-2.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => onColorChange(c)}
                    className={clsx(
                      "w-7 h-7 rounded-full border transition-all duration-300 hover:scale-110",
                      currentColor === c ? "border-white shadow-[0_0_12px_currentColor] scale-110 ring-1 ring-white/50" : "border-transparent opacity-60 hover:opacity-100 ring-0"
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
             <div className="flex items-center justify-between text-[10px] text-white/20">
                <span>Gemini 2.5 Flash</span>
                <span>v1.2.0</span>
             </div>
          </div>

        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Controls;
