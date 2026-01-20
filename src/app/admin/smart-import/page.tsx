'use client';

import { useState } from 'react';
import { parseImportTextAction } from '@/lib/ai-assistant'; // Client-side safe import of helper class
import { createEquipment } from '@/app/actions';
import { ArrowRight, Sparkles, Save, Loader2, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SmartImportPage() {
    const router = useRouter();
    const [inputText, setInputText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Extracted data state
    const [data, setData] = useState({
        name: '',
        brand: '',
        model: '',
        category: 'Accessory',
        description: '',
        daily_rate_est: 0,
        mount: '',
        weight_kg: 0
    });

    const handleAnalyze = async () => {
        if (!inputText.trim()) return;
        setIsAnalyzing(true);
        try {
            // Simulate AI parsing
            const result = await parseImportTextAction(inputText);
            setData(prev => ({
                ...prev,
                name: result.name || '',
                brand: result.brand || '',
                model: result.model || '',
                category: result.category || 'Accessory',
                description: result.description || '',
                daily_rate_est: result.daily_rate_est || 100
            }));
        } catch (error) {
            console.error(error);
            alert("AI Analysis failed.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('brand', data.brand);
        formData.append('model', data.model);
        formData.append('category', data.category);
        formData.append('description', data.description);
        formData.append('daily_rate_est', data.daily_rate_est.toString());
        if (data.mount) formData.append('mount', data.mount);
        if (data.weight_kg) formData.append('weight_kg', data.weight_kg.toString());

        const res = await createEquipment(formData);
        if (res.success) {
            alert("Equipment imported successfully!");
            router.push('/inventory');
        } else {
            alert("Import failed: " + res.message);
        }
        setIsSaving(false);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-primary/10 p-3 rounded-full">
                    <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Smart AI Importer</h1>
                    <p className="text-muted-foreground">Paste raw equipment text, let CineBrain extract the specs.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[600px]">
                {/* Left: Input */}
                <div className="flex flex-col gap-4">
                    <div className="bg-secondary/30 p-4 rounded-xl border border-border flex-1 flex flex-col">
                        <label className="font-semibold mb-2 block">Raw Source Text</label>
                        <textarea
                            className="flex-1 w-full bg-background p-4 rounded-lg border border-border focus:ring-2 ring-primary outline-none resize-none font-mono text-sm"
                            placeholder="Paste product specs here... e.g. 'ARRI SkyPanel X, 800W LED Panel, IP66 rated...'"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !inputText}
                                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
                            >
                                {isAnalyzing ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                Analyze Text
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Extracted Data Form */}
                <div className="flex flex-col gap-4">
                    <div className="bg-background p-6 rounded-xl border border-border shadow-sm flex-1 overflow-y-auto">
                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-border">
                            <Database className="w-5 h-5 text-muted-foreground" />
                            <h2 className="font-semibold">Extracted Data</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Brand</label>
                                    <input
                                        type="text"
                                        className="w-full bg-secondary/20 border border-border rounded-md px-3 py-2"
                                        value={data.brand}
                                        onChange={e => setData({ ...data, brand: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Model</label>
                                    <input
                                        type="text"
                                        className="w-full bg-secondary/20 border border-border rounded-md px-3 py-2"
                                        value={data.model}
                                        onChange={e => setData({ ...data, model: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase">Display Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-secondary/20 border border-border rounded-md px-3 py-2 font-bold"
                                    value={data.name}
                                    onChange={e => setData({ ...data, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Category</label>
                                    <select
                                        className="w-full bg-secondary/20 border border-border rounded-md px-3 py-2"
                                        value={data.category}
                                        onChange={e => setData({ ...data, category: e.target.value })}
                                    >
                                        <option value="Camera">Camera</option>
                                        <option value="Lens">Lens</option>
                                        <option value="Lighting">Lighting</option>
                                        <option value="Audio">Audio</option>
                                        <option value="Monitor">Monitor</option>
                                        <option value="Grip">Grip</option>
                                        <option value="Accessory">Accessory</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Daily Rate ($)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-secondary/20 border border-border rounded-md px-3 py-2"
                                        value={data.daily_rate_est}
                                        onChange={e => setData({ ...data, daily_rate_est: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase">Description</label>
                                <textarea
                                    rows={3}
                                    className="w-full bg-secondary/20 border border-border rounded-md px-3 py-2 resize-none"
                                    value={data.description}
                                    onChange={e => setData({ ...data, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border">
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !data.name}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                                Add to Database
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
