'use client';

import { useState } from 'react';
import { toggleKitVisibility } from '@/app/actions';
import { Eye, EyeOff, Globe, Lock, Copy, Check } from 'lucide-react';

interface KitShareControlProps {
    kitId: string;
    initialIsPublic: boolean;
    shareToken: string | null;
}

export function KitShareControl({ kitId, initialIsPublic, shareToken: initialToken }: KitShareControlProps) {
    const [isPublic, setIsPublic] = useState(initialIsPublic);
    const [shareToken, setShareToken] = useState(initialToken);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        const res = await toggleKitVisibility(kitId);
        setLoading(false);

        if (res.success) {
            setIsPublic(res.isPublic ?? false);
            if (res.shareToken) {
                setShareToken(res.shareToken);
            }
        } else {
            alert('Failed to update visibility: ' + res.message);
        }
    };

    const copyLink = () => {
        const url = `${window.location.origin}/share/${shareToken}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleToggle}
                disabled={loading}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider transition-all ${isPublic
                    ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20'
                    : 'bg-black/5 text-black/60 hover:bg-black/10'
                    }`}
            >
                {isPublic ? (
                    <>
                        <Globe className="h-3 w-3" />
                        Public
                    </>
                ) : (
                    <>
                        <Lock className="h-3 w-3" />
                        Private
                    </>
                )}
            </button>

            {isPublic && shareToken && (
                <button
                    onClick={copyLink}
                    className="p-1.5 text-black/40 hover:text-black transition-colors"
                    title="Copy Public Link"
                >
                    {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </button>
            )}
        </div>
    );
}
