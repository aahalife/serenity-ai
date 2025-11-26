'use client';

import React, { useState, useEffect } from 'react';
import { Category, Phrase, Technique } from '@/lib/stress-relief/types';
import { PhraseTile } from '@/components/stress-relief/PhraseTile';
import { TechniqueTile } from '@/components/stress-relief/TechniqueTile';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LiquidGlass from '@/components/LiquidGlass';

type ViewState = 'HOME' | 'CATEGORY' | 'PHRASE_TECHNIQUES' | 'TECHNIQUES_LIST';

export default function StressReliefPage() {
    const router = useRouter();
    const [viewState, setViewState] = useState<ViewState>('HOME');

    const [categories, setCategories] = useState<Category[]>([]);
    const [phrases, setPhrases] = useState<Phrase[]>([]);
    const [techniques, setTechniques] = useState<Technique[]>([]);

    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedPhrase, setSelectedPhrase] = useState<Phrase | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, phraseRes, techRes] = await Promise.all([
                    fetch('/api/stress-relief/categories'),
                    fetch('/api/stress-relief/phrases'),
                    fetch('/api/stress-relief/techniques')
                ]);

                setCategories(await catRes.json());
                setPhrases(await phraseRes.json());
                setTechniques(await techRes.json());
            } catch (error) {
                console.error('Failed to load data', error);
            }
        };
        fetchData();
    }, []);

    const handleCategoryClick = (category: Category) => {
        setSelectedCategory(category);
        setViewState('CATEGORY');
    };

    const handlePhraseClick = (phrase: Phrase) => {
        setSelectedPhrase(phrase);
        setViewState('PHRASE_TECHNIQUES');
    };

    const handleTechniqueClick = (id: string) => {
        router.push(`/stress-relief/technique/${id}`);
    };

    const handleBack = () => {
        if (viewState === 'PHRASE_TECHNIQUES') {
            setViewState('CATEGORY');
            setSelectedPhrase(null);
        } else if (viewState === 'CATEGORY' || viewState === 'TECHNIQUES_LIST') {
            setViewState('HOME');
            setSelectedCategory(null);
        }
    };

    const filteredPhrases = phrases.filter(p => {
        const matchesSearch = p.text.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory ? p.category === selectedCategory.id : true;
        return matchesSearch && matchesCategory;
    });

    const getSuggestedTechniques = () => {
        if (!selectedPhrase) return [];
        return techniques.filter(t => selectedPhrase.techniques.includes(t.id));
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 pb-32">
            {/* Header */}
            <header className="max-w-6xl mx-auto mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                        {viewState !== 'HOME' && viewState !== 'TECHNIQUES_LIST' && (
                            <button
                                onClick={handleBack}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <ArrowLeft size={24} />
                            </button>
                        )}
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 font-montage">
                            {viewState === 'HOME' && "Stress Relief"}
                            {viewState === 'TECHNIQUES_LIST' && "All Techniques"}
                            {viewState === 'CATEGORY' && selectedCategory?.label}
                            {viewState === 'PHRASE_TECHNIQUES' && "Suggested Techniques"}
                        </h1>
                    </div>

                    {(viewState === 'HOME' || viewState === 'TECHNIQUES_LIST') && (
                        <p className="text-lg md:text-xl text-white/60 max-w-2xl font-petrona">
                            Identify what's weighing on you, and let's find a way through it.
                        </p>
                    )}
                </div>

                {/* View Toggle */}
                {/* View Toggle */}
                {(viewState === 'HOME' || viewState === 'TECHNIQUES_LIST') && (
                    <div className="flex space-x-4 shrink-0">
                        <LiquidGlass
                            onClick={() => setViewState('HOME')}
                            className={`rounded-full transition-all duration-300 ${viewState === 'HOME'
                                    ? 'shadow-[0_0_20px_rgba(59,130,246,0.5)] border-blue-400/50'
                                    : 'opacity-70 hover:opacity-100'
                                }`}
                        >
                            <div className={`px-8 py-3 text-base font-medium ${viewState === 'HOME' ? 'text-blue-100' : 'text-white/60'}`}>
                                Phrases
                            </div>
                        </LiquidGlass>

                        <LiquidGlass
                            onClick={() => setViewState('TECHNIQUES_LIST')}
                            className={`rounded-full transition-all duration-300 ${viewState === 'TECHNIQUES_LIST'
                                    ? 'shadow-[0_0_20px_rgba(168,85,247,0.5)] border-purple-400/50'
                                    : 'opacity-70 hover:opacity-100'
                                }`}
                        >
                            <div className={`px-8 py-3 text-base font-medium ${viewState === 'TECHNIQUES_LIST' ? 'text-purple-100' : 'text-white/60'}`}>
                                Techniques
                            </div>
                        </LiquidGlass>
                    </div>
                )}
            </header>

            {/* Search Bar (Only on Home) */}
            {viewState === 'HOME' && (
                <div className="max-w-2xl mx-auto mb-12 md:mb-16 relative px-4">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                    <input
                        type="text"
                        placeholder="I am feeling..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all shadow-lg backdrop-blur-xl font-petrona text-lg"
                    />
                </div>
            )}

            <main className="max-w-6xl mx-auto px-4 md:px-0">
                <AnimatePresence mode="wait">
                    {viewState === 'HOME' && (
                        <motion.div
                            key="home"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        >
                            {categories.map(category => (
                                <motion.div
                                    key={category.id}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="h-full"
                                >
                                    <LiquidGlass
                                        onClick={() => handleCategoryClick(category)}
                                        className="h-full cursor-pointer min-h-[200px] flex flex-col justify-center items-center text-center p-8 group"
                                    >
                                        <h3 className="text-2xl font-bold text-white/90 mb-3 font-montage group-hover:text-blue-300 transition-colors">
                                            {category.label}
                                        </h3>
                                        <p className="text-sm text-white/60 font-petrona leading-relaxed mb-4">
                                            {category.description}
                                        </p>
                                        <div className="mt-auto text-xs text-white/40 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full">
                                            {category.phrase_count} Phrases
                                        </div>
                                    </LiquidGlass>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {viewState === 'CATEGORY' && (
                        <motion.div
                            key="category"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filteredPhrases.map(phrase => (
                                <PhraseTile
                                    key={phrase.id}
                                    phrase={phrase}
                                    onClick={handlePhraseClick}
                                />
                            ))}
                        </motion.div>
                    )}

                    {viewState === 'PHRASE_TECHNIQUES' && selectedPhrase && (
                        <motion.div
                            key="techniques"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="mb-10 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md max-w-3xl mx-auto text-center">
                                <div className="flex items-center justify-center space-x-3 mb-3">
                                    <Sparkles className="text-purple-400" size={20} />
                                    <span className="text-sm text-purple-300 uppercase tracking-wider font-bold">Selected Focus</span>
                                </div>
                                <p className="text-3xl font-montage text-white/90">"{selectedPhrase.text}"</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {getSuggestedTechniques().map(tech => (
                                    <TechniqueTile
                                        key={tech.id}
                                        technique={tech}
                                        onClick={handleTechniqueClick}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {viewState === 'TECHNIQUES_LIST' && (
                        <motion.div
                            key="all-techniques"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {techniques.map(tech => (
                                <TechniqueTile
                                    key={tech.id}
                                    technique={tech}
                                    onClick={handleTechniqueClick}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
