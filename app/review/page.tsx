"use client";

import { AppShell } from "@/components/app-shell";
import { ReviewChat } from "@/components/review-chat";
import { useStore } from "@/lib/store";

export default function ReviewPage() {
  const { pendingCount } = useStore();

  return (
    <AppShell
      title="Review"
      subtitle={
        pendingCount > 0
          ? `${pendingCount} transaction${pendingCount === 1 ? "" : "s"} to clarify`
          : "Everything is clarified"
      }
    >
      <ReviewChat />
    </AppShell>
  );
}
