'use client';

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

export function NavigationLinks() {
    const { t } = useLanguage();
    return (
        <>
            <Link href="/inventory" className="text-sm font-medium hover:text-primary transition-colors">{t.nav.catalog}</Link>
            <Link href="/builder" className="text-sm font-medium hover:text-primary transition-colors">{t.nav.builder}</Link>
        </>
    );
}
