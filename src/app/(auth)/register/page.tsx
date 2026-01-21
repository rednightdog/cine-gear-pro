'use client';

import { useActionState } from 'react';
import { register } from '@/app/actions/auth';
import Link from 'next/link';

export default function RegisterPage() {
    const [state, action] = useActionState(register, undefined);

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-secondary/30 p-4">
            <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-lg border border-border">
                <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
                    <p className="text-sm text-muted-foreground mt-2">Start managing your gear</p>
                </div>

                <form action={action} className="space-y-4 text-left">
                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input name="name" type="text" required className="w-full p-2 rounded-md border border-input bg-background" />
                    </div>
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
                        Create Account
                    </button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account? <Link href="/login" className="text-primary hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}
