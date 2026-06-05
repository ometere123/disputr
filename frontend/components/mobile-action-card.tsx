import Link from "next/link";
import { Clock, MoveRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { activeDisputes } from "@/lib/demo-data";

export function MobileActionCards() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-primary">Action Required</h2>
        <Link href="/disputes" className="flex items-center gap-1 font-semibold text-primary">
          View All <MoveRight className="size-4" />
        </Link>
      </div>
      {activeDisputes.slice(0, 2).map((dispute, index) => (
        <div
          key={dispute.id}
          className="border-l-[5px] border-l-[#cf8a20] bg-card p-6 shadow-soft warm-panel rounded-[18px]"
        >
          <div className="flex items-center gap-3">
            <Badge variant={index === 0 ? "warning" : "default"}>{dispute.phase}</Badge>
            <span className="text-sm font-semibold text-muted-foreground">Case {dispute.id}</span>
          </div>
          <h3 className="mt-4 text-2xl font-extrabold leading-tight text-primary">{dispute.title}</h3>
          <p className="mt-4 text-lg leading-7 text-muted-foreground">{dispute.summary}</p>
          <div className="mt-6 grid grid-cols-2 border-t border-border pt-5">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Deadline</p>
              <p className="mt-1 flex items-center gap-1 font-bold text-primary">
                <Clock className="size-4" />
                {dispute.deadline}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Category</p>
              <p className="mt-1 font-semibold">{dispute.category}</p>
            </div>
          </div>
          <Button asChild className="mt-6 w-full">
            <Link href="/disputes/90210">{index === 0 ? "Review Evidence" : "View Details"}</Link>
          </Button>
        </div>
      ))}
    </div>
  );
}
