'use client';

import { useState } from 'react';
import LiquidGlass from '@/components/LiquidGlass';
import { Wind, Sparkles, User, Lock, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { externalApi } from '@/lib/external-api';

export default function Register() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        age: '',
        gender: '',
        location: '',
        goal: '',
        familyCode: ''
    });
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // 1. Register with external API
            await externalApi.register({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                age: parseInt(formData.age) || 25,
                gender_identity: formData.gender,
                location: formData.location,
                stress_level: '5'
            });

            // 2. Login to get token
            const loginData = await externalApi.login(formData.email, formData.password);
            const token = loginData.access_token;
            localStorage.setItem('external_api_token', token);

            // 3. Get Deep Profile
            try {
                const deepProfile = await externalApi.getDetails(token);
                localStorage.setItem('deepProfile', JSON.stringify(deepProfile));
            } catch (dpError) {
                console.warn("Could not fetch deep profile immediately", dpError);
            }

            // 4. Store Goal
            localStorage.setItem('userGoal', formData.goal);

            // 5. Store family code locally
            if (formData.familyCode) {
                localStorage.setItem('family_code', formData.familyCode);
            }

            // Redirect to Chat
            router.push('/chat');
        } catch (error) {
            console.error("Registration failed", error);
            alert("Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            <LiquidGlass className="relative z-10 max-w-md w-full p-8 !rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                        <Wind size={32} className="text-white" />
                    </div>

                    <h1 className="text-3xl font-montage text-white mb-2">Join Serenity</h1>
                    <p className="text-white/60 text-sm leading-relaxed">
                        Create your account to start your personalized journey.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-black/30 transition-all"
                            />
                        </div>
                        <div className="relative group">
                            <input
                                type="number"
                                placeholder="Age"
                                required
                                value={formData.age}
                                onChange={e => setFormData({ ...formData, age: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-black/30 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Gender Identity"
                                required
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-black/30 transition-all"
                            />
                        </div>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Location"
                                required
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-black/30 transition-all"
                            />
                        </div>
                    </div>

                    <div className="relative group">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-black/30 transition-all"
                        />
                    </div>

                    <div className="relative group">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-black/30 transition-all"
                        />
                    </div>

                    <div className="relative group">
                        <Sparkles size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-yellow-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Your Primary Goal (e.g. Reduce Stress)"
                            required
                            value={formData.goal}
                            onChange={e => setFormData({ ...formData, goal: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 focus:bg-black/30 transition-all"
                        />
                    </div>

                    <div className="relative group">
                        <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Family Code (Optional)"
                            value={formData.familyCode}
                            onChange={e => setFormData({ ...formData, familyCode: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-black/30 transition-all"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 group-hover:opacity-100 opacity-0 transition-opacity">
                            <div className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded-full border border-purple-500/30">
                                Connects Family
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Create Account <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-white/40 text-sm">
                        Already have an account?{' '}
                        <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300 transition-colors font-semibold">
                            Sign In
                        </Link>
                    </p>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/20">
                    <Sparkles size={10} />
                    <span>Serenity Family Intelligence</span>
                </div>
            </LiquidGlass>
        </div>
    );
}
