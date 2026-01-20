'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { EquipmentItem, KitItem } from '@/types';

export interface ProjectDetails {
    projectName: string;
    testDateStart: string;
    testDateEnd: string;
    shootDateStart: string;
    shootDateEnd: string;
    productionCompany: string;
    director: string;
    dop: string;
    cameraAssistant: string;
}

interface KitContextType {
    items: KitItem[];
    addItem: (item: EquipmentItem, qty?: number) => void;
    addCustomItem: (name: string, category: string, brand?: string, description?: string) => void;
    addItems: (items: EquipmentItem[]) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, delta: number) => void;
    updateItemNote: (itemId: string, note: string) => void;
    clearKit: () => void;
    totalDailyRate: number;
    showRates: boolean;
    toggleRates: () => void;
    notes: string;
    setNotes: (notes: string) => void;
    projectDetails: ProjectDetails;
    updateProjectDetail: (key: keyof ProjectDetails, value: string) => void;
}

const KitContext = createContext<KitContextType | undefined>(undefined);

export function KitProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<KitItem[]>([]);
    const [showRates, setShowRates] = useState(true);
    const [notes, setNotes] = useState('');
    const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
        projectName: '',
        testDateStart: '',
        testDateEnd: '',
        shootDateStart: '',
        shootDateEnd: '',
        productionCompany: '',
        director: '',
        dop: '',
        cameraAssistant: ''
    });

    const addItem = (equipment: EquipmentItem, qty: number = 1) => {
        setItems(prev => {
            const existing = prev.find(i => i.item.id === equipment.id);
            if (existing) {
                return prev.map(i =>
                    i.item.id === equipment.id
                        ? { ...i, quantity: i.quantity + qty }
                        : i
                );
            }
            return [...prev, { item: equipment, quantity: qty, notes: '' }];
        });
    };

    const addCustomItem = (name: string, category: string, brand: string = 'Custom', description: string = '') => {
        const newItem: EquipmentItem = {
            id: `custom-${Date.now()}`,
            name,
            brand,
            category: category as any,
            model: 'Custom',
            description,
            daily_rate_est: 0,
            specs: {},
            image_url: '/equipment/default-custom.png' // Use a placeholder
        };
        addItem(newItem, 1);
    };

    const addItems = (equipmentList: EquipmentItem[]) => {
        setItems(prev => {
            const newItems = [...prev];
            equipmentList.forEach(eq => {
                const existingIndex = newItems.findIndex(i => i.item.id === eq.id);
                if (existingIndex >= 0) {
                    newItems[existingIndex] = {
                        ...newItems[existingIndex],
                        quantity: newItems[existingIndex].quantity + 1
                    };
                } else {
                    newItems.push({ item: eq, quantity: 1, notes: '' });
                }
            });
            return newItems;
        });
    };

    const removeItem = (itemId: string) => {
        setItems(prev => prev.filter(i => i.item.id !== itemId));
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setItems(prev => prev.map(i => {
            if (i.item.id === itemId) {
                const newQty = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    };

    const updateItemNote = (itemId: string, note: string) => {
        setItems(prev => prev.map(i => {
            if (i.item.id === itemId) {
                return { ...i, notes: note };
            }
            return i;
        }));
    };

    const clearKit = () => {
        setItems([]);
        setNotes('');
        setProjectDetails({
            projectName: '',
            testDateStart: '',
            testDateEnd: '',
            shootDateStart: '',
            shootDateEnd: '',
            productionCompany: '',
            director: '',
            dop: '',
            cameraAssistant: ''
        });
    };

    const updateProjectDetail = (key: keyof ProjectDetails, value: string) => {
        setProjectDetails(prev => ({ ...prev, [key]: value }));
    };

    // Load initial state from localStorage
    useEffect(() => {
        const savedItems = localStorage.getItem('kit_items');
        const savedDetails = localStorage.getItem('kit_projectDetails');
        const savedNotes = localStorage.getItem('kit_notes');
        const savedRates = localStorage.getItem('kit_showRates');

        if (savedItems) setItems(JSON.parse(savedItems));
        if (savedDetails) setProjectDetails(JSON.parse(savedDetails));
        if (savedNotes) setNotes(savedNotes);
        if (savedRates) setShowRates(JSON.parse(savedRates));
    }, []);

    // Persist state changes
    useEffect(() => {
        localStorage.setItem('kit_items', JSON.stringify(items));
    }, [items]);

    useEffect(() => {
        localStorage.setItem('kit_projectDetails', JSON.stringify(projectDetails));
    }, [projectDetails]);

    useEffect(() => {
        localStorage.setItem('kit_notes', notes);
    }, [notes]);

    useEffect(() => {
        localStorage.setItem('kit_showRates', JSON.stringify(showRates));
    }, [showRates]);

    const toggleRates = () => setShowRates(prev => !prev);

    const totalDailyRate = items.reduce((sum, i) => sum + (i.item.daily_rate_est * i.quantity), 0);

    return (
        <KitContext.Provider value={{
            items,
            addItem,
            addCustomItem,
            addItems,
            removeItem,
            updateQuantity,
            updateItemNote,
            clearKit,
            totalDailyRate,
            showRates,
            toggleRates,
            notes,
            setNotes,
            projectDetails,
            updateProjectDetail
        }}>
            {children}
        </KitContext.Provider>
    );
}

export function useKit() {
    const context = useContext(KitContext);
    if (context === undefined) {
        throw new Error('useKit must be used within a KitProvider');
    }
    return context;
}
