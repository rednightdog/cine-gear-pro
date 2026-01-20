'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionary, Language } from '@/lib/dictionary';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof dictionary['TR'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
    children,
    initialLanguage = 'TR'
}: {
    children: React.ReactNode,
    initialLanguage?: string
}) {
    // Validate initial language
    const safeInitial: Language = (initialLanguage === 'EN') ? 'EN' : 'TR';

    const [language, setLanguage] = useState<Language>(safeInitial);

    const value = {
        language,
        setLanguage,
        t: dictionary[language]
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
