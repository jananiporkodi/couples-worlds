import { getTimelineFeed } from "@/lib/data";
import TimelineItem from "@/components/timeline/TimelineItem";
import AddTimelineEventForm from "@/components/timeline/AddTimelineEventForm";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const feed = await getTimelineFeed();

  return (
    <div>
      <p className="font-hand text-4xl md:text-5xl leading-none mb-1">Our journey 📅</p>
      <p className="text-sm text-ink-soft mb-6">the chronological story of us — milestones and memories together</p>

      <div className="mb-8">
        <AddTimelineEventForm />
      </div>

      {feed.length === 0 ? (
        <p className="text-sm text-ink-soft">No story yet — add a milestone above, or save your first memory.</p>
      ) : (
        <div className="pl-1 border-l-2 border-dashed border-accent/40 ml-3">
          {feed.map((item) => (
            <TimelineItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
