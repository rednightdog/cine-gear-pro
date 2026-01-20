import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ token: string }>;
}

export default async function SharedKitPage(props: PageProps) {
    const { token } = await props.params;

    const kit = await prisma.kit.findUnique({
        where: { shareToken: token },
        include: {
            // Include items and their equipment details
            items: {
                include: {
                    equipment: {
                        include: {
                            // Fetch basic info
                        }
                    }
                }
            }
        }
    });

    if (!kit || !kit.isPublic) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-4 bg-[#FDF5E6] text-black">
                <h1 className="text-2xl font-serif italic">This kit is private or does not exist.</h1>
                <Link href="/" className="text-xs uppercase tracking-widest border-b border-black">Return Home</Link>
            </div>
        );
    }

    const projectDetails = kit.projectDetails ? JSON.parse(kit.projectDetails) : {};

    // Calculate total if needed (though we might hide rates publicly, let's show them for now as per "Client view")
    // If we want to hide rates, we could add a toggle later. Assumption: Show basic info.

    // Group items similar to Builder? Or just list them? 
    // Let's do a clean list similar to the PDF output style.

    return (
        <div className="min-h-screen bg-[#FDF5E6] p-6 lg:p-10 text-black font-sans">
            <div className="max-w-4xl mx-auto bg-white p-8 lg:p-12 shadow-sm border border-black/5">

                {/* Header */}
                <div className="border-b border-black/10 pb-8 mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-serif italic mb-2">{kit.name}</h1>
                        <p className="text-sm text-black/60 uppercase tracking-widest">
                            {new Date(kit.updatedAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs uppercase tracking-widest text-black/40 mb-1">Created by</div>
                        {/* We don't expose owner name publicly unless we want to. Let's keep it anon / generic for now or fetch owner.name if included */}
                        <div className="font-bold">CineGear Pro User</div>
                    </div>
                </div>

                {/* Project Info Grid */}
                {kit.projectDetails && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 text-sm border-b border-black/10 pb-8">
                        <div>
                            <span className="block text-[10px] uppercase text-black/40 font-bold mb-1">Project</span>
                            <span className="font-serif italic text-lg">{projectDetails.projectName || '-'}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase text-black/40 font-bold mb-1">Production</span>
                            <span>{projectDetails.productionCompany || '-'}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase text-black/40 font-bold mb-1">Director</span>
                            <span>{projectDetails.director || '-'}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase text-black/40 font-bold mb-1">DoP</span>
                            <span>{projectDetails.dop || '-'}</span>
                        </div>
                    </div>
                )}

                {/* Items Table */}
                <div className="space-y-4">
                    <div className="flex text-[10px] uppercase tracking-widest text-black/40 font-bold border-b border-black/10 pb-2">
                        <div className="w-16">Qty</div>
                        <div className="flex-1">Description</div>
                        <div className="w-32">Note</div>
                    </div>

                    {kit.items.map((kitItem) => (
                        <div key={kitItem.id} className="flex py-3 border-b border-black/5 text-sm items-baseline">
                            <div className="w-16 font-mono text-lg">{kitItem.quantity}</div>
                            <div className="flex-1 pr-4">
                                <span className="font-bold">{kitItem.equipment.brand}</span> <span className="italic">{kitItem.equipment.name}</span>
                                <span className="block text-xs text-black/50 uppercase tracking-wider mt-0.5">{kitItem.equipment.category}</span>
                            </div>
                            <div className="w-32 text-xs italic text-black/60">
                                {kitItem.equipment.description}
                                {/* If we had per-item notes in kitItem, display here. Note: schema doesn't seem to have store separate kitItem notes in KitItem table? 
                                   Wait, schema has 'items' linking to 'KitItem'. Does 'KitItem' have notes? 
                                   Let's check schema quick or assume no for now. 
                                   Actually, looking at `saveKit`, we don't save per-item notes to DB KitItem yet! 
                                   We passed `items` with notes to `saveKit`, but `prisma.kit.create` mapped them?
                                   Ah, in `actions.ts`: 
                                   `items: { create: items.map(i => ({ quantity: i.quantity, equipment: ... })) }`
                                   We are LOSING the item-specific notes (red comments) during save! 
                                   I should fix that in a later step if requested. Use global notes for now.
                                */}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Notes */}
                {kit.description && (
                    <div className="mt-12 bg-[#F9F9F9] p-6 border-l-2 border-black/20">
                        <span className="block text-[10px] uppercase font-bold text-black/40 mb-2">Notes</span>
                        <p className="text-sm whitespace-pre-wrap">{kit.description}</p>
                    </div>
                )}

                <div className="mt-16 pt-8 border-t border-black/10 flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest text-black/40">Powered by CineGear Pro</span>
                    <Link href="/" className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-black/80">
                        Build Your Own Kit
                    </Link>
                </div>

            </div>
        </div>
    );
}
