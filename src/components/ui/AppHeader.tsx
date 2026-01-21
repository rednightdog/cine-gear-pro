'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserNav } from "@/components/ui/UserNav";
import { NavigationLinks } from "@/components/ui/NavigationLinks";
import { Clapperboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CineBrainChat } from './CineBrainChat';

interface AppHeaderProps {
    user: any;
}

export function AppHeader({ user }: AppHeaderProps) {
    const pathname = usePathname();
    const isPrintView = pathname?.startsWith('/builder/print');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        // Configure Status Bar for native app
        const configStatusBar = async () => {
            // Dynamic import to avoid SSR issues or check platform
            const { StatusBar, Style } = await import('@capacitor/status-bar');
            const { Capacitor } = await import('@capacitor/core');

            if (Capacitor.isNativePlatform()) {
                try {
                    await StatusBar.setStyle({ style: Style.Light }); // Light style = Dark text (usually)
                    await StatusBar.setOverlaysWebView({ overlay: true });
                } catch (e) {
                    console.error('Status bar error', e);
                }
            }
        };
        configStatusBar();
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-safe-or-fallback transition-all duration-200" style={{ paddingTop: 'max(env(safe-area-inset-top), 44px)' }}>
            <div className="container flex h-14 items-center justify-between px-6">
                <Link href="/" className="flex items-center space-x-2 font-bold">
                    <img src="/header-logo.jpg" alt="CineBrain" className="h-10 w-auto object-contain" />
                    <span className="inline-block">CineBrain Pro</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-4">
                    <NavigationLinks />
                    <div className="h-4 w-px bg-border mx-2" />
                    <CineBrainChat variant="header" />
                    <UserNav user={user} />
                </nav>

                {/* Mobile Menu Toggle & Chat */}
                <div className="flex md:hidden items-center gap-2">
                    <CineBrainChat variant="header" />
                    <button
                        className="md:hidden p-2 text-foreground"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-background p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
                    <NavigationLinks />
                    <div className="h-px w-full bg-border my-2" />
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground mr-2">Account</span>
                        <UserNav user={user} />
                    </div>
                </div>
            )}
        </header>
    );
}
