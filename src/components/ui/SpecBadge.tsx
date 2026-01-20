import clsx from 'clsx';

interface SpecBadgeProps {
    label: string;
    value?: string | number;
    className?: string;
}

export function SpecBadge({ label, value, className }: SpecBadgeProps) {
    if (!value) return null;

    return (
        <div className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/50 border border-border/50 text-xs font-medium text-muted-foreground", className)}>
            <span className="text-secondary-foreground/70 uppercase tracking-wider text-[10px]">{label}</span>
            <span className="text-foreground">{value}</span>
        </div>
    );
}
