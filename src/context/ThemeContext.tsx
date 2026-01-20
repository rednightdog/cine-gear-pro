'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'cinema' | 'light' | 'blue';
type ViewMode = 'grid' | 'list';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Default to 'cinema'
    const [theme, setTheme] = useState<Theme>('cinema');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    useEffect(() => {
        // Check local storage on mount
        const savedTheme = localStorage.getItem('app-theme') as Theme;
        const savedView = localStorage.getItem('app-view-mode') as ViewMode;
        if (savedTheme) setTheme(savedTheme);
        if (savedView) setViewMode(savedView);
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        // Remove all previous theme classes
        root.classList.remove('theme-light', 'theme-blue');

        // Add new class if needed (default "cinema" uses :root vars so no class needed)
        if (theme === 'light') root.classList.add('theme-light');
        if (theme === 'blue') root.classList.add('theme-blue');

        localStorage.setItem('app-theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('app-view-mode', viewMode);
    }, [viewMode]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, viewMode, setViewMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
