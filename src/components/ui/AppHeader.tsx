'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserNav } from "@/components/ui/UserNav";
import { NavigationLinks } from "@/components/ui/NavigationLinks";
import { Clapperboard } from 'lucide-react';

interface AppHeaderProps {
    user: any;
}

export function AppHeader({ user }: AppHeaderProps) {
    const pathname = usePathname();
    const isPrintView = pathname?.startsWith('/builder/print');

    if (isPrintView) return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-6">
                <Link href="/" className="flex items-center space-x-2 font-bold">
                    <img src="/logo.png" alt="CineBrain" className="h-8 w-8 rounded-full object-cover border border-primary/20" />
                    <span className="hidden sm:inline-block">CineBrain Pro</span>
                </Link>
                <nav className="flex items-center gap-4">
                    <NavigationLinks />
                    <div className="h-4 w-px bg-border mx-2" />
                    <UserNav user={user} />
                </nav>
            </div>
        </header>
    );
}
