'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Key } from 'lucide-react'; // Added Mail and Key icons
import { loginUser } from '@/app/actions'; // Changed import to loginUser

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await loginUser(email, password);

            if (res.success) {
                router.push('/inventory');
                router.refresh();
            } else {
                setError(res.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-sm bg-card border border-border rounded-xl p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-6">
                    <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Admin Access</h1>
                    <p className="text-sm text-muted-foreground mt-1">Sign in to manage inventory</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                className="w-full pl-10 pr-4 py-2 bg-secondary border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full pl-10 pr-4 py-2 bg-secondary border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="text-destructive text-sm text-center font-medium">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
