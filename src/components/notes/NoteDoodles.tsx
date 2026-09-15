import type { NoteDoodleVariant } from "@/lib/noteStyles";

const INK = "#4a3c3c";

function Heart({ className, size = 14 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
      <path
        d="M12 20.5c-.3 0-.6-.1-.8-.3C7 16.7 3 13.1 3 9.3 3 6.7 5.1 4.6 7.7 4.6c1.5 0 2.9.7 3.8 1.9.9-1.2 2.3-1.9 3.8-1.9 2.6 0 4.7 2.1 4.7 4.7 0 3.8-4 7.4-8.2 10.9-.2.2-.5.3-.8.3z"
        fill="#F3AFC1"
        stroke={INK}
        strokeWidth="0.8"
      />
    </svg>
  );
}

function Star({ className, size = 10 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className}>
      <path d="M10 1l2.2 5.8L18 9l-5.8 2.2L10 17l-2.2-5.8L2 9l5.8-2.2z" fill="#F6D66B" stroke={INK} strokeWidth="0.6" />
    </svg>
  );
}

function Clip({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 34" width="18" height="26" className={className}>
      <rect x="6" y="2" width="12" height="26" rx="3" fill="#C99A63" stroke="#8a6239" strokeWidth="1" />
      <line x1="12" y1="2" x2="12" y2="28" stroke="#8a6239" strokeWidth="1" />
      <circle cx="12" cy="15" r="2.4" fill="none" stroke="#8a6239" strokeWidth="1" />
    </svg>
  );
}

function Plane({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" className={className}>
      <path d="M3 11l18-7-7 18-3-7-8-4z" fill="none" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function Sun({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width="26" height="26" className={className}>
      <circle cx="20" cy="20" r="9" fill="#FCE38A" stroke={INK} strokeWidth="1.2" />
      <g stroke={INK} strokeWidth="1.2" strokeLinecap="round">
        <line x1="20" y1="2" x2="20" y2="7" />
        <line x1="20" y1="33" x2="20" y2="38" />
        <line x1="2" y1="20" x2="7" y2="20" />
        <line x1="33" y1="20" x2="38" y2="20" />
        <line x1="7" y1="7" x2="10.5" y2="10.5" />
        <line x1="29.5" y1="29.5" x2="33" y2="33" />
        <line x1="33" y1="7" x2="29.5" y2="10.5" />
        <line x1="7" y1="33" x2="10.5" y2="29.5" />
      </g>
      <circle cx="17" cy="19" r="0.9" fill={INK} />
      <circle cx="23" cy="19" r="0.9" fill={INK} />
      <path d="M17 23c1 1.2 5 1.2 6 0" fill="none" stroke={INK} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function Cloud({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 24" width="24" height="16" className={className}>
      <path
        d="M10 18a6 6 0 010-12 7 7 0 0113-3 6 6 0 016 8 5 5 0 01-1 7H10z"
        fill="#fff"
        stroke="#7fb3d9"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function Flower({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14" className={className}>
      <g fill="#F3AFC1" stroke={INK} strokeWidth="0.5">
        <circle cx="10" cy="5" r="3" />
        <circle cx="10" cy="15" r="3" />
        <circle cx="5" cy="10" r="3" />
        <circle cx="15" cy="10" r="3" />
      </g>
      <circle cx="10" cy="10" r="2.6" fill="#FBE29A" stroke={INK} strokeWidth="0.5" />
    </svg>
  );
}

function Bow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 24" width="26" height="16" className={className}>
      <path d="M20 12 4 3v18z" fill="#F3AFC1" stroke={INK} strokeWidth="1" />
      <path d="M20 12 36 3v18z" fill="#F3AFC1" stroke={INK} strokeWidth="1" />
      <circle cx="20" cy="12" r="3" fill="#F191AC" stroke={INK} strokeWidth="1" />
    </svg>
  );
}

function Moon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 30" width="20" height="20" className={className}>
      <path d="M20 4a11 11 0 100 22 9 9 0 010-22z" fill="#FBE29A" stroke={INK} strokeWidth="1" />
      <path d="M13 15c.6 1 3 1 3.6 0" fill="none" stroke={INK} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function doodleFor(variant: NoteDoodleVariant) {
  switch (variant) {
    case "clip":
      return (
        <>
          <Clip className="absolute -top-3.5 left-1/2 -translate-x-1/2" />
          <Heart className="absolute -top-1.5 -right-1.5" />
          <Heart className="absolute top-1/2 -left-2 -translate-y-1/2" />
          <Heart className="absolute -bottom-1.5 left-2" />
          <Heart className="absolute -bottom-1.5 -right-1.5" />
        </>
      );
    case "planeHearts":
      return (
        <>
          <Plane className="absolute bottom-2 left-2" />
          <Heart size={12} className="absolute -top-1.5 -right-1.5" />
          <Heart size={10} className="absolute top-3 -right-1" />
          <Star size={7} className="absolute top-2 left-3" />
        </>
      );
    case "sunCloud":
      return (
        <>
          <Sun className="absolute -top-3.5 left-1/2 -translate-x-1/2" />
          <Cloud className="absolute bottom-2 left-2" />
          <Flower className="absolute bottom-2 right-2" />
        </>
      );
    case "bowDots":
      return (
        <>
          <Bow className="absolute -top-2.5 left-1/2 -translate-x-1/2" />
          <Heart className="absolute -bottom-1.5 -right-1.5" />
        </>
      );
    case "moonStars":
      return (
        <>
          <Star size={9} className="absolute top-2 right-3" />
          <Star size={7} className="absolute top-5 right-1.5" />
          <Star size={8} className="absolute top-1 right-7" />
          <Moon className="absolute -bottom-1.5 -left-1.5" />
        </>
      );
    default:
      return null;
  }
}

/**
 * Absolutely-positioned decorative doodles for a note frame - the parent must be
 * `relative`. `size` uniformly scales the whole decoration layer (icons + their
 * positions together) so the same variant can shrink to fit a small card or scale
 * back up for the full-size modal.
 */
export default function NoteDoodle({ variant, size = 1 }: { variant: NoteDoodleVariant; size?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={size !== 1 ? { transform: `scale(${size})` } : undefined}
    >
      {doodleFor(variant)}
    </div>
  );
}
