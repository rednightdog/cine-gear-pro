'use client';

import Link from 'next/link';
import { User, LogOut, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth';
import { useLanguage } from '@/context/LanguageContext';

export function UserNav({ user }: { user: any }) {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <div className="flex items-center gap-4">
            {!user ? (
                <>
                    <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                        {t.nav.login}
                    </Link>
                    <Link href="/register" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                        {t.nav.signup}
                    </Link>
                </>
            ) : (
                <>
                    <span className="text-sm text-muted-foreground hidden sm:inline-block">
                        Hi, {user.name || 'Filmmaker'}
                    </span>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-sm font-medium bg-secondary hover:bg-secondary/80 px-3 py-2 rounded-lg transition-colors border border-border"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="hidden sm:inline">{t.nav.dashboard}</span>
                    </Link>
                    <Link
                        href="/profile"
                        className="flex items-center gap-2 text-sm font-medium bg-secondary hover:bg-secondary/80 px-3 py-2 rounded-lg transition-colors border border-border"
                        title="Profile"
                    >
                        <User className="h-4 w-4" />
                    </Link>
                    <form action={logoutAction}>
                        <button type="submit" className="text-muted-foreground hover:text-destructive transition-colors p-2" title={t.nav.logout}>
                            <LogOut className="h-4 w-4" />
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}
