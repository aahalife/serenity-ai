'use client';

import React, { useState, useEffect } from 'react';
import { Category, Phrase, Technique } from '@/lib/stress-relief/types';
import { PhraseTile } from '@/components/stress-relief/PhraseTile';
import { TechniqueTile } from '@/components/stress-relief/TechniqueTile';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StressReliefPage() {
    const router = useRouter();
    const [view, setView] = useState<'phrases' | 'techniques'>('phrases');
    const [categories, setCategories] = useState<Category[]>([]);
    const [phrases, setPhrases] = useState<Phrase[]>([]);
    const [techniques, setTechniques] = useState<Technique[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPhrase, setSelectedPhrase] = useState<Phrase | null>(null);

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

    const handlePhraseClick = (phrase: Phrase) => {
        setSelectedPhrase(phrase);
        // Scroll to suggestions
        setTimeout(() => {
            document.getElementById('suggestions')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleTechniqueClick = (id: string) => {
        router.push(`/stress-relief/technique/${id}`);
    };

    const filteredPhrases = phrases.filter(p =>
        p.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getSuggestedTechniques = () => {
        if (!selectedPhrase) return [];
        return techniques.filter(t => selectedPhrase.techniques.includes(t.id));
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8 pb-32">
            {/* Header */}
            <header className="max-w-6xl mx-auto mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Stress Relief
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl">
                        Hey — what's been taking up headspace today? Browse around, pick whatever fits. No pressure.
                    </p>
                </div>

                {/* View Toggle */}
                <div className="bg-white/5 p-1 rounded-full flex space-x-1">
                    <button
                        onClick={() => setView('phrases')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${view === 'phrases' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/80'
                            }`}
                    >
                        Phrases
                    </button>
                    <button
                        onClick={() => setView('techniques')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${view === 'techniques' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/80'
                            }`}
                    >
                        Techniques
                    </button>
                </div>
            </header>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-16 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                <input
                    type="text"
                    placeholder="Say it your way... e.g. 'work is stuck in my head'"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all shadow-lg backdrop-blur-xl"
                />
            </div>

            <main className="max-w-6xl mx-auto">
                <AnimatePresence mode="wait">
                    {view === 'phrases' ? (
                        <motion.div
                            key="phrases"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-16"
                        >
                            {categories.map(category => {
                                const categoryPhrases = filteredPhrases.filter(p => p.category === category.id);
                                if (categoryPhrases.length === 0) return null;

                                return (
                                    <section key={category.id}>
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-semibold text-white/90 mb-1">{category.label}</h2>
                                            <p className="text-white/50 text-sm">{category.description}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {categoryPhrases.map(phrase => (
                                                <PhraseTile
                                                    key={phrase.id}
                                                    phrase={phrase}
                                                    onClick={handlePhraseClick}
                                                    isSelected={selectedPhrase?.id === phrase.id}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                );
                            })}

                            {/* Suggestions Section */}
                            <AnimatePresence>
                                {selectedPhrase && (
                                    <motion.div
                                        id="suggestions"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="pt-12 border-t border-white/10"
                                    >
                                        <div className="flex items-center space-x-3 mb-8">
                                            <Sparkles className="text-purple-400" />
                                            <h3 className="text-xl font-medium text-white/80">
                                                To help with: <span className="italic text-white">"{selectedPhrase.text}"</span>
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="techniques"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {techniques.map(tech => (
                                    <TechniqueTile
                                        key={tech.id}
                                        technique={tech}
                                        onClick={handleTechniqueClick}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
