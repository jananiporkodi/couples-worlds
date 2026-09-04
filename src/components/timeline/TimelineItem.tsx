import Image from "next/image";
import Link from "next/link";
import type { TimelineFeedItem } from "@/lib/data";
import { formatFriendlyDate } from "@/lib/dates";

export default function TimelineItem({ item }: { item: TimelineFeedItem }) {
  const body = (
    <div className="relative pl-8 pb-8 last:pb-0">
      <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-[3px] border-accent/70 bg-white dark:bg-paper-dark overflow-hidden flex items-center justify-center text-[10px]">
        {item.photo ? (
          <Image src={item.photo} alt="" width={24} height={24} className="object-cover w-full h-full" />
        ) : item.kind === "memory" ? (
          "📸"
        ) : (
          "📌"
        )}
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">{formatFriendlyDate(item.date)}</p>
      <p className="font-hand text-2xl leading-tight">{item.title}</p>
      {item.description && <p className="text-sm text-ink-soft mt-0.5 line-clamp-2">{item.description}</p>}
    </div>
  );

  if (item.kind === "memory") {
    const memoryId = item.id.replace(/^memory-/, "");
    return (
      <Link href={`/memories?open=${memoryId}`} className="block hover:opacity-80 transition">
        {body}
      </Link>
    );
  }

  return body;
}
