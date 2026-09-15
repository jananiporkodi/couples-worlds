import Link from "next/link";
import { Suspense } from "react";
import MoonMark from "@/components/layout/MoonMark";

function WelcomeContent({ from }: { from: string }) {
  const lockHref = `/lock${from ? `?from=${encodeURIComponent(from)}` : ""}`;

  return (
    <div className="min-h-dvh bg-bezel flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl bg-cream rounded-3xl overflow-hidden shadow-2xl">
        <div className="relative w-full aspect-[8/5] bg-bezel">
          {/* eslint-disable-next-line @next/next/no-img-element -- local SVG hero; next/image blocks
              unoptimized SVGs by default, and a static illustration needs no optimization anyway. */}
          <img src="/welcome-scene.svg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="p-8 sm:p-12 text-center">
          <div className="flex justify-center mb-3">
            <span className="w-10 h-10 rounded-full bg-peach flex items-center justify-center">
              <MoonMark className="w-5 h-5 text-accent" />
            </span>
          </div>
          <p className="font-hand text-4xl sm:text-5xl leading-none mb-3 text-ink">Our Little World</p>
          <p className="text-sm sm:text-base text-ink-soft max-w-md mx-auto mb-8">
            A quiet corner just for the two of us — our memories, our plans, our little
            in-jokes, all in one place. Made with love, kept just between us.
          </p>
          <Link href={lockHref} className="btn-primary inline-block !px-8 !py-3">
            step inside →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function WelcomePage({ searchParams }: { searchParams: { from?: string } }) {
  return (
    <Suspense fallback={null}>
      <WelcomeContent from={searchParams.from || ""} />
    </Suspense>
  );
}
