'use client';

import { useRouter } from 'next/navigation';
import { EquipmentItem } from '@/types';

const CATEGORIES = ['Camera', 'Lens', 'Lighting', 'Support', 'Monitor', 'Audio', 'Power', 'Media', 'Grip', 'Accessory'];
const MOUNTS = ['PL', 'EF', 'E-Mount', 'LPL', 'RF', 'X-Mount', 'MFT', 'Bowens', 'V-Mount', 'Gold Mount', 'N/A'];

interface EquipmentFormProps {
    initialData?: Partial<EquipmentItem>;
    action: (formData: FormData) => Promise<{ success: boolean; message?: string }>;
}

export default function EquipmentForm({ initialData, action }: EquipmentFormProps) {
    const router = useRouter();

    async function clientAction(formData: FormData) {
        const res = await action(formData);
        if (res.success) {
            alert(initialData ? 'Equipment updated successfully!' : 'Equipment created successfully!');
            router.push('/inventory');
            router.refresh();
        } else {
            alert('Error: ' + res.message);
        }
    }

    return (
        <div className="min-h-screen bg-[#FDF5E6] text-black p-6 lg:p-10 flex items-center justify-center">
            <div className="w-full max-w-2xl space-y-8 bg-[#F4EBD9] border border-black/10 p-8 rounded-none shadow-xl">
                <div>
                    <h1 className="text-3xl font-serif italic tracking-tight">
                        {initialData ? 'Edit Equipment' : 'Add New Equipment'}
                    </h1>
                    <p className="text-black/60 font-mono text-xs uppercase tracking-widest mt-2">
                        {initialData ? 'Update inventory details.' : 'Enter specifications for new inventory items.'}
                    </p>
                </div>

                <form action={clientAction} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-40">Brand</label>
                            <input
                                name="brand"
                                required
                                defaultValue={initialData?.brand}
                                placeholder="e.g. ARRI"
                                className="w-full bg-transparent border-b border-black/20 py-2 focus:outline-none focus:border-black transition-colors placeholder:text-black/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-40">Model</label>
                            <input
                                name="model"
                                required
                                defaultValue={initialData?.model}
                                placeholder="e.g. Alexa Mini LF"
                                className="w-full bg-transparent border-b border-black/20 py-2 focus:outline-none focus:border-black transition-colors placeholder:text-black/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-40">Product Name (Display)</label>
                        <input
                            name="name"
                            required
                            defaultValue={initialData?.name}
                            placeholder="Full display name"
                            className="w-full bg-transparent border-b border-black/20 py-2 focus:outline-none focus:border-black transition-colors placeholder:text-black/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-40">Image Path / URL (Optional)</label>
                        <input
                            name="imageUrl"
                            defaultValue={initialData?.image_url}
                            placeholder="/equipment/filename.png"
                            className="w-full bg-transparent border-b border-black/20 py-2 focus:outline-none focus:border-black transition-colors placeholder:text-black/20"
                        />
                        <p className="text-[10px] text-black/40 font-mono">* Must be a valid local path or URL (e.g. /equipment/alexa.png)</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-40">Category</label>
                            <select
                                name="category"
                                defaultValue={initialData?.category}
                                className="w-full bg-transparent border-b border-black/20 py-2 focus:outline-none focus:border-black transition-colors appearance-none rounded-none"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-40">Daily Rate ($)</label>
                            <input
                                name="daily_rate_est"
                                type="number"
                                required
                                defaultValue={initialData?.daily_rate_est}
                                placeholder="0"
                                className="w-full bg-transparent border-b border-black/20 py-2 focus:outline-none focus:border-black transition-colors placeholder:text-black/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-40">Description</label>
                        <textarea
                            name="description"
                            required
                            rows={3}
                            defaultValue={initialData?.description}
                            className="w-full bg-transparent border-b border-black/20 py-2 focus:outline-none focus:border-black transition-colors placeholder:text-black/20 resize-none"
                        />
                    </div>

                    <div className="p-4 border border-black/5 bg-[#FDF5E6] space-y-4 rounded-none">
                        <h3 className="font-serif italic text-lg opacity-80">Technical Specs (Optional)</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-black/40">Mount</label>
                                <select
                                    name="mount"
                                    defaultValue={initialData?.specs?.mount}
                                    className="w-full bg-transparent border-b border-black/20 py-1 text-sm rounded-none"
                                >
                                    <option value="">-</option>
                                    {MOUNTS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-black/40">Weight (kg)</label>
                                <input
                                    name="weight_kg"
                                    type="number"
                                    step="0.1"
                                    defaultValue={initialData?.specs?.weight_kg}
                                    className="w-full bg-transparent border-b border-black/20 py-1 text-sm placeholder:text-black/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-black/40">Resolution</label>
                                <input
                                    name="resolution"
                                    defaultValue={initialData?.specs?.resolution}
                                    placeholder="e.g. 4K"
                                    className="w-full bg-transparent border-b border-black/20 py-1 text-sm placeholder:text-black/20"
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-black text-white hover:bg-black/90 font-bold py-4 text-xs uppercase tracking-widest transition-colors shadow-lg">
                        {initialData ? 'Update Product' : 'Create Product'}
                    </button>
                </form>
            </div>
        </div>
    );
}
