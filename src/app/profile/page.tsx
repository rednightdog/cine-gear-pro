import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import ProfileForm from '@/components/profile/ProfileForm';

export default async function ProfilePage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    // getCurrentUser returns { id, name, email, role, language } etc.
    // Ensure we pass necessary props.

    return (
        <div className="min-h-screen bg-[#FDF5E6] p-6 lg:p-10 text-black">
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                <header className="border-b border-black/10 pb-6">
                    <h1 className="text-4xl font-serif italic mb-2">My Profile</h1>
                    <p className="text-sm text-black/60 uppercase tracking-widest">Manage your account settings and preferences.</p>
                </header>

                <ProfileForm user={user} />
            </div>
        </div>
    );
}
