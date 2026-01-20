import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Eye, Lock, Globe, Trash2, Edit } from 'lucide-react';
import { dictionary, Language } from '@/lib/dictionary';
import { KitShareControl } from '@/components/ui/KitShareControl';

export default async function DashboardPage() {
    const session = await getSession();
    if (!session?.userId) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { language: true, role: true }
    });

    const lang = (user?.language || 'TR') as Language;
    const t = dictionary[lang].dashboard;

    const kits = await prisma.kit.findMany({
        where: { ownerId: session.userId },
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { items: true } } }
    });

    return (
        <div className="min-h-screen bg-background p-6 lg:p-10">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t.myKits}</h1>
                        <p className="text-muted-foreground mt-1">Manage your saved equipment lists and sharing settings.</p>
                    </div>

                    {/* Admin Controls */}
                    {user?.role === 'ADMIN' && (
                        <div className="flex gap-2">
                            <Link href="/admin/add" className="bg-black text-white px-4 py-2 rounded-md text-sm font-bold uppercase tracking-widest hover:bg-black/80 flex items-center gap-2">
                                <Edit className="h-4 w-4" />
                                Add Equipment
                            </Link>
                            {/* Placeholder for future User Management */}
                            {/* <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-bold uppercase tracking-widest hover:bg-secondary/80">
                                Users
                            </button> */}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kits.map(kit => (
                        <div key={kit.id} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:border-primary/50 transition-colors group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg line-clamp-1" title={kit.name}>{kit.name}</h3>
                                    {kit.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1 italic">
                                            "{kit.description}"
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {new Date(kit.updatedAt).toLocaleDateString()} • {kit._count.items} {t.itemCount}
                                    </p>
                                </div>
                                <KitShareControl
                                    kitId={kit.id}
                                    initialIsPublic={kit.isPublic}
                                    shareToken={kit.shareToken}
                                />
                            </div>

                            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between gap-2">
                                <Link
                                    href={`/share/${kit.shareToken}`}
                                    className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                    title={t.view + " / " + t.share}
                                >
                                    {kit.isPublic ? <Globe className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Link>

                                <Link
                                    href={`/builder?kitId=${kit.id}`}
                                    className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                    title="Edit Kit"
                                >
                                    <Edit className="h-4 w-4" />
                                </Link>

                                <form action={async () => {
                                    'use server';
                                    const { deleteKit } = await import('@/app/actions');
                                    await deleteKit(kit.id);
                                }}>
                                    <button className="p-2 text-muted-foreground hover:text-destructive transition-colors" title={t.delete}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </form>
                            </div>

                            {/* Project Details Preview (if any) */}
                            {kit.projectDetails && (
                                <div className="text-xs text-muted-foreground bg-secondary/30 p-2 rounded">
                                    {(JSON.parse(kit.projectDetails || '{}') as any).projectName || 'No Project Name'}
                                </div>
                            )}
                        </div>
                    ))}

                    {kits.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground bg-secondary/10 border border-dashed border-border rounded-xl">
                            <p>{t.noKits}</p>
                            <Link href="/builder" className="text-primary hover:underline mt-2 inline-block">
                                {t.createNew}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
