export function GeometricPattern({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="50" cy="30" r="20" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="50" cy="70" r="20" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="30" cy="50" r="20" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="70" cy="50" r="20" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="36" cy="36" r="20" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="64" cy="36" r="20" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="36" cy="64" r="20" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="64" cy="64" r="20" stroke="currentColor" strokeWidth="0.5" />
        </svg>
    );
}
