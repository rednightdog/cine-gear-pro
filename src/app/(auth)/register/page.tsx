'use client';

import { useActionState } from 'react';
import { register } from '@/app/actions/auth';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(register, null);

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Visual Side */}
            <div className="hidden lg:block bg-[#1a1a1a] text-[#FDF5E6] p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <Link href="/" className="font-serif italic text-2xl">CineBrain Pro</Link>
                    <div>
                        <h1 className="font-serif italic text-6xl leading-tight mb-6">
                            Join the <br /> professional <br /> network.
                        </h1>
                        <p className="font-mono text-sm opacity-60 max-w-md">
                            Create collaborative kits, manage your inventory with precision, and share detailed equipment lists with your production team.
                        </p>
                    </div>
                    <div className="flex gap-4 text-xs font-mono opacity-40 uppercase tracking-widest">
                        <span>EST. 2024</span>
                        <span>•</span>
                        <span>Istanbul</span>
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div className="bg-[#FDF5E6] text-black p-8 lg:p-24 flex flex-col justify-center">
                <div className="max-w-md w-full mx-auto space-y-12">
                    <Link href="/" className="inline-flex items-center text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Link>

                    <div>
                        <h2 className="text-3xl font-serif italic mb-2">Create Account</h2>
                        <p className="text-muted-foreground text-sm">Enter your details to get started.</p>
                    </div>

                    <form action={formAction} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-mono uppercase tracking-widest opacity-50">Full Name</label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="w-full bg-transparent border-b border-black/20 py-2 focus:outline-none focus:border-black transition-colors"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono uppercase tracking-widest opacity-50">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full bg-transparent border-b border-black/20 py-2 focus:outline-none focus:border-black transition-colors"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono uppercase tracking-widest opacity-50">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full bg-transparent border-b border-black/20 py-2 focus:outline-none focus:border-black transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        {state?.message && (
                            <p className="text-xs text-red-600 font-medium bg-red-50 p-3 rounded-sm">
                                {state.message}
                            </p>
                        )}

                        <button
                            disabled={isPending}
                            className="w-full bg-black text-white hover:bg-black/80 h-12 rounded-sm font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center"
                        >
                            {isPending ? 'Creating...' : 'Sign Up'}
                        </button>

                        <p className="text-center text-xs text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/login" className="text-black font-bold underline">
                                Log in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
