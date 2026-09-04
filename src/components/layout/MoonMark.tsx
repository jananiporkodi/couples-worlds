export default function MoonMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M16.2 3.3a8.9 8.9 0 1 0 4.3 15.6c.3-.25.05-.72-.32-.66a7 7 0 0 1-2.1-13.85c.36-.08.44-.57.12-.75a8.9 8.9 0 0 0-2-.34z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19.3" cy="5.2" r="0.55" fill="currentColor" opacity="0.6" />
      <circle cx="21.4" cy="8.6" r="0.35" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
