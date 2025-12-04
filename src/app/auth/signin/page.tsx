'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import LiquidGlass from '@/components/LiquidGlass';
import { Wind, Sparkles, Lock, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignIn() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signIn('google', { callbackUrl: '/profile' });
        } catch (error) {
            console.error("Sign in failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCredentialsSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (res?.error) {
                alert("Invalid credentials");
            } else {
                router.push('/profile');
            }
        } catch (error) {
            console.error("Sign in failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            <LiquidGlass className="relative z-10 max-w-md w-full p-8 !rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                        <Wind size={32} className="text-white" />
                    </div>

                    <h1 className="text-3xl font-montage text-white mb-2">Welcome Back</h1>
                    <p className="text-white/60 text-sm leading-relaxed">
                        Sign in to access your personalized stress relief journey.
                    </p>
                </div>

                <form onSubmit={handleCredentialsSignIn} className="space-y-4 mb-6">
                    <div className="relative group">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-black/30 transition-all"
                        />
                    </div>

                    <div className="relative group">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-black/30 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Sign In <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="relative flex items-center justify-center mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <span className="relative bg-[#0a0a0f] px-4 text-xs text-white/40 uppercase tracking-wider">Or continue with</span>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-3 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                        className="w-5 h-5"
                        style={{ width: '20px', height: '20px' }}
                    />
                    Google
                </button>

                <div className="mt-6 text-center">
                    <p className="text-white/40 text-sm">
                        Don't have an account?{' '}
                        <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 transition-colors font-semibold">
                            Create Account
                        </Link>
                    </p>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/20">
                    <Sparkles size={10} />
                    <span>Powered by Serenity AI Intelligence Engine</span>
                </div>
            </LiquidGlass>
        </div>
    );
}
