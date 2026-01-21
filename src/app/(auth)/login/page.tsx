'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/auth';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
    const [state, action] = useActionState(loginAction, undefined);

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-secondary/30 p-4">
            <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-lg border border-border">
                <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
                    <p className="text-sm text-muted-foreground mt-2">Sign in to your account</p>
                </div>

                <form action={action} className="space-y-4 text-left">
                    <input type="hidden" name="callbackUrl" value={useSearchParams().get('callbackUrl') || ''} />
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input name="email" type="email" required className="w-full p-2 rounded-md border border-input bg-background" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input name="password" type="password" required className="w-full p-2 rounded-md border border-input bg-background" />
                    </div>

                    {state?.message && (
                        <p className="text-sm text-destructive">{state.message}</p>
                    )}

                    <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
                        Sign In
                    </button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Don't have an account? <Link href="/register" className="text-primary hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
}
