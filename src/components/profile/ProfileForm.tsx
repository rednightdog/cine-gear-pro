'use client';

import { updateProfile, changePassword } from '@/app/actions';
import { useRouter } from 'next/navigation';

import { useState } from 'react';

// Simplified user type for props
interface ProfileFormProps {
    user: {
        name: string | null;
        jobTitle: string | null;
        language: string;
        email: string;
    };
}

export default function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleUpdateInfo(formData: FormData) {
        setLoading(true);
        const res = await updateProfile(formData);
        setLoading(false);
        if (res.success) {
            alert('Profile updated successfully!');
            router.refresh();
        } else {
            alert('Error: ' + res.message);
        }
    }

    async function handleChangePassword(formData: FormData) {
        setLoading(true);
        const res = await changePassword(formData);
        setLoading(false);
        if (res.success) {
            alert('Password changed successfully!');
            // Optional: reset form
            (document.getElementById('passwordForm') as HTMLFormElement).reset();
        } else {
            alert('Error: ' + res.message);
        }
    }

    return (
        <div className="space-y-12">

            {/* General Info */}
            <section className="bg-white p-8 border border-black/5 shadow-sm">
                <h2 className="text-2xl font-serif italic mb-6">General Information</h2>
                <form action={handleUpdateInfo} className="space-y-6 max-w-lg">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-40">Full Name</label>
                        <input
                            name="name"
                            defaultValue={user.name || ''}
                            required
                            className="w-full bg-transparent border-b border-black/20 py-2 focus:outline-none focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-40">Job Title</label>
                        <input
                            name="jobTitle"
                            defaultValue={user.jobTitle || ''}
                            placeholder="e.g. Director of Photography"
                            className="w-full bg-transparent border-b border-black/20 py-2 focus:outline-none focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-40">Email (Read Only)</label>
                        <div className="py-2 text-black/50 font-mono text-sm">{user.email}</div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-40">Language</label>
                        <select
                            name="language"
                            defaultValue={user.language}
                            className="w-full bg-transparent border-b border-black/20 py-2 focus:outline-none focus:border-black transition-colors appearance-none rounded-none"
                        >
                            <option value="TR">Türkçe</option>
                            <option value="EN">English</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-opacity disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </section>

            {/* Security */}
            <section className="bg-white p-8 border border-black/5 shadow-sm">
                <h2 className="text-2xl font-serif italic mb-6">Security</h2>
                <form id="passwordForm" action={handleChangePassword} className="space-y-6 max-w-lg">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-40">Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            required
                            className="w-full bg-transparent border-b border-black/20 py-2 focus:outline-none focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-40">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            required
                            className="w-full bg-transparent border-b border-black/20 py-2 focus:outline-none focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-40">Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            className="w-full bg-transparent border-b border-black/20 py-2 focus:outline-none focus:border-black transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-red-500/10 text-red-600 px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                        Change Password
                    </button>
                </form>
            </section>
        </div>
    );
}
